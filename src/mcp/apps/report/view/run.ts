import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import * as kit from "./kit.tsx";

export type ViewComponent = React.ComponentType<{ data: Record<string, unknown>; title?: string; subtitle?: string }>;

const MODULES: Record<string, unknown> = { react: React, "react/jsx-runtime": jsxRuntime, log: kit };

export function moduleRequire(name: string): unknown {
  const found = MODULES[name];
  if (!found) throw new Error(`a view can import only from "log" and "react", not "${name}"`);
  return found;
}

export function viewFromModule(factory: (require: (name: string) => unknown, module: { exports: Record<string, unknown> }, exports: Record<string, unknown>) => void): ViewComponent {
  const module = { exports: {} as Record<string, unknown> };
  factory(moduleRequire, module, module.exports);
  const view = (module.exports.default ?? module.exports.App) as ViewComponent | undefined;
  if (typeof view !== "function") throw new Error("the view's code has no default export: end with `export default function App({ data }) { … }`");
  return view;
}
