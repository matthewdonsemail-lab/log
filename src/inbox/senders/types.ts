export const SENDER_SOURCES = ["twitterDmsBySender"] as const;
export type SenderSource = (typeof SENDER_SOURCES)[number];

export class SendersNoDataError extends Error {
  readonly code = "reportSourceNoData";
  constructor(readonly platform: string) {
    super(`reportSourceNoData: log.db holds no conversations on ${platform}: read that platform's inbox first, or ask about a platform that has chats`);
  }
}

export const SENDERS_DEFAULT_LIMIT = 20;
export const SENDERS_MAX_LIMIT = 200;
export const SENDERS_ACTIVITY_DAYS = 30;
export const SENDERS_PREVIEW_CHARS = 200;

export interface SendersOptions {
  account?: string | null;
  since?: string | null;
  limit?: number;
  now?: Date;
}

export interface Sender {
  handle: string;
  name: string;
  account: string;
  count: number;
  firstAt: string | null;
  lastAt: string | null;
  activity: number[];
  lastMessage: string | null;
}

export interface SendersDay {
  day: string;
  count: number;
}

export interface SendersReport {
  source: SenderSource | "dmsBySender";
  platform?: string;
  readFrom: "log.db";
  account: string | null;
  accounts: string[];
  since: string | null;
  messages: number;
  people: number;
  senders: Sender[];
  byDay: SendersDay[];
}
