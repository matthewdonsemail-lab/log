# Naming conventions

`scripts/checkNamingConventions.mjs` is the gate that keeps this true
(`bun run check:naming`). If the doc and the gate disagree, the gate is the bug.

This follows the `{library}/{domain}/` shape from `agencyContent` and
`open-twenty-dialer`, with one change from matt: **names are camelCase, never
kebab-case**. That covers directories, domains and every `.ts` file.

## The shape

```text
src/{library}/{domain}/
├── index.ts        # required. Entry point: I/O, wiring, re-exports.
├── types.ts        # the domain's types, when it declares its own
├── client.ts       # optional. The data boundary (today the seed, later the live client).
├── machine.ts      # optional. A state machine.
└── helpers/        # optional. Pure functions only.
    ├── index.ts    # required whenever helpers/ exists.
    └── *.ts        # camelCase, pure, no I/O.
```

Read it as **library, then domain, then role**:

| Path | What it is |
| --- | --- |
| `marketplace/listing` | Facebook Marketplace listings: types, the listing machine, the data client |
| `marketplace/account` | The Facebook accounts the listings are published from |
| `cli/runner` | Command registry, dispatcher, shared CLI helpers (args, tables, usage) |
| `cli/listing` | `log listings` and `log listing <id>` |
| `cli/account` | `log accounts` |
| `cli/launch` | `log launch`, the Clack guided menu |

## Rules the gate enforces

1. Every directory and `.ts` file under `src/` and `bin/` is camelCase. `*.test.ts` sits beside what it tests.
2. Every domain has an `index.ts`.
3. Every `helpers/` has an `index.ts` barrel.
4. No helper imports its parent domain's `index.ts`.
5. No kebab-case string literal (`'under-review'`, `"no-session"`) in `src/`, `bin/`, `scripts/` or `python/`, and no kebab-case file or folder name in `skills/`, `python/` or `scripts/`.

Domains are singular (`listing`, not `listings`). Operations use
`list<Resources>` / `get<Resource>` (`listListings`, `getSellerActions`).

## Values are camelCase too (matt, 2026-10-18)

Not just file names. Every value this repo defines is camelCase: listing
statuses (`underReviewDuplicate`, `loginWall`), account ids
(`fbGalwayRubbish`), worker error codes (`noSession`), and usage placeholders
(`<listingId>`). Rule 5 of the gate rejects any kebab-case string literal in
`src/`, `bin/`, `scripts/` or `python/`.

Where another system speaks kebab-case, convert it once at the boundary and
never let it in further. Example: facebook-camofox-client's `classify_status`
returns `under-review-duplicate`, and `camofox/worker/helpers/fromCamofoxStatus.ts`
turns it into `underReviewDuplicate`.

## What is not ours

These keep their own spelling because we can't rename them:

- Other repos and packages: `facebook-camofox-client`, `@clack/prompts`, `Listaro_backup`.
- Git's fixed names: the hook file `.githooks/pre-commit`, the `rev-parse` command. The Linux opener `xdg-open`.
- npm's package `name` (`log-cli`). npm doesn't allow capital letters there.
- HTTP header names (`set-cookie`, `proxy-authorization`) and rea-agents commands
  (`inspect-web-network-capture`, `analyze-javascript-application`).
- Third-party ids: Unsplash photo ids (`photo-1558...`), the UUID template.
- Account issues (`session_expired`) are snake_case from log's shared
  account-issue vocabulary. They are not kebab-case. Rename them if matt asks.
