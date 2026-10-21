import assert from "node:assert/strict";
import { test } from "node:test";
import { createRelayHandler } from "./newsletter-relay.mjs";

const relayToken = "r".repeat(48);
const twentyApiKey = "test-twenty-key";
const endpoint = "http://relay.test/v1/newsletter/subscribe";

function subscribeRequest(body, token = relayToken) {
  return new Request(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

test("rejects unauthenticated writes without calling Twenty", async () => {
  let calls = 0;
  const handler = createRelayHandler({
    relayToken,
    twentyApiKey,
    twentyBaseUrl: "http://twenty.test/rest",
    fetchImpl: async () => {
      calls += 1;
      return new Response();
    },
  });

  const response = await handler(subscribeRequest({ email: "person@example.test" }, "wrong"));

  assert.equal(response.status, 401);
  assert.equal(calls, 0);
});

test("normalizes and creates a newsletter member", async () => {
  const calls = [];
  const handler = createRelayHandler({
    relayToken,
    twentyApiKey,
    twentyBaseUrl: "http://twenty.test/rest/",
    now: () => new Date("2026-10-20T12:00:00.000Z"),
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), init });
      if (init?.method === "POST") {
        return Response.json({ data: { createNewsletterMember: { id: "new-id" } } });
      }
      return Response.json({ data: { newsletterMembers: [] } });
    },
  });

  const response = await handler(
    subscribeRequest({ email: "  Person@Example.Test ", firstName: "  Ada  " }),
  );

  assert.equal(response.status, 200);
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /newsletterMembers\?/);
  assert.equal(calls[0].init.headers.Authorization, `Bearer ${twentyApiKey}`);
  assert.deepEqual(JSON.parse(calls[1].init.body), {
    email: "person@example.test",
    firstName: "Ada",
    source: "listeningkit-website",
    status: "ACTIVE",
    consentAt: "2026-10-20T12:00:00.000Z",
  });
});

test("updates an existing member and hides Twenty response bodies", async () => {
  const originalConsoleError = console.error;
  const errors = [];
  console.error = (message) => errors.push(String(message));
  try {
    let calls = 0;
    const handler = createRelayHandler({
      relayToken,
      twentyApiKey,
      twentyBaseUrl: "http://twenty.test/rest",
      fetchImpl: async (_url, init) => {
        calls += 1;
        if (calls === 1) {
          return Response.json({ data: { newsletterMembers: [{ id: "existing-id" }] } });
        }
        assert.equal(init.method, "PATCH");
        return new Response("private upstream details", { status: 500 });
      },
    });

    const response = await handler(subscribeRequest({ email: "person@example.test" }));
    const result = await response.json();

    assert.equal(response.status, 502);
    assert.deepEqual(result, { error: "sync_failed" });
    assert.equal(errors.length, 1);
    assert.doesNotMatch(errors[0], /private upstream details|person@example\.test|test-twenty-key/);
  } finally {
    console.error = originalConsoleError;
  }
});

test("rejects invalid input before calling Twenty", async () => {
  let calls = 0;
  const handler = createRelayHandler({
    relayToken,
    twentyApiKey,
    twentyBaseUrl: "http://twenty.test/rest",
    fetchImpl: async () => {
      calls += 1;
      return new Response();
    },
  });

  const response = await handler(subscribeRequest({ email: "not-an-email" }));

  assert.equal(response.status, 400);
  assert.equal(calls, 0);
});
