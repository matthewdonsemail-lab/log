export const SENDER_SOURCES = ["twitterDmsBySender"] as const;
export type SenderSource = (typeof SENDER_SOURCES)[number];
export const SENDERS_DEFAULT_LIMIT = 20;
export const SENDERS_MAX_LIMIT = 200;

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
}

export interface SendersDay {
  day: string;
  count: number;
}

export interface SendersReport {
  source: SenderSource;
  readFrom: "log.db";
  account: string | null;
  accounts: string[];
  since: string | null;
  messages: number;
  people: number;
  senders: Sender[];
  byDay: SendersDay[];
}
