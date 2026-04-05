export declare function fixturesDir(): string;
export declare function loadFixture(filePath: string): {
    name: string;
    direction: string;
    frames: Record<string, unknown>[];
};
