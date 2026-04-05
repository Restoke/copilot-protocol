import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateTranscript } from "../src/transcript.js";

describe("unified transcript validation — valid fixtures", () => {
  const base = path.resolve(__dirname, "../../fixtures/valid");
  const files = fs.readdirSync(base).filter((name) => name.endsWith(".json"));

  for (const file of files) {
    it(file, () => {
      const doc = JSON.parse(fs.readFileSync(path.join(base, file), "utf-8"));
      expect(validateTranscript(doc.frames)).toEqual([]);
    });
  }
});

describe("unified transcript validation — invalid fixtures", () => {
  const base = path.resolve(__dirname, "../../fixtures/invalid");
  // invalid-protocol-event has a valid envelope and lifecycle (single non-turn frame)
  // so the unified validator won't catch it at this layer
  const SKIP = new Set(["invalid-protocol-event.json"]);
  const files = fs
    .readdirSync(base)
    .filter((name) => name.endsWith(".json") && !SKIP.has(name));

  for (const file of files) {
    it(file, () => {
      const doc = JSON.parse(fs.readFileSync(path.join(base, file), "utf-8"));
      const errors = validateTranscript(doc.frames);
      expect(errors.length).toBeGreaterThan(0);
    });
  }
});
