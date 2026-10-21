#!/usr/bin/env node

import { createServer } from "node:http";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const BUZZ_MESSAGE_KINDS = new Set([9, 40002]);
const CATEGORIES = new Set(["DECISION", "CUSTOMER_NOTE", "FOLLOW_UP", "INCIDENT", "OTHER"]);
const MAX_TITLE_LENGTH = 160;
const MAX_DETAILS_LENGTH = 4_000;
const MAX_BUZZ_OUTPUT_BYTES = 2 * 1024 * 1024;
const MAX_SEEN_EVENT_IDS = 5_000;
const HEALTH_PATH = "/healthz";
const DEFAULT_PORT = 8790;

function plainError(message) {
  return new Error(message);
}

export function containsSensitiveMaterial(value) {
  if (typeof value !== "string") return true;
  return [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
    /\b(?:nsec1|sk_(?:live|test)_|pk_(?:live|test)_|whsec_|cfut_|lk_(?:api|ingest)_)[A-Za-z0-9_-]{12,}/i,
    /\b(?:authorization|bearer|api[_ -]?key|access[_ -]?token|refresh[_ -]?token|password|cookie)\s*[:=]\s*\S+/i,
    /\b(?:session|secret)[_-]?(?:key|token)?\s*[:=]\s*[A-Za-z0-9_./+=-]{16,}/i,
  ].some((pattern) => pattern.test(value));
}

function normalizeRecordUrl(value) {
  if (!value) return undefined;
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.hostname !== "twenty.listeningkit.com") return null;
  url.username = "";
  url.password = "";
  url.search = "";
  url.hash = "";
  return url.toString();
}

export function parseCrmCommand(content, mentionLabel = "Twenty CRM Bridge") {
  if (typeof content !== "string") return { type: "ignore" };
  const trimmed = content.trim();
  const aliases = [`@${mentionLabel}`.toLowerCase(), "@crm"];
  const alias = aliases.find((candidate) => {
    const lower = trimmed.toLowerCase();
    return lower === candidate || lower.startsWith(`${candidate} `) || lower.startsWith(`${candidate}\n`);
  });
  if (!alias) return { type: "ignore" };
  const rest = trimmed.slice(alias.length).trim();
  if (!rest || rest.toLowerCase() === "help") return { type: "help" };
  if (!rest.toLowerCase().startsWith("save ")) {
    return { type: "invalid", reason: "Use `save` or `help`." };
  }
  const parts = rest.slice(5).split("|").map((part) => part.trim());
  if (parts.length < 3 || parts.length > 4) {
    return {
      type: "invalid",
      reason: "Use `save <category> | <title> | <details> [| Twenty record URL]`.",
    };
  }
  const category = parts[0].replace(/[ -]+/g, "_").toUpperCase();
  const headline = parts[1];
  const details = parts[2];
  const relatedRecordUrl = normalizeRecordUrl(parts[3]);
  if (!CATEGORIES.has(category)) {
    return {
      type: "invalid",
      reason: "Category must be decision, customer note, follow-up, incident, or other.",
    };
  }
  if (!headline || headline.length > MAX_TITLE_LENGTH) {
    return { type: "invalid", reason: `Title must be 1-${MAX_TITLE_LENGTH} characters.` };
  }
  if (!details || details.length > MAX_DETAILS_LENGTH) {
    return { type: "invalid", reason: `Details must be 1-${MAX_DETAILS_LENGTH} characters.` };
  }
  if (relatedRecordUrl === null) {
    return { type: "invalid", reason: "The optional record link must be on twenty.listeningkit.com." };
  }
  if (containsSensitiveMaterial(`${headline}\n${details}`)) {
    return {
      type: "invalid",
      reason: "This looks like it contains a credential or secret. Remove it before saving.",
    };
  }
  return { type: "save", category, headline, details, relatedRecordUrl };
}

function tagValues(event, name) {
  return Array.isArray(event?.tags)
    ? event.tags.filter((tag) => Array.isArray(tag) && tag[0] === name).map((tag) => tag[1])
    : [];
}

