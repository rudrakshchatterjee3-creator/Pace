/**
 * geminiClient.test.ts
 * Tests for callAgent — the core AI proxy function.
 * All network calls are mocked; no real API key required.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { callAgent, type AgentRequest, type AgentOptions } from "../lib/geminiClient";
import type { PaceOut } from "../lib/history";

// ──────────────────────────────────────────────
// Mock fetch globally
// ──────────────────────────────────────────────
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Helper not currently used; kept for future network-success tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function makeSuccessResponse(data: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data }),
  } as Response);
}

function makeErrorResponse(status: number, body = "Server error") {
  return Promise.resolve({
    ok: false,
    status,
    text: () => Promise.resolve(body),
  } as unknown as Response);
}

const DEMO_RESULT: PaceOut = {
  is_crisis: false,
  detected_stressors: ["test stressor"],
  emotional_tone: "anxious",
  strategy: "Breathe.",
  resilience_score: 7,
};

const MOCK_FN = () => DEMO_RESULT;

const BASE_REQ: AgentRequest<{ journalEntry: string }> = {
  task: "analyze-journal",
  input: { journalEntry: "I feel stressed." },
  schemaHint: "{ is_crisis: boolean, detected_stressors: string[], emotional_tone: string, strategy: string, resilience_score: number }",
  system: "You are a supportive companion.",
};

const BASE_OPTS: AgentOptions<PaceOut> = {
  mock: MOCK_FN,
  retries: 0, // disable retries in unit tests for speed
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ──────────────────────────────────────────────
// Happy path
// ──────────────────────────────────────────────
describe("callAgent — happy path", () => {
  it("returns live data when fetch succeeds", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: DEMO_RESULT }),
    });

    const result = await callAgent(BASE_REQ, BASE_OPTS);
    expect(result.source).toBe("live");
    expect(result.data.emotional_tone).toBe("anxious");
    expect(result.data.resilience_score).toBe(7);
  });

  it("POSTs to /api/agent with correct headers", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: DEMO_RESULT }),
    });

    await callAgent(BASE_REQ, BASE_OPTS);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/agent",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("includes profile in request body when provided", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: DEMO_RESULT }),
    });

    await callAgent(
      {
        ...BASE_REQ,
        profile: { name: "Rudraksh", age: 17, targetExam: "JEE", avatar: "🎯" },
      },
      BASE_OPTS
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.profile).toBeDefined();
    expect(body.profile.name).toBe("Rudraksh");
  });

  it("parses data when server returns a JSON string (legacy compat)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: JSON.stringify(DEMO_RESULT) }),
    });

    const result = await callAgent(BASE_REQ, BASE_OPTS);
    expect(result.source).toBe("live");
    expect(result.data.strategy).toBe("Breathe.");
  });

  it("reports elapsed ms", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: DEMO_RESULT }),
    });

    const result = await callAgent(BASE_REQ, BASE_OPTS);
    expect(result.ms).toBeGreaterThanOrEqual(0);
  });
});

// ──────────────────────────────────────────────
// Failure → fallback paths
// ──────────────────────────────────────────────
describe("callAgent — failure fallback", () => {
  it("falls back to mock data on 503 (no retries)", async () => {
    mockFetch.mockResolvedValue(makeErrorResponse(503));
    const result = await callAgent(BASE_REQ, BASE_OPTS);
    expect(result.source).toBe("mock");
    expect(result.data).toEqual(DEMO_RESULT);
  });

  it("falls back to mock data on network failure", async () => {
    mockFetch.mockRejectedValue(new Error("Network offline"));
    const result = await callAgent(BASE_REQ, BASE_OPTS);
    expect(result.source).toBe("mock");
  });

  it("falls back immediately (no retry) on 400 bad request", async () => {
    mockFetch.mockResolvedValue(makeErrorResponse(400, "bad input"));
    const result = await callAgent(BASE_REQ, { mock: MOCK_FN, retries: 3 });
    // Should only call once — 4xx signals no retry
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.source).toBe("mock");
  });

  it("retries on 429 up to configured limit", async () => {
    mockFetch.mockResolvedValue(makeErrorResponse(429, "rate limited"));
    await callAgent(BASE_REQ, { mock: MOCK_FN, retries: 2 });
    // 1 initial + 2 retries = 3 calls
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("falls back when server returns error field", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ error: "Model unavailable" }),
    });
    const result = await callAgent(BASE_REQ, BASE_OPTS);
    expect(result.source).toBe("mock");
  });
});
