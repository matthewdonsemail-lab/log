import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface ConsoleTrouble {
  kind: "console" | "exception" | "log";
  text: string;
}

interface Frame {
  id?: number;
  sessionId?: string;
  method?: string;
  params?: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: { message?: string };
}

const DEFAULT_CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

export function chromeBinary(): string {
  const named = process.env.LOG_CHROME?.trim();
  if (named && existsSync(named)) return named;
  const found = DEFAULT_CHROME.find((path) => existsSync(path));
  if (!found) throw new Error("mcpApps: no Chrome or Edge found; set LOG_CHROME to the browser binary");
  return found;
}

export function freePort(): number {
  const probe = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response("") });
  const port = probe.port ?? 0;
  probe.stop(true);
  return port;
}

const IGNORED = [/favicon/i, /net::ERR_ABORTED/, /Failed to load resource: the server responded with a status of 404/];

export class Tab {
  readonly trouble: ConsoleTrouble[] = [];
  private id = 0;
  private pending = new Map<number, (answer: Frame) => void>();
  private sessions: string[] = [];
  private socket: WebSocket;

  private constructor(socket: WebSocket) {
    this.socket = socket;
    socket.onmessage = (event) => {
      const frame = JSON.parse(String(event.data)) as Frame;
      if (frame.id !== undefined && this.pending.has(frame.id)) {
        this.pending.get(frame.id)?.(frame);
        this.pending.delete(frame.id);
        return;
      }
      this.onEvent(frame);
    };
  }

  static async attach(socketUrl: string): Promise<Tab> {
    const socket = new WebSocket(socketUrl);
    await new Promise<void>((resolve, reject) => {
      socket.onopen = () => resolve();
      socket.onerror = () => reject(new Error(`mcpApps: could not attach to ${socketUrl}`));
    });
    return new Tab(socket);
  }

  private onEvent(frame: Frame): void {
    const params = frame.params ?? {};
    if (frame.method === "Target.attachedToTarget") {
      const info = (params.targetInfo ?? {}) as { type?: string };
      const session = String(params.sessionId ?? "");
      if (info.type === "iframe" && session) {
        this.sessions.push(session);
        this.send("Runtime.enable", {}, session).catch(() => {});
        this.send("Log.enable", {}, session).catch(() => {});
      }
      return;
    }
    if (frame.method === "Target.detachedFromTarget") {
      const session = String(params.sessionId ?? "");
      this.sessions = this.sessions.filter((each) => each !== session);
      return;
    }
    if (frame.method === "Runtime.consoleAPICalled") {
      const type = String(params.type ?? "");
      if (type !== "error" && type !== "warning" && type !== "assert") return;
      const text = ((params.args ?? []) as { value?: unknown; description?: string }[]).map((arg) => (arg.description ?? String(arg.value ?? ""))).join(" ");
      if (!IGNORED.some((pattern) => pattern.test(text))) this.trouble.push({ kind: "console", text: `${type}: ${text}` });
      return;
    }
    if (frame.method === "Runtime.exceptionThrown") {
      const details = (params.exceptionDetails ?? {}) as { text?: string; exception?: { description?: string } };
      const text = details.exception?.description ?? details.text ?? "exception";
      if (!IGNORED.some((pattern) => pattern.test(text))) this.trouble.push({ kind: "exception", text });
      return;
    }
    if (frame.method === "Log.entryAdded") {
      const entry = (params.entry ?? {}) as { level?: string; text?: string; source?: string };
      if (entry.level !== "error") return;
      const text = entry.text ?? "";
      if (!IGNORED.some((pattern) => pattern.test(text))) this.trouble.push({ kind: "log", text: `${entry.source ?? "log"}: ${text}` });
    }
  }

