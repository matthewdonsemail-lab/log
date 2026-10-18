/** Human renderer for the Facebook accounts table. Pure. */
import type { ConnectionRecord } from "../../../marketplace/account/index.ts";
import type { ListingRecord } from "../../../marketplace/listing/index.ts";
import { renderTable } from "../../runner/helpers/index.ts";

export function renderAccountsTable(accounts: ConnectionRecord[], listings: ListingRecord[]): string {
  return renderTable(
    ["Account ID", "Label", "Connected", "Issue", "Listings"],
    accounts.map((account) => [
      account.id,
      account.label,
      account.connectedAt ? account.connectedAt.slice(0, 10) : "never",
      account.lastIssue ?? "healthy",
      String(listings.filter((row) => row.accountId === account.id).length),
    ]),
  );
}
