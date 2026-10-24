import { fromPromise } from "xstate";
import { createAdsPowerClient, ensureKernel } from "../../../browser/adsPower/index.ts";
import { answersIssue, answerWait, flowWithParams, loadFlow, pageProblem } from "../../../browser/flow/index.ts";
import { stepExchangesAt } from "../../../subq/stepReading/helpers/stepExchanges.ts";
import type { FlowStep } from "../../../browser/flow/index.ts";
import type { InspectAction, InspectStepResult } from "../../../browser/inspect/index.ts";
import type { PreparedRun } from "../../../browser/run/index.ts";
import { classifySignal } from "../../../marketplace/account/index.ts";
import { activeWindow, homeOf, hoursUntilOpen, localClock, outsideActiveHours } from "../../../marketplace/home/index.ts";
import type { LifecycleActorInputs, StepOutcome, WarmupActivity } from "../../../marketplace/lifecycle/index.ts";
import { fetchProxyUrl, saveSession } from "../../../marketplace/socialAccount/index.ts";
import { preparePhotos } from "../../../media/photo/index.ts";
import { join } from "node:path";
import type { FacebookAccount } from "../../../marketplace/socialAccount/index.ts";
import { ACTIVITY_SCRIPTS, NOTED_ISSUES } from "../../../facebook/warmup/stages/index.ts";
import * as marketplaceCheck from "../../../facebook/marketplace/check/index.ts";
import { placeProblem } from "../../../facebook/marketplace/location/index.ts";
import { runFlowInSession, openInspectSession } from "../../flow/helpers/index.ts";
import type { OpenSession } from "../../flow/helpers/index.ts";
import { keepNewDevice, keepSession, openAccount } from "../../live/index.ts";
import { settleInBackground } from "../../../rea/capture/client.ts";
import type { CommandContext } from "../../runner/types.ts";

const FB = "https://www.facebook.com";

export interface HostBrowser {
  run: PreparedRun | null;
  session: OpenSession | null;
}

const ok = (detail?: string, endOfDay?: boolean): StepOutcome => ({ kind: "ok", ...(detail ? { detail } : {}), ...(endOfDay ? { endOfDay } : {}) });
const issue = (code: string, detail?: string): StepOutcome => ({ kind: "issue", issue: code as never, detail });
const error = (code: string, detail?: string, retryable = false): StepOutcome => ({ kind: "error", code, detail, retryable });

export function dayOf(account: FacebookAccount, now = new Date()): { today: string; over: boolean; msUntilOpen: number } {
  const home = homeOf(account);
  if (!home.ok) return { today: now.toISOString().slice(0, 10), over: false, msUntilOpen: 0 };
  const clock = localClock(now, home.home.timezone);
  const over = outsideActiveHours(account, home.home.timezone, now) !== null;
  return { today: clock.date, over, msUntilOpen: over ? Math.round(hoursUntilOpen(clock.hour, activeWindow(account)) * 3_600_000) : 0 };
}

