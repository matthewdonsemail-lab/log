export interface ConsoleGovernor {
  platform: string;
  account: string;
  day: string | null;
  requests: number;
  writes: number;
  writesPerDay: number;
  hourRequests: number;
  cooldownSeconds: number;
}

export interface ConsoleSettings {
  schemaVersion: 1;
  source: "local";
  generatedAt: string;
  paths: { database: string; runs: string; accounts: string; env: string };
  requestsPerDay: number;
  governors: ConsoleGovernor[];
  webConsole: { command: string; url: string };
}