export function isEligibleBuzzEvent(event, config) {
  return Boolean(
    event &&
      BUZZ_MESSAGE_KINDS.has(event.kind) &&
      typeof event.id === "string" &&
      typeof event.pubkey === "string" &&
      event.pubkey !== config.bridgePubkey &&
      Number.isInteger(event.created_at) &&
      event.created_at >= config.startedAt &&
      tagValues(event, "p").includes(config.bridgePubkey),
  );
}

function threadRoot(event) {
  const root = (event.tags ?? []).find(
    (tag) => Array.isArray(tag) && tag[0] === "e" && tag[3] === "root",
  );
  return root?.[1] || event.id;
}

function buzzMessageUrl(channelId, event) {
  const params = new URLSearchParams({
    channel: channelId,
    id: event.id,
    thread: threadRoot(event),
  });
  return `buzz://message?${params.toString()}`;
}

function helpMessage(mentionLabel) {
  return [
    "CRM bridge commands:",
    `\`@${mentionLabel} save decision | Title | Details\``,
    `\`@${mentionLabel} save customer note | Title | Details | https://twenty.listeningkit.com/...\``,
    "Categories: decision, customer note, follow-up, incident, other.",
    "Only this private channel is watched. Credentials and secrets are rejected.",
  ].join("\n");
}

async function patchFailure(twenty, id, reason) {
  try {
    await twenty.patchUpdate(id, { syncStatus: "FAILED", failureReason: reason });
  } catch {
    // The original operation already failed. Never echo a second error or response body.
  }
}

export async function processBuzzEvent(event, context) {
  const command = parseCrmCommand(event.content, context.config.mentionLabel);
  if (command.type === "ignore") return { handled: false };
  if (command.type === "help") {
    await context.buzz.sendMessage(helpMessage(context.config.mentionLabel), {
      replyTo: event.id,
      mention: event.pubkey,
    });
    return { handled: true, outcome: "help" };
  }
  if (command.type === "invalid") {
    await context.buzz.sendMessage(`CRM bridge did not save this: ${command.reason}`, {
      replyTo: event.id,
      mention: event.pubkey,
    });
    return { handled: true, outcome: "rejected" };
  }

  let record = await context.twenty.findByBuzzEventId(event.id);
  if (!record) {
    record = await context.twenty.createUpdate({
      headline: command.headline,
      details: command.details,
      category: command.category,
      direction: "BUZZ_TO_TWENTY",
      syncStatus: "PENDING_REPLY",
      buzzEventId: event.id,
      buzzChannelId: context.config.channelId,
      buzzThreadId: threadRoot(event),
      buzzAuthorPubkey: event.pubkey,
      buzzMessageUrl: buzzMessageUrl(context.config.channelId, event),
      ...(command.relatedRecordUrl ? { relatedRecordUrl: command.relatedRecordUrl } : {}),
      syncedAt: context.now().toISOString(),
    });
  }

  if (record.syncStatus !== "PENDING_REPLY") {
    return { handled: true, outcome: "already_recorded" };
  }
  await context.twenty.patchUpdate(record.id, { syncStatus: "SENDING_REPLY" });
  try {
    const recordUrl = context.twenty.publicRecordUrl(record.id);
    await context.buzz.sendMessage(`Saved to Twenty: ${recordUrl}`, {
      replyTo: event.id,
      mention: event.pubkey,
    });
    await context.twenty.patchUpdate(record.id, {
      syncStatus: "SYNCED",
      syncedAt: context.now().toISOString(),
      failureReason: "",
    });
    return { handled: true, outcome: "saved", recordId: record.id };
  } catch {
    await patchFailure(context.twenty, record.id, "Buzz acknowledgement failed.");
    throw plainError("Buzz acknowledgement failed")
  }
}

