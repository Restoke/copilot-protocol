export function isTurnComplete(frame) {
    const content = frame.content;
    return (frame.message_type === "PROTOCOL" &&
        typeof content === "object" &&
        content !== null &&
        content.type === "TURN_COMPLETE");
}
export function isError(frame) {
    return frame.message_type === "ERROR";
}
export function validateTurnLifecycle(frames) {
    const errors = [];
    const turnCompleteIndexes = frames
        .map((frame, index) => ({ frame, index }))
        .filter(({ frame }) => isTurnComplete(frame))
        .map(({ index }) => index);
    if (turnCompleteIndexes.length !== 1) {
        errors.push(`expected exactly 1 TURN_COMPLETE, found ${turnCompleteIndexes.length}`);
        return errors;
    }
    const turnCompleteIndex = turnCompleteIndexes[0];
    if (turnCompleteIndex !== frames.length - 1) {
        errors.push("TURN_COMPLETE must be the last frame");
    }
    const errorIndexes = frames
        .map((frame, index) => ({ frame, index }))
        .filter(({ frame }) => isError(frame))
        .map(({ index }) => index);
    if (errorIndexes.length > 1) {
        errors.push(`expected at most 1 ERROR, found ${errorIndexes.length}`);
    }
    if (errorIndexes.length > 0 && errorIndexes[0] > turnCompleteIndex) {
        errors.push("ERROR must not occur after TURN_COMPLETE");
    }
    return errors;
}
