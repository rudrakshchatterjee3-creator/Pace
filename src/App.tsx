import React, { useEffect, useState } from "react";
import {
  Sparkles,
  AlertCircle,
  Phone,
  BookOpen,
  Activity,
  LogOut,
  NotebookPen,
  TrendingUp,
  LifeBuoy,
  Settings,
  Wind,
  Smile,
  X,
  Trash2,
  Flame,
  Coffee,
  Moon,
  Users,
  Brain,
  Clock3,
  Headphones,
  ArrowRight,
  CheckCircle2,
  LineChart,
  TimerReset,
} from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, AreaChart, Area, YAxis, CartesianGrid } from "recharts";
import { callAgent } from "./lib/geminiClient";
import { GoogleLogin, googleLogout, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import ShaderBackground from "./components/ShaderBackground";
import BackgroundDecor from "./components/BackgroundDecor";
import BreathingTimer from "./components/BreathingTimer";
import {
  PaceOut,
  JournalRecord,
  UserProfile,
  getProfile,
  saveProfile,
  getHistory,
  addHistoryEntry,
  clearHistory,
  computeStreak,
  computeWeekCounts,
} from "./lib/history";

interface PaceIn {
  journalEntry: string;
  template?: string;
}

type View = "journal" | "trends" | "resources";

interface GoogleUser {
  email: string;
  given_name?: string;
  name?: string;
  picture?: string;
}

const CRISIS_FALLBACK: PaceOut = {
  is_crisis: true,
  detected_stressors: [],
  emotional_tone: "overwhelmed",
  strategy: "",
  resilience_score: 1,
};

const MUSIC_LINKS = [
  {
    title: "Lofi Girl radio",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    note: "A steady no-sign-in YouTube stream for study blocks.",
  },
  {
    title: "Chillhop radio",
    url: "https://www.youtube.com/watch?v=5yx6BWlEVcY",
    note: "Soft beats for journaling or cooling down after a mock test.",
  },
  {
    title: "Calm study playlist",
    url: "https://www.youtube.com/results?search_query=lofi+study+music+no+ads",
    note: "Use when you want a quieter background before sleep.",
  },
] as const;

const LANDING_PROOF = [
  {
    value: "59.3M",
    label: "U.S. adults lived with a mental illness in 2022.",
    source: "NIMH",
    url: "https://www.nimh.nih.gov/health/statistics/mental-illness",
  },
  {
    value: "40%",
    label: "high-school students reported persistent sadness or hopelessness in 2023.",
    source: "CDC YRBS",
    url: "https://www.cdc.gov/yrbs/dstr/index.html",
  },
  {
    value: "301M",
    label: "people worldwide were living with an anxiety disorder in 2019.",
    source: "WHO",
    url: "https://www.who.int/news-room/fact-sheets/detail/anxiety-disorders",
  },
] as const;

const randomMusicLink = () => MUSIC_LINKS[Math.floor(Math.random() * MUSIC_LINKS.length)];

function getDemoFallback(profile: UserProfile | null): PaceOut {
  const name = profile?.name || "student";
  const exam = profile?.targetExam || "exam";
  
  const strategies: Record<string, string> = {
    NEET: `Hey ${name}, biology memorization can be exhausting. Put down your flashcards for 5 minutes. Take a sip of water and look out of the window to rest your eyes and mind.`,
    JEE: `Hey ${name}, solving math and physics problems under speed limits is intense. Step away from your desk. Do a quick physical stretch for 5 minutes before tackling the next practice set.`,
    CUET: `Hey ${name}, preparing for multiple disciplines in CUET is a balancing act. Close your books. Do a quick 4-7-8 breathing cycle to calm your nervous system.`,
    CAT: `Hey ${name}, quantitative speed and data analysis takes huge mental focus. Stand up, roll your shoulders, and walk around your room for 5 minutes to restore your focus.`,
    GATE: `Hey ${name}, deep engineering concepts can create severe mental fatigue. Close your eyes, take 5 slow deep breaths, and let go of the formulas for a moment.`,
    UPSC: `Hey ${name}, civil services preparation requires extreme mental endurance. Close your notebook, step outside for a short 5-minute walk, and disconnect from current affairs.`,
    SSC: `Hey ${name}, high-speed general aptitude drills are draining. Rest your hands and mind. Do a quick breathing relaxation exercise before starting the next mock test.`,
    Others: `Hey ${name}, exam preparation is a marathon. Take a 5-minute break. Close your eyes and focus on your breathing to reset before you study further.`
  };

  const strategy = strategies[exam] || `Hey ${name}, take a 5-minute break to breathe and reset before you study further.`;

  return {
    is_crisis: false,
    detected_stressors: [`${exam} prep load`, "academic competition"],
    emotional_tone: "stressed but determined",
    strategy,
    resilience_score: 6,
  };
}

function LoadingDots({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6">
      <div className="flex gap-2">
        <div className="h-3 w-3 rounded-full bg-accent-calm animate-pulse-dot [animation-delay:0ms]"></div>
        <div className="h-3 w-3 rounded-full bg-accent-calm animate-pulse-dot [animation-delay:200ms]"></div>
        <div className="h-3 w-3 rounded-full bg-accent-calm animate-pulse-dot [animation-delay:400ms]"></div>
      </div>
      <span className="text-sm font-semibold uppercase tracking-widest text-muted">{label}</span>
    </div>
  );
}

function toneColorClass(tone: string) {
  const t = tone.toLowerCase();
  if (t.includes("anx") || t.includes("overwhelm") || t.includes("stress")) return "bg-crisis";
  if (t.includes("hope") || t.includes("calm") || t.includes("good") || t.includes("accomplish")) return "bg-accent-calm";
  return "bg-accent-warm";
}

function PaceLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="inline-flex items-center gap-3 text-ink">
      <div className="relative h-11 w-11 shrink-0 rounded-full bg-ink shadow-[0_14px_30px_rgba(45,49,66,0.18)]">
        <div className="absolute inset-2 rounded-full border border-paper/45"></div>
        <div className="absolute left-1/2 top-1/2 h-1.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper"></div>
        <div className="absolute left-1/2 top-[9px] h-5 w-1.5 -translate-x-1/2 rounded-full bg-accent-warm"></div>
      </div>
      {!compact && (
        <div className="leading-none">
          <span className="block font-display text-2xl font-bold tracking-tight">Pace</span>
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.28em] text-muted">steady study</span>
        </div>
      )}
    </div>
  );
}