  send(method: string, params: Record<string, unknown> = {}, sessionId?: string): Promise<Frame> {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, (frame) => (frame.error ? reject(new Error(`mcpApps: ${method} failed: ${frame.error.message ?? "unknown"}`)) : resolve(frame)));
      this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }

  async media(theme: "light" | "dark"): Promise<void> {
    await this.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: theme }] });
  }

  async open(url: string, width = 960, height = 1200): Promise<void> {
    this.sessions = [];
    this.trouble.length = 0;
    await this.send("Page.enable");
    await this.send("Runtime.enable");
    await this.send("Log.enable");
    await this.send("Target.setAutoAttach", { autoAttach: true, waitForDebuggerOnStart: false, flatten: true });
    await this.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await this.send("Page.navigate", { url });
    await this.waitFor("document.readyState === 'complete'", 20_000);
  }

  async evaluate<T>(expression: string, sessionId?: string): Promise<T> {
    const frame = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }, sessionId);
    const thrown = (frame.result ?? {}).exceptionDetails as { text?: string; exception?: { description?: string } } | undefined;
    if (thrown) throw new Error(`${thrown.exception?.description ?? thrown.text ?? "evaluate failed"} (in ${expression.slice(0, 40)})`);
    return ((frame.result ?? {}).result as { value?: T } | undefined)?.value as T;
  }

  async appSession(): Promise<string> {
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      const first = this.sessions[0];
      if (first) return first;
      await Bun.sleep(120);
    }
    throw new Error("mcpApps: the page has no app frame running");
  }

  async within<T>(expression: string): Promise<T> {
    return this.evaluate<T>(expression, await this.appSession());
  }

  async waitWithin(expression: string, timeout = 30_000): Promise<void> {
    const until = Date.now() + timeout;
    while (Date.now() < until) {
      const seen = await this.within<boolean>(`(() => { try { return Boolean(${expression}); } catch { return false; } })()`).catch(() => false);
      if (seen) return;
      await Bun.sleep(150);
    }
    throw new Error(`mcpApps: timed out waiting inside the app frame for ${expression}`);
  }

  async waitFor(expression: string, timeout = 20_000): Promise<void> {
    const until = Date.now() + timeout;
    while (Date.now() < until) {
      if (await this.evaluate<boolean>(`(() => { try { return Boolean(${expression}); } catch { return false; } })()`)) return;
      await Bun.sleep(120);
    }
    throw new Error(`mcpApps: timed out waiting for ${expression}`);
  }

  async screenshot(file: string, height: number): Promise<string> {
    mkdirSync(join(file, ".."), { recursive: true });
    const clip = { x: 0, y: 0, width: 960, height: Math.max(200, Math.ceil(height)), scale: 1 };
    const frame = await this.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip });
    const data = String(((frame.result ?? {}) as { data?: string }).data ?? "");
    await Bun.write(file, Buffer.from(data, "base64"));
    return file;
  }

  close(): void {
    this.socket.close();
  }
}

export class Chrome {
  private constructor(
    private readonly child: ReturnType<typeof Bun.spawn>,
    readonly port: number,
  ) {}

  static async launch(profile: string): Promise<Chrome> {
    mkdirSync(profile, { recursive: true });
    const port = freePort();
    const child = Bun.spawn(
      [
        chromeBinary(),
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        "--hide-scrollbars",
        "--mute-audio",
        "--disable-dev-shm-usage",
        `--remote-debugging-port=${port}`,
        `--user-data-dir=${profile}`,
        "about:blank",
      ],
      { stdout: "ignore", stderr: "ignore", windowsHide: true },
    );
    const chrome = new Chrome(child, port);
    await chrome.until();
    return chrome;
  }

  private async until(): Promise<void> {
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      try {
        const answer = await fetch(`http://127.0.0.1:${this.port}/json/version`);
        if (answer.ok) {
          await answer.json();
          return;
        }
      } catch {}
      await Bun.sleep(150);
    }
    throw new Error("mcpApps: Chrome did not open its debugging port");
  }

  async tab(): Promise<Tab> {
    const targets = (await (await fetch(`http://127.0.0.1:${this.port}/json/list`)).json()) as { type: string; webSocketDebuggerUrl?: string }[];
    const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
    if (!page?.webSocketDebuggerUrl) throw new Error("mcpApps: Chrome has no page to drive");
    return Tab.attach(page.webSocketDebuggerUrl);
  }

  stop(): void {
    this.child.kill();
  }
}
