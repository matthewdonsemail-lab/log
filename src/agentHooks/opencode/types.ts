export interface MergeResult {
  text: string;
  changed: boolean;
}

export interface HarnessInstall {
  configPath: string;
  changed: boolean;
  pluginDir: string;
  pluginFiles: string[];
}
