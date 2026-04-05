/**
 * Unified transcript validator.
 *
 * This is the single import both server and client repos use to validate
 * transcripts against the protocol. It combines schema validation and
 * lifecycle invariant checking.
 */
import type { Frame } from "./invariants.js";
export declare function validateTranscript(frames: Frame[]): string[];
