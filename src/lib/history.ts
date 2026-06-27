export interface PaceOut {
  is_crisis: boolean;
  detected_stressors: string[];
  emotional_tone: string;
  strategy: string;
  resilience_score: number;
}

export interface UserProfile {
  name: string;
  age: number;
  targetExam: string;
  avatar: string;
}

export interface JournalRecord {
  id: string;
  createdAt: string; // ISO timestamp
  journalEntry: string;
  result: PaceOut;
  source: "live" | "mock";
}

const keyFor = (email: string) => `pace.history.${email}`;
const profileKeyFor = (email: string) => `pace.profile.${email}`;

export function getProfile(email: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(profileKeyFor(email));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.name === "string" && typeof parsed.age === "number") {
      return parsed as UserProfile;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveProfile(email: string, profile: UserProfile): void {
  localStorage.setItem(profileKeyFor(email), JSON.stringify(profile));
}


export function getHistory(email: string): JournalRecord[] {
  try {
    const raw = localStorage.getItem(keyFor(email));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(email: string, record: JournalRecord): JournalRecord[] {
  const history = [record, ...getHistory(email)].slice(0, 100);
  localStorage.setItem(keyFor(email), JSON.stringify(history));
  return history;
}

export function clearHistory(email: string): void {
  localStorage.removeItem(keyFor(email));
}

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Consecutive days (including today, walking backwards) that have at least one entry. */
export function computeStreak(history: JournalRecord[]): number {
  if (history.length === 0) return 0;
  const days = new Set(history.map((r) => dayKey(new Date(r.createdAt))));
  let streak = 0;
  let cursor = new Date();
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}

/** Entry counts for the current week, Monday through Sunday. */
export function computeWeekCounts(history: JournalRecord[]): { label: string; count: number }[] {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date();
  const isoDow = (today.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(today.getTime() - isoDow * DAY_MS);

  const counts = labels.map((label, idx) => {
    const day = new Date(monday.getTime() + idx * DAY_MS);
    const key = dayKey(day);
    const count = history.filter((r) => dayKey(new Date(r.createdAt)) === key).length;
    return { label, count };
  });
  return counts;
}