export async function processTwentyOutbound(record, context) {
  if (record.direction !== "TWENTY_TO_BUZZ" || record.syncStatus !== "PENDING") {
    return { handled: false };
  }
  const headline = typeof record.headline === "string" ? record.headline.trim() : "";
  const details = typeof record.details === "string" ? record.details.trim() : "";
  const category = CATEGORIES.has(record.category) ? record.category : "OTHER";
  if (
    !headline ||
    headline.length > MAX_TITLE_LENGTH ||
    !details ||
    details.length > MAX_DETAILS_LENGTH ||
    containsSensitiveMaterial(`${headline}\n${details}`)
  ) {
    await patchFailure(context.twenty, record.id, "Content was invalid or looked sensitive.");
    return { handled: true, outcome: "rejected" };
  }

  await context.twenty.patchUpdate(record.id, { syncStatus: "SENDING" });
  const label = category.toLowerCase().replaceAll("_", " ");
  const recordUrl = context.twenty.publicRecordUrl(record.id);
  try {
    const sent = await context.buzz.sendMessage(
      [`CRM ${label}: **${headline}**`, details, recordUrl].join("\n\n"),
    );
    await context.twenty.patchUpdate(record.id, {
      syncStatus: "SYNCED",
      buzzEventId: sent.event_id,
      buzzChannelId: context.config.channelId,
      buzzThreadId: sent.event_id,
      buzzMessageUrl: buzzMessageUrl(context.config.channelId, {
        id: sent.event_id,
        tags: [],
      }),
      syncedAt: context.now().toISOString(),
      failureReason: "",
    });
    return { handled: true, outcome: "posted", eventId: sent.event_id };
  } catch {
    await patchFailure(context.twenty, record.id, "Buzz publication failed.");
    throw plainError("Buzz publication failed")
  }
}

