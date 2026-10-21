import assert from "node:assert/strict";
import test from "node:test";

import {
  containsSensitiveMaterial,
  createBridge,
  isEligibleBuzzEvent,
  parseCrmCommand,
  processBuzzEvent,
  processTwentyOutbound,
} from "./buzz-twenty-bridge.mjs";

const config = {
  bridgePubkey: "b".repeat(64),
  channelId: "3fc0d09e-36bf-4bf6-8def-de22a42630ac",
  startedAt: 1_000,
  mentionLabel: "Twenty CRM Bridge",
};

function event(overrides = {}) {
  return {
    id: "e".repeat(64),
    pubkey: "a".repeat(64),
    kind: 9,
    created_at: 1_001,
    tags: [["h", config.channelId], ["p", config.bridgePubkey]],
    content: "@Twenty CRM Bridge save decision | Approved launch | Ship after final checks",
    ...overrides,
  };
}

test("parser accepts the explicit command and normalizes its category", () => {
  assert.deepEqual(parseCrmCommand(event().content), {
    type: "save",
    category: "DECISION",
    headline: "Approved launch",
    details: "Ship after final checks",
    relatedRecordUrl: undefined,
  });
});

test("parser rejects credentials and non-Twenty links", () => {
  assert.equal(containsSensitiveMaterial("api_key=not-a-real-secret-value"), true);
  assert.equal(
    parseCrmCommand("@crm save note | Unsafe | password=not-a-real-password").type,
    "invalid",
  );
  assert.equal(
    parseCrmCommand("@crm save note | Link | Details | https://example.com/record").type,
    "invalid",
  );
});

test("eligibility requires a signed mention in the dedicated channel window", () => {
  assert.equal(isEligibleBuzzEvent(event(), config), true);
  assert.equal(isEligibleBuzzEvent(event({ tags: [["h", config.channelId]] }), config), false);
  assert.equal(isEligibleBuzzEvent(event({ created_at: 999 }), config), false);
  assert.equal(isEligibleBuzzEvent(event({ pubkey: config.bridgePubkey }), config), false);
});

test("Buzz to Twenty creates one record and acknowledges only after a sending fence", async () => {
  const patches = [];
  const sent = [];
  const result = await processBuzzEvent(event(), {
    config,
    now: () => new Date("2026-10-20T19:00:00Z"),
    buzz: {
      async sendMessage(content, options) {
        sent.push({ content, options });
        return { accepted: true, event_id: "f".repeat(64) };
      },
    },
    twenty: {
      async findByBuzzEventId() {
        return null;
      },
      async createUpdate(payload) {
        assert.equal(payload.buzzEventId, event().id);
        assert.equal(payload.syncStatus, "PENDING_REPLY");
        return { id: "record-1", syncStatus: "PENDING_REPLY" };
      },
      async patchUpdate(id, payload) {
        patches.push({ id, payload });
      },
      publicRecordUrl(id) {
        return `https://twenty.listeningkit.com/objects/buzzUpdates/${id}`;
      },
    },
  });
  assert.equal(result.outcome, "saved");
  assert.equal(patches[0].payload.syncStatus, "SENDING_REPLY");
  assert.equal(patches[1].payload.syncStatus, "SYNCED");
  assert.equal(sent.length, 1);
  assert.equal(sent[0].options.replyTo, event().id);
});

test("Twenty to Buzz moves through SENDING before publishing", async () => {
  const patches = [];
  const result = await processTwentyOutbound(
    {
      id: "record-2",
      direction: "TWENTY_TO_BUZZ",
      syncStatus: "PENDING",
      category: "FOLLOW_UP",
      headline: "Call customer",
      details: "Confirm the next step.",
    },
    {
      config,
      now: () => new Date("2026-10-20T19:00:00Z"),
      buzz: {
        async sendMessage() {
          assert.equal(patches[0].payload.syncStatus, "SENDING");
          return { accepted: true, event_id: "c".repeat(64) };
        },
      },
      twenty: {
        async patchUpdate(id, payload) {
          patches.push({ id, payload });
        },
        publicRecordUrl(id) {
          return `https://twenty.listeningkit.com/objects/buzzUpdates/${id}`;
        },
      },
    },
  );
  assert.equal(result.outcome, "posted");
  assert.equal(patches.at(-1).payload.syncStatus, "SYNCED");
});

test("bridge ignores unsigned text and persists a bounded cursor", async () => {
  const persisted = [];
  let outboundChecks = 0;
  const bridge = createBridge({
    config,
    state: { startedAt: 1_000, lastBuzzTimestamp: 1_000, seenEventIds: [] },
    async persistState(state) {
      persisted.push(structuredClone(state));
    },
    buzz: {
      async listMessages() {
        return [event({ id: "1".repeat(64), tags: [["h", config.channelId]] })];
      },
      async sendMessage() {
        throw new Error("unsigned text must not be handled");
      },
    },
    twenty: {
      async listOutbound() {
        outboundChecks += 1;
        return [];
      },
    },
  });
  await bridge.tick();
  assert.equal(persisted.length, 1);
  assert.deepEqual(persisted[0].seenEventIds, ["1".repeat(64)]);
  assert.equal(outboundChecks, 1);
});
