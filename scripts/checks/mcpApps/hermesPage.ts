export const HERMES_VARIABLES: Record<"light" | "dark", Record<string, string>> = {
  light: {
    "--ui-text-primary": "#1f2328",
    "--ui-text-secondary": "#57606a",
    "--ui-text-tertiary": "#6e7781",
    "--ui-accent": "#0969da",
    "--ui-stroke-tertiary": "#d0d7de",
    "--ui-bg-editor": "#ffffff",
    "--ui-bg-secondary": "#f6f8fa",
  },
  dark: {
    "--ui-text-primary": "#e6edf3",
    "--ui-text-secondary": "#9198a1",
    "--ui-text-tertiary": "#8b949e",
    "--ui-accent": "#58a6ff",
    "--ui-stroke-tertiary": "#30363d",
    "--ui-bg-editor": "#0d1117",
    "--ui-bg-secondary": "#151b23",
  },
};

export const PLUGIN_HOST = `import { createRoot } from "react-dom/client";
import plugin from "/hermes/plugin.js";

const spec = JSON.parse(document.getElementById("hermesCase").textContent);
const state = { registered: [], errors: [], rendered: false };
window.__hermes = state;
const registrations = [];
const ctx = {
  register(entry) {
    registrations.push(entry);
    state.registered.push({ id: entry.id, area: entry.area, name: entry.data && entry.data.name });
  },
  async rest(path) {
    if (path === "/blocks/" + spec.id) return { blocks: spec.blocks };
    if (path === "/pages") return { pages: [] };
    return {};
  },
  setInterval(fn, ms) {
    const timer = setInterval(fn, ms);
    return () => clearInterval(timer);
  },
  on() {},
  off() {},
  emit() {},
};
try {
  plugin.register(ctx);
  const blocks = registrations.find((entry) => entry.data && entry.data.name === "blocks");
  if (!blocks) throw new Error("the plugin registered no blocks tag");
  createRoot(document.getElementById("root")).render(blocks.data.render({ attrs: { id: spec.id }, streaming: false }));
  state.rendered = true;
} catch (error) {
  state.errors.push(String((error && error.stack) || error));
}
`;

export const IMPORTS = {
  react: "/hermes/react.js",
  "react/jsx-runtime": "/hermes/jsxRuntime.js",
  "react-dom": "/hermes/reactDom.js",
  "react-dom/client": "/hermes/reactDom.js",
  "@hermes/plugin-sdk": "/hermes/pluginSdk.js",
};

export function hermesPage(theme: "light" | "dark", blockId: string, blocks: unknown[]): string {
  const variables = (name: "light" | "dark") => Object.entries(HERMES_VARIABLES[name]).map(([key, value]) => `${key}:${value}`).join(";");
  const background = theme === "dark" ? "#0d1117" : "#f6f8fa";
  const payload = JSON.stringify({ id: blockId, blocks }).replace(/</g, "\\u003c");
  return `<!doctype html><html class="${theme === "dark" ? "dark" : ""}"><head><meta charset="utf-8"><title>log desktop plugin</title>
<style>:root{${variables("light")};color-scheme:light}:root.dark{${variables("dark")};color-scheme:dark}html,body{margin:0;background:${background};color:var(--ui-text-primary);font-family:system-ui,sans-serif}#root{width:900px;padding:24px}</style>
<script type="importmap">${JSON.stringify({ imports: IMPORTS })}</script></head>
<body><div id="root"></div>
<script type="application/json" id="hermesCase">${payload}</script>
<script type="module" src="/hermes/host.js"></script></body></html>`;
}

export const HERMES_STATE = `(() => {
  const state = window.__hermes || { registered: [], errors: [] };
  return { registered: state.registered, errors: state.errors, rendered: Boolean(state.rendered) };
})()`;
