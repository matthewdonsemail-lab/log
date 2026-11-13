import type { SendersReport } from "../../../inbox/senders/index.ts";
import type { ReportBlock } from "./types.ts";

const ago = (at: string | null, now: number): string => {
  const time = Date.parse(at ?? "");
  if (Number.isNaN(time)) return "";
  const hours = Math.max(0, Math.round((now - time) / 3_600_000));
  return hours < 1 ? "just now" : hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
};

export function sendersBlocks(report: SendersReport, now: number = Date.now()): ReportBlock[] {
  const days = report.byDay.slice(-30);
  const top = report.senders.slice(0, 10);
  return [
    { type: "stat", items: [{ label: "Messages", value: report.messages }, { label: "People", value: report.people }, ...(top[0] ? [{ label: "Top", value: `@${top[0].handle}`, hint: `${top[0].count.toLocaleString("en-US")} messages` }] : [])] },
    ...(top.length ? [{ type: "barChart", title: "Who messages most", unit: "msgs", data: top.map((s) => ({ label: s.name, value: s.count })) } as ReportBlock] : []),
    ...(days.length > 1 ? [{ type: "lineChart", title: "Messages per day", x: days.map((d) => d.day.slice(5)), series: [{ name: "Messages", values: days.map((d) => d.count) }] } as ReportBlock] : []),
    ...(top.length ? [{ type: "table", title: "Latest from each", columns: [{ key: "name", label: "Person" }, { key: "last", label: "Last" }, { key: "said", label: "Latest message" }], rows: top.map((s) => ({ name: `${s.name} @${s.handle}`, last: ago(s.lastAt, now), said: s.lastMessage ?? "" })) } as ReportBlock] : []),
  ];
}
