import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateTurnLifecycle } from "../src/invariants.js";

const LIFECYCLE_FIXTURES = [
  "duplicate-turn-complete.json",
  "turn-complete-not-last.json",
  "error-after-turn-complete.json",
  "message-after-turn-complete.json",
];

describe("invalid fixtures", () => {
  const base = path.resolve(__dirname, "../../fixtures/invalid");

  for (const file of LIFECYCLE_FIXTURES) {
    it(file, () => {
      const doc = JSON.parse(fs.readFileSync(path.join(base, file), "utf-8"));
      const errors = validateTurnLifecycle(doc.frames);
      expect(errors.length).toBeGreaterThan(0);
    });
  }
});
