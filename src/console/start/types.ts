export interface ConsoleStart {
  schemaVersion: 1;
  source: "local";
  generatedAt: string;
  database: { path: string; found: boolean };
  mcp: { running: boolean; pid: number | null; startedAt: string | null };
  accounts: number;
  lastEventAt: string | null;
}
