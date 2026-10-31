# Naming conventions

log names everything in camelCase, never kebab-case: folders, files, values, ids and error codes. Code is laid out as library, then domain, then a small set of role files. Read this before adding a folder, file or value, because a check refuses anything that breaks these rules.

The check is `scripts/checks/checkNamingConventions.mjs` (`bun run check:naming`). If this page and the check disagree, the check is the bug.

## The shape

```text
src/{library}/{domain}/
├── index.ts        # required. Entry point: I/O, wiring, re-exports.
├── types.ts        # the domain's types, when it declares its own
├── client.ts       # optional. The data boundary (a seed, or the live client).
├── machine.ts      # optional. A state machine.
└── helpers/        # optional. Pure functions only.
    ├── index.ts    # required whenever helpers/ exists.
    └── *.ts        # camelCase, pure, no I/O.
```

Read a path as **library, then domain, then role**:

| Path | What it is |
| --- | --- |
| `marketplace/listing` | Facebook Marketplace listings: types, the listing machine, the data client |
| `marketplace/account` | The Facebook accounts the listings are published from |
| `cli/runner` | The command registry, dispatcher and shared CLI helpers (args, tables, usage) |
| `cli/listing` | `log facebook listings` and `log facebook listing <id>` |
| `cli/account` | `log facebook accounts` |
| `cli/launch` | `log launch`, the guided menu |

## What the check enforces

1. Every folder and `.ts` file under `src/` and `bin/` is camelCase. A `*.test.ts` file sits beside what it tests.
2. Every domain has an `index.ts`.
3. Every `helpers/` folder has an `index.ts` that re-exports its helpers.
4. No helper imports its parent domain's `index.ts`.
5. No kebab-case string literal (`'under-review'`, `"no-session"`) in `src/`, `bin/`, `scripts/` or `python/`, and no kebab-case file or folder name in `skills/`, `python/` or `scripts/`.

Two more habits:

- Domains are singular: `listing`, not `listings`.
- Operations are named `list<Resources>` / `get<Resource>` (`listListings`, `getSellerActions`).

## Values are camelCase too

Not just file names. Every value log defines is camelCase: listing statuses (`underReviewDuplicate`, `loginWall`), account ids (`fbGalwayRubbish`), worker error codes (`noSession`) and usage placeholders (`<listingId>`).

When another system uses kebab-case, convert it once, at the boundary, and never let it further in. For example, an earlier Facebook client's `classify_status` returns `under-review-duplicate`, and `camofox/worker/helpers/fromCamofoxStatus.ts` turns it into `underReviewDuplicate`.

## What isn't ours to rename

These keep their own spelling:

- Other projects' and packages' names, such as `@clack/prompts`.
- Git's fixed names: the `pre-commit` and `pre-push` hooks, the `rev-parse` command. The Linux opener `xdg-open`.
- npm's package `name` (`log-cli`), since npm doesn't allow capital letters there.
- HTML attribute names read from a site's page (`aria-label`).
- HTTP header names (`set-cookie`, `proxy-authorization`, `content-type`) and rea-agents commands (`inspect-web-network-capture`, `analyze-javascript-application`).
- Third-party ids: Unsplash photo ids (`photo-1558...`), the UUID template.
- Account issues (`session_expired`), which are snake_case from log's shared account-issue vocabulary. They aren't kebab-case.
