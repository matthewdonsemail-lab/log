import { findDiscordAccount, discordGate } from "../../discord/account/session/index.ts";
import { labelOf, matchChat } from "../../discord/chat/match/index.ts";
import type { DiscordChat } from "../../discord/chat/match/index.ts";
import { PLATFORM_AUDIO, providerOf, readClone, renderVoiceNote, textOnlyProblem, VOICE_PROVIDERS, voiceProvider } from "../../extensions/voiceClone/index.ts";
import type { Rendered, VoiceNote, VoiceNotePlatform, VoiceProvider } from "../../extensions/voiceClone/index.ts";
import { waitCaughtUp } from "../../inbox/catchUp/index.ts";
import { guardSend } from "../../inbox/claims/index.ts";
import { findInstagramAccount, instagramGate } from "../../instagram/account/session/index.ts";
import type { PlatformAnswer } from "../../platformKit/session/index.ts";
import { watermarkReadingOf } from "../../twitter/copy/watermark/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandInput, CommandResult, FlagSpec } from "../runner/types.ts";
import { openAccount as openSlackAccount, chatIdOf as slackChatIdOf, inWorkspace } from "../slack/index.ts";
import { gateDeps } from "../twitter/helpers/voice.ts";

type Resolved = { ok: true; account: string; chatId: string; label: string; claimWith?: string; gateHandle?: string; send: (note: VoiceNote, approvedBy: string) => PlatformAnswer } | { ok: false; result: CommandResult };

interface VoiceShape {
  platform: VoiceNotePlatform;
  chat: FlagSpec;
  extra: FlagSpec[];
  native: string;
  engine: string;
  resolve: (context: CommandContext, label: string, flags: Record<string, unknown>) => Promise<Resolved>;
}

export const voiceNoteDeps: { render: (provider: VoiceProvider, platform: VoiceNotePlatform, text: string, language?: string) => Promise<Rendered> } = {
  render: (provider, platform, text, language) => renderVoiceNote(voiceProvider(provider), platform, text, undefined, undefined, undefined, language),
};

const TEXT: FlagSpec = { name: "text", kind: "string", required: true, description: "What matt says in the voice note, as text in his words; never an audio file" };
const PROVIDER: FlagSpec = { name: "provider", kind: "enum", values: VOICE_PROVIDERS, description: "Which voice provider says it: inworld or fishAudio (default: LOG_VOICE_PROVIDER, else inworld)" };
const APPROVED_BY: FlagSpec = { name: "approvedBy", kind: "string", description: "Who approved it: needed with --live (rule 8)" };

function usageOf(shape: VoiceShape): string {
  return [
    `Usage: log ${shape.platform} voice --account <accountName> --${shape.chat.name} <${shape.chat.name}> --text "<what matt says>"${shape.extra.map((f) => ` [--${f.name} <${f.name}>]`).join("")} [--provider inworld|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]`,
    `Sends a voice note in matt's cloned voice (the voice provider, log clone voice) as ${shape.platform}'s own voice note: ${shape.native}. It takes text only, never an audio file: the words are said in his voice, converted with ffmpeg to ${PLATFORM_AUDIO[shape.platform].container} and uploaded on the direct-API engine through the account's one session (${shape.engine}, no browser).`,
    "A voice note goes out only when matt asks for one (rule 142). The provider is --provider, else LOG_VOICE_PROVIDER, else inworld; the command only ever calls the shared voice layer (rule 143). Without --live it is a dry run: nothing is generated and nothing is contacted. --live needs --approvedBy (rule 8). It waits for the account to catch up (rule 135), runs the text through the voice gate every send runs (rule 137), generates and converts it, claims the chat (rule 133) and releases it after. The governor counts it as a write, the platform's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).",
    "--mattsWords says the text is matt's own words, dictated by him for this voice note: the voice gate's read is skipped, since it grades speech as typed text and as a reply, while the AI artifact check still runs and refuses aiArtifacts (rule 144).",
    "--translationOf \"<what it translates>\" says the text is a translation, only when matt asked for one: the voice gate grades those original words (his own language, which the gate reads) instead of the translation, which it can't match to his writing; both are read for AI artifacts. --language <code> (zh-CN, es-ES ...) is the language the clone speaks it in, instead of the clone's own, and it is needed with --translationOf (rule 148).",
  ].join("\n");
}