function runBuzzCommand(config, args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(config.buzzBinary, args, {
      env: {
        PATH: process.env.PATH,
        BUZZ_RELAY_URL: config.relayUrl,
        BUZZ_PRIVATE_KEY: config.privateKey,
        ...(config.authTag ? { BUZZ_AUTH_TAG: config.authTag } : {}),
      },
      stdio: [input === undefined ? "ignore" : "pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = Buffer.alloc(0);
    let stderrBytes = 0;
    const timeout = setTimeout(() => child.kill("SIGKILL"), 20_000);
    child.stdout.on("data", (chunk) => {
      stdout = Buffer.concat([stdout, chunk]);
      if (stdout.length > MAX_BUZZ_OUTPUT_BYTES) child.kill("SIGKILL");
    });
    child.stderr.on("data", (chunk) => {
      stderrBytes += chunk.length;
      if (stderrBytes > MAX_BUZZ_OUTPUT_BYTES) child.kill("SIGKILL");
    });
    child.on("error", () => {
      clearTimeout(timeout);
      reject(plainError("Buzz CLI could not start"));
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0 || stdout.length > MAX_BUZZ_OUTPUT_BYTES) {
        reject(plainError(`Buzz CLI failed with exit code ${code ?? "unknown"}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout.toString("utf8")));
      } catch {
        reject(plainError("Buzz CLI returned invalid JSON"));
      }
    });
    if (input !== undefined) child.stdin.end(input);
  });
}

function createBuzzClient(config) {
  return {
    async listMessages(since) {
      const result = await runBuzzCommand(config, [
        "messages",
        "get",
        "--channel",
        config.channelId,
        "--limit",
        "100",
        "--since",
        String(since),
      ]);
      if (!Array.isArray(result)) throw plainError("Buzz message list was invalid");
      if (result.length >= 100) throw plainError("Buzz bridge backlog reached its safety limit");
      return result;
    },
    async sendMessage(content, options = {}) {
      const args = [
        "messages",
        "send",
        "--channel",
        config.channelId,
        "--content",
        "-",
      ];
      if (options.replyTo) args.push("--reply-to", options.replyTo);
      if (options.mention) args.push("--mention", options.mention);
      const result = await runBuzzCommand(config, args, content);
      if (!result?.accepted || typeof result.event_id !== "string") {
        throw plainError("Buzz rejected a message");
      }
      return result;
    },
  };
}

function createTwentyClient(config) {
  async function request(path, init = {}) {
    const response = await fetch(`${config.twentyBaseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${config.twentyApiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(8_000),
    });
    const text = await response.text();
    if (!response.ok) {
      throw plainError(`Twenty ${init.method ?? "GET"} failed with HTTP ${response.status}`);
    }
    return text.trim() ? JSON.parse(text) : {};
  }
  return {
    async findByBuzzEventId(eventId) {
      const params = new URLSearchParams({
        limit: "1",
        filter: `buzzEventId[eq]:${JSON.stringify(eventId)}`,
      });
      const result = await request(`/buzzUpdates?${params.toString()}`);
      return result?.data?.buzzUpdates?.[0] ?? null;
    },
    async createUpdate(payload) {
      const result = await request("/buzzUpdates", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const record = result?.data?.createBuzzUpdate ?? result?.data?.buzzUpdate ?? result?.data;
      if (!record || typeof record.id !== "string") throw plainError("Twenty create response was invalid");
      return record;
    },
    async patchUpdate(id, payload) {
      await request(`/buzzUpdates/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    async listOutbound() {
      const result = await request("/buzzUpdates?limit=100");
      const rows = result?.data?.buzzUpdates;
      if (!Array.isArray(rows)) throw plainError("Twenty Buzz Updates list was invalid");
      if (rows.length >= 100) throw plainError("Twenty Buzz Updates reached its safety limit");
      return rows.filter(
        (row) => row.direction === "TWENTY_TO_BUZZ" && row.syncStatus === "PENDING",
      );
    },
    publicRecordUrl(id) {
      return `${config.twentyPublicUrl}/objects/buzzUpdates/${encodeURIComponent(id)}`;
    },
  };
}

async function loadState(path, startedAt) {
  try {
    const state = JSON.parse(await readFile(path, "utf8"));
    return {
      startedAt: Number.isInteger(state.startedAt) ? state.startedAt : startedAt,
      lastBuzzTimestamp: Number.isInteger(state.lastBuzzTimestamp)
        ? state.lastBuzzTimestamp
        : startedAt,
      seenEventIds: Array.isArray(state.seenEventIds)
        ? state.seenEventIds.filter((id) => typeof id === "string").slice(-MAX_SEEN_EVENT_IDS)
        : [],
    };
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    return { startedAt, lastBuzzTimestamp: startedAt, seenEventIds: [] };
  }
}

async function saveState(path, state) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.tmp`;
  await writeFile(temporary, `${JSON.stringify(state)}\n`, { mode: 0o600 });
  await rename(temporary, path);
}

export function createBridge(options) {
  const context = {
    config: options.config,
    buzz: options.buzz,
    twenty: options.twenty,
    now: options.now ?? (() => new Date()),
  };
  let state = options.state;
  let running = false;
  return {
    async tick() {
      if (running) return;
      running = true;
      try {
        const messages = await context.buzz.listMessages(
          Math.max(context.config.startedAt, state.lastBuzzTimestamp - 2),
        );
        const seen = new Set(state.seenEventIds);
        for (const event of messages.sort((left, right) => left.created_at - right.created_at)) {
          if (typeof event.id !== "string" || seen.has(event.id)) continue;
          if (isEligibleBuzzEvent(event, context.config)) {
            await processBuzzEvent(event, context);
          }
          seen.add(event.id);
          if (Number.isInteger(event.created_at)) {
            state.lastBuzzTimestamp = Math.max(state.lastBuzzTimestamp, event.created_at);
          }
        }
        state.seenEventIds = [...seen].slice(-MAX_SEEN_EVENT_IDS);
        await options.persistState(state);

        const outbound = await context.twenty.listOutbound();
        for (const record of outbound) await processTwentyOutbound(record, context);
      } finally {
        running = false;
      }
    },
    state() {
      return structuredClone(state);
    },
  };
}

function required(name) {
  const value = process.env[name]?.trim() ?? "";
  if (!value) throw plainError(`${name} is required`);
  return value;
}

function readConfig() {
  const relayUrl = required("BUZZ_RELAY_URL").replace(/\/+$/, "");
  const twentyBaseUrl = required("BUZZ_BRIDGE_TWENTY_BASE_URL").replace(/\/+$/, "");
  const twentyPublicUrl = required("TWENTY_PUBLIC_URL").replace(/\/+$/, "");
  const privateKey = required("BUZZ_BRIDGE_PRIVATE_KEY");
  const bridgePubkey = required("BUZZ_BRIDGE_PUBKEY").toLowerCase();
  const channelId = required("BUZZ_BRIDGE_CHANNEL_ID");
  const startedAt = Number(required("BUZZ_BRIDGE_STARTED_AT"));
  if (!relayUrl.startsWith("https://")) throw plainError("BUZZ_RELAY_URL must use HTTPS");
  if (!twentyPublicUrl.startsWith("https://")) throw plainError("TWENTY_PUBLIC_URL must use HTTPS");
  if (!/^[0-9a-f]{64}$/.test(bridgePubkey)) throw plainError("BUZZ_BRIDGE_PUBKEY is invalid");
  if (!/^[0-9a-f]{64}$/.test(privateKey) && !privateKey.startsWith("nsec1")) {
    throw plainError("BUZZ_BRIDGE_PRIVATE_KEY is invalid");
  }
  if (!/^[0-9a-f-]{36}$/.test(channelId)) throw plainError("BUZZ_BRIDGE_CHANNEL_ID is invalid");
  if (!Number.isInteger(startedAt) || startedAt <= 0) throw plainError("BUZZ_BRIDGE_STARTED_AT is invalid");
  return {
    relayUrl,
    twentyBaseUrl,
    twentyPublicUrl,
    twentyApiKey: required("BUZZ_BRIDGE_TWENTY_API_KEY"),
    privateKey,
    authTag: process.env.BUZZ_BRIDGE_AUTH_TAG?.trim() ?? "",
    bridgePubkey,
    channelId,
    startedAt,
    mentionLabel: process.env.BUZZ_BRIDGE_MENTION_LABEL?.trim() || "Twenty CRM Bridge",
    buzzBinary: process.env.BUZZ_BINARY?.trim() || "/usr/local/bin/buzz",
    statePath: process.env.BUZZ_BRIDGE_STATE_PATH?.trim() || "/data/state.json",
    pollMs: Math.max(5_000, Number(process.env.BUZZ_BRIDGE_POLL_MS || 10_000)),
    port: Number(process.env.PORT || DEFAULT_PORT),
  };
}

async function main() {
  const config = readConfig();
  const state = await loadState(config.statePath, config.startedAt);
  config.startedAt = state.startedAt;
  const buzz = createBuzzClient(config);
  const twenty = createTwentyClient(config);
  const bridge = createBridge({
    config,
    buzz,
    twenty,
    state,
    persistState: (next) => saveState(config.statePath, next),
  });
  let lastErrorAt = null;
  let lastSuccessAt = null;
  const run = async () => {
    try {
      await bridge.tick();
      lastSuccessAt = new Date().toISOString();
    } catch (error) {
      lastErrorAt = new Date().toISOString();
      console.error(`[buzz-twenty-bridge] sync failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  };
  const server = createServer((request, response) => {
    if (request.method !== "GET" || request.url !== HEALTH_PATH) {
      response.writeHead(404).end();
      return;
    }
    const healthy = lastSuccessAt !== null && (Date.now() - Date.parse(lastSuccessAt)) < config.pollMs * 6;
    response.writeHead(healthy ? 200 : 503, {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    });
    response.end(JSON.stringify({ ok: healthy, lastSuccessAt, lastErrorAt }));
  });
  server.listen(config.port, "0.0.0.0");
  await run();
  setInterval(run, config.pollMs).unref();
  console.log(`[buzz-twenty-bridge] listening on port ${config.port}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(`[buzz-twenty-bridge] startup failed: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exit(1);
  });
}
