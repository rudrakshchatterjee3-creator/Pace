/**
 * history.test.ts
 * Tests for all logic in src/lib/history.ts — the highest-priority coverage axis.
 * All tests run fully in-memory with a localStorage mock (provided by jsdom).
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  getProfile,
  saveProfile,
  getHistory,
  addHistoryEntry,
  clearHistory,
  computeStreak,
  computeWeekCounts,
  type UserProfile,
  type JournalRecord,
  type PaceOut,
} from "../lib/history";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
const EMAIL = "test@pace.app";

function makeResult(overrides: Partial<PaceOut> = {}): PaceOut {
  return {
    is_crisis: false,
    detected_stressors: ["mock stressor"],
    emotional_tone: "anxious",
    strategy: "Breathe deeply.",
    resilience_score: 6,
    ...overrides,
  };
}

function makeRecord(
  createdAt: string,
  overrides: Partial<JournalRecord> = {}
): JournalRecord {
  return {
    id: crypto.randomUUID(),
    createdAt,
    journalEntry: "I am stressed about the mock test.",
    result: makeResult(),
    source: "live",
    ...overrides,
  };
}

/** ISO date string N days ago from now */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ──────────────────────────────────────────────
// Reset localStorage between each test
// ──────────────────────────────────────────────
beforeEach(() => {
  localStorage.clear();
});

// ──────────────────────────────────────────────
// UserProfile persistence
// ──────────────────────────────────────────────
describe("getProfile / saveProfile", () => {
  it("returns null when nothing is stored", () => {
    expect(getProfile(EMAIL)).toBeNull();
  });

  it("round-trips a valid profile", () => {
    const profile: UserProfile = {
      name: "Rudraksh",
      age: 17,
      targetExam: "JEE",
      avatar: "🎯",
    };
    saveProfile(EMAIL, profile);
    expect(getProfile(EMAIL)).toEqual(profile);
  });

  it("returns null for corrupt JSON", () => {
    localStorage.setItem(`pace.profile.${EMAIL}`, "NOT_JSON{{{");
    expect(getProfile(EMAIL)).toBeNull();
  });

  it("returns null when stored object is missing required fields", () => {
    localStorage.setItem(
      `pace.profile.${EMAIL}`,
      JSON.stringify({ name: "No age" })
    );
    expect(getProfile(EMAIL)).toBeNull();
  });
});

// ──────────────────────────────────────────────
// JournalRecord history
// ──────────────────────────────────────────────
describe("getHistory / addHistoryEntry / clearHistory", () => {
  it("returns empty array when nothing is stored", () => {
    expect(getHistory(EMAIL)).toEqual([]);
  });

  it("adds an entry and retrieves it", () => {
    const record = makeRecord(new Date().toISOString());
    addHistoryEntry(EMAIL, record);
    const stored = getHistory(EMAIL);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(record.id);
  });

  it("prepends new entries (most recent first)", () => {
    const first = makeRecord(daysAgo(2), { journalEntry: "first" });
    const second = makeRecord(new Date().toISOString(), { journalEntry: "second" });
    addHistoryEntry(EMAIL, first);
    addHistoryEntry(EMAIL, second);
    const stored = getHistory(EMAIL);
    expect(stored[0].journalEntry).toBe("second");
    expect(stored[1].journalEntry).toBe("first");
  });

  it("caps history at 100 entries", () => {
    for (let i = 0; i < 110; i++) {
      addHistoryEntry(EMAIL, makeRecord(new Date().toISOString()));
    }
    expect(getHistory(EMAIL)).toHaveLength(100);
  });

  it("clearHistory removes all entries", () => {
    addHistoryEntry(EMAIL, makeRecord(new Date().toISOString()));
    clearHistory(EMAIL);
    expect(getHistory(EMAIL)).toEqual([]);
  });

  it("returns empty array for corrupt localStorage data", () => {
    localStorage.setItem(`pace.history.${EMAIL}`, "BAD_DATA");
    expect(getHistory(EMAIL)).toEqual([]);
  });

  it("returns empty array when stored value is not an array", () => {
    localStorage.setItem(`pace.history.${EMAIL}`, JSON.stringify({ bad: true }));
    expect(getHistory(EMAIL)).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// Streak computation
// ──────────────────────────────────────────────
describe("computeStreak", () => {
  it("returns 0 for empty history", () => {
    expect(computeStreak([])).toBe(0);
  });

  it("returns 1 for a single entry today", () => {
    const records = [makeRecord(new Date().toISOString())];
    expect(computeStreak(records)).toBe(1);
  });

  it("counts consecutive days including today", () => {
    const records = [
      makeRecord(new Date().toISOString()),
      makeRecord(daysAgo(1)),
      makeRecord(daysAgo(2)),
    ];
    expect(computeStreak(records)).toBe(3);
  });

  it("breaks streak on a gap", () => {
    // Today + 3 days ago (gap on days 1 and 2)
    const records = [
      makeRecord(new Date().toISOString()),
      makeRecord(daysAgo(3)),
    ];
    expect(computeStreak(records)).toBe(1);
  });

  it("returns 0 when the most recent entry is not today", () => {
    const records = [makeRecord(daysAgo(1))];
    expect(computeStreak(records)).toBe(0);
  });

  it("de-duplicates multiple entries on the same day", () => {
    // Two entries today + one yesterday = streak of 2
    const now = new Date().toISOString();
    const records = [
      makeRecord(now),
      makeRecord(now),
      makeRecord(daysAgo(1)),
    ];
    expect(computeStreak(records)).toBe(2);
  });
});

// ──────────────────────────────────────────────
// Week count computation
// ──────────────────────────────────────────────
describe("computeWeekCounts", () => {
  it("returns 7 buckets labelled M-S", () => {
    const result = computeWeekCounts([]);
    expect(result).toHaveLength(7);
    expect(result.map((d) => d.label)).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
  });

  it("all counts are 0 for empty history", () => {
    const result = computeWeekCounts([]);
    expect(result.every((d) => d.count === 0)).toBe(true);
  });

  it("counts today's entry in the correct bucket", () => {
    const today = new Date();
    const isoDow = (today.getDay() + 6) % 7; // 0 = Monday
    const records = [makeRecord(today.toISOString())];
    const result = computeWeekCounts(records);
    expect(result[isoDow].count).toBe(1);
  });

  it("multiple entries on the same day increment the same bucket", () => {
    const today = new Date();
    const isoDow = (today.getDay() + 6) % 7;
    const records = [
      makeRecord(today.toISOString()),
      makeRecord(today.toISOString()),
    ];
    const result = computeWeekCounts(records);
    expect(result[isoDow].count).toBe(2);
  });
});
