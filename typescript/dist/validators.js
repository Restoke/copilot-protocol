const REQUIRED_ENVELOPE_FIELDS = [
    "message_id",
    "message_type",
    "channel",
    "content",
];
/** Fields where an empty string is never valid. */
const NON_EMPTY_FIELDS = new Set([
    "message_id",
    "message_type",
    "channel",
]);
export function validateEnvelope(message) {
    const errors = [];
    for (const field of REQUIRED_ENVELOPE_FIELDS) {
        if (!(field in message)) {
            errors.push(`missing required field: ${field}`);
        }
        else if (NON_EMPTY_FIELDS.has(field) &&
            typeof message[field] === "string" &&
            message[field] === "") {
            errors.push(`field '${field}' must not be empty`);
        }
    }
    return errors;
}
export function validateReadyContent(content) {
    const errors = [];
    if (content.type !== "READY") {
        errors.push(`expected type "READY", got "${String(content.type)}"`);
    }
    if (!("protocol_version" in content)) {
        errors.push("missing required field: protocol_version");
    }
    else if (typeof content.protocol_version !== "string" ||
        content.protocol_version === "") {
        errors.push("protocol_version must be a non-empty string");
    }
    if ("capabilities" in content && !Array.isArray(content.capabilities)) {
        errors.push("capabilities must be an array");
    }
    return errors;
}
