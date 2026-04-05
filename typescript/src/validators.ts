import type { Frame } from "./invariants.js";

const REQUIRED_ENVELOPE_FIELDS = [
  "message_id",
  "message_type",
  "channel",
  "content",
] as const;

export function validateEnvelope(message: Frame): string[] {
  const errors: string[] = [];

  for (const field of REQUIRED_ENVELOPE_FIELDS) {
    if (!(field in message)) {
      errors.push(`missing required field: ${field}`);
    } else if (typeof message[field] === "string" && message[field] === "") {
      errors.push(`field '${field}' must not be empty`);
    }
  }

  return errors;
}

export function validateReadyContent(
  content: Record<string, unknown>,
): string[] {
  const errors: string[] = [];

  if (content.type !== "READY") {
    errors.push(`expected type "READY", got "${String(content.type)}"`);
  }

  if (!("protocol_version" in content)) {
    errors.push("missing required field: protocol_version");
  } else if (
    typeof content.protocol_version !== "string" ||
    content.protocol_version === ""
  ) {
    errors.push("protocol_version must be a non-empty string");
  }

  if ("capabilities" in content && !Array.isArray(content.capabilities)) {
    errors.push("capabilities must be an array");
  }

  return errors;
}
