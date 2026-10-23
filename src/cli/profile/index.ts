import { dirname, join } from "node:path";
import { createActor, fromPromise, toPromise } from "xstate";
import type { ProfileSession, ProfileStep } from "../../camofox/session/index.ts";
import { preparePhotos } from "../../media/photo/index.ts";
import { profileMachine } from "../../marketplace/profile/index.ts";
import type { ProfileActOutput, ProfileActorInputs, ProfileNameOutput, ProfileOutput, ProfilePhotosOutput, ProfileReadOutput } from "../../marketplace/profile/index.ts";
import { fetchProxyUrl, markProfileSet } from "../../marketplace/socialAccount/index.ts";
import { createInspector, formatTraceLine } from "../../observability/trace/index.ts";
import { openAccount, withNote, withRun } from "../live/index.ts";
import { parseArgs, refuseError } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";
import { renderProfile, summarizeProfile } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const PROFILE_USAGE = "Usage: log facebook profile setup --account <accountName> [--live] [--bypass] [--json]";

export const profileCommand: Command = {
  usage: PROFILE_USAGE,
  platform: "facebook",
  name: "profile",
  effect: "browser",
  summary: "Set an account's profile picture and cover photo from Twenty (dry run unless --live, rule 28)",
  args: "setup --account <name> [--live] [--bypass] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["live", "bypass", "json"], valued: ["account"] });
    if (!parsed.ok) return { code: 1, stderr: `log facebook profile: ${parsed.error}\n${PROFILE_USAGE}` };
    if (parsed.positionals[0] !== "setup" || parsed.positionals.length > 1) return { code: 1, stderr: `log facebook profile: expected "setup"\n${PROFILE_USAGE}` };
    const live = Boolean(parsed.flags["live"]);
    const opened = await openAccount(context, "profile", PROFILE_USAGE, parsed.flags["account"], "run", Boolean(parsed.flags["bypass"]));
    if (!("run" in opened)) return opened;
    const { account, run } = opened;
    const runDir = run.captureDir ? dirname(run.captureDir) : null;
    return withRun(context, "profile", account, run, async () => {
      let session: ProfileSession | null = null;
      const call = <T>(step: ProfileStep, params: Record<string, unknown> = {}) =>
        (session ??= context.profileSession({
          accountId: account.id,
          storageStatePath: run.statePath,
          proxyPath: run.proxyPath,
          devicePath: run.devicePath,
          captureDir: run.captureDir!,
        })).call<T>(step, params);
      const machine = profileMachine.provide({
        actors: {
          preparePhotos: fromPromise<ProfilePhotosOutput, ProfileActorInputs["preparePhotos"]>(async () => {
            const sources = [account.profilePhoto, account.coverPhoto].filter((s): s is string => Boolean(s));
            const result = await preparePhotos(sources, { dir: join(runDir ?? ".", "photos"), proxy: fetchProxyUrl(account.proxy) });
            if (!result.ok) return { ok: false, code: "profilePhotoMissing", detail: `${result.code}: ${result.detail}` };
            const [first, second] = result.photos.map((p) => p.path);
            return { ok: true, profilePath: account.profilePhoto ? first : "", coverPath: account.profilePhoto ? (second ?? "") : first };
          }),
          open: fromPromise<ProfileActOutput, undefined>(() => call("open")),
          read: fromPromise<ProfileReadOutput, undefined>(() => call("read")),
          readName: fromPromise<ProfileNameOutput, undefined>(() => call("readName")),
          uploadProfilePhoto: fromPromise<ProfileActOutput, ProfileActorInputs["uploadProfilePhoto"]>(({ input }) => call("uploadProfilePhoto", input)),
          uploadCoverPhoto: fromPromise<ProfileActOutput, ProfileActorInputs["uploadCoverPhoto"]>(({ input }) => call("uploadCoverPhoto", input)),
        },
      });
      const actor = createActor(machine, {
        id: `profile:${account.accountName}`,
        input: { accountId: account.accountName, live, hasProfilePhoto: Boolean(account.profilePhoto), hasCoverPhoto: Boolean(account.coverPhoto), profileName: account.profileName },
        inspect: createInspector((line) => context.err(formatTraceLine(line)), summarizeProfile),
      });
      let output: ProfileOutput;
      try {
        actor.start();
        output = (await toPromise(actor)) as ProfileOutput;
      } finally {
        if (session) await (session as ProfileSession).close();
      }
      let note: string | null = null;
      if (output.result === "saved") {
        try {
          await markProfileSet(context.twenty, account.id, (context.now ?? (() => new Date()))());
          note = `Recorded profileSetAt for ${account.accountName} in Twenty.`;
        } catch (error) {
          note = `Could not record profileSetAt: ${refuseError("profile", error).stderr}`;
        }
      }
      const code = output.result === "failed" ? 1 : 0;
      const result = parsed.flags["json"] ? { code, stdout: JSON.stringify(output, null, 2) } : { code, stdout: renderProfile(account.accountName, output, runDir) };
      return withNote(result, note);
    });
  },
};
