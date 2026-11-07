import { describe, expect, test } from "bun:test";

import {
  AnonymousRedditAuthenticationContext,
  AuthenticatedRedditAuthenticationContext,
  RedditAuthenticationContext,
  VERSION,
  type RequestParity,
} from "../src";

describe("reversechud", () => {
  test("exposes its version", () => {
    expect(VERSION).toBe("0.1.0");
  });

  test("represents anonymous authentication without null", () => {
    const authentication = new AnonymousRedditAuthenticationContext();
    const request: RequestParity = { authentication };

    expect(request.authentication).toBeInstanceOf(
      RedditAuthenticationContext,
    );
    expect(request.authentication).toBe(authentication);
  });

  test("represents an authenticated Reddit session", () => {
    const authentication = new AuthenticatedRedditAuthenticationContext(
      "spez",
    );
    const request: RequestParity<AuthenticatedRedditAuthenticationContext> = {
      authentication,
    };

    expect(request.authentication.username).toBe("spez");
    expect(request.authentication).toBeInstanceOf(
      RedditAuthenticationContext,
    );
  });

  test("rejects an empty authenticated username", () => {
    expect(() => new AuthenticatedRedditAuthenticationContext("")).toThrow(
      "username cannot be empty",
    );
  });
});
