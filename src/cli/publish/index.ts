/**
 * `log publish --listing <agencyListingId>` — post one Marketplace listing from
 * Twenty through the publish machine (XState) and print every step.
 *
 * The listing row says what to post and which socialAccount posts it. Before
 * anything opens (dry run or live, rule 12): the account is Facebook and
 * usable, has a proxy and a home country, and the listing is in that country.
 * At launch python/proxyGate.py checks the proxy's exit IP is in it too.
 *
 * Dry run by default: it opens the form, uploads the photos, fills and reads
 * back every field, screenshots the review, and stops before Publish. Only
 * `--live` clicks Publish. Captchas are routed CaptchaKraken → 2Captcha → a
 * person (`captcha/router`). Every run is written back to the listing row.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createActor, fromPromise, toPromise } from "xstate";
import { appendAttempt, countArkoseToday, readAttempts, solverAvailability } from "../../captcha/router/index.ts";
import { prepareRun } from "../../camofox/run/index.ts";
import { settleFirefoxCapture } from "../../rea/firefox/index.ts";
import type { PublishSession } from "../../camofox/session/index.ts";
import type { ErrorCode } from "../../errors/catalog/index.ts";
import { countryMismatch, getListing, listListingsWhere, PUBLISHABLE_STATUSES, recordRun, setListingStatus, toPublishListing } from "../../marketplace/agencyListing/index.ts";
import type { AgencyListing } from "../../marketplace/agencyListing/index.ts";
import { publishMachine } from "../../marketplace/publish/index.ts";
import type {
  CaptureOutput,
  ConfirmOutput,
  FillOutput,
  FormOutcome,
  PreparePhotosOutput,
  PublishActorInputs,
  PublishClickOutput,
  PublishOutput,
  ReviewOutput,
  SolveOutput,
  StepOutput,
  UploadOutput,
} from "../../marketplace/publish/index.ts";
import { countPostedToday, recordAccountIssue } from "../../marketplace/replacement/index.ts";
import { homeOf } from "../../marketplace/home/index.ts";
import { fetchProxyUrl, findAccount, markPosted, recordProxyCheck } from "../../marketplace/socialAccount/index.ts";
import type { FacebookAccount } from "../../marketplace/socialAccount/index.ts";
import { preparePhotos } from "../../media/photo/index.ts";
import { createInspector, formatTraceLine } from "../../observability/trace/index.ts";
import { renderLoss } from "../live/helpers/index.ts";
import { keepNewDevice, keepSession } from "../live/index.ts";
import { parseArgs, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandResult } from "../runner/types.ts";
import { renderPublishOutput, summarizePublish } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const PUBLISH_USAGE = [
  "Usage: log publish --listing <agencyListingId> [--live] [--json] [--formUrl <url>]",
  "Dry run unless --live: fills and checks everything, never clicks Publish.",
  "The listing, its account and the account's proxy all come from Twenty.",
].join("\n");

function publishRunDir(runId: string, env: Record<string, string | undefined> = process.env): string {
  return join(env.LOG_PUBLISH_DIR || join(homedir(), ".logCli", "publish"), runId);
}

/** A refusal before anything opened, also written to the listing row so Twenty shows why. */
async function refuseListing(context: CommandContext, listing: AgencyListing, code: ErrorCode, detail: string): Promise<CommandResult> {
  try {
    await context.twenty.update("agencyListings", listing.id, {
      lastRunAt: new Date().toISOString(),
      lastRunResult: "BLOCKED" as never,
      lastErrorCode: code,
      lastError: detail.slice(0, 500),
    });
  } catch {
    // The refusal stands even if Twenty can't take the note.
  }
  return refuse("publish", code, detail);
}