function inputOf(shape: VoiceShape): CommandInput {
  const summary = `Send a voice note in matt's cloned voice as ${shape.platform[0].toUpperCase() + shape.platform.slice(1)}'s own voice note, from text; a dry run unless --live`;
  return { forms: [{ words: [], effect: "write", summary, positionals: [], flags: [{ name: "account", kind: "string", required: true, description: `The ${shape.platform.toUpperCase()} socialAccount's accountName (its handle)` }, shape.chat, TEXT, ...shape.extra, PROVIDER, { name: "mattsWords", kind: "boolean", description: "The text is matt's own words, dictated by him for this voice note: the voice gate's read of his typing is skipped, the AI artifact check still runs (rule 144)" }, { name: "translationOf", kind: "string", description: "The text is a translation matt asked for, of these original words: the voice gate grades the original instead of the translation; needs --language (rule 148)" }, { name: "language", kind: "string", description: "The language the clone speaks it in (zh-CN, es-ES ...), instead of the clone's own (rule 148)" }, APPROVED_BY, { name: "live", kind: "boolean", live: true, description: "Send it, only when matt asked for a voice note (rules 8, 142); without it a dry run generates and contacts nothing" }, JSON_FLAG] }] };
}

export function voiceNoteCommandOf(shape: VoiceShape): Command {
  const usage = usageOf(shape);
  const input = inputOf(shape);
  const label = `${shape.platform} voice`;
  return {
    usage,
    platform: shape.platform,
    name: "voice",
    effect: "write",
    input,
    summary: input.forms[0].summary,
    args: `--account <a> --${shape.chat.name} <${shape.chat.name}> --text "<what matt says>" [--provider <p>] [--mattsWords] [--translationOf "<original>" --language <code>] [--approvedBy <who>] [--live] [--json]`,
    async run(context, argv) {
      const parsed = parseArgs(argv, parserSpecOf(input));
      if (!parsed.ok) return { code: 1, stderr: `log ${label}: ${parsed.error}\n${usage}` };
      if (parsed.positionals.length) return { code: 1, stderr: `log ${label}: takes no words, only flags: the voice note is made from --text, never from a file\n${usage}` };
      const text = String(parsed.flags["text"] ?? "");
      const approvedBy = typeof parsed.flags["approvedBy"] === "string" ? parsed.flags["approvedBy"].trim() : "";
      const live = parsed.flags["live"] === true;
      const mattsWords = parsed.flags["mattsWords"] === true;
      const translationOf = typeof parsed.flags["translationOf"] === "string" ? parsed.flags["translationOf"].trim() : "";
      const language = typeof parsed.flags["language"] === "string" ? parsed.flags["language"].trim() : "";
      if (translationOf && !language) return refuse(label, "voiceNoteInvalid", "--translationOf needs --language: the language the clone speaks the translation in (rule 148)");
      if (translationOf && mattsWords) return refuse(label, "voiceNoteInvalid", "--translationOf and --mattsWords are two different things: a translation is gated on its original (rule 148), matt's dictated words skip the gate's read (rule 144)");
      if (language && !/^[a-z]{2,3}(-[A-Z]{2})?$/.test(language)) return refuse(label, "voiceNoteInvalid", `--language ${language} isn't a language code like zh-CN or es-ES`);
      const problem = textOnlyProblem(text);
      if (problem) return refuse(label, "voiceNoteInvalid", problem);
      if (live && !approvedBy) return refuse(label, "notApproved", "--live needs --approvedBy <who> (rule 8)");
      const watermark = watermarkReadingOf(translationOf ? `${text}\n${translationOf}` : text);
      if (watermark.level === "artifacts") return refuse(label, "aiArtifacts", `the text carries what AI chat interfaces leave in text: ${watermark.findings.filter((f) => f.deterministic).map((f) => `${f.label} ×${f.count}`).join(", ")}`);
      const chosen = providerOf(parsed.flags["provider"]);
      if (!chosen.ok) return refuse(label, "voiceProviderUnknown", chosen.detail);
      const provider = chosen.provider;
      try {
        const resolved = await shape.resolve(context, label, parsed.flags);
        if (!resolved.ok) return resolved.result;
        const clone = readClone(provider);
        const where = { platform: shape.platform, account: resolved.account, chat: resolved.chatId, text: text.trim(), provider, container: PLATFORM_AUDIO[shape.platform].container, ...(translationOf ? { translationOf, language } : language ? { language } : {}) };
        if (!live) {
          if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ engine: "directApi", ok: true, dryRun: true, cloned: !!clone, mattsWords, ...where }, null, 2) };
          return { code: 0, stdout: [`log ${label}: dry run: ${resolved.account} would send ${resolved.label} a voice note in matt's cloned voice (${PLATFORM_AUDIO[shape.platform].container}) saying:`, `  ${text.trim()}`, clone ? `The clone on ${provider} is ready (made ${clone.createdAt}).` : `There is no clone on ${provider} yet: log clone voice --provider ${provider} --apply makes it first.`, ...(mattsWords ? ["These are matt's own dictated words (--mattsWords): the voice gate's read is skipped, the AI artifact check passed (rule 144)."] : []), ...(translationOf ? [`It is a translation into ${language} of: ${translationOf} (--translationOf): the voice gate grades that original (rule 148).`] : language ? [`Spoken in ${language}.`] : []), "Nothing was generated or sent. --live --approvedBy <who> sends it, only when matt asked for a voice note (rules 8, 142)."].join("\n") };
        }
        if (!clone) return refuse(label, "voiceCloneMissing", `log clone voice --provider ${provider} --apply makes it once from matt's own voice notes`);
        context.err(`${resolved.account}: voice note to ${resolved.label}, approved by ${approvedBy}`);
        const caught = await waitCaughtUp(shape.platform, resolved.account);
        if (!caught.ok) return refuse(label, "accountBehind", caught.refused);
        if (mattsWords) context.err(`${resolved.account}: matt's own dictated words (--mattsWords): the voice gate's read of his typing is skipped, the AI artifact check passed`);
        else {
          if (translationOf) context.err(`${resolved.account}: a translation into ${language} (--translationOf): the voice gate grades the original words`);
          const voiced = await gateDeps.gate(context, { platform: shape.platform, account: resolved.account, to: resolved.label, text: translationOf || text, conversationId: resolved.gateHandle ? undefined : resolved.chatId, handle: resolved.gateHandle, spoken: true });
          if (!voiced.ok) return refuse(label, "voiceGateFailed", voiced.refused);
          context.err(voiced.line);
        }
        context.err(`${resolved.account}: saying it in matt's cloned voice on ${provider} and converting it to ${PLATFORM_AUDIO[shape.platform].container}`);
        const rendered = await voiceNoteDeps.render(provider, shape.platform, text, language || undefined);
        if (!rendered.ok) return refuse(label, rendered.code, rendered.detail);
        context.err(`${resolved.account}: ${rendered.note.path}, ${rendered.note.seconds} s`);
        const guard = guardSend({ platform: shape.platform, account: resolved.account, conversationId: resolved.chatId, ...(resolved.claimWith ? { with: resolved.claimWith } : {}) });
        if (!guard.ok) return refuse(label, "chatClaimedElsewhere", guard.refused);
        let answer: PlatformAnswer;
        try {
          answer = resolved.send(rendered.note, approvedBy);
        } catch (error) {
          guard.done("failed", error instanceof Error ? error.message : String(error));
          throw error;
        }
        guard.done(answer.ok ? "sent" : "failed", `voice note (${rendered.note.seconds} s): ${text.trim().slice(0, 240)}${answer.ok ? "" : `: ${answer.code}`}`);
        const code = answer.ok ? 0 : 1;
        if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", approvedBy, ...where, file: rendered.note.path, seconds: rendered.note.seconds, ...answer }, null, 2) };
        if (answer.ok) return { code, stdout: `log ${label}: ${resolved.account} sent ${resolved.label} a ${rendered.note.seconds} s voice note in matt's voice${answer.messageId ? ` (message ${answer.messageId})` : ""}: ${text.trim()}` };
        return { code, stdout: `log ${label}: ${resolved.account}: ${answer.code}: ${answer.detail ?? ""}. Nothing is retried (rule 94).` };
      } catch (error) {
        return refuseError(label, error);
      }
    },
  };
}

