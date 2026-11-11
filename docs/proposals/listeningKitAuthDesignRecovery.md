# Recovered authentication designs

Source: `c1659cad^`, before authentication pages were deleted.

- `site/apps/web/src/pages/onboarding/OnboardingAuth.tsx`: white two-column layout, left form, full-height right showcase, Satoshi, logo, blue action and rounded fields.
- `site/apps/web/src/landing/UsecaseLoop.tsx`: restored from that revision using existing dither, ears, phone clips and styles.
- Earlier `OnboardingShell.tsx` contained the blue cloud backdrop; the final historical auth page used white mode without the cloud hero.

Current skeleton: `site/apps/web/src/pages/auth/AuthPage.tsx`.

| Schema route | Screen | Initial state |
| --- | --- | --- |
| `/sign-in` | Email entry and request code | idle |
| `/verify` | Code entry and verification | waiting |
| `/login` | Redirect to `/sign-in` | Compatibility alias |

Contracts: listeningKitSchema.yaml frontend pages and listeningKitConsole.md route contract. Actual successful verification must precede teams. This design preview sends no email and creates no session; submission reports the unavailable service. Footer preview links switch screens independently of authentication.

Historical Clerk and Convex behavior is not restored. Remaining team and console pages are outside this login-design recovery.

## Account settings presentation

`site/apps/web/src/pages/console/SettingsPage.tsx` replaces the settings placeholder with Change password and Delete account tabs. The password form confirms matching entries and clears submitted credentials; deletion requires typing DELETE. Keyboard navigation supports arrows, Home and End. No backend operation is connected: submission explicitly reports that no password change or deletion occurred. Password sign-in/account recovery semantics are not implemented by this UI; the accepted hosted sign-in contract remains email OTP until explicitly extended.

## Expanded showcase and SSO preview

The right panel keeps the original ears, dither, grid and automatic vertical filmstrip. It cycles the original videos and all existing animated stories for X, Discord, Slack, Instagram and Reddit, then slides into a duplicate first frame before resetting seamlessly. There are no platform tabs or manual carousel controls. Hover pauses playback; reduced motion stays static. These are showcase examples, independent of private workspace data.

Google and GitHub buttons recover the provider choices from the historical OnboardingAuth.tsx. This is a requested design extension beyond the current email-only schema: provider endpoints, identity linking and callbacks still require an explicit schema/backend implementation. Buttons report that sign-in is not connected and do not simulate a successful session.
