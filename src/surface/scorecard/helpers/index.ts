export { citationsOf, deadCitations } from "./citations.ts";
export type { CitationCount } from "./citations.ts";
export { compareScorecard, renderScorecard, writeBaseline } from "./compare.ts";
export { callsMachine, declaringFile, hasMachine, relativeImports } from "./machines.ts";
export {
  actingTools,
  argsTools,
  boilerplateShare,
  flowToolsWithoutPlatform,
  hookHosts,
  liveCommands,
  measure,
  platformFallbacks,
  sharedNamingPlatform,
  sharedToolsUnderPlatformGuide,
  sharedUnderPlatformGuide,
  toolsInNoUseCase,
  toolsPerPlatform,
  ungatedActingTools,
  useCaseCounts,
  useCasesWithoutAsks,
  useCasesWithoutSteps,
} from "./measure.ts";
export { stringFlagReparses } from "./flagReparses.ts";
export { isShared, platformOfToolName, platformOfTopic, platformsNamed } from "./platformWords.ts";