export const discordVoiceCommand = voiceNoteCommandOf({
  platform: "discord",
  chat: { name: "channel", kind: "string", required: true, description: "The chat as matt says it, matched to one DM or group; or a channel id" },
  extra: [],
  native: "a voice message (flags 8192, its waveform and duration), the bubble Discord's own app records",
  engine: "vendor/endcord",
  async resolve(context, label, flags) {
    const account = await findDiscordAccount(context.twenty, String(flags["account"]));
    const gate = discordGate(account);
    if (!gate.ok) return { ok: false, result: refuse(label, gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail) };
    const direct = context.directDiscord;
    if (!direct) return { ok: false, result: { code: 1, stderr: `log ${label}: the direct-API engine isn't wired in this context` } };
    const said = String(flags["channel"]).trim();
    let target = said;
    let shown = said;
    if (!/^\d{15,22}$/.test(said)) {
      const listed = direct(account, { action: "chats" });
      if (!listed.answer.ok) return { ok: false, result: { code: 1, stdout: `log ${label}: ${account.accountName}: reading its chats to find "${said}": ${listed.answer.code}: ${listed.answer.detail ?? ""}` } };
      const found = matchChat((listed.answer.chats as DiscordChat[] | undefined) ?? [], said);
      if (!found.ok) return { ok: false, result: refuse(label, found.code, [found.detail, ...found.candidates.map((c) => `  ${c.id}  ${c.label}`)].join("\n")) };
      target = found.chat.id;
      shown = labelOf(found.chat);
    }
    return { ok: true, account: account.accountName, chatId: target, label: shown, send: (note, approvedBy) => direct(account, { action: "voice", channel: target, path: note.path, seconds: note.seconds, waveform: note.waveform, live: true, approvedBy }).answer };
  },
});

