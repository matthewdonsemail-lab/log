import { MACHINE_BLOCK, MACHINE_DIRECTIONS, MACHINE_LIMITS, MACHINE_PLATFORMS, MACHINE_TONES, MACHINE_VIEWS } from "../../src/relate/machine/types.ts";
import { MACHINE_GENUI_CATALOG, MACHINE_GENUI_FILE } from "../../src/relate/machine/genui.ts";
import { machineState, machineTransition, stateMachine } from "../../src/mcp/apps/report/helpers/schema.ts";
import { REPORT_LIMITS } from "../../src/mcp/apps/report/types.ts";

export const GENUI_MACHINE_OUT = MACHINE_GENUI_FILE.join("/");

export function genuiMachineJson(): string {
  const spec = {
    kind: MACHINE_BLOCK,
    catalog: MACHINE_GENUI_CATALOG,
    limits: { ...MACHINE_LIMITS, detailLabel: REPORT_LIMITS.label },
    views: MACHINE_VIEWS,
    tones: MACHINE_TONES,
    directions: MACHINE_DIRECTIONS,
    platforms: MACHINE_PLATFORMS,
    keys: { block: Object.keys(stateMachine.shape), state: Object.keys(machineState.shape), transition: Object.keys(machineTransition.shape) },
  };
  return `${JSON.stringify(spec, null, 2)}\n`;
}