function MusicLinkCard({ compact = false }: { compact?: boolean }) {
  const [music] = useState(randomMusicLink);

  return (
    <a
      href={music.url}
      target="_blank"
      rel="noreferrer"
      className={`group flex items-center gap-3 rounded-xl border border-muted/10 bg-white/80 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent-calm/40 hover:shadow-md ${
        compact ? "max-w-full" : ""
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-calm/15 text-accent-calm">
        <Headphones className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{music.title}</p>
        <p className="text-xs leading-relaxed text-muted">{music.note}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
    </a>
  );
}

export default function App() {
  const [entry, setEntry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaceOut | null>(null);
  const [source, setSource] = useState<"live" | "mock" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auth state
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Navigation + chrome
  const [view, setView] = useState<View>("journal");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Real, locally-persisted reflection history (per Google account)
  const [history, setHistory] = useState<JournalRecord[]>([]);

  // Restore auth session from localStorage on mount (fixes refresh logout)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pace.user");
      if (saved) {
        const decoded: GoogleUser = JSON.parse(saved);
        if (decoded?.email) {
          setUser(decoded);
          setHistory(getHistory(decoded.email));
          setProfile(getProfile(decoded.email));
        }
      }
    } catch {
      localStorage.removeItem("pace.user");
    }
  }, []);

  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const decoded = jwtDecode<GoogleUser>(credentialResponse.credential);
      localStorage.setItem("pace.user", JSON.stringify(decoded));
      setUser(decoded);
      setHistory(getHistory(decoded.email));
      setProfile(getProfile(decoded.email));
    }
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem("pace.user");
    setUser(null);
    setProfile(null);
    setSelectedTemplate(null);
    setResult(null);
    setEntry("");
    setHistory([]);
    setView("journal");
    setSettingsOpen(false);
  };

  function handleClearHistory() {
    if (!user) return;
    clearHistory(user.email);
    setHistory([]);
  }

  function startNewEntry() {
    setResult(null);
    setSource(null);
    setEntry("");
    setError(null);
    setSelectedTemplate(null);
  }

  async function run(input: PaceIn, forceCrisisDemo = false) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data, source } = await callAgent<PaceIn, PaceOut>(
        {
          task: "analyze-journal",
          input,
          schemaHint: "{ is_crisis: boolean, detected_stressors: string[], emotional_tone: string, strategy: string, resilience_score: number }",
          system: "You are Pace, a supportive digital companion for students taking high-stakes exams. Return only the requested JSON. Do not diagnose. Do not invent facts about the user. Use only the journal entry and provided profile. If the user expresses self-harm, suicidal ideation, or crisis-level distress, set is_crisis to true and resilience_score to 1. Otherwise, identify up to five stressors, name the emotional tone in plain words, rate resilience from 1 to 10 based on coping capability and outlook in the entry, and provide one short, actionable grounding strategy under 70 words.",
          profile: profile || undefined,
        },
        { mock: () => forceCrisisDemo ? CRISIS_FALLBACK : getDemoFallback(profile) }
      );

      const text = input.journalEntry.toLowerCase();
      if (text.includes("want to end it") || text.includes("hurt myself") || text.includes("kill myself") || text.includes("suicide")) {
        data.is_crisis = true;
        data.resilience_score = 1;
      }

      if (typeof data.resilience_score !== "number") {
        data.resilience_score = data.is_crisis ? 1 : 6;
      }

      setResult(data);
      setSource(source);

      if (!data.is_crisis && user) {
        const record: JournalRecord = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          journalEntry: input.journalEntry,
          result: data,
          source,
        };
        setHistory(addHistoryEntry(user.email, record));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // --- LANDING PAGE ---
  if (!user) {
    return (
      <main className="landing-shell relative min-h-screen overflow-hidden bg-paper font-body text-ink">
        <ShaderBackground className="absolute inset-0 -z-10 h-full w-full opacity-35" />
        <div className="study-scroll-layer" aria-hidden="true">
          <span className="study-note note-a">mock test 62%</span>
          <span className="study-note note-b">sleep: 5h 20m</span>
          <span className="study-note note-c">revise organic chem</span>
          <span className="study-line line-a"></span>
          <span className="study-line line-b"></span>
        </div>

        <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 md:px-10">
          <header className="flex items-center justify-between">
            <PaceLogo />
            <a href="#start" className="hidden rounded-full border border-muted/20 bg-white/70 px-5 py-2 text-sm font-semibold text-ink shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-accent-calm/40 md:inline-flex">
              Start gently
            </a>
          </header>

          <div className="grid flex-1 items-center gap-10 py-14 md:grid-cols-[1.05fr_0.95fr] md:py-20">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent-calm/25 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-muted shadow-sm">
                <Brain className="h-4 w-4 text-accent-calm" />
                Built for overloaded students
              </div>
              <div className="space-y-5">
                <h1 className="max-w-3xl font-display text-[clamp(3rem,9vw,6.9rem)] font-bold leading-[0.9] tracking-tight text-ink">
                  When your mind is racing, Pace slows the next minute down.
                </h1>
                <p className="max-w-xl text-lg leading-8 text-ink/72 md:text-xl">
                  Write the messy version of what happened. Pace reads for stress, pressure, and burnout, then gives you one small reset you can actually do before the next study block.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-ink shadow-sm">Mock test spirals</span>
                <span className="rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-ink shadow-sm">Parent pressure</span>
                <span className="rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-ink shadow-sm">Late-night panic</span>
                <span className="rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-ink shadow-sm">Comparison loops</span>
              </div>
            </div>

            <div className="landing-journal-panel scroll-reveal rounded-2xl border border-muted/10 bg-white/80 p-5 shadow-2xl backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">Tonight's entry</p>
                  <p className="mt-1 font-display text-2xl font-bold">"I studied all day and still feel behind."</p>
                </div>
                <Clock3 className="h-6 w-6 text-accent-warm" />
              </div>
              <div className="space-y-3">
                <div className="rounded-xl bg-paper p-4">
                  <p className="text-sm leading-6 text-ink/75">Your brain is treating one bad mock like proof that the whole exam is slipping away.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-accent-calm/20 bg-accent-calm/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">Tone</p>
                    <p className="mt-2 font-semibold text-ink">wired, tired</p>
                  </div>
                  <div className="rounded-xl border border-accent-warm/25 bg-accent-warm/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">Next</p>
                    <p className="mt-2 font-semibold text-ink">10 minute reset</p>
                  </div>
                </div>
                <MusicLinkCard compact />
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 border-y border-muted/10 bg-white/55 px-6 py-16 backdrop-blur md:px-10">
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
            {LANDING_PROOF.map((item) => (
              <a key={item.value} href={item.url} target="_blank" rel="noreferrer" className="scroll-reveal rounded-2xl border border-muted/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-accent-calm/35 hover:shadow-lg">
                <p className="font-display text-5xl font-bold text-ink">{item.value}</p>
                <p className="mt-4 min-h-16 text-sm leading-6 text-muted">{item.label}</p>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-accent-calm">{item.source}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="relative z-10 mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-[0.9fr_1.1fr] md:px-10 md:py-24">
          <div className="scroll-reveal space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent-calm">What Pace notices</p>
            <h2 className="font-display text-4xl font-bold leading-tight md:text-5xl">The problem is rarely discipline. It is an unprocessed day.</h2>
          </div>
          <div className="grid gap-4">
            {[
              ["You compare your chapter count to everyone else's and call it motivation."],
              ["You keep studying because stopping feels unsafe, even when nothing is going in."],
              ["You know you need a break, but you need someone to tell you what kind."],
              ["You want support that sounds like a person, not a poster on a classroom wall."],
            ].map(([text]) => (
              <div key={text} className="scroll-reveal flex gap-4 rounded-2xl border border-muted/10 bg-white/75 p-5 shadow-sm">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-accent-calm" />
                <p className="text-base leading-7 text-ink/78">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="start" className="relative z-10 mx-auto max-w-xl px-6 pb-24 text-center md:px-10">
          <div className="scroll-reveal rounded-2xl border border-muted/10 bg-white/85 p-8 shadow-2xl backdrop-blur md:p-10">
            <PaceLogo />
            <h2 className="mt-8 font-display text-3xl font-bold text-ink">Start with one honest entry.</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
              Pace stores your reflections on this device and turns each entry into a clear next step.
            </p>
            <div className="mt-8 flex justify-center">
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => console.warn("Google Login Failed")}
                useOneTap
                theme="filled_black"
                shape="pill"
                size="large"
                text="continue_with"
              />
            </div>
          </div>
        </section>
      </main>
    );
  }

  const streak = computeStreak(history);
  const weekCounts = computeWeekCounts(history);

  // --- ONBOARDING VIEW TRIGGER ---
  if (user && !profile) {
    return (
      <OnboardingView
        user={user}
        onSave={(newProfile) => {
          saveProfile(user.email, newProfile);
          setProfile(newProfile);
        }}
      />
    );
  }

  // --- LOGGED-IN APP ---
  return (
    <div className="min-h-screen bg-paper font-body relative">
      <BackgroundDecor />

      {/* Signature Element: Breath Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-accent-calm/20 overflow-hidden z-50">
        <div className="h-full bg-accent-calm animate-breath rounded-r-full"></div>
      </div>

      {/* TopAppBar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-muted/10 bg-paper/80 px-6 py-4 backdrop-blur-md md:px-10">
        <button
          type="button"
          onClick={() => setView("journal")}
          aria-label="Go to dashboard"
          className="rounded-full transition-transform hover:-translate-y-0.5"
        >
          <PaceLogo />
        </button>
        <nav className="hidden md:flex items-center gap-8">
          <NavTab icon={NotebookPen} label="Journal" active={view === "journal"} onClick={() => setView("journal")} />
          <NavTab icon={TrendingUp} label="Trends" active={view === "trends"} onClick={() => setView("trends")} />
          <NavTab icon={LifeBuoy} label="Resources" active={view === "resources"} onClick={() => setView("resources")} />
        </nav>
        <div className="flex items-center gap-2">
          <button
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
            className="rounded-full p-2.5 text-muted transition-colors hover:bg-muted/10 hover:text-ink flex items-center gap-2"
          >
            {profile && (
              <span className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm border border-muted/10 text-xl font-display">
                {profile.avatar.startsWith("http") ? (
                  <img src={profile.avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  profile.avatar
                )}
              </span>
            )}
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] max-w-4xl flex-col px-6 py-8 pb-28 md:py-12 md:pb-12">
        {view === "journal" && (
          <JournalView
            user={user}
            profile={profile}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            entry={entry}
            setEntry={setEntry}
            loading={loading}
            error={error}
            result={result}
            source={source}
            run={run}
            startNewEntry={startNewEntry}
          />
        )}

        {view === "trends" && (
          <TrendsView streak={streak} weekCounts={weekCounts} history={history} />
        )}

        {view === "resources" && <ResourcesView />}
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-3 bg-paper/90 backdrop-blur-lg border-t border-muted/10 shadow-[0_-8px_30px_rgba(23,27,43,0.06)]">
        <BottomTab icon={NotebookPen} label="Journal" active={view === "journal"} onClick={() => setView("journal")} />
        <BottomTab icon={TrendingUp} label="Trends" active={view === "trends"} onClick={() => setView("trends")} />
        <BottomTab icon={LifeBuoy} label="Resources" active={view === "resources"} onClick={() => setView("resources")} />
      </nav>

      {/* Settings Drawer */}
      {settingsOpen && (
        <SettingsDrawer
          user={user}
          profile={profile}
          onSaveProfile={(updatedProfile) => {
            saveProfile(user.email, updatedProfile);
            setProfile(updatedProfile);
          }}
          historyCount={history.length}
          onClose={() => setSettingsOpen(false)}
          onClearHistory={handleClearHistory}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

function NavTab({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof NotebookPen;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 pb-1 transition-colors ${
        active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}

function BottomTab({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof NotebookPen;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-all duration-200 active:scale-95 ${
        active ? "bg-accent-calm/15 text-ink" : "text-muted hover:text-ink"
      }`}
    >
      <Icon className="h-5 w-5 mb-1" />
      <span className={`text-[10px] leading-tight ${active ? "font-bold" : ""}`}>{label}</span>
    </button>
  );
}