export function hostActors(context: CommandContext, account: FacebookAccount, browser: HostBrowser, options: { bypassHours: boolean; now?: boolean; likes?: boolean; log: (line: string) => void }) {
  const log = options.log;
  const send = async (action: InspectAction, args: string[] = [], timeoutMs = 240_000, expect?: { name: string; ms?: number }): Promise<InspectStepResult | null> => {
    if (!browser.session) return null;
    return context.sendInspect(browser.session.current, action, args, timeoutMs, expect);
  };
  const home = { uid: account.accountName, homeCity: account.homeCity, homeCountry: account.homeCountry };
  const answerOutcome = (step: FlowStep, reply: InspectStepResult | null): StepOutcome | null => {
    if (!step.answers?.length || !reply?.folder) return null;
    const wrong = answersIssue(step.answers, stepExchangesAt(reply.folder), home);
    if (!wrong) return null;
    return wrong.code === "answerNotAsExpected" ? error(wrong.code, `${step.id}: ${wrong.text}`, true) : issue(wrong.code, `${step.id}: ${wrong.text}`);
  };
  const look = async () => send("pageText");
  const problemOf = (step: { action: string; url?: string }, reply: InspectStepResult | null): StepOutcome | null => {
    if (!reply) return error("browserGone", "the browser didn't answer");
    const landed = pageProblem(step, reply);
    if (landed) return landed.code === "pageNotReached" ? error(landed.code, landed.detail) : issue(landed.code, landed.detail);
    const text = (reply as InspectStepResult & { text?: string }).text;
    const signal = classifySignal({ url: reply.url ?? "", text: text ?? reply.title ?? "" });
    if (signal && signal !== "readOnlyLimited") return issue(signal, `${reply.url}: ${(text ?? "").slice(0, 120)}`);
    return null;
  };

  return {
    checkProxy: fromPromise<StepOutcome, LifecycleActorInputs["checkProxy"]>(async () => (account.proxy ? ok() : error("noProxy", "no proxy in Twenty (rule 12)"))),

    openBrowser: fromPromise<StepOutcome, LifecycleActorInputs["openBrowser"]>(async () => {
      if (account.adsPowerProfileId) {
        const kernel = await ensureKernel(context.adsPower ?? createAdsPowerClient(), log).catch((e: unknown) => ({ ok: false as const, detail: e instanceof Error ? e.message : String(e) }));
        if (!kernel.ok) return error("adsPowerKernelMissing", kernel.detail);
      }
      let opened = await openAccount(context, "host", "log facebook host start --account <a>", account.accountName, "connect", options.bypassHours, true, Boolean(options.now));
      if (!("run" in opened) && /launchTooSoon/.test(opened.stderr ?? "")) {
        const minutes = Number((opened.stderr ?? "").match(/wait (\d+) min/)?.[1] ?? 10);
        log(`host ${account.accountName}: the last launch was under 10 minutes ago (rule 24): opening in ${minutes} min`);
        await new Promise((r) => setTimeout(r, (minutes * 60 + 15) * 1000));
        opened = await openAccount(context, "host", "log facebook host start --account <a>", account.accountName, "connect", options.bypassHours, true, Boolean(options.now));
      }
      if (!("run" in opened)) return error((opened.stderr ?? "").match(/: (\w+):/)?.[1] ?? "openRefused", opened.stderr);
      browser.run = opened.run;
      const session = await openInspectSession(context, account, opened.run);
      if ("error" in session) {
        opened.run.cleanup();
        browser.run = null;
        return error("browserNotReady", session.error, true);
      }
      browser.session = session;
      void session.session.then(() => {
        browser.session = null;
      });
      log(`host ${account.accountName}: browser open (${session.current.runDir})`);
      return ok(session.current.runDir);
    }),

    closeBrowser: fromPromise<StepOutcome, LifecycleActorInputs["closeBrowser"]>(async ({ input }) => {
      const run = browser.run;
      if (browser.session) {
        await send("stop", [], 60_000);
        await browser.session.session;
      }
      browser.session = null;
      if (run) {
        const notes = [await keepNewDevice(context, account, run), await keepSession(context, account, run)].filter(Boolean) as string[];
        const failed = notes.some((n) => n.startsWith("Could not save"));
        for (const n of notes) log(`host ${account.accountName}: ${n}`);
        if (failed) log(`host ${account.accountName}: kept the device and session at ${run.keep()} (log facebook account resave)`);
        if (run.captureDir) settleInBackground(run.captureDir);
        run.cleanup();
      }
      browser.run = null;
      log(`host ${account.accountName}: browser closed (${input.reason})`);
      return ok(input.reason);
    }),

    signIn: fromPromise<StepOutcome, LifecycleActorInputs["signIn"]>(async () => {
      await send("goto", [`${FB}/marketplace/selling/`]);
      let triedForm = 0;
      for (let i = 0; i < 12; i++) {
        const page = await look();
        if (!page) return error("browserGone");
        const url = page.url ?? "";
        const text = (page as InspectStepResult & { text?: string }).text ?? "";
        if (/checkpoint\/601051028565049/.test(url) || /suspect automated behaviou?r/i.test(text)) {
          log(`host ${account.accountName}: "We suspect automated behaviour": Dismiss`);
          await send("clickRole", ["button", "Dismiss"]);
          continue;
        }
        if (/\/checkpoint\//.test(url)) return issue("checkpointed", `${url}: ${text.slice(0, 120)}`);
        if (/wrong password|incorrect password|password you.ve entered is incorrect/i.test(text)) return issue("wrongPassword");
        if (/two_step|approvals_code/i.test(url) || /enter the code|authentication app|6-digit code/i.test(text)) {
          await send("code");
          continue;
        }
        await send("saveState");
        const state = browser.run?.readStorageState();
        const signedIn = Boolean(state?.cookies.some((c) => c.name === "c_user") && state?.cookies.some((c) => c.name === "xs"));
        if (signedIn && !/\/login|login\.php/.test(url)) {
          await saveSession(context.twenty, account.id, state!);
          log(`host ${account.accountName}: signed in; session saved to Twenty (${state!.cookies.length} cookies)`);
          return ok();
        }
        if (triedForm >= 2) return issue("signInNotFinished", `still signed out on ${url} after two sign-ins`);
        if (!/\/login|login\.php/.test(url)) {
          log(`host ${account.accountName}: signed out (no session cookie): the login page`);
          await send("goto", [`${FB}/login/`]);
          continue;
        }
        triedForm++;
        const tried = await send("signIn");
        if (tried?.ok === false) return error("signInFormMissing", tried.error ?? "no login form", false);
      }
      return error("signInNotFinished", "twelve pages without a sign-in");
    }),

    checkAccount: fromPromise<StepOutcome, LifecycleActorInputs["checkAccount"]>(async () => {
      const status = marketplaceCheck.CHECK_PAGES.status;
      const opened = await send("goto", [status]);
      const landed = problemOf({ action: "goto", url: status }, opened);
      if (landed) return landed;
      const access = marketplaceCheck.marketplaceAccessOf(marketplaceCheck.harOf(opened));
      if (access) {
        const problem = marketplaceCheck.accessProblem(access);
        return problem ? issue("suspended", problem) : ok(`Marketplace status: ${access.title ?? "full access"}${access.sell ? `, selling ${access.sell}` : ""}`);
      }
      return problemOf({ action: "pageText" }, await look()) ?? ok("Marketplace open, no restriction (its status answer didn't load: read from the page)");
    }),

    setProfile: fromPromise<StepOutcome, LifecycleActorInputs["setProfile"]>(async ({ input }) => {
      if (!input.live) return error("needsLive", "the profile changes Facebook: run the host with --live when matt asks (rule 8)");
      const recorded = loadFlow("profileSetup");
      if (!recorded || !browser.session) return error("flowNotRecorded", "profileSetup");
      if (!account.profilePhoto) return error("noProfileInTwenty", "profilePhoto is needed in Twenty");
      const [firstName, ...rest] = (account.profileName ?? "").split(" ");
      const sources = [account.profilePhoto, account.coverPhoto].filter((p): p is string => Boolean(p));
      const photos = await preparePhotos(sources, { dir: join(browser.session.current.runDir, "photos"), proxy: fetchProxyUrl(account.proxy) });
      if (!photos.ok) return error(photos.code, photos.detail);
      const params = { uid: account.accountName, profilePhoto: photos.photos[0].path, coverPhoto: photos.photos[1]?.path, firstName: firstName || undefined, lastName: rest.join(" ") || undefined };
      const flow = flowWithParams(recorded, params);
      const output = await runFlowInSession(context, browser.session.current, flow, Object.fromEntries(Object.entries(params).filter(([, v]) => v)) as Record<string, string>, { account: home });
      const last = output.steps.at(-1);
      if (output.result === "done") return ok(["profile photo", account.coverPhoto && "cover", account.profileName && "name"].filter(Boolean).join(", ") + " saved");
      if (last?.issue && last.issue !== "pageNotReached") return issue(last.issue, last.error);
      return error("profileNotSaved", `${output.failedAt}: ${last?.error ?? ""}`);
    }),

    setName: fromPromise<StepOutcome, LifecycleActorInputs["setName"]>(async () => ok("named by profileSetup")),

    setLocation: fromPromise<StepOutcome, LifecycleActorInputs["setLocation"]>(async ({ input }) => {
      const form = await send("goto", [`${FB}/marketplace/create/item`]);
      const landed = problemOf({ action: "goto", url: `${FB}/marketplace/create/item` }, form);
      if (landed) return landed;
      const read = (await send("sellLocation")) as (InspectStepResult & { sellLocation?: { city: string; postalCode: string; country: string } | null }) | null;
      const where = read?.sellLocation;
      const home = (account.homeCity ?? "").toLowerCase();
      if (where && where.city.toLowerCase() === home) return ok(`${where.city} ${where.postalCode}`);
      const place = await placeFor(context, account);
      if (!place) return error("noPlaceName", `the Marketplace location is ${where?.city ?? "unknown"}; give a listing of this account in ${account.homeCity ?? "its home city"} a locationQuery, "City, State" written out`);
      const problem = placeProblem(place);
      if (problem) return error(problem.code, problem.detail);
      if (!input.live) return error("needsLive", `the Marketplace location is ${where?.city ?? "unknown"}, not ${account.homeCity}: --live sets it to ${place}`);
      const set = await send("setLocation", [place]);
      if (!set || set.ok === false) return error("locationNotSet", set?.error ?? "no reply");
      return ok(`set to ${place}`);
    }),

    warmupActivity: fromPromise<StepOutcome, LifecycleActorInputs["warmupActivity"]>(async ({ input }) => {
      if (dayOf(account).over && !options.bypassHours) return ok("the day is over", true);
      const script = ACTIVITY_SCRIPTS[input.activity as WarmupActivity];
      const flow = loadFlow(script.flow);
      const steps: FlowStep[] = flow?.steps ?? script.steps.map((s, i) => ({ id: `s${i + 1}_${s.action}`, action: s.action, ...(s.action === "goto" ? { url: s.args[0] } : { args: s.args }), recorded: { step: "", ms: null, reaEvidenceId: null, requests: [] } }) as FlowStep);
      const noted: string[] = [];
      for (const step of steps) {
        if (step.action === "clickAny" && !(input.live && options.likes)) continue;
        const args = step.action === "goto" ? [step.url!] : (step.args ?? []);
        const reply = await send(step.action as InspectAction, args, 300_000, step.expect ? { name: step.expect, ms: 45_000 } : answerWait(step.answers));
        const problem = problemOf(step, reply);
        if (problem) return problem;
        if (reply && reply.ok === false) return error("warmupStepFailed", `${step.id}: ${reply.error ?? ""}`, true);
        const answered = answerOutcome(step, reply);
        if (answered?.kind === "issue" && NOTED_ISSUES.includes(answered.issue)) {
          noted.push(`${answered.issue}: ${answered.detail ?? ""}`);
          log(`host ${account.accountName}: noted ${answered.issue} in ${input.activity}; carrying on`);
          continue;
        }
        if (answered) return answered;
      }
      log(`host ${account.accountName}: warm-up ${input.activity} done`);
      return noted.length ? ok(`noted: ${noted.join("; ")}`) : ok();
    }),

    watchCheck: fromPromise<StepOutcome, LifecycleActorInputs["watchCheck"]>(async () => {
      if (dayOf(account).over && !options.bypassHours) return ok("the day is over", true);
      if (!browser.session) return error("browserGone", "the window went away");
      let landed: StepOutcome | null = null;
      const checked = async (action: InspectAction, args: string[] = []) => {
        const reply = await send(action, args);
        landed ??= problemOf({ action, url: args[0] }, reply);
        return reply;
      };
      const found = await marketplaceCheck.readMarketplace(checked, log);
      if (landed) return landed;
      const report = await marketplaceCheck.keepCheck(context.twenty, account.id, account.accountName, found, browser.session.current.runDir);
      for (const line of report.lines) log(`host ${line}`);
      if (report.issue) return issue(report.issue.code, report.issue.detail);
      return ok(report.threads ? `${report.threads} seller chat(s)` : undefined);
    }),

    act: fromPromise<StepOutcome, LifecycleActorInputs["act"]>(async ({ input }) =>
      error("actNotBuilt", `${input.action.kind} as a tab in the host isn't built yet (plan P3)`)),

    waitForActiveHours: fromPromise<StepOutcome, LifecycleActorInputs["waitForActiveHours"]>(async () => {
      const { msUntilOpen } = dayOf(account);
      log(`host ${account.accountName}: resting ${Math.round(msUntilOpen / 60_000)} min until the account's morning`);
      await new Promise((r) => setTimeout(r, msUntilOpen));
      return ok();
    }),
  };
}

async function placeFor(context: CommandContext, account: FacebookAccount): Promise<string | null> {
  const rows = await context.twenty.list("agencyListings", { socialAccountId: { eq: account.id } });
  const home = (account.homeCity ?? "").toLowerCase();
  const queries = rows.map((r) => r.locationQuery?.trim()).filter((q): q is string => Boolean(q));
  return queries.find((q) => q.split(",")[0].trim().toLowerCase() === home) ?? queries[0] ?? null;
}
