export interface HostCase {
  name: string;
  theme: "light" | "dark";
  html: string;
  csp: { connectDomains: string[]; resourceDomains: string[] };
  tool: string;
  toolInput: Record<string, unknown>;
  result: Record<string, unknown>;
}

export const HOST_VARIABLES: Record<"light" | "dark", Record<string, string>> = {
  light: {
    "--color-background-primary": "#ffffff",
    "--color-background-secondary": "#f5f5f4",
    "--color-border-primary": "#e7e5e4",
    "--color-text-primary": "#1c1917",
    "--color-text-secondary": "#78716c",
    "--color-background-inverse": "#1c1917",
    "--color-text-inverse": "#fafaf9",
    "--color-ring-primary": "#c2410c",
    "--font-sans": "system-ui, sans-serif",
  },
  dark: {
    "--color-background-primary": "#262624",
    "--color-background-secondary": "#1f1e1d",
    "--color-border-primary": "#3e3e38",
    "--color-text-primary": "#f5f4ef",
    "--color-text-secondary": "#a8a29e",
    "--color-background-inverse": "#f5f4ef",
    "--color-text-inverse": "#1f1e1d",
    "--color-ring-primary": "#d97757",
    "--font-sans": "system-ui, sans-serif",
  },
};

const SANDBOX = ["allow", "scripts"].join("-");

export function mcpAppsPage(data: HostCase, csp: string): string {
  const background = data.theme === "dark" ? "#1f1e1d" : "#f5f5f4";
  const payload = JSON.stringify({ ...data, csp }).replace(/</g, "\\u003c");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>reference MCP Apps host</title>
<style>html,body{margin:0;background:${background}}body{padding:24px}#view{display:block;width:900px;border:0;height:240px;background:transparent}</style></head>
<body><iframe id="view" sandbox="${SANDBOX}" title="app"></iframe>
<script type="application/json" id="mcpCase">${payload}</script>
<script>
const spec = JSON.parse(document.getElementById('mcpCase').textContent);
const frame = document.getElementById('view');
const variables = ${JSON.stringify(HOST_VARIABLES[data.theme])};
window.__mcpHost = { calls: [], initialized: false, unknown: [], height: null, errors: [] };
const send = (message) => frame.contentWindow.postMessage(message, '*');
const reply = (id, result) => send({ jsonrpc: '2.0', id, result });
const fail = (id, message) => send({ jsonrpc: '2.0', id, error: { code: -32601, message } });
const hostContext = { theme: spec.theme, styles: { variables }, displayMode: 'inline', availableDisplayModes: ['inline'], platform: 'web', userAgent: 'mcpAppsCheck', locale: 'en-US', containerDimensions: { width: 900, maxHeight: 2000 } };
addEventListener('message', async (event) => {
  if (event.source !== frame.contentWindow) return;
  const message = event.data;
  if (!message || message.jsonrpc !== '2.0' || typeof message.method !== 'string') return;
  switch (message.method) {
    case 'ui/initialize':
      return reply(message.id, { protocolVersion: '2026-01-26', hostInfo: { name: 'mcpAppsCheck', version: '1.0.0' }, hostCapabilities: { serverTools: {}, serverResources: {}, logging: {}, message: { text: {} }, updateModelContext: { text: {} }, openLinks: {}, downloadFile: {} }, hostContext });
    case 'ui/notifications/initialized':
      window.__mcpHost.initialized = true;
      send({ jsonrpc: '2.0', method: 'ui/notifications/tool-input', params: { arguments: spec.toolInput } });
      send({ jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: spec.result });
      return;
    case 'ui/notifications/size-changed':
      if (message.params && typeof message.params.height === 'number') {
        window.__mcpHost.height = message.params.height;
        frame.style.height = Math.ceil(message.params.height) + 'px';
      }
      return;
    case 'tools/call': {
      window.__mcpHost.calls.push(message.params && message.params.name);
      try {
        const answer = await fetch('/call?case=' + encodeURIComponent(spec.name), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(message.params) });
        if (!answer.ok) throw new Error('host route answered ' + answer.status);
        return reply(message.id, await answer.json());
      } catch (error) {
        return send({ jsonrpc: '2.0', id: message.id, error: { code: -32000, message: String(error && error.message || error) } });
      }
    }
    case 'ui/message':
    case 'ui/update-model-context':
    case 'ui/open-link':
    case 'ui/download-file':
    case 'ui/request-display-mode':
    case 'ping':
      return reply(message.id, message.method === 'ui/request-display-mode' ? { mode: 'inline' } : {});
    default:
      window.__mcpHost.unknown.push(message.method);
      if (message.id !== undefined) fail(message.id, 'not supported: ' + message.method);
  }
});
const THEMES = ${JSON.stringify(HOST_VARIABLES)};
window.__setTheme = (theme) => {
  send({ jsonrpc: '2.0', method: 'ui/notifications/host-context-changed', params: { theme, styles: { variables: THEMES[theme] } } });
};
frame.srcdoc = spec.html.replace(/<head[^>]*>/i, (match) => match + '<meta http-equiv="Content-Security-Policy" content="' + spec.csp.replace(/"/g, '&quot;') + '">');
</script></body></html>`;
}

export interface Drawn {
  ready: boolean;
  text: string;
  textLength: number;
  scrollHeight: number;
  clientHeight: number;
  scrollers: string[];
  lightness: number | null;
  raw: string | null;
  frames: number;
  height: number | null;
  calls: string[];
  unknown: string[];
  initialized: boolean;
}

export const INSPECT = `(() => {
  const text = (document.body.innerText || '').trim();
  const scrollers = [...document.querySelectorAll('*')].filter((el) => { const style = getComputedStyle(el); if (el.clientHeight < 8 || el.clientWidth < 8 || style.visibility === 'hidden' || Number(style.opacity) === 0) return false; return /(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1; }).map((el) => el.className || el.tagName);
  const lightness = (() => {
    for (let el = document.elementFromPoint(60, 24); el; el = el.parentElement) {
      const found = getComputedStyle(el).backgroundColor.match(/[\\d.]+/g);
      if (found && (found.length < 4 || Number(found[3]) > 0.5)) return (0.2126 * Number(found[0]) + 0.7152 * Number(found[1]) + 0.0722 * Number(found[2])) / 255;
    }
    return null;
  })();
  const raw = /(^|[^a-z])(undefined|null|NaN)([^a-z]|$)|\\[object Object\\]/.exec(text);
  const family = getComputedStyle(document.body).fontFamily || "";
  const fonts = document.fonts ? [...document.fonts].map((face) => ({ family: face.family.replace(/^["']|["']$/g, ""), status: face.status })) : [];
  return {
    text: text.slice(0, 400),
    textLength: text.length,
    scrollHeight: document.body.scrollHeight,
    clientHeight: document.body.clientHeight,
    scrollers,
    lightness,
    raw: raw ? raw[0] : null,
    frames: document.querySelectorAll('*').length,
    family,
    fonts,
  };
})()`;

export const HOST_STATE = `(() => {
  const host = window.__mcpHost || {};
  return { initialized: Boolean(host.initialized), height: host.height ?? null, calls: (host.calls || []).slice(-6), callCount: (host.calls || []).length, unknown: host.unknown || [], errors: host.errors || [] };
})()`;
