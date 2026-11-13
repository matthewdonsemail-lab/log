import { matchPlays } from "../../../useCases/router/index.ts";
import { setActivePlay } from "./activePlay.ts";
import { CORE_GUIDE, GUIDE_TOPICS, listUseCases, readGuide, readUseCase } from "./guides.ts";

export interface GuideAnswer {
  text: string;
  isError?: boolean;
}

export const ASK_FLOOR = 0.5;

function useCaseAnswer(id: string): GuideAnswer {
  const page = readUseCase(id);
  if (page === null) return { isError: true, text: `No use case "${id}". Use cases: ${listUseCases().map((u) => u.id).join(", ")}.` };
  const play = setActivePlay(id, page);
  return { text: `${page}\n\n>>> PLAY ${play.id} is now this session's play: every log tool's answer ends with the step it is and the step that comes next, and a send that isn't one of its steps says so (rule 157).` };
}

export function askAnswer(ask: string): GuideAnswer {
  const useCases = listUseCases();
  const matches = matchPlays(ask, useCases, ASK_FLOOR);
  if (!matches.length) {
    return {
      text: [`No use case matches "${ask.slice(0, 200)}". Do it with the tools that fit, after the core guide (getGuide({ topic: "${CORE_GUIDE}" })) if this session hasn't read it.`, `Use cases: ${useCases.map((u) => `"${u.id}" (${u.title})`).join(", ")}.`].join("\n"),
    };
  }
  const [top, ...rest] = matches;
  const answer = useCaseAnswer(top.id);
  const others = rest.length ? `\n\nAlso close: ${rest.map((m) => `"${m.id}" (${m.title})`).join(", ")}. If the owner meant one of those, load it with getGuide({ useCase }).` : "";
  return { ...answer, text: `>>> PLAY MATCH: "${top.title}" (${top.id}), matched on "${top.phrase}".\n\n${answer.text}${others}` };
}

export function guideAnswer(input: unknown): GuideAnswer {
  const asked = (input ?? {}) as { topic?: unknown; useCase?: unknown; ask?: unknown };
  if (typeof asked.ask === "string" && asked.ask.trim()) return askAnswer(asked.ask.trim());
  if (typeof asked.useCase === "string" && asked.useCase) return useCaseAnswer(asked.useCase);
  const topic = String(asked.topic ?? CORE_GUIDE);
  const text = readGuide(topic);
  if (text === null) return { isError: true, text: `No guide "${topic}". Topics: ${Object.keys(GUIDE_TOPICS).join(", ")}.` };
  return { text };
}
