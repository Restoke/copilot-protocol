import type { Frame } from "./invariants.js";
export declare function validateEnvelope(message: Frame): string[];
export declare function validateReadyContent(content: Record<string, unknown>): string[];
