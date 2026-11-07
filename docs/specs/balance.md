---
title: "Provider balances"
---

# Provider balances

Every paid provider log calls, with what is left, so a failing voice note, gate or search is seen as money and not a bug. Reading a balance spends nothing, and topping up is matt's. Rules 41, 73, 94 and 164.

## Reading

### REQ-BALANCE-01: One command shows every paid provider

`log balance` (MCP `balance`) lists SubQ, Jina, Inworld, Fish Audio, AssemblyAI, Parallel, treg, 2Captcha and Byteful, each with its state (ok, low, empty, out of credit, failing, unknown, not set up), what it is used for and where it is topped up. `--provider` shows one. Any that is low, empty or out of credit leads the answer as `>>> NEEDS MONEY`.

Checked by: code and SubQ

### REQ-BALANCE-02: A balance API is read where the provider has one

Jina's token balance, Fish Audio's credit, treg's balance, 2Captcha's balance and Byteful's residential traffic and credit are read from the provider's own answer, with GET or the provider's own CLI, never a call that costs money.

Checked by: code and SubQ

### REQ-BALANCE-03: Without a balance API, the last real answer decides

SubQ, Inworld, AssemblyAI and Parallel have no balance API, so their state is their last answer to a real call log made. A provider with no key is not set up, and nothing is called for it.

Checked by: code and SubQ

## Every answer kept

### REQ-BALANCE-04: Each paid call's answer is kept

The SubQ, Jina, Inworld, Fish Audio and AssemblyAI clients record each answer's status, time and, on a failure, what the provider said, in `~/.logCli/billing/answers.jsonl` (`LOG_BILLING_ANSWERS` moves it). A 402, or words like insufficient credit, payment required, quota exceeded or creation limit, mark the answer out of credit.

Checked by: code and SubQ

### REQ-BALANCE-05: Out of credit is said in the failure itself

When a provider answers that it is out of credit, the error the call returns says so and names where to top up and `log balance`, and SubQ's error has the code `providerOutOfCredit`, so the failure is never read as a bug in log.

Checked by: code and SubQ
