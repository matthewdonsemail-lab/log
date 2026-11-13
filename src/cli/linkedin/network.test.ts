import { describe, expect, test } from "bun:test";
import { linkedinConnectCommand, linkedinSuggestionsCommand, profileOf } from "./helpers/network.ts";

describe("linkedin suggestions and connect inputs", () => {
  test("profileOf takes a public id or a profile url, lowercased", () => {
    expect(profileOf("JaneDoe123")).toBe("janedoe123");
    expect(profileOf("https://www.linkedin.com/in/janedoe123/")).toBe("janedoe123");
    expect(profileOf("https://www.linkedin.com/in/janedoe123?trk=x")).toBe("janedoe123");
    expect(profileOf("")).toBe("");
    expect(profileOf("a b")).toBe("");
  });

  test("connect is a write that needs --approvedBy with --live, suggestions only reads", async () => {
    expect(linkedinConnectCommand.effect).toBe("write");
    expect(linkedinSuggestionsCommand.effect).toBe("read");
    const run = await linkedinConnectCommand.run({ err: () => {} } as never, ["--account", "a", "--profile", "janedoe123", "--live"]);
    expect(run.code).toBe(1);
    expect(run.stderr ?? "").toContain("notApproved");
  });
});