/** Everything that must hold before a browser may open for this listing. */
export async function checkPublishable(
  context: CommandContext,
  listingId: string,
  live: boolean,
  now: Date = new Date(),
): Promise<{ listing: AgencyListing; account: FacebookAccount } | CommandResult> {
  const listing = await getListing(context.twenty, listingId);
  if (!listing) return refuse("publish", "listingNotFound", listingId);
  if (!listing.socialAccountId) return refuse("publish", "listingNoAccount", listing.id);
  if (!listing.status || !PUBLISHABLE_STATUSES.includes(listing.status)) {
    return refuse("publish", "listingNotPublishable", `${listing.id} is ${listing.status ?? "unset"}`);
  }
  const account = await findAccount(context.twenty, listing.socialAccountId);
  const content = toPublishListing(listing);
  if (!content.ok) return refuseListing(context, listing, "listingInvalid", content.problems.join("; "));
  if (account.homeCountry) {
    const mismatch = countryMismatch(listing, account.homeCountry);
    if (mismatch) return refuseListing(context, listing, "listingCountryMismatch", mismatch);
  }
  if (live) {
    const published = await listListingsWhere(context.twenty, { socialAccountId: { eq: account.id } });
    // The account's own calendar day, not UTC (rule 18).
    const home = homeOf(account);
    const zones = new Map(home.ok ? [[account.id, home.home.timezone]] : []);
    const today = countPostedToday(published, now, zones).get(account.id) ?? 0;
    if (today >= account.dailyListingCap) {
      return refuseListing(context, listing, "dailyCapReached", `${account.accountName}: ${today}/${account.dailyListingCap} today`);
    }
  }
  return { listing, account };
}

