import { describe, expect, it } from "vitest";
import { validateReadyContent } from "../src/validators.js";

describe("handshake validation", () => {
  it("accepts valid READY with version", () => {
    const content = { type: "READY", protocol_version: "1.0.0" };
    expect(validateReadyContent(content)).toEqual([]);
  });

  it("accepts valid READY with capabilities", () => {
    const content = {
      type: "READY",
      protocol_version: "1.0.0",
      min_client_version: "1.0.0",
      capabilities: ["turn_complete", "widget"],
    };
    expect(validateReadyContent(content)).toEqual([]);
  });

  it("rejects missing protocol_version", () => {
    const content = { type: "READY" };
    const errors = validateReadyContent(content);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("protocol_version"))).toBe(true);
  });

  it("rejects empty protocol_version", () => {
    const content = { type: "READY", protocol_version: "" };
    const errors = validateReadyContent(content);
    expect(errors.length).toBeGreaterThan(0);
  });
});
