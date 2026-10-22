function isEvent(frame, name) {
    const content = frame.content;
    return frame.message_type === "PROTOCOL" && typeof content === "object" &&
        content !== null && "type" in content && content.type === name;
}
export function isTurnComplete(frame) {
    return isEvent(frame, "TURN_COMPLETE");
}
export function isError(frame) {
    return frame.message_type === "ERROR";
}
export function validateTurnLifecycle(frames) {
    const errors = [];
    const completes = frames.flatMap((frame, index) => isTurnComplete(frame) ? [index] : []);
    if (completes.length !== 1) {
        return [`expected exactly 1 TURN_COMPLETE, found ${completes.length}`];
    }
    const complete = completes[0];
    const content = frames[complete].content;
    // isTurnComplete has established the object shape; narrow it for field access.
    if (typeof content !== "object" || content === null)
        return ["invalid TURN_COMPLETE content"];
    if ("more" in content && typeof content.more !== "boolean") {
        errors.push("TURN_COMPLETE more must be a boolean");
    }
    const settled = frames.flatMap((frame, index) => isEvent(frame, "TURN_SETTLED") ? [index] : []);
    if ("more" in content && content.more === true) {
        if (settled.length !== 1) {
            errors.push(`expected exactly 1 TURN_SETTLED, found ${settled.length}`);
        }
        else if (settled[0] <= complete || settled[0] !== frames.length - 1) {
            errors.push("TURN_SETTLED must follow TURN_COMPLETE and be the last frame");
        }
        if (frames.slice(complete + 1).some(frame => frame.message_type !== "WIDGET" && !isEvent(frame, "TURN_SETTLED"))) {
            errors.push("only optional WIDGET frames may follow TURN_COMPLETE before TURN_SETTLED");
        }
    }
    else {
        if (complete !== frames.length - 1)
            errors.push("TURN_COMPLETE must be the last frame");
        if (settled.length > 0)
            errors.push("TURN_SETTLED requires TURN_COMPLETE with more=true");
    }
    const errorIndexes = frames.flatMap((frame, index) => isError(frame) ? [index] : []);
    if (errorIndexes.length > 1)
        errors.push(`expected at most 1 ERROR, found ${errorIndexes.length}`);
    if (errorIndexes.length > 0 && errorIndexes[0] > complete)
        errors.push("ERROR must not occur after TURN_COMPLETE");
    return errors;
}
