/**
 * Camoufox as a browser (rule 44): the open-source Firefox log-cli started on. Its launch,
 * device and gate live in the `camofox` library (`src/camofox/*`, `python/browser/visibleBrowser.py`,
 * `python/browser/proxyGate.py`, `python/device/deviceProfile.py`). This domain is its place among the
 * browsers: its row of the parity table, and its driver for the session machine.
 */
import type { BrowserCapabilities } from '../driver/types'

/** Camoufox's row of the parity table (docs/browsers.md). */
export const camoufoxCapabilities = {
  headedWindow: { status: 'built', how: 'visibleBrowser.launch_kwargs: headless False, humanize, showcursor (rule 11)' },
  proxyGate: { status: 'built', how: 'proxyGate.apply() builds the only launch options; the launch guard refuses any other' },
  selfCheck: { status: 'built', how: "proxyGate's new_context guard runs _self_check before the caller gets the context" },
  sessionHar: { status: 'built', how: "Playwright's record_har_path, forced on every context by the gate" },
  stepHar: { status: 'built', how: "harRecorder.Recorder, the inspect session's per-step HAR" },
  humanMouse: { status: 'built', how: "HumanMouse on the Playwright page; Camoufox's humanize per-hop curve capped at 20 ms" },
  scrollMotion: { status: 'built', how: 'scrollMotion wheel trajectories on the Playwright page' },
  devicePinned: { status: 'built', how: 'deviceProfile.py: one Windows identity per account in socialAccounts.deviceProfile (rule 15)' },
  localePinned: { status: 'built', how: 'HOME_COUNTRIES locale in the launch; the self-check checks it (rule 16)' },
  sessionCarried: { status: 'built', how: "Twenty's cookies and localStorage as the context's storage_state each open" },
  sessionSaved: { status: 'built', how: 'saveState writes the context storage state, saved to Twenty' },
  inspectSession: { status: 'built', how: 'python/browser/browserDriver.py open_camoufox' },
  syncSessions: { status: 'built', how: 'publishSession, connectSession and profileSession launch it (sync API)' },
  oneMachineAtATime: { status: 'notApplicable', how: 'Camoufox runs only where log-cli runs; there is no shared profile to open twice' }
} as const satisfies BrowserCapabilities
