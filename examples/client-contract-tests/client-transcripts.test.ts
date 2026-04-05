/**
 * Example contract tests for the client repo.
 *
 * Copy this into your client repo's test directory and adapt
 * `applyTranscript` to your client's state machine.
 *
 * The key idea: feed canonical protocol transcripts into your client's
 * message handler and assert it reaches the correct UI state.
 */

import { describe, expect, it } from "vitest";
import type { Frame } from "copilot-protocol";

// Replace this with your actual client state machine adapter
interface ClientState {
  isWaiting: boolean;
  hasError: boolean;
  messages: string[];
}

function applyTranscript(_frames: Frame[]): ClientState {
  // Wire this to your client's message handling logic.
  // Feed each frame through your WebSocket message handler
  // and return the final UI state.
  throw new Error("Wire this to your client's state machine");
}

describe("client protocol contracts", () => {
  it("TURN_COMPLETE is the only terminal signal", () => {
    const result = applyTranscript([
      {
        message_type: "FRAGMENT",
        channel: "chat",
        message_id: "1",
        content: "hi",
      },
      {
        message_type: "MESSAGE_ENDED",
        channel: "chat",
        message_id: "2",
        content: {},
      },
      {
        message_type: "PROTOCOL",
        channel: "chat",
        message_id: "3",
        content: { type: "TURN_COMPLETE" },
      },
    ]);

    expect(result.isWaiting).toBe(false);
  });

  it("MESSAGE_ENDED does not end the turn", () => {
    // After MESSAGE_ENDED but before TURN_COMPLETE, client should still be waiting
    const result = applyTranscript([
      {
        message_type: "FRAGMENT",
        channel: "chat",
        message_id: "1",
        content: "hi",
      },
      {
        message_type: "MESSAGE_ENDED",
        channel: "chat",
        message_id: "2",
        content: {},
      },
      // Note: no TURN_COMPLETE yet
    ]);

    expect(result.isWaiting).toBe(true);
  });

  it("ERROR does not end the turn by itself", () => {
    const result = applyTranscript([
      {
        message_type: "ERROR",
        channel: "chat",
        message_id: "1",
        content: "oops",
        error: { code: "TEST", user_message: "oops" },
      },
      // Note: no TURN_COMPLETE yet
    ]);

    expect(result.isWaiting).toBe(true);
    expect(result.hasError).toBe(true);
  });

  it("handles empty turns", () => {
    const result = applyTranscript([
      {
        message_type: "PROTOCOL",
        channel: "chat",
        message_id: "1",
        content: { type: "TURN_COMPLETE" },
      },
    ]);

    expect(result.isWaiting).toBe(false);
  });

  it("handles widget-only turns", () => {
    const result = applyTranscript([
      {
        message_type: "WIDGET",
        channel: "chat",
        message_id: "1",
        content: { widget_type: "table", payload: { rows: [] } },
      },
      {
        message_type: "PROTOCOL",
        channel: "chat",
        message_id: "2",
        content: { type: "TURN_COMPLETE" },
      },
    ]);

    expect(result.isWaiting).toBe(false);
  });

  it("tolerates unknown message types", () => {
    // Should not crash on unknown types
    const result = applyTranscript([
      {
        message_type: "FUTURE_TYPE",
        channel: "chat",
        message_id: "1",
        content: "something new",
      },
      {
        message_type: "PROTOCOL",
        channel: "chat",
        message_id: "2",
        content: { type: "TURN_COMPLETE" },
      },
    ]);

    expect(result.isWaiting).toBe(false);
  });
});
