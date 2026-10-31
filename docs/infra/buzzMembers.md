# Joining ListeningKit's Buzz community

ListeningKit's Buzz workspace is self-hosted on node02. The community address
is:

```text
wss://buzz.listeningkit.com
```

No Tailscale client or VPN is needed. Normal Wi-Fi or mobile data works.

Member access is tied to a person's Buzz identity, which is a Nostr keypair.
Joining this community does not create a new identity: Buzz reuses the identity
already stored in the app.

## Desktop

1. Open Buzz.
2. Open the community switcher.
3. Choose **Join a community**.
4. Enter `wss://buzz.listeningkit.com`.
5. Keep the current identity; do not create a new one.
6. Continue and confirm the migrated channels and history appear.

## Phone with Buzz already installed

1. Open Buzz.
2. Choose **Join a community** or **Add community**.
3. Enter `wss://buzz.listeningkit.com`.
4. Use the identity already stored in the app.

## New phone carrying an existing identity

Do not create a new identity. The existing private key must move to the new
phone first.

1. On the current phone or desktop, open **Settings → Mobile pairing**.
2. Generate a new pairing code.
3. On the new phone, choose **Pair with desktop** or **Scan pairing code**.
4. Scan the QR code, or enter the `nostrpair://...` code.
5. Confirm the matching security code on both devices.
6. Join `wss://buzz.listeningkit.com`.

A pairing code starts with `nostrpair://` and expires. The community address is
not a pairing code.

If pairing is unavailable, use Buzz's **Save nsec backup** and import that
backup on the new device. The `nsec` is the private key: never send it in chat,
email or a public issue. The `npub` is the public identity and is safe to share.

## A new member

A relay owner or admin must first add the person's public key to the closed
relay:

```bash
docker exec buzz /usr/local/bin/buzz-admin add-member --pubkey <HEX> --role member
```

Add people one at a time, a few seconds apart. The roster is published as one
signed event and simultaneous additions can overwrite each other.

After the public key is on the roster, the person joins with the community
address above using that same identity.

## Common errors

| Message | Meaning | Action |
| --- | --- | --- |
| Invalid pairing code | The value is not a fresh `nostrpair://` code | Generate a new mobile pairing code on the desktop |
| Could not connect | The phone cannot reach the public relay | Check normal internet access, then retry |
| Not a relay member | The app is using a different identity | Send the owner the Buzz name or `npub`; never send the `nsec` |
| Empty channels after joining | Wrong relay or an incomplete identity transfer | Confirm the exact address and that the existing identity was used |

## Known migration limitations

Historical attachment URLs still point at the old hosted media hostname. The
original media files are mirrored on node02, but an old image or file may fail
to render. Relay-hosted Git object data was also not mirrored; repository
records are present.
