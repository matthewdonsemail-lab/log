/**
 * `log publish` — post one Marketplace listing through the publish machine
 * (XState) and print every step.
 *
 * Dry run by default: it opens the form, uploads the photos, fills and reads
 * back every field, screenshots the review, and stops before Publish. Only
 * `--live` clicks Publish. Captchas are routed CaptchaKraken → 2Captcha → a
 * person (`captcha/router`), and every attempt goes to the captcha ledger.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createActor, fromPromise, toPromise } from "xstate";
import { appendAttempt, countArkoseToday, readAttempts, solverAvailability } from "../../captcha/router/index.ts";
import type { PublishSession } from "../../camofox/session/index.ts";
import { storageStatePath } from "../../camofox/worker/index.ts";
import { preparePhotos } from "../../media/photo/index.ts";
import { publishMachine, validateListing } from "../../marketplace/publish/index.ts";
import type {
  CaptureOutput,
  ConfirmOutput,
  FillOutput,
  FormOutcome,
  PreparePhotosOutput,
  PublishActorInputs,
  PublishClickOutput,
  PublishListing,
  PublishOutput,
  ReviewOutput,
  SolveOutput,
  StepOutput,
  UploadOutput,
} from "../../marketplace/publish/index.ts";
import { createInspector, formatTraceLine } from "../../observability/trace/index.ts";
import { parseArgs } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";
import { renderPublishOutput, summarizePublish } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const PUBLISH_USAGE = [
  "Usage: log publish --account <accountId> --title <text> --price <n> --category <name> --photo <path|url>[,<path|url>...]",
  "                   [--condition <new|likeNew|good|fair>] [--description <text>] [--location <city, region>]",
  "                   [--file <listing.json>] [--live] [--json] [--headless] [--formUrl <url>]",
  "Dry run unless --live: fills and checks everything, never clicks Publish.",
].join("\n");

function publishRunDir(runId: string, env: Record<string, string | undefined> = process.env): string {
  return join(env.LOG_PUBLISH_DIR || join(homedir(), ".logCli", "publish"), runId);
}

/** Flags (and an optional JSON file) → listing. Flags win over the file. */
function readListing(flags: Record<string, string | true>): { listing?: PublishListing; error?: string } {
  let base: Partial<PublishListing> = {};
  if (typeof flags.file === "string") {
    try {
      base = JSON.parse(readFileSync(flags.file, "utf8")) as Partial<PublishListing>;
    } catch (error) {
      return { error: `--file: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
  const str = (name: string) => (typeof flags[name] === "string" ? (flags[name] as string) : undefined);
  const photos = str("photo")?.split(",").map((p) => p.trim()).filter(Boolean) ?? base.photos ?? [];
  const priceText = str("price") ?? (base.price === undefined ? undefined : String(base.price));
  const listing: PublishListing = {
    title: str("title") ?? base.title ?? "",
    price: priceText === undefined ? Number.NaN : Number(priceText),
    category: str("category") ?? base.category ?? "",
    condition: str("condition") ?? base.condition,
    description: str("description") ?? base.description,
    location: str("location") ?? base.location,
    photos,
  };
  return { listing };
}

export const publishCommand: Command = {
  name: "publish",
  summary: "Post one Marketplace listing (dry run unless --live), printing every machine step",
  args: "--account <id> --title <t> --price <n> --category <c> --photo <p,...> [--live]",
  async run(context, argv) {
    const parsed = parseArgs(argv, {
      boolean: ["live", "json", "headless"],
      valued: ["account", "title", "price", "category", "condition", "description", "location", "photo", "file", "formUrl"],
    });
    if (!parsed.ok) return { code: 1, stderr: `log publish: ${parsed.error}\n${PUBLISH_USAGE}` };
    if (parsed.positionals.length > 0) return { code: 1, stderr: `log publish: unexpected argument "${parsed.positionals[0]}"\n${PUBLISH_USAGE}` };

    const data = context.load();
    const known = data.accounts.map((a) => a.id).join(", ");
    const accountId = parsed.flags.account;
    if (typeof accountId !== "string") return { code: 1, stderr: `log publish: --account is required. Known: ${known}\n${PUBLISH_USAGE}` };
    if (!data.accounts.some((a) => a.id === accountId)) return { code: 1, stderr: `log publish: unknown account "${accountId}". Known: ${known}` };

    const { listing, error } = readListing(parsed.flags);
    if (!listing) return { code: 1, stderr: `log publish: ${error}` };
    const problems = validateListing(listing);
    if (problems.length) return { code: 1, stderr: `log publish: ${problems.join("; ")}\n${PUBLISH_USAGE}` };

    const statePath = storageStatePath(accountId);
    if (!existsSync(statePath)) {
      return { code: 1, stderr: `log publish: no Facebook session for ${accountId} (${statePath}). Run: log connect --account ${accountId}` };
    }

    const dryRun = !parsed.flags.live;
    const json = Boolean(parsed.flags.json);
    const runId = `${new Date().toISOString().replace(/[:.]/g, "").slice(0, 15)}${accountId}`;
    const runDir = publishRunDir(runId);
    mkdirSync(runDir, { recursive: true });
    const ledger = readAttempts();

    let session: PublishSession | null = null;
    const open = () =>
      (session ??= context.session({
        accountId,
        storageStatePath: statePath,
        receiptDir: runDir,
        headless: Boolean(parsed.flags.headless),
        formUrl: typeof parsed.flags.formUrl === "string" ? parsed.flags.formUrl : undefined,
      }));
    const call = <T>(step: Parameters<PublishSession["call"]>[0], params: Record<string, unknown> = {}) => open().call<T>(step, params);

    const machine = publishMachine.provide({
      actors: {
        preparePhotos: fromPromise<PreparePhotosOutput, PublishActorInputs["preparePhotos"]>(async ({ input }) => {
          const result = await preparePhotos(input.sources, { dir: join(runDir, "photos") });
          if (!result.ok) return { ok: false, code: result.code, detail: result.detail };
          return { ok: true, paths: result.photos.map((p) => p.path), hashes: result.photos.map((p) => p.sha256) };
        }),
        openForm: fromPromise<FormOutcome, PublishActorInputs["openForm"]>(async ({ input }) => {
          // A crashed step replies { ok: false, code }, not a FormOutcome.
          const result = await call<Partial<FormOutcome> & { code?: string; detail?: string }>("open", { recheck: input.recheck });
          return result.kind ? (result as FormOutcome) : { kind: "error", code: result.code ?? "openFailed", detail: result.detail };
        }),
        solveCaptcha: fromPromise<SolveOutput, PublishActorInputs["solveCaptcha"]>(async ({ input }) =>
          call<SolveOutput>("solveCaptcha", { solver: input.solver, detection: input.detection }),
        ),
        setCategory: fromPromise<StepOutput, PublishActorInputs["setCategory"]>(async ({ input }) => call<StepOutput>("setCategory", input)),
        uploadPhotos: fromPromise<UploadOutput, PublishActorInputs["uploadPhotos"]>(async ({ input }) => call<UploadOutput>("uploadPhotos", input)),
        fillFields: fromPromise<FillOutput, PublishActorInputs["fillFields"]>(async ({ input }) => call<FillOutput>("fillFields", input)),
        review: fromPromise<ReviewOutput, PublishActorInputs["review"]>(async ({ input }) => call<ReviewOutput>("review", input)),
        publish: fromPromise<PublishClickOutput, PublishActorInputs["publish"]>(async () => call<PublishClickOutput>("publish")),
        confirm: fromPromise<ConfirmOutput, PublishActorInputs["confirm"]>(async () => call<ConfirmOutput>("confirm")),
        captureId: fromPromise<CaptureOutput, PublishActorInputs["captureId"]>(async ({ input }) => call<CaptureOutput>("captureId", input)),
      },
    });

    const inspect = createInspector(
      (line) => (json ? context.out(JSON.stringify(line)) : context.err(formatTraceLine(line))),
      summarizePublish,
    );
    const actor = createActor(machine, {
      id: `publish:${accountId}`,
      input: {
        accountId,
        listing,
        dryRun,
        availability: solverAvailability(),
        arkoseToday: countArkoseToday(ledger, accountId),
      },
      inspect,
    });

    let output: PublishOutput;
    try {
      actor.start();
      output = (await toPromise(actor)) as PublishOutput;
    } finally {
      if (session) await (session as PublishSession).close();
    }
    // Every attempt goes to the ledger, with whether the page accepted it.
    for (const attempt of output.captchaAttempts) appendAttempt(attempt);
    writeFileSync(join(runDir, "output.json"), `${JSON.stringify({ dryRun, listing: { ...listing, photos: listing.photos.length }, ...output }, null, 2)}\n`);

    const code = output.result === "dryRun" || output.result === "published" ? 0 : 1;
    if (json) return { code, stdout: JSON.stringify({ kind: "output", dryRun, runDir, ...output }) };
    return { code, stdout: renderPublishOutput(output, runDir) };
  },
};
