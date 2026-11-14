import { SOCIAL_ACCOUNTS, toFacebookAccount } from "../../platformKit/socialAccount/index.ts";
import type { SocialAccountRow } from "../../platformKit/socialAccount/index.ts";
import type { PlatformAccount } from "../../platformKit/session/index.ts";
import { TwentyError } from "../../twenty/graphql/index.ts";
import type { TwentyClient } from "../../twenty/graphql/index.ts";

export const TWENTY_PLATFORM_BY_PLATFORM: Readonly<Record<string, string>> = {
  snapchat: "SNAPCHAT",
};

export async function findMobileAccount(twenty: TwentyClient, twentyPlatform: string, ref: string): Promise<PlatformAccount> {
  const key = ref.trim().replace(/^@/, "");
  const named = (await twenty.list(SOCIAL_ACCOUNTS, { accountName: { eq: key } })).filter((row) => String(row.platform) === twentyPlatform);
  const rows = named.length ? named : (await twenty.list(SOCIAL_ACCOUNTS, { name: { eq: key } })).filter((row) => String(row.platform) === twentyPlatform && !row.accountName?.trim());
  if (rows.length === 0) throw new TwentyError("accountNotFound", `no ${twentyPlatform} socialAccount "${key}"`);
  if (rows.length > 1) throw new TwentyError("accountNotFound", `${rows.length} ${twentyPlatform} socialAccounts are called "${key}"`);
  return toFacebookAccount(rows[0] as SocialAccountRow);
}
