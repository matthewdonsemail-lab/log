---
name: host
description: Run an account's whole lifecycle (rule 35) in ONE browser kept open for its day - log host start opens it once, signs in by the session cookie, checks the account, sets profile/name/location (--live), runs the warm-up and watches, saving progress on every change so a restart resumes at the exact next step. Use when matt says host, keep it open, run the account, resume, or the persistent browser.
---

# host

## Hard boundaries

1. **One browser per account per local day** (rule 35). The host opens it
   through every gate; every step is a command to it; it closes only for a
   logged reason (end of day, shutdown, restriction, lost, crash).
2. **Signed in means the session cookies** (`c_user` and `xs`), never the
   page's wording. Signed out with no form: `/login/`. Two failed sign-ins in a
   row go to a person (`signInSpent`), never round again.
3. **Every page is checked for where it landed** (`pageProblem`): a checkpoint,
   a sign-out or a restriction is the step's outcome and goes to Twenty.
4. **Writes need matt:** `--live` for profile, name and Marketplace location
   (rules 8, 28); `--likes` for the warm-up's likes.
5. **Stop with SHUTDOWN, never by killing it,** so the browser closes for its
   reason and the session and device are saved (`log host send ... SHUTDOWN`,
   or Ctrl+C).

## The routine

```bash
log host start --account <a> [--live] [--likes] --gapMinutes 2 --watchMinutes 2 [--groupMinutes 60]   # watched; default 150 / 12 / 60
log host status [--account <a>]          # state, warm-up done, opens today, every close and its reason
log host send --account <a> PERSON_DONE  # after clearing a checkpoint by hand in the window
log host send --account <a> SHUTDOWN
```

Every watch check also reads each group the account is a member of that is
due (`--groupMinutes`, default 60; 0 reads none): the group firehose (rule 62).
The posts and comments go to `agencyGroupPosts` and `agencyGroupComments`, and
OpenMagpie reads them from Twenty (`log read group --worker`). A checkpoint on
a group page is the account's issue, as on any page.

Run `start` through Monitor (rule 26). A restart reads
`~/.logCli/runs/host/<a>/progress.json` and resumes: the warm-up activities
done, today's opens; a fresh browser opens and the router walks to the next
step. Too soon after the last launch (rule 24), the host waits the gap out.

A save Twenty refused keeps the run's device and session in
`~/.logCli/runs/unsaved/` (login removed): `log account resave <a> --from <dir>`.

`opensSpent` or `launchBudgetSpent` ends the day. Only when matt asks, close
every browser (`log host send --account <a> SHUTDOWN`), then run `log account
resetOpens <a>|all --reason "<why>"` (rule 37). It deletes nothing.

Code: `src/marketplace/host` (the runner), `src/cli/host` (the steps),
`src/marketplace/lifecycle` (the machine). Doc: `docs/lifecycle.md`.
