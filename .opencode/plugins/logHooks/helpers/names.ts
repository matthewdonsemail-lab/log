const LOG_SERVER = "mcp__log__";

const SHELL_TOOLS = new Set(["bash", "shell", "powershell", "pwsh", "cmd", "terminal", "sh", "zsh"]);

const SHELL_HOOK_NAMES = new Set(["Bash", "PowerShell", "Monitor"]);

export function logToolName(tool: string): string {
  if (!tool) return "";
  if (tool.startsWith(LOG_SERVER)) return tool;
  for (const prefix of ["log.", "log_", "log__"]) {
    if (tool.startsWith(prefix)) return `${LOG_SERVER}${tool.slice(prefix.length)}`;
  }
  return tool;
}

export function hostToolName(tool: string, platform: string = process.platform): string {
  const name = tool.trim();
  const lower = name.toLowerCase();
  if (SHELL_TOOLS.has(lower)) return platform === "win32" ? "PowerShell" : "Bash";
  if (lower === "monitor") return "Monitor";
  return logToolName(name);
}

export function isShellHookName(name: string): boolean {
  return SHELL_HOOK_NAMES.has(name);
}

export function isLogTool(name: string): boolean {
  return name.startsWith(LOG_SERVER);
}

export function shellCommandOf(input: Record<string, unknown> | undefined): string {
  if (!input) return "";
  for (const key of ["command", "cmd", "script"]) {
    const value = input[key];
    if (typeof value === "string") return value;
  }
  return "";
}

export function runsInBackground(input: Record<string, unknown> | undefined): boolean {
  if (!input) return false;
  return input.run_in_background === true || input.runInBackground === true || input.background === true;
}
