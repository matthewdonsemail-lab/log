# Isolation and reputation

One phone per account, one route per phone, one app per account. That is real
and it is worth doing. It is also not the same thing as a safe account, and
the two get confused often enough to be worth writing down plainly.

## What the isolation does

| It does | Because |
| --- | --- |
| Keeps one account's session, device id, cache and media out of another account's | they are different installs on different phones |
| Keeps one account's traffic out of another account's route | each phone leaves through its own proxy |
| Keeps one account's restriction from being another account's problem | the accounts share no install and no route |
| Gives each account a steady device | the same phone, the same serial, the same OS version, for as long as it is attached |

That last one matters more than it looks: a phone that keeps its identity
across months does not suddenly look new.

## What it does not do

- **It does not clear an account's reputation.** The account's history is
  the account's history. A phone that has never been used before does not
  take that history with it, and the platform keeps the history.
- **It does not stop a platform from restricting an account.** A restricted
  account on its own phone, on its own proxy, is still restricted.
- **It does not stand in for the platform's rules.** Separate profiles do not
  exempt accounts from the rules the platform sets.
- **It does not stand in for the filters a community puts on an account.** A
  community that filters by standing does not care which phone the account
  posts from.

## Reddit's Contributor Quality Score

Reddit assigns accounts a Contributor Quality Score, and communities that use
it filter what those accounts can post and where. A separate phone per
account does nothing about the score: the score is about what the account has
done, not about what the account does it from. An account with a poor score
can have its posts and comments filtered in a community that uses CQS even
when it runs on its own Android 14 phone with its own US proxy.

That is why the practice is to spend time in conversations before publishing
promotional content: the score moves because of what the account does, not
because of where it does it from.

## The same, for a proxy

A proxy changes where the traffic comes from. It does not change what the
account has done. A proxy will not rescue an account with a bad reputation,
and a proxy does not buy the right to ignore the rules.

## None of it is a guarantee

No arrangement of phones, proxies or profiles guarantees that an account
will not get restricted. This layer makes one thing true: the accounts do not
hurt each other. What each account does on its own is still the account's own
doing, and it is still measured.

## What log does, and does not do

Log does the mechanical part, and only the mechanical part:

| Log does | Log does not |
| --- | --- |
| Keep one phone bound to one account, and refuse to mix them | promise that an account is safe |
| Drive that phone through its own commands, and record every step | post anything, or sign in as the account |
| Keep the route label with the phone, and read the phone's own exit | hide the account's history, or act on its behalf |
| Say what it found, and let the platform's own answer decide | decide that an account is in good standing |

The last row is the one that matters most. Every answer on this layer comes
from the phone: the model, the OS version, the app in the front, the screen,
the UI tree, the calls the app made. The account's standing is the
platform's to decide, and log reports what the platform says.

