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

Domains are singular (`listing`, not `listings`). Operations use
`list<Resources>` / `get<Resource>` (`listListings`, `getSellerActions`).

## What is not ours

Values that come from another system keep that system's spelling. Listing
statuses (`under-review-duplicate`), account ids (`fb-galway-rubbish`) and
account issues (`proxy_unreachable`) are data from listeningkit-hackathon, so
they are copied verbatim. The rule above is about names in this repo's source tree.
