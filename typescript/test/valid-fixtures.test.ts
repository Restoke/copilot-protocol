import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateTurnLifecycle } from "../src/invariants.js";

describe("valid fixtures", () => {
  const base = path.resolve(__dirname, "../../fixtures/valid");
  const files = fs
    .readdirSync(base)
    .filter((name) => name.startsWith("turn-") && name.endsWith(".json"));

  for (const file of files) {
    it(file, () => {
      const doc = JSON.parse(fs.readFileSync(path.join(base, file), "utf-8"));
      expect(validateTurnLifecycle(doc.frames)).toEqual([]);
    });
  }
});
