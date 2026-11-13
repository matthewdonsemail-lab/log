export interface ConsoleWebOptions {
  host?: string;
  port?: number;
  siteDir?: string;
}

export interface ConsoleWebServer {
  url: string;
  port: number;
  stop: () => void;
}
