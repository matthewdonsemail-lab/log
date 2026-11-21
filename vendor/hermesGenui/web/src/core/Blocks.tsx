// Draws a list of blocks in order. Each type's drawing is its entry in registry.tsx; containers draw their children
// through the same lookup. One list is one board: its blocks share which flow node a steps block has lit.
import type { ReactNode } from "react";
import { FlowLightBoard } from "../blocks/flow/highlight";
import { blockEntry, type Block } from "../registry";

function BlockView({ block }: { block: Block }) {
  const entry = blockEntry(block.type);
  if (!entry) return null;
  const { Component } = entry;
  return <Component block={block} draw={drawAll} />;
}

function drawAll(blocks: Block[]): ReactNode[] {
  return blocks.map((b, i) => <BlockView key={i} block={b} />);
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return <div className="hb-blocks"><FlowLightBoard>{drawAll(blocks)}</FlowLightBoard></div>;
}
