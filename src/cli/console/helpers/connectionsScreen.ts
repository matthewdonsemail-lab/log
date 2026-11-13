import { loadConsoleConnections } from "../../../console/connections/index.ts";
import type { ConsoleAccount, ConsoleConnections } from "../../../console/connections/index.ts";
import { checkAccountSession, signInAccount } from "../../launch/index.ts";
import type { ConsoleUi } from "./ui.ts";
import { BACK } from "./ui.ts";

const SIGN_IN_TEXT: Record<ConsoleAccount["signIn"], string> = { cookies: "save its cookies", connect: "connect its browser", browser: "sign in in its browser" };

export function renderConnections(data: ConsoleConnections): string {
  if (!data.total) return `No accounts yet in ${data.path}. Add one: log launch, Add an account.`;
  const lines = [`${data.total} account(s) in ${data.path}:`];
  for (const group of data.platforms) {
    lines.push(`${group.label} (${group.accounts.length})`);
    const width = Math.max(...group.accounts.map((account) => account.accountName.length));
    for (const account of group.accounts) lines.push(`  ${account.accountName.padEnd(width)}  ${account.sessionState ?? "no session yet"}${account.browserProfile ? "  browser profile" : ""}`);
  }
  return lines.join("\n");
}

export async function runConnectionsScreen(ui: ConsoleUi): Promise<void> {
  const data = loadConsoleConnections();
  ui.context.out(renderConnections(data));
  const accounts = data.platforms.flatMap((group) => group.accounts.map((account) => ({ account, label: group.label })));
  if (!accounts.length) return;
  const picked = await ui.pick("Pick an account", [
    ...accounts.map(({ account, label }, index) => ({ value: String(index), label: account.accountName, hint: `${label} · ${account.sessionState ?? "no session yet"}` })),
    { value: BACK, label: "Back" },
  ]);
  if (picked === null || picked === BACK) return;
  const { account } = accounts[Number(picked)];
  const action = await ui.pick(`${account.accountName}: what now?`, [
    ...(account.platform === "facebook" ? [] : [{ value: "check", label: "Check its session", hint: `log ${account.platform} session check --account ${account.accountName}` }]),
    { value: "signIn", label: `Sign it in: ${SIGN_IN_TEXT[account.signIn]}`, hint: account.signIn === "cookies" ? `log ${account.platform} cookies save --account ${account.accountName}` : undefined },
    { value: BACK, label: "Back" },
  ]);
  if (action === "check") await checkAccountSession(ui.context, account);
  if (action === "signIn") await signInAccount(ui.context, { platform: account.platform, accountName: account.accountName, hasProfile: account.browserProfile });
}

export { loadConsoleConnections };