export const publishCommand: Command = {
  name: "publish",
  summary: "Post one Twenty listing (dry run unless --live), printing every machine step",
  args: "--listing <id> [--live] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["live", "json"], valued: ["listing", "formUrl"] });
    if (!parsed.ok) return { code: 1, stderr: `log publish: ${parsed.error}\n${PUBLISH_USAGE}` };
    if (parsed.positionals.length > 0) return { code: 1, stderr: `log publish: unexpected argument "${parsed.positionals[0]}"\n${PUBLISH_USAGE}` };
    const listingId = parsed.flags.listing;
    if (typeof listingId !== "string") return { code: 1, stderr: `log publish: --listing is required (an agencyListing id)\n${PUBLISH_USAGE}` };
    const dryRun = !parsed.flags.live;
    const json = Boolean(parsed.flags.json);

    const now = (context.now ?? (() => new Date()))();
    let checked: Awaited<ReturnType<typeof checkPublishable>>;
    try {
      checked = await checkPublishable(context, listingId, !dryRun, now);
    } catch (error) {
      return refuseError("publish", error);
    }
    if (!("account" in checked)) return checked;
    const { listing, account } = checked;
    const content = toPublishListing(listing);
    if (!content.ok) return refuse("publish", "listingInvalid", content.problems.join("; "));

    // Rule 12: no proxy, no home country, or an unusable account means no files and no browser.
    const prepared = prepareRun(account, "run", { now });
    if (!prepared.ok) return refuseListing(context, listing, prepared.code, prepared.detail);
    const run = prepared.run;

    const runId = `${new Date().toISOString().replace(/[:.]/g, "").slice(0, 15)}${account.accountName.replace(/\W/g, "")}`;
    const runDir = publishRunDir(runId);
    mkdirSync(runDir, { recursive: true });
    const ledger = readAttempts();

    let session: PublishSession | null = null;
    const open = () =>
      (session ??= context.session({
        accountId: account.id,
        storageStatePath: run.statePath,
        proxyPath: run.proxyPath,
        devicePath: run.devicePath,
        receiptDir: runDir,
        formUrl: typeof parsed.flags.formUrl === "string" ? parsed.flags.formUrl : undefined,
      }));
    const call = <T>(step: Parameters<PublishSession["call"]>[0], params: Record<string, unknown> = {}) => open().call<T>(step, params);
    // The exit IP is re-read through the browser at review and right before Publish (rule 12):
    // another country stops the run (proxyCountryChanged); a new IP in the same country is recorded.
    const exitNotes: string[] = [];
    const noteExit = async <T>(result: T): Promise<T> => {
      const moved = (result as { exitIpChanged?: { from?: string; to?: string; country?: string } }).exitIpChanged;
      if (moved?.to) {
        exitNotes.push(`The proxy exit moved from ${moved.from ?? "?"} to ${moved.to} (still ${moved.country ?? account.homeCountry}).`);
        try {
          await recordProxyCheck(context.twenty, account.id, { exitIp: moved.to, exitCountry: moved.country ?? account.homeCountry });
        } catch {
          // The run goes on; the note says what moved.
        }
      }
      return result;
    };

    const machine = publishMachine.provide({
      actors: {
        preparePhotos: fromPromise<PreparePhotosOutput, PublishActorInputs["preparePhotos"]>(async ({ input }) => {
          const result = await preparePhotos(input.sources, { dir: join(runDir, "photos"), proxy: fetchProxyUrl(account.proxy) });
          if (!result.ok) return { ok: false, code: result.code, detail: result.detail };
          return { ok: true, paths: result.photos.map((p) => p.path), hashes: result.photos.map((p) => p.sha256) };
        }),
        openForm: fromPromise<FormOutcome, PublishActorInputs["openForm"]>(async ({ input }) => {
          // A crashed step replies { ok: false, code }, not a FormOutcome.
          const result = await call<Partial<FormOutcome> & { code?: ErrorCode; detail?: string }>("open", { recheck: input.recheck });
          if (result.kind) return result as FormOutcome;
          return { kind: "error", code: result.code ?? "badReply", detail: result.detail ?? JSON.stringify(result).slice(0, 200) };
        }),
        solveCaptcha: fromPromise<SolveOutput, PublishActorInputs["solveCaptcha"]>(async ({ input }) =>
          call<SolveOutput>("solveCaptcha", { solver: input.solver, detection: input.detection }),
        ),
        setCategory: fromPromise<StepOutput, PublishActorInputs["setCategory"]>(async ({ input }) => call<StepOutput>("setCategory", input)),
        uploadPhotos: fromPromise<UploadOutput, PublishActorInputs["uploadPhotos"]>(async ({ input }) => call<UploadOutput>("uploadPhotos", input)),
        fillFields: fromPromise<FillOutput, PublishActorInputs["fillFields"]>(async ({ input }) => call<FillOutput>("fillFields", input)),
        review: fromPromise<ReviewOutput, PublishActorInputs["review"]>(async ({ input }) => noteExit(await call<ReviewOutput>("review", input))),
        publish: fromPromise<PublishClickOutput, PublishActorInputs["publish"]>(async () => noteExit(await call<PublishClickOutput>("publish"))),
        confirm: fromPromise<ConfirmOutput, PublishActorInputs["confirm"]>(async () => call<ConfirmOutput>("confirm")),
        captureId: fromPromise<CaptureOutput, PublishActorInputs["captureId"]>(async ({ input }) => call<CaptureOutput>("captureId", input)),
      },
    });

    const inspect = createInspector(
      (line) => (json ? context.out(JSON.stringify(line)) : context.err(formatTraceLine(line))),
      summarizePublish,
    );
    const actor = createActor(machine, {
      id: `publish:${account.accountName}`,
      input: {
        accountId: account.accountName,
        listing: content.listing,
        dryRun,
        availability: solverAvailability(),
        arkoseToday: countArkoseToday(ledger, account.accountName),
      },
      inspect,
    });

    let output: PublishOutput;
    try {
      if (!dryRun) await setListingStatus(context.twenty, listing.id, "publishing");
      actor.start();
      output = (await toPromise(actor)) as PublishOutput;
    } catch (error) {
      return refuseError("publish", error);
    } finally {
      if (session) await (session as PublishSession).close();
      try {
        const captureNote = await settleFirefoxCapture(join(runDir, "firefox"));
        if (captureNote) exitNotes.push(captureNote);
      } catch (error) {
        exitNotes.push(`Firefox capture: ${error instanceof Error ? error.message : String(error)}`);
      }
      const deviceNote = await keepNewDevice(context, account, run);
      if (deviceNote) exitNotes.push(deviceNote);
      const sessionNote = await keepSession(context, account, run);
      if (sessionNote) exitNotes.push(sessionNote);
      run.cleanup();
    }
    // Every attempt goes to the ledger, with whether the page accepted it.
    for (const attempt of output.captchaAttempts) appendAttempt(attempt);
    writeFileSync(join(runDir, "output.json"), `${JSON.stringify({ dryRun, agencyListingId: listing.id, account: account.accountName, ...output }, null, 2)}\n`);

    const notes: string[] = [...exitNotes];
    try {
      await recordRun(context.twenty, listing, output, dryRun, output.receipt);
      if (!dryRun && output.result === "published") await markPosted(context.twenty, account.id);
      if (output.issue) {
        const loss = await recordAccountIssue(context.twenty, account, output.issue, output.failure?.detail ?? null);
        if (loss) notes.push(renderLoss(loss));
      }
      notes.push(`Written to Twenty: agencyListing ${listing.id}.`);
    } catch (error) {
      notes.push(`Could not write the run to Twenty: ${refuseError("publish", error).stderr}`);
    }

    const code = output.result === "dryRun" || output.result === "published" ? 0 : 1;
    if (json) return { code, stdout: JSON.stringify({ kind: "output", dryRun, runDir, agencyListingId: listing.id, account: account.accountName, ...output }) };
    return { code, stdout: [renderPublishOutput(output, runDir), ...notes].join("\n") };
  },
};
