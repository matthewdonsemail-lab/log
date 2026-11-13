import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const RENAMED_TOOLS: Readonly<Record<string, string>> = {
  listings: "facebookListings",
  listing: "facebookListing",
  listingCreate: "facebookListingCreate",
  listingRemove: "facebookListingRemove",
  listingRemoveLive: "facebookListingRemoveLive",
  listingSweep: "facebookListingSweep",
  listingLint: "facebookListingLint",
  accounts: "facebookAccounts",
  accountShow: "facebookAccountShow",
  accountResave: "facebookAccountResave",
  accountResetOpens: "facebookAccountResetOpens",
  accountStatus: "facebookAccountStatus",
  lifecycle: "facebookLifecycle",
  preflight: "facebookPreflight",
  doctor: "facebookDoctor",
  connect: "facebookConnect",
  profile: "facebookProfile",
  profileLive: "facebookProfileLive",
  hostStart: "facebookHostStart",
  hostStartLive: "facebookHostStartLive",
  hostSend: "facebookHostSend",
  hostStatus: "facebookHostStatus",
  join: "facebookJoin",
  joinLive: "facebookJoinLive",
  readGroup: "facebookReadGroup",
  readGroupLive: "facebookReadGroupLive",
  readMembers: "facebookReadMembers",
  poll: "facebookPoll",
  check: "facebookCheck",
  scan: "facebookScan",
  status: "facebookStatus",
  watch: "facebookWatch",
  publish: "facebookPublish",
  publishLive: "facebookPublishLive",
  campaign: "facebookCampaign",
  campaignLive: "facebookCampaignLive",
  conversations: "facebookConversations",
  conversationShow: "facebookConversationShow",
  conversationRead: "facebookConversationRead",
  conversationLead: "facebookConversationLead",
  conversationLink: "facebookConversationLink",
  conversationRecord: "facebookConversationRecord",
  capture: "facebookCapture",
};

export function renamedTool(name: string): string | null {
  return Object.hasOwn(RENAMED_TOOLS, name) ? RENAMED_TOOLS[name] : null;
}

export function currentToolName(name: string): string {
  return renamedTool(name) ?? name;
}

export function renamedLine(old: string, current: string): string {
  return `\`${old}\` was renamed to \`${current}\`: call \`${current}\` from now on (the old name goes in the next release).`;
}

export function withRenamedNote(old: string, result: CallToolResult): CallToolResult {
  const current = renamedTool(old);
  if (!current) return result;
  return { ...result, content: [...(result.content ?? []), { type: "text", text: renamedLine(old, current) }] };
}
