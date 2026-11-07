/**
 * Base type for authentication state carried by a Reddit request.
 *
 * The private field makes authentication contexts nominal: a plain object
 * cannot accidentally satisfy this type.
 */
export class RedditAuthenticationContext {
  readonly #authenticationContext = true;

  protected constructor() {}
}

/** Authentication state for requests that do not require a Reddit session. */
export class AnonymousRedditAuthenticationContext extends RedditAuthenticationContext {
  constructor() {
    super();
  }
}

/** Authentication state after password acceptance while Reddit awaits 2FA. */
export class TwoFactorRedditAuthenticationContext extends RedditAuthenticationContext {
  constructor(readonly username: string) {
    super();
    validateUsername(username);
  }
}

/** Authentication state for requests made with an established Reddit session. */
export class AuthenticatedRedditAuthenticationContext extends RedditAuthenticationContext {
  constructor(readonly username: string) {
    super();
    validateUsername(username);
  }
}

/** Associates a request with the authentication state required to send it. */
export interface RequestParity<
  TAuthentication extends RedditAuthenticationContext = AnonymousRedditAuthenticationContext,
> {
  readonly authentication: TAuthentication;
}

function validateUsername(username: string): void {
  if (username.length === 0) {
    throw new TypeError("Reddit username cannot be empty");
  }
}