export const instagramVoiceCommand = voiceNoteCommandOf({
  platform: "instagram",
  chat: { name: "with", kind: "string", required: true, description: "Who it goes to: their handle, user id, or a thread id" },
  extra: [],
  native: "a voice clip (instagrapi's direct_send_voice: the audio uploaded to rupload.facebook.com/messenger_audio, then sent as a voice_attachment with its waveform)",
  engine: "vendor/instagrapi, in the account's one session",
  async resolve(context, label, flags) {
    const account = await findInstagramAccount(context.twenty, String(flags["account"]));
    const gate = instagramGate(account);
    if (!gate.ok) return { ok: false, result: refuse(label, gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail) };
    const direct = context.directInstagram;
    if (!direct) return { ok: false, result: { code: 1, stderr: `log ${label}: the direct-API engine isn't wired in this context` } };
    const said = String(flags["with"]).trim();
    return { ok: true, account: account.accountName, chatId: said, label: said, claimWith: said, gateHandle: said, send: (note, approvedBy) => direct(account, { action: "voice", with: said, path: note.path, seconds: note.seconds, levels: note.levels, account: account.accountName, live: true, approvedBy }).answer };
  },
});

export const slackVoiceCommand = voiceNoteCommandOf({
  platform: "slack",
  chat: { name: "chat", kind: "string", required: true, description: "The chat as matt says it, matched to one DM or group; or its id (D…, G…, C…)" },
  extra: [{ name: "workspace", kind: "string", description: "The workspace's domain; needed when the session is signed in to more than one" }],
  native: "an audio file shared into the chat through Slack's own upload (files.getUploadURLExternal, the bytes, files.completeUploadExternal), which Slack plays inline",
  engine: "vendor/gabrielSlack on curl_cffi",
  async resolve(context, label, flags) {
    const opened = await openSlackAccount(context, label, flags);
    if (!opened.ok) return opened;
    const chat = await slackChatIdOf(context, label, opened.account, opened.workspace, String(flags["chat"]).trim());
    if (!chat.ok) return chat;
    return { ok: true, account: opened.account.accountName, chatId: chat.id, label: chat.label, send: (note, approvedBy) => context.directSlack!(opened.account, { action: "voice", chat: chat.id, path: note.path, seconds: note.seconds, live: true, approvedBy, ...inWorkspace(opened.workspace) }).answer };
  },
});