function JournalView({
  user,
  profile,
  selectedTemplate,
  setSelectedTemplate,
  entry,
  setEntry,
  loading,
  error,
  result,
  source,
  run,
  startNewEntry,
}: {
  user: GoogleUser;
  profile: UserProfile | null;
  selectedTemplate: string | null;
  setSelectedTemplate: (v: string | null) => void;
  entry: string;
  setEntry: (v: string) => void;
  loading: boolean;
  error: string | null;
  result: PaceOut | null;
  source: "live" | "mock" | null;
  run: (input: PaceIn, forceCrisisDemo?: boolean) => Promise<void>;
  startNewEntry: () => void;
}) {
  const templates = [
    {
      id: "anxiety",
      title: "Exam Anxiety",
      icon: AlertCircle,
      prompt: `[Exam Anxiety]\n- What exam event is causing stress? (e.g., mock tests, specific topic, exam day):\n- What physical/mental sensations are you experiencing?:\n- What is the most anxious thought you have right now?:`
    },
    {
      id: "time",
      title: "Time Management",
      icon: Coffee,
      prompt: `[Time Management]\n- What is your current study schedule vs. what you want to achieve?:\n- Where do you feel time is slipping away or wasted?:\n- What is one tiny adjustment you can make today?:`
    },
    {
      id: "pressure",
      title: "Peer Pressure",
      icon: Users,
      prompt: `[Peer Pressure]\n- Who is expressing expectations or comparison (parents, friends, relative)?:\n- What comparison is playing on your mind?:\n- How does this comparison affect your confidence?:`
    },
    {
      id: "focus",
      title: "Lack of Focus",
      icon: Activity,
      prompt: `[Lack of Focus]\n- What is currently distracting you the most?:\n- How long have you been struggling to concentrate today?:\n- What is the environment around you like right now?:`
    }
  ];

  const handleSelectTemplate = (promptText: string, title: string) => {
    setSelectedTemplate(title);
    setEntry(promptText);
  };

  return (
    <>
      <div className="space-y-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink leading-tight">
          Hey {profile?.name || user.given_name || 'there'}, how did today's prep go?
        </h1>
        <p className="text-muted leading-relaxed max-w-md">
          Exam prep is a marathon. Drop your thoughts, stress, or burnout below.
          We'll help you find your footing before the next study session.
        </p>
      </div>

      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
        <span className="text-sm font-semibold text-ink">Choose a journaling template to start:</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
          {templates.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedTemplate === t.title;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTemplate(t.prompt, t.title)}
                className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left group hover:scale-[1.02] active:scale-[0.98] ${
                  isSelected
                    ? "border-accent-calm bg-accent-calm/10 ring-2 ring-accent-calm/20"
                    : "border-muted/10 bg-white hover:border-muted/30"
                }`}
              >
                <Icon className={`h-5 w-5 mb-2 transition-colors ${isSelected ? "text-accent-calm" : "text-muted group-hover:text-ink"}`} />
                <span className="font-semibold text-sm text-ink leading-tight">{t.title}</span>
              </button>
            );
          })}
        </div>

        <label htmlFor="journal" className="sr-only">Daily Debrief Entry</label>
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-accent-calm/20 to-accent-warm/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"></div>
          <textarea
            id="journal"
            value={entry}
            onChange={(e) => {
              setEntry(e.target.value);
              if (!e.target.value.trim()) {
                setSelectedTemplate(null);
              }
            }}
            disabled={loading}
            placeholder="I'm feeling overwhelmed after today's mock test..."
            className="relative z-10 min-h-[220px] w-full resize-y rounded-2xl border-2 border-transparent bg-white p-6 text-lg text-ink shadow-sm placeholder:text-muted/50 focus:border-accent-calm focus:outline-none focus:ring-4 focus:ring-accent-calm/10 transition-all disabled:opacity-50"
          />
        </div>

        <MusicLinkCard />

        {loading ? (
          <LoadingDots label="Reflecting on your entry..." />
        ) : (
          <div className="flex flex-wrap gap-3 items-center mt-2">
            <button
              onClick={() => run({ journalEntry: entry, template: selectedTemplate || undefined })}
              disabled={!entry.trim()}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-8 py-3.5 font-semibold transition-all active:scale-[0.98] ${
                entry.trim()
                  ? "border-transparent bg-ink text-paper shadow-md hover:bg-ink/90 hover:shadow-lg"
                  : "border-muted/20 bg-muted/10 text-muted cursor-not-allowed"
              }`}
            >
              <Sparkles className="h-5 w-5" />
              Reflect
            </button>
          </div>
        )}
      </div>

      <div className="mt-10">
        {error && (
          <div className="flex items-start gap-4 rounded-2xl border border-crisis/30 bg-crisis/5 p-6 text-ink shadow-sm animate-in fade-in" role="alert">
            <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-crisis" />
            <span className="leading-relaxed text-lg">{error}</span>
          </div>
        )}

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out mt-4" aria-live="polite">
            {result.is_crisis ? (
              /* --- CRISIS SUPPORT UI --- */
              <div className="space-y-6 rounded-[2rem] border-2 border-crisis bg-white p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-crisis"></div>
                <div className="flex items-center gap-4 text-crisis mb-4">
                  <AlertCircle className="h-8 w-8" />
                  <h2 className="font-display text-3xl font-bold tracking-tight">You don't have to carry this alone.</h2>
                </div>
                <p className="text-ink text-xl leading-relaxed font-medium">
                  It sounds like you are going through an incredibly difficult time right now.
                  Please reach out to someone who can support you immediately.
                </p>
                <div className="bg-crisis/5 rounded-2xl p-6 mt-6 space-y-6 border border-crisis/10">
                  <div className="flex items-center gap-5 p-2">
                    <div className="bg-crisis/10 p-4 rounded-full text-crisis">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink text-lg">KIRAN Mental Health Helpline</p>
                      <p className="font-display text-3xl font-bold text-crisis tracking-wider my-1">1800-599-0019</p>
                      <p className="text-sm font-medium text-muted">24/7 Toll-Free (India)</p>
                    </div>
                  </div>
                  <div className="h-px bg-crisis/10 w-full"></div>
                  <div className="flex items-center gap-5 p-2">
                    <div className="bg-crisis/10 p-4 rounded-full text-crisis">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink text-lg">AASRA Helpline</p>
                      <p className="font-display text-3xl font-bold text-crisis tracking-wider my-1">9820466726</p>
                      <p className="text-sm font-medium text-muted">24/7 Support</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={startNewEntry}
                  className="text-sm font-semibold text-muted hover:text-ink transition-colors"
                >
                  Return to journal
                </button>
              </div>
            ) : (
              /* --- REFLECTION RESULT UI --- */
              <div className="space-y-8 rounded-[2rem] border border-muted/10 bg-white p-8 md:p-10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-calm to-accent-warm"></div>

                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted/70 bg-paper px-3 py-1 rounded-full">
                    {source === "mock" ? "Guided reflection" : "AI reflection"}
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-muted mb-4 uppercase tracking-widest">
                        <Smile className="h-4 w-4" /> Emotional Tone
                      </h3>
                      <div className="inline-flex items-center rounded-full bg-accent-calm/15 px-6 py-3 text-ink font-medium capitalize border border-accent-calm/30">
                        {result.emotional_tone}
                      </div>
                    </div>

                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-muted mb-4 uppercase tracking-widest">
                        <Activity className="h-4 w-4" /> Resilience Rating
                      </h3>
                      <div className="inline-flex items-center rounded-full bg-accent-calm/15 px-6 py-3 text-ink font-bold border border-accent-calm/30">
                        Resilience: {result.resilience_score}/10
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-muted/10 w-full"></div>

                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-muted mb-4 uppercase tracking-widest">
                      <Activity className="h-4 w-4" /> Detected Stressors
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.detected_stressors.length > 0 ? (
                        result.detected_stressors.map((stressor, idx) => (
                          <span key={idx} className="inline-flex items-center rounded-full bg-paper px-4 py-1.5 text-sm font-medium text-ink border border-muted/10 shadow-sm transition-transform hover:scale-105">
                            {stressor}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted italic text-sm">None explicitly detected.</span>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-muted/10 w-full"></div>

                  <div className="bg-gradient-to-br from-accent-calm/10 to-transparent rounded-2xl p-6 md:p-8 border border-accent-calm/20 relative overflow-hidden">
                    <div className="flex items-start gap-4">
                      <div className="bg-white/70 p-3 rounded-full text-accent-calm shadow-inner shrink-0">
                        <Wind className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="flex items-center gap-2 font-display text-2xl font-bold text-ink mb-3">
                          <BookOpen className="h-5 w-5 text-accent-calm" /> Grounding Strategy
                        </h3>
                        <p className="text-ink/90 text-lg leading-relaxed">
                          {result.strategy}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <MusicLinkCard />

                <button
                  onClick={startNewEntry}
                  className="rounded-xl border border-muted/20 bg-white px-5 py-3 font-medium text-muted transition-all hover:bg-paper hover:text-ink hover:border-muted/40"
                >
                  New Entry
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function TrendsView({
  streak,
  weekCounts,
  history,
}: {
  streak: number;
  weekCounts: { label: string; count: number }[];
  history: JournalRecord[];
}) {
  const resilienceData = [...history]
    .reverse()
    .map((record) => {
      const dateObj = new Date(record.createdAt);
      const dateStr = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const timeStr = dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      return {
        label: `${dateStr} ${timeStr}`,
        date: dateStr,
        time: timeStr,
        score: record.result.resilience_score ?? 6,
        snippet: record.journalEntry.length > 35 ? `${record.journalEntry.slice(0, 35)}...` : record.journalEntry
      };
    });
  const averageResilience = history.length
    ? Math.round(history.reduce((sum, record) => sum + (record.result.resilience_score ?? 6), 0) / history.length)
    : 0;
  const stressorCounts = history.reduce<Record<string, number>>((acc, record) => {
    record.result.detected_stressors.forEach((stressor) => {
      const key = stressor.trim().toLowerCase();
      if (key) acc[key] = (acc[key] || 0) + 1;
    });
    return acc;
  }, {});
  const topStressors = Object.entries(stressorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { date: string; time: string; score: number; snippet: string } }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-muted/20 bg-white p-3 shadow-md text-xs space-y-1">
          <p className="font-semibold text-ink">{data.date} at {data.time}</p>
          <p className="text-accent-calm font-bold">Resilience: {data.score}/10</p>
          <p className="text-muted italic">"{data.snippet}"</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-ink">Trends</h1>
        <p className="text-muted leading-relaxed max-w-md">
          A look at your reflection habit, built from entries saved on this device.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-muted/10 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-display text-4xl font-bold text-ink leading-none">{streak}</p>
            <p className="text-sm text-muted mt-1 font-medium">Day streak</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-accent-warm/15 text-tertiary flex items-center justify-center">
            <Flame className="h-6 w-6 text-accent-warm" />
          </div>
        </div>
        <div className="rounded-2xl border border-muted/10 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-display text-4xl font-bold text-ink leading-none">{history.length}</p>
            <p className="text-sm text-muted mt-1 font-medium">Total reflections</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-accent-calm/15 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-accent-calm" />
          </div>
        </div>
        <div className="rounded-2xl border border-muted/10 bg-white p-6 shadow-sm flex items-center justify-between sm:col-span-2">
          <div>
            <p className="font-display text-4xl font-bold text-ink leading-none">{averageResilience || "Start"}</p>
            <p className="text-sm text-muted mt-1 font-medium">
              {averageResilience ? "Average resilience rating" : "One entry turns this into your pattern map"}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-accent-calm/15 flex items-center justify-center">
            <LineChart className="h-6 w-6 text-accent-calm" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-muted/10 bg-white p-6 shadow-sm relative">
        <p className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Resilience Trend</p>
        {resilienceData.length === 0 ? (
          <div className="grid min-h-48 place-items-center rounded-xl bg-paper/70 p-6 text-center">
            <div>
              <TimerReset className="mx-auto mb-3 h-8 w-8 text-accent-calm" />
              <p className="font-semibold text-ink">Your first trend starts with one honest check-in.</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">After each reflection, Pace plots whether your stress is cooling, holding, or building.</p>
            </div>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resilienceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="resilienceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8CA5A5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8CA5A5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(142,152,168,0.15)" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8E98A8", fontSize: 11, fontWeight: 500 }}
                />
                <YAxis
                  domain={[0, 10]}
                  tickCount={6}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8E98A8", fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#8CA5A5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#resilienceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-muted/10 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Pressure map</p>
        {topStressors.length === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {["Mock scores", "Unfinished syllabus", "Family expectations", "Sleep debt"].map((label) => (
              <div key={label} className="rounded-xl border border-dashed border-muted/20 bg-paper/60 p-4">
                <p className="text-sm font-semibold text-ink">{label}</p>
                <p className="mt-1 text-xs leading-5 text-muted">Pace will replace this with your own recurring stressors.</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topStressors.map(([stressor, count]) => (
              <span key={stressor} className="rounded-full border border-accent-calm/20 bg-accent-calm/10 px-4 py-2 text-sm font-semibold capitalize text-ink">
                {stressor} <span className="text-muted">x{count}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-muted/10 bg-white p-6 shadow-sm relative">
        <p className="text-sm font-bold uppercase tracking-widest text-muted mb-4">This Week</p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekCounts} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8E98A8", fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(140,165,165,0.08)" }}
                contentStyle={{ borderRadius: 12, border: "1px solid rgba(142,152,168,0.2)", fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#8CA5A5" maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {weekCounts.every((d) => d.count === 0) && (
          <p className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-sm text-muted/70 italic pointer-events-none">
            No reflections logged yet this week.
          </p>
        )}
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Recent Entries</p>
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-muted/30 bg-white/60 p-10 text-center">
            <p className="text-muted leading-relaxed">
              Your trends will appear here once you save your first reflection.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 8).map((record) => (
              <div key={record.id} className="flex items-start gap-4 rounded-2xl border border-muted/10 bg-white p-5 shadow-sm">
                <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${toneColorClass(record.result.emotional_tone)}`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink capitalize">{record.result.emotional_tone}</p>
                      <span className="text-xs font-semibold text-accent-calm bg-accent-calm/10 px-2 py-0.5 rounded-full">
                        Resilience: {record.result.resilience_score ?? 6}/10
                      </span>
                    </div>
                    <span className="text-xs text-muted shrink-0">
                      {new Date(record.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-1 line-clamp-2">{record.journalEntry}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResourcesView() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-ink">Resources</h1>
        <p className="text-muted leading-relaxed max-w-md">
          Grounding tools and support, whenever the marathon gets heavy.
        </p>
      </div>

      <div className="rounded-2xl border border-accent-calm/20 bg-gradient-to-br from-accent-calm/10 to-transparent p-6 md:p-8 shadow-sm">
        <h2 className="flex items-center gap-3 font-display text-xl font-bold text-ink mb-1">
          <Wind className="h-5 w-5 text-accent-calm" /> Box Breathing
        </h2>
        <p className="text-muted text-sm mb-2">Inhale, hold, exhale, hold, four seconds each. Repeat a few rounds to lower your heart rate before you go back to studying.</p>
        <BreathingTimer />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TipCard icon={Coffee} title="Take a real break" body="Step away from screens for 10 minutes. Stretch, get water, or step outside." />
        <TipCard icon={Moon} title="Protect your sleep" body="Cramming past midnight rarely beats a rested brain. Set a wind-down alarm." />
        <TipCard icon={Users} title="Talk to someone" body="A friend, parent, or teacher can carry some of the weight. You don't have to do this solo." />
        <TipCard icon={Activity} title="Move your body" body="Even a five minute walk resets a racing mind better than another revision pass." />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-bold uppercase tracking-widest text-muted">Low-pressure background sound</p>
        <MusicLinkCard />
      </div>

      <div className="rounded-2xl border border-crisis/20 bg-crisis/5 p-6 md:p-8">
        <h2 className="flex items-center gap-3 font-display text-xl font-bold text-ink mb-4">
          <Phone className="h-5 w-5 text-crisis" /> Crisis Support Lines
        </h2>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-ink">KIRAN Mental Health Helpline</p>
            <p className="font-display text-2xl font-bold text-crisis tracking-wider">1800-599-0019</p>
            <p className="text-sm text-muted">24/7 Toll-Free (India)</p>
          </div>
          <div className="h-px bg-crisis/10 w-full"></div>
          <div>
            <p className="font-semibold text-ink">AASRA Helpline</p>
            <p className="font-display text-2xl font-bold text-crisis tracking-wider">9820466726</p>
            <p className="text-sm text-muted">24/7 Support</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TipCard({ icon: Icon, title, body }: { icon: typeof Coffee; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-muted/10 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-9 w-9 rounded-full bg-accent-warm/15 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-accent-warm" />
        </div>
        <p className="font-semibold text-ink">{title}</p>
      </div>
      <p className="text-sm text-muted leading-relaxed">{body}</p>
    </div>
  );
}

function SettingsDrawer({
  user,
  profile,
  onSaveProfile,
  historyCount,
  onClose,
  onClearHistory,
  onLogout,
}: {
  user: GoogleUser;
  profile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
  historyCount: number;
  onClose: () => void;
  onClearHistory: () => void;
  onLogout: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.name || user.name || user.given_name || "");
  const [editAgeStr, setEditAgeStr] = useState(profile?.age ? String(profile.age) : "");
  const [editExam, setEditExam] = useState(profile?.targetExam || "JEE");
  const [editAvatar, setEditAvatar] = useState(profile?.avatar || user.picture || "☀️");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const age = parseInt(editAgeStr, 10);
    if (!editName.trim()) return;
    if (isNaN(age) || age <= 0) return;
    onSaveProfile({
      name: editName.trim(),
      age,
      targetExam: editExam,
      avatar: editAvatar,
    });
    setIsEditing(false);
  };

  const avatars = [
    ...(user.picture ? [{ label: "Google Photo", value: user.picture, isImg: true }] : []),
    { label: "Sunny", value: "☀️", isImg: false },
    { label: "Calm", value: "🍃", isImg: false },
    { label: "Focused", value: "🎯", isImg: false },
    { label: "Cozy", value: "☕", isImg: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div className="relative z-10 h-full w-full max-w-sm bg-paper shadow-2xl p-6 flex flex-col gap-6 animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-ink">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-full p-2 text-muted hover:bg-muted/10 hover:text-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-muted/10 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-ink text-sm uppercase tracking-wider">Edit Profile</h3>
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-xs font-bold text-muted uppercase">Preferred Name</label>
              <input
                id="edit-name"
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl border border-muted/20 bg-white px-3 py-2 text-sm text-ink focus:border-accent-calm focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="edit-age" className="text-xs font-bold text-muted uppercase">Age</label>
                <input
                  id="edit-age"
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={editAgeStr}
                  onChange={(e) => setEditAgeStr(e.target.value)}
                  className="w-full rounded-xl border border-muted/20 bg-white px-3 py-2 text-sm text-ink focus:border-accent-calm focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-exam" className="text-xs font-bold text-muted uppercase">Target Exam</label>
                <select
                  id="edit-exam"
                  value={editExam}
                  onChange={(e) => setEditExam(e.target.value)}
                  className="w-full rounded-xl border border-muted/20 bg-white px-3 py-2 text-sm text-ink focus:border-accent-calm focus:outline-none appearance-none"
                >
                  <option value="NEET">NEET</option>
                  <option value="JEE">JEE</option>
                  <option value="CUET">CUET</option>
                  <option value="CAT">CAT</option>
                  <option value="GATE">GATE</option>
                  <option value="UPSC">UPSC</option>
                  <option value="SSC">SSC</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted uppercase block">Avatar</span>
              <div className="flex flex-wrap gap-2">
                {avatars.map((av) => (
                  <button
                    key={av.value}
                    type="button"
                    onClick={() => setEditAvatar(av.value)}
                    className={`h-9 w-9 rounded-full overflow-hidden flex items-center justify-center border-2 transition-all ${
                      editAvatar === av.value
                        ? "border-ink scale-105 bg-white"
                        : "border-muted/10 bg-white/40 hover:border-muted/30"
                    }`}
                  >
                    {av.isImg ? (
                      <img src={av.value} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-base">{av.value}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-ink text-paper text-sm font-semibold py-2 shadow-sm hover:bg-ink/90"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 rounded-xl border border-muted/20 text-muted text-sm font-semibold py-2 hover:bg-paper"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-4 rounded-2xl border border-muted/10 bg-white p-5 shadow-sm relative group">
            {profile ? (
              <div className="h-14 w-14 rounded-full overflow-hidden flex items-center justify-center border border-muted/10 bg-white shadow-sm text-3xl">
                {profile.avatar.startsWith("http") ? (
                  <img src={profile.avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  profile.avatar
                )}
              </div>
            ) : user.picture ? (
              <img src={user.picture} alt="" className="h-14 w-14 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-ink flex items-center justify-center text-paper font-display text-xl font-bold">
                {(user.given_name || user.name || user.email)[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-ink">{profile?.name || user.name || user.given_name}</p>
              {profile && (
                <p className="text-xs font-semibold text-accent-calm bg-accent-calm/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Age {profile.age} • {profile.targetExam}
                </p>
              )}
              <p className="text-xs text-muted mt-1 break-all">{user.email}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-3 right-3 text-xs font-bold text-accent-calm hover:underline"
            >
              Edit
            </button>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Your Data</p>
          <div className="rounded-2xl border border-muted/10 bg-white p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-medium text-ink">{historyCount} saved reflections</p>
              <p className="text-sm text-muted">Stored only on this device.</p>
            </div>
            <button
              onClick={onClearHistory}
              disabled={historyCount === 0}
              aria-label="Clear saved reflections"
              className="rounded-full p-2.5 text-muted transition-colors hover:bg-crisis/10 hover:text-crisis disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1"></div>

        <button
          onClick={onLogout}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-muted/20 bg-white px-5 py-3.5 font-semibold text-ink transition-all hover:bg-paper"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </div>
  );
}

function OnboardingView({ user, onSave }: { user: GoogleUser; onSave: (profile: UserProfile) => void }) {
  const [name, setName] = useState(user.name || user.given_name || "");
  const [ageStr, setAgeStr] = useState("");
  const [targetExam, setTargetExam] = useState("JEE");
  const [avatar, setAvatar] = useState(user.picture || "☀️");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const age = parseInt(ageStr, 10);
    if (!name.trim()) return;
    if (isNaN(age) || age <= 0) return;
    onSave({
      name: name.trim(),
      age,
      targetExam,
      avatar,
    });
  };

  const avatars = [
    ...(user.picture ? [{ label: "Google Photo", value: user.picture, isImg: true }] : []),
    { label: "Sunny", value: "☀️", isImg: false },
    { label: "Calm", value: "🍃", isImg: false },
    { label: "Focused", value: "🎯", isImg: false },
    { label: "Cozy", value: "☕", isImg: false },
  ];

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-paper px-6 font-body overflow-hidden">
      <ShaderBackground className="absolute inset-0 -z-10 h-full w-full opacity-50" />
      <div className="absolute inset-0 -z-10 bg-paper/40 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <PaceLogo />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Set up your profile</h1>
            <p className="text-muted text-sm mt-1">Let's customize your companion for your exam marathon.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/40 bg-white/60 p-8 shadow-xl backdrop-blur-xl space-y-6">
          <div className="space-y-2">
            <label htmlFor="onboard-name" className="text-sm font-semibold text-ink">Preferred Name</label>
            <input
              id="onboard-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-muted/20 bg-white px-4 py-3 text-ink focus:border-accent-calm focus:outline-none focus:ring-4 focus:ring-accent-calm/10 transition-all"
              placeholder="Your name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="onboard-age" className="text-sm font-semibold text-ink">Age</label>
              <input
                id="onboard-age"
                type="number"
                required
                min="1"
                max="120"
                value={ageStr}
                onChange={(e) => setAgeStr(e.target.value)}
                className="w-full rounded-xl border border-muted/20 bg-white px-4 py-3 text-ink focus:border-accent-calm focus:outline-none focus:ring-4 focus:ring-accent-calm/10 transition-all"
                placeholder="Age"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="onboard-exam" className="text-sm font-semibold text-ink">Target Exam</label>
              <select
                id="onboard-exam"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full rounded-xl border border-muted/20 bg-white px-4 py-3 text-ink focus:border-accent-calm focus:outline-none focus:ring-4 focus:ring-accent-calm/10 transition-all appearance-none"
              >
                <option value="NEET">NEET</option>
                <option value="JEE">JEE</option>
                <option value="CUET">CUET</option>
                <option value="CAT">CAT</option>
                <option value="GATE">GATE</option>
                <option value="UPSC">UPSC</option>
                <option value="SSC">SSC</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-semibold text-ink block">Choose Avatar</span>
            <div className="flex flex-wrap gap-3">
              {avatars.map((av) => (
                <button
                  key={av.value}
                  type="button"
                  onClick={() => setAvatar(av.value)}
                  className={`h-12 w-12 rounded-full overflow-hidden flex items-center justify-center border-2 transition-all ${
                    avatar === av.value
                      ? "border-ink scale-110 shadow-md bg-white"
                      : "border-muted/10 bg-white/40 hover:border-muted/30"
                  }`}
                >
                  {av.isImg ? (
                    <img src={av.value} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-xl">{av.value}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-ink py-3.5 font-semibold text-paper shadow-md hover:bg-ink/90 transition-all active:scale-[0.98] mt-2"
          >
            Save and Continue
          </button>
        </form>
      </div>
    </main>
  );
}
