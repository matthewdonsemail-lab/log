# SubQ port matrix — log-cli families → fbk direct API

Scored by SubQ (2026-10-25), one call per family. Sorted by tier, then safest-first.

| Family | Kind | Tier | Tier conf | Low-risk-first |
|---|---|---|---|---|
| read group posts/comments | read | **shipsInFbk** | 100% | 100% |
| read members | read | **shipsInFbk** | 100% | 100% |
| poll group | read | **shipsInFbk** | 98% | 100% |
| conversations/inbox read | read | **shipsInFbk** | 100% | 100% |
| join group | mutation | **shipsInFbk** | 100% | 3% |
| conversation reply | mutation | **shipsInFbk** | 100% | 3% |
| profilePost (own feed) | mutation | **shipsInFbk** | 100% | 1% |
| postComment | mutation | **shipsInFbk** | 100% | 1% |
| deletePost | mutation | **shipsInFbk** | 100% | 0% |
| publish marketplace listing | mutation | **portableFromRecordings** | 100% | 1% |
| setLocation (publish step) | mutation | **portableFromRecordings** | 100% | 1% |
| check (Selling status/listings/inbox) | read | **needsPlaywrightCapture** | 85% | 100% |
| scan (Selling) | read | **needsPlaywrightCapture** | 94% | 100% |
| status (item classify) | read | **needsPlaywrightCapture** | 93% | 100% |
| watch (listing monitor) | read | **needsPlaywrightCapture** | 100% | 100% |
| profile setup (picture/cover/name) | mutation | **needsPlaywrightCapture** | 69% | 5% |
| messengerPinCreate | mutation | **needsPlaywrightCapture** | 100% | 0% |
| warmup (feed/reel/stages) | read | **mustStayBrowser** | 98% | 99% |
| host (onboarding lane) | login | **mustStayBrowser** | 100% | 7% |
| connect (login) | login | **mustStayBrowser** | 98% | 3% |
