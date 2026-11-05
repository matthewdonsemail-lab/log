export const RETIRED_COMMANDS: Readonly<Record<string, (rest: readonly string[]) => string>> = {
  fish: (rest) => `log fish: the voice clone is provider-agnostic now (rule 143): log ${["clone", rest[0] === "speak" ? "speak" : "voice", "--provider", "fishAudio", ...rest.slice(1)].join(" ")}`,
};
