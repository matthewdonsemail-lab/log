# Add your accounts

Every account needs two things: a name log knows it by, and a signed-in session. You add the account once, sign it in, then check it.

## 1. Add the account

Accounts live on your machine, in `~/.logCli/localAccounts.json`.

```bash
log localAccount add --platform twitter --account yourhandle
log localAccount list
```

`--platform` is `twitter`, `reddit`, `facebook` or `discord`. For accounts that run in a browser, also pass the account's browser profile with `--adsPower <profileId>`. Facebook accounts also need `--proxy`, `--home <country code>` and `--city`.

X and LinkedIn accounts can skip this step: saving their cookies (below) adds them.

## 2. Sign it in

### X and LinkedIn: paste the cookies

1. Open the site in a browser where the account is signed in.
2. Export its cookies with a cookie-export browser extension.
3. Run the command and paste the values into the masked prompt.

```bash
log twitter cookies save --account yourhandle
log linkedin cookies save --account your-public-id
```

X asks for `auth_token`, `ct0` and `twid`. LinkedIn asks for `li_at` and `JSESSIONID`, and `--account` is the part after `linkedin.com/in/`. log checks the cookies with the platform before it saves them. They're never shown or passed as flags.

### Reddit and Discord: sign in once in the account's browser

Open the account's own browser, sign in by hand, then stop it. The session is saved when it stops.

```bash
log inspect start --account yourname
# sign in in the window that opens
log inspect do stop --account yourname
```

### Facebook: connect

```bash
log facebook connect --account yourname
```

This opens the account's browser through its proxy and signs in. If the platform asks for something only you can give, finish it in the window.

## 3. Check it

```bash
log twitter session check --account yourhandle
```

Each platform has the same check: `log reddit session check`, `log discord session check`, `log linkedin session check`. It sends nothing. The answer is `loggedIn`, `loggedOut` or `restricted`. If it says `loggedOut`, sign in again.

## Many accounts

To keep many accounts in one shared place instead of a local file, use [Twenty](twenty.md). `log localAccount pull` copies the accounts Twenty has into your local file.

Next: [connect your agent](mcp.md).
