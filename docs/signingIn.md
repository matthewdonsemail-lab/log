# Signing in (`log login`)

The same OAuth flow as `blaster login` (blaster `packages/blaster-cli/src/cli/login.ts`).
Twenty is the identity provider, and blaster's hosted web app
(`https://blaster.listeningkit.com`) runs the sign-in page.

1. `log login` makes a state nonce and a PKCE challenge, then starts a one-shot server on `127.0.0.1`.
2. It opens `<webUrl>/login?state=…&code_challenge=…&exchange=…`. You sign in to Twenty there.
3. The web app POSTs the tokens back to the loopback. log-cli only accepts them if state and challenge match this run.
4. The token is checked through blaster's API (`GET /api/auth/me`) and saved in `~/.logCli/auth/`
   (`LOG_HOME` moves it). `log whoami` refreshes it through `POST /api/auth/refresh` when it expires.

`--token <accessToken>` is the paste path for headless terminals. `--webUrl` / `--apiUrl`
(or `LOG_WEB_URL` / `LOG_API_URL`) point at a local blaster. The CLI never holds the
OAuth client secret.
