import { outcomeOf, route } from "../../../useCases/router/index.ts";
import type { RouteDecision } from "../../../useCases/router/index.ts";
import { activePlay, clearActivePlay, handleOf, processPlayScope, setActivePlay } from "./activePlay.ts";
import type { ActivePlay, PlayLoadedBy, PlayScope } from "./activePlay.ts";
import { CORE_GUIDE, GUIDE_TOPICS, listUseCases, readGuide, readUseCase } from "./guides.ts";

export interface GuideAnswer {
  text: string;
  isError?: boolean;
  play?: ActivePlay | null;
  routed?: string;
}

function playLine(play: ActivePlay): string {
  return `>>> PLAY ${play.id} is now this session's play, under the handle ${play.handle} (passed back as playHandle, or left out to use this caller's own). Every log tool's answer ends with the step it is and the step that comes next. A send as the owner goes out only when one of this play's steps names it. The play ends after its idle time, when another one is loaded, or with getGuide({ clearPlay: true }).`;
}

function useCaseAnswer(id: string, scope: PlayScope, handle: unknown, loadedBy: PlayLoadedBy): GuideAnswer {
  const page = readUseCase(id);
  if (page === null) return { isError: true, text: `No use case "${id}". Use cases: ${listUseCases().map((u) => u.id).join(", ")}.` };
  const play = setActivePlay(id, page, { scope, handle, loadedBy });
  return { text: `${page}\n\n${playLine(play)}`, play };
}

export function askDecision(ask: string): RouteDecision {
  return route(ask, { useCases: listUseCases() });
}

export function askAnswer(ask: string, scope: PlayScope = processPlayScope(), handle: unknown = null): GuideAnswer {
  const useCases = listUseCases();
  const decision = route(ask, { useCases });
  const routed = outcomeOf(decision);
  if (decision.play) {
    const top = decision.play;
    const answer = useCaseAnswer(top.id, scope, handle, "ask");
    return { ...answer, routed, text: `>>> PLAY MATCH: "${top.title}" (${top.id}), matched on "${top.phrase}".\n\n${answer.text}` };
  }
  const current = activePlay(scope, handle);
  const kept = current ? ` The play already loaded, ${current.id}, stays as it was.` : " No play is active.";
  if (decision.menu.length) {
    return {
      routed,
      play: current,
      text: [
        `No single use case matches "${ask.slice(0, 200)}": it is close to more than one, so none was loaded.${kept}`,
        `Close: ${decision.menu.map((m) => `"${m.id}" (${m.title})`).join(", ")}.`,
        "The one the owner meant loads with getGuide({ useCase }).",
      ].join("\n"),
    };
  }
  return {
    routed,
    play: current,
    text: [`No use case matches "${ask.slice(0, 200)}".${kept} The tools that fit do it, after the core guide (getGuide({ topic: "${CORE_GUIDE}" })) if this session hasn't read it.`, `Use cases: ${useCases.map((u) => `"${u.id}" (${u.title})`).join(", ")}.`].join("\n"),
  };
}

export function guideAnswer(input: unknown, scope: PlayScope = processPlayScope(), shell = true): GuideAnswer {
  const asked = (input ?? {}) as { topic?: unknown; useCase?: unknown; ask?: unknown; clearPlay?: unknown };
  const handle = handleOf(input);
  if (asked.clearPlay === true) {
    const current = activePlay(scope, handle);
    clearActivePlay(scope, handle);
    return { play: null, text: current ? `The play ${current.id} (handle ${current.handle}) is cleared: no play is active for this caller.` : "No play was active for this caller." };
  }
  if (typeof asked.ask === "string" && asked.ask.trim()) return askAnswer(asked.ask.trim(), scope, handle);
  if (typeof asked.useCase === "string" && asked.useCase) return useCaseAnswer(asked.useCase, scope, handle, "useCase");
  const topic = String(asked.topic ?? CORE_GUIDE);
  const text = readGuide(topic, shell);
  if (text === null) return { isError: true, text: `No guide "${topic}". Topics: ${Object.keys(GUIDE_TOPICS).join(", ")}.` };
  return { text };
}
