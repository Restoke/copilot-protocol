import { describe, expect, it } from "vitest";
import { validateEnvelope } from "../src/validators.js";

describe("envelope validation", () => {
  it("accepts a valid envelope", () => {
    const msg = {
      message_id: "1",
      message_type: "FRAGMENT",
      channel: "chat",
      content: "hello",
    };
    expect(validateEnvelope(msg)).toEqual([]);
  });

  it("rejects missing message_type", () => {
    const msg = {
      message_id: "1",
      channel: "chat",
      content: "hello",
    };
    const errors = validateEnvelope(msg);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("message_type"))).toBe(true);
  });

  it("rejects empty message_id", () => {
    const msg = {
      message_id: "",
      message_type: "FRAGMENT",
      channel: "chat",
      content: "hello",
    };
    const errors = validateEnvelope(msg);
    expect(errors.length).toBeGreaterThan(0);
  });
});
