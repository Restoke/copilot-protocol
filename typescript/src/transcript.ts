/**
 * Unified transcript validator.
 *
 * This is the single import both server and client repos use to validate
 * transcripts against the protocol. It combines schema validation and
 * lifecycle invariant checking.
 */

import type { Frame } from "./invariants.js";
import { validateTurnLifecycle } from "./invariants.js";
import { validateEnvelope, validateReadyContent } from "./validators.js";

function isReadyFrame(frame: Frame): boolean {
  const content = frame.content;
  return (
    frame.message_type === "PROTOCOL" &&
    typeof content === "object" &&
    content !== null &&
    (content as Record<string, unknown>).type === "READY"
  );
}

export function validateTranscript(frames: Frame[]): string[] {
  const errors: string[] = [];

  // 1. Validate every frame conforms to the envelope schema
  for (let i = 0; i < frames.length; i++) {
    const envelopeErrors = validateEnvelope(frames[i]);
    for (const e of envelopeErrors) {
      errors.push(`frame[${i}] envelope: ${e}`);
    }
  }

  // 2. Validate READY frames have required content
  for (let i = 0; i < frames.length; i++) {
    if (isReadyFrame(frames[i])) {
      const readyErrors = validateReadyContent(
        (frames[i].content ?? {}) as Record<string, unknown>,
      );
      for (const e of readyErrors) {
        errors.push(`frame[${i}] READY content: ${e}`);
      }
    }
  }

  // 3. Validate turn lifecycle invariants (skip READY-only frames)
  const turnFrames = frames.filter((f) => !isReadyFrame(f));
  if (turnFrames.length > 0) {
    const lifecycleErrors = validateTurnLifecycle(turnFrames);
    errors.push(...lifecycleErrors);
  }

  return errors;
}
