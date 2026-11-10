# Hosted Log implementation package — PR #113

Updated 11 November 2026. Assigned implementation owner: Mandeep. Product owner: Matt.

Start with [the assignment and acceptance criteria](listeningKitHandoff.md). This package specifies the native hosted application; the services and migrations described here are implementation work still to do.

## Read in this order

1. [Mandeep's implementation assignment](listeningKitHandoff.md): decisions, ordered slices, completion evidence and remaining setup.
2. [Native schema guide](listeningKitSchema.md) and [schema v2 YAML](listeningKitSchema.yaml): data definitions, relationships, DTOs, endpoints and recovery contracts.
3. [Private/hosted ownership](listeningKitNativeData.md) and [instance contracts](listeningKitInstanceContracts.md): existing SQLite foundation and distributed failure behavior.
4. [Treg source map](listeningKitTregArchitecture.md): pinned links to the exact upstream files for identity/team/auth behavior.
5. [Hosted MCP](listeningKitHostedMcp.md), [Boat adapter](listeningKitBoatRuntime.md) and [AdsPower](listeningKitAdsPower.md): routing, compute and browser boundaries.
6. [Console](listeningKitConsole.md), [dependency cutover audit](listeningKitTwentyCutover.md) and [provisioning](listeningKitProvisioning.md): UI, current legacy dependencies and deployment sequence.

## Authority and status

Current Matt decisions and active [AGENTS.md](../../AGENTS.md) govern scope. The handoff and schema v2 supersede broader historical drafts. Current runtime code is evidence of what exists, not proof the proposed target is implemented. Preserve source anchors when replacing dependencies.

Private data stays in the selected persistent workspace's existing log.db and protected files. Central PostgreSQL holds identity, team authorization, grants and minimal routing/recovery metadata. Treg is the control reference. Native V1 uses email OTP, explicit team selection, one selected runtime per team and the existing platform engines.

The `*Comment.md` files and interim auth proposal are discussion snapshots, not implementation authority. They are not part of this committed handoff. The [rule archive](../../ruleHistory/index.md) preserves retired instructions separately.
