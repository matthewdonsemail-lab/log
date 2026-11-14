import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import * as kit from "./kit.tsx";

export type ViewComponent = React.ComponentType<{ data: Record<string, unknown>; title?: string; subtitle?: string }>;

const MODULES: Record<string, unknown> = { react: React, "react/jsx-runtime": jsxRuntime, log: kit };

export const VIEW_MODULES: readonly string[] = Object.keys(MODULES);

export function moduleRequire(name: unknown): unknown {
  const found = typeof name === "string" && Object.prototype.hasOwnProperty.call(MODULES, name) ? MODULES[name] : undefined;
  if (!found) throw new Error(`viewImportRefused: a view can import only from "log" and "react", not "${String(name)}", and never with import()`);
  return found;
}

export function viewFromModule(factory: (require: (name: string) => unknown, module: { exports: Record<string, unknown> }, exports: Record<string, unknown>) => void): ViewComponent {
  const module = { exports: {} as Record<string, unknown> };
  factory(moduleRequire, module, module.exports);
  const view = (module.exports.default ?? module.exports.App) as ViewComponent | undefined;
  if (typeof view !== "function") throw new Error("the view's code has no default export: end with `export default function App({ data }) { … }`");
  return view;
}
