# Signing in

`log login` signs the CLI in to your workspace, so commands can act as you.
It uses a standard OAuth flow with PKCE: Twenty is the identity provider, and a
companion web app runs the sign-in page. You only need this when log talks to a
shared workspace rather than local accounts.

## How it works

1. `log login` makes a state nonce and a PKCE challenge, then starts a one-shot
   server on `127.0.0.1`.
2. It opens `<webUrl>/login?state=…&code_challenge=…&exchange=…`. You sign in
   to Twenty there.
3. The web app sends the tokens back to that local server. log accepts them
   only if the state and challenge match this run.
4. The token is checked with the web app's API (`GET /api/auth/me`) and saved
   in `~/.logCli/auth/` (`LOG_HOME` moves it).

`log whoami` shows who you are signed in as, and refreshes the token through
`POST /api/auth/refresh` when it has expired.

## Options

- `--token <accessToken>`: paste a token instead, for terminals with no
  browser.
- `--webUrl` / `--apiUrl` (or `LOG_WEB_URL` / `LOG_API_URL`): point at another
  web app, for example a local one.

The CLI never holds the OAuth client secret.
