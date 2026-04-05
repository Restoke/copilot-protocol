import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function fixturesDir(): string {
  return path.resolve(__dirname, "../../fixtures");
}

export function loadFixture(filePath: string): {
  name: string;
  direction: string;
  frames: Record<string, unknown>[];
} {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
