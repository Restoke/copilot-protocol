import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export function fixturesDir() {
    return path.resolve(__dirname, "../../fixtures");
}
export function loadFixture(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
