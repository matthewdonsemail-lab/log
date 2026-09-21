# ListeningKit Connect Extension

This is a Chrome Manifest V3 extension for connecting a browser session to ListeningKit.

## Flow

1. Open a supported site in the active tab: Reddit, X/Twitter, or Facebook.
2. Click the ListeningKit extension action.
3. The popup detects the platform from the active tab URL.
4. It reads the complete cookie jar for that platform's domains using `chrome.cookies`.
5. It checks for the platform's session cookies before offering a token.
6. The token can be copied locally or saved as a named browser profile.
7. A saved profile can explicitly fill a token and proxy into a form on the active page.

## Session checks

The checks are intentionally small readiness checks, not an allowlist for the cookie jar:

- Reddit: `token_v2` or `reddit_session`
- X/Twitter: both `auth_token` and `ct0`
- Facebook: both `c_user` and `xs`

All cookies are retained in the generated token because platform clients can need additional scope, routing, or anti-CSRF cookies as their web applications change. The token is sensitive session material and must be treated like a password. Profiles are stored in Chrome local extension storage and are never uploaded automatically.

These cookie names are implementation details of the web applications, not a stable public authentication API. Reddit officially recommends OAuth for API integrations; cookie import is used here only for the user's own browser session and may stop working when a platform changes its session model.

## Permissions

The manifest uses `activeTab`, `cookies`, `clipboardWrite`, `storage`, and `scripting`, plus host permissions limited to the three supported platforms. It has no dashboard credentials, arbitrary host access, or network request code.

## Local development

Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select this directory. The packaging script used by the web app is:

```text
python scripts/build-extension.py
```
