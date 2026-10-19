import { describe, expect, test } from "bun:test";
import { PassThrough } from "node:stream";
import { pipeProcessLog, setLogSink, splitLines } from "./index.ts";

describe("processLog", () => {
  test("splitLines keeps the unfinished rest", () => {
    expect(splitLines("Open", "ing\r\nLogged in.\npart")).toEqual({ lines: ["Opening", "Logged in."], rest: "part" });
  });

  test("pipeProcessLog sends each line to the sink, the last partial one at the end", async () => {
    const got: string[] = [];
    setLogSink((entry) => got.push(`${entry.source}: ${entry.line}`));
    try {
      const stream = new PassThrough();
      pipeProcessLog(stream, "worker");
      stream.write("one\ntw");
      stream.write("o\n");
      stream.end("three");
      await new Promise((resolve) => stream.on("end", resolve));
      expect(got).toEqual(["worker: one", "worker: two", "worker: three"]);
    } finally {
      setLogSink(null);
    }
  });
});
