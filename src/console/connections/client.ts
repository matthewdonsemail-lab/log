import { platformOfTwenty, signInRouteOf } from "../../cli/launch/helpers/start.ts";
import { PLATFORM_LABELS, PLATFORMS } from "../../cli/runner/helpers/platforms.ts";
import type { Platform } from "../../cli/runner/helpers/platforms.ts";
import { localAccountsPath, readLocalAccounts } from "../../twenty/graphql/index.ts";
import type { ConsoleAccount, ConsoleConnections } from "./types.ts";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function platformNamed(value: unknown): Platform | null {
  const name = String(value ?? "").toLowerCase();
  return PLATFORMS.find((platform) => platform === name) ?? null;
}

export function readConsoleAccounts(path: string = localAccountsPath()): ConsoleAccount[] {
  return readLocalAccounts(path).flatMap((row): ConsoleAccount[] => {
    const platform = platformOfTwenty(row.platform) ?? platformNamed(row.platform);
    const accountName = text(row.accountName) ?? text(row.name);
    if (!platform || !accountName) return [];
    return [{ id: String(row.id), platform, accountName, sessionState: text(row.sessionState), browserProfile: Boolean(text(row.adsPowerProfileId)), signIn: signInRouteOf(platform).kind }];
  });
}

export function loadConsoleConnections(options: { platform?: string; path?: string } = {}): ConsoleConnections {
  const path = options.path ?? localAccountsPath();
  const wanted = options.platform?.trim().toLowerCase();
  if (wanted && !(PLATFORMS as readonly string[]).includes(wanted)) throw new Error("consolePlatformInvalid");
  const accounts = readConsoleAccounts(path).filter((account) => !wanted || account.platform === wanted);
  const platforms = PLATFORMS.flatMap((platform) => {
    const mine = accounts.filter((account) => account.platform === platform).sort((left, right) => left.accountName.localeCompare(right.accountName));
    return mine.length ? [{ platform, label: PLATFORM_LABELS[platform], accounts: mine }] : [];
  });
  return { schemaVersion: 1, source: "local", generatedAt: new Date().toISOString(), path, total: accounts.length, platforms };
}
