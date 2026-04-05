export type Frame = Record<string, unknown>;
export declare function isTurnComplete(frame: Frame): boolean;
export declare function isError(frame: Frame): boolean;
export declare function validateTurnLifecycle(frames: Frame[]): string[];
