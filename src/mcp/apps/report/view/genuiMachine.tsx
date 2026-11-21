import { MACHINE_BLOCK } from "../../../../relate/machine/types.ts";
import type { StateMachineBlock } from "../../../../relate/machine/types.ts";
import type { Trail } from "../../../../../vendor/hermesGenui/web/src/core/fields.ts";
import type { ExtraBlockEntry } from "../../../../../vendor/hermesGenui/web/src/registry.tsx";
import { stateMachine } from "../helpers/schema.ts";
import { StateMachine } from "./machine.tsx";

export function readMachineBlock(raw: unknown, here: Trail): StateMachineBlock | null {
  const parsed = stateMachine.safeParse(raw);
  if (parsed.success) return parsed.data as StateMachineBlock;
  const issue = parsed.error.issues[0];
  return here.drop(`${MACHINE_BLOCK} ${issue?.path.join(".") ?? ""}: ${issue?.message ?? "unreadable"}`);
}

export const MACHINE_GENUI_ENTRY: ExtraBlockEntry = {
  read: (raw, here) => readMachineBlock(raw, here),
  Component: ({ block }: { block: StateMachineBlock }) => (
    <div className="rmFrame">
      <StateMachine machine={block} />
    </div>
  ),
};
