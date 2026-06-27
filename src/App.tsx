import { useState } from "react";
import { Sparkles, Loader2, AlertCircle, Phone, BookOpen, Activity } from "lucide-react";
import { callAgent } from "./lib/geminiClient";

interface PaceIn {
  journalEntry: string;
}

interface PaceOut {
  is_crisis: boolean;
  detected_stressors: string[];
  emotional_tone: string;
  strategy: string;
}

const DEMO_FALLBACK: PaceOut = {
  is_crisis: false,
  detected_stressors: ["mock test scores", "sleep deprivation"],
  emotional_tone: "anxious but trying to stay focused",
  strategy: "Step away from your desk for 5 minutes. Do a quick 4-7-8 breathing exercise to reset your nervous system before looking at any more test scores.",
};

const CRISIS_FALLBACK: PaceOut = {
  is_crisis: true,
  detected_stressors: [],
  emotional_tone: "overwhelmed",
  strategy: "",
};

export default function App() {
  const [entry, setEntry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaceOut | null>(null);
  const [source, setSource] = useState<"live" | "mock" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(input: PaceIn, forceCrisisDemo = false) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data, source } = await callAgent<PaceIn, PaceOut>(
        {
          task: "analyze-journal",
          input,
          schemaHint: "{ is_crisis: boolean, detected_stressors: string[], emotional_tone: string, strategy: string }",
          system: "You are a supportive digital companion for students taking high-stakes exams. Analyze the journal entry. If the user expresses self-harm, suicidal ideation, or crisis-level distress, set is_crisis to true. Otherwise, identify their stressors, determine their emotional tone, and provide ONE short, actionable grounding strategy."
        },
        { mock: () => forceCrisisDemo ? CRISIS_FALLBACK : DEMO_FALLBACK }
      );
      
      // Safety override: if the entry itself contains obvious test keywords for crisis,
      // force is_crisis in case the model failed to flag it (belt and suspenders for the hackathon).
      const text = input.journalEntry.toLowerCase();
      if (text.includes("want to end it") || text.includes("hurt myself")) {
        data.is_crisis = true;
      }
      
      setResult(data);
      setSource(source);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-12 font-body">
      {/* Signature Element: Breath Bar */}
      <div className="h-1 w-full rounded-full bg-accent-calm/30 mb-12 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 bg-accent-calm animate-breath rounded-full w-full"></div>
      </div>

      <header className="space-y-3 mb-10">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
          Pace
        </h1>
        <p className="text-xl text-ink/80 font-medium">
          How did today's prep go? Unpack it here.
        </p>
        <p className="text-muted leading-relaxed">
          Exam prep is a marathon. Drop your thoughts, stress, or burnout below. 
          We'll help you find your footing before the next study session.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <label htmlFor="journal" className="sr-only">Your journal entry</label>
        <textarea
          id="journal"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="I'm feeling overwhelmed after today's mock test..."
          className="min-h-[160px] w-full resize-y rounded-xl border border-muted/30 bg-white p-5 text-ink outline-none focus-visible:border-accent-calm focus-visible:ring-2 focus-visible:ring-accent-calm/20 transition-all shadow-sm"
        />
        
        <div className="flex flex-wrap gap-3 items-center mt-2">
          <button
            onClick={() => run({ journalEntry: entry })}
            disabled={loading || !entry.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-6 py-3 font-medium text-paper disabled:opacity-50 transition-colors hover:bg-ink/90 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Reflect
          </button>
          <div className="flex-1"></div>
          <button
            onClick={() => run({ journalEntry: entry || "sample" })}
            className="rounded-lg border border-muted/30 px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-muted/5 hover:text-ink"
          >
            Load Demo
          </button>
          <button
            onClick={() => run({ journalEntry: "I can't take this anymore, I want to end it" }, true)}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Test Crisis
          </button>
        </div>
      </div>

      <div className="mt-8">
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-crisis/30 bg-crisis/10 p-5 text-sm text-ink" role="alert">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-crisis" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out mt-4" aria-live="polite">
            
            {result.is_crisis ? (
              // CRISIS OVERRIDE PATH
              <div className="space-y-4 rounded-2xl border-2 border-crisis bg-white p-6 shadow-md">
                <div className="flex items-center gap-3 text-crisis mb-2">
                  <AlertCircle className="h-6 w-6" />
                  <h2 className="font-display text-2xl font-bold tracking-tight">You don't have to carry this alone.</h2>
                </div>
                <p className="text-ink/90 text-lg leading-relaxed">
                  It sounds like you are going through an incredibly difficult time right now. 
                  Please reach out to someone who can support you.
                </p>
                <div className="bg-paper rounded-xl p-5 mt-4 space-y-4 border border-muted/20">
                  <div className="flex items-start gap-4">
                    <div className="bg-crisis/10 p-3 rounded-full text-crisis mt-1">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink text-lg">KIRAN Mental Health Helpline</p>
                      <p className="text-2xl font-display font-bold text-crisis tracking-wider my-1">1800-599-0019</p>
                      <p className="text-sm text-muted">24/7 Toll-Free (India)</p>
                    </div>
                  </div>
                  <div className="h-px bg-muted/20 w-full"></div>
                  <div className="flex items-start gap-4">
                    <div className="bg-crisis/10 p-3 rounded-full text-crisis mt-1">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink text-lg">AASRA Helpline</p>
                      <p className="text-2xl font-display font-bold text-crisis tracking-wider my-1">9820466726</p>
                      <p className="text-sm text-muted">24/7 support</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // STANDARD RESULT PATH
              <div className="space-y-6 rounded-2xl border border-muted/20 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {source === "mock" ? "Demo Data" : "Analysis"}
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-muted mb-3 uppercase tracking-wider">
                      <Activity className="h-4 w-4" /> Detected Stressors
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.detected_stressors.length > 0 ? (
                        result.detected_stressors.map((stressor, idx) => (
                          <span key={idx} className="inline-flex items-center rounded-full bg-paper px-3 py-1 text-sm font-medium text-ink border border-muted/10">
                            {stressor}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted italic text-sm">None explicitly detected.</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="h-px bg-muted/10 w-full"></div>

                  <div>
                     <h3 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wider">
                      Emotional Tone
                    </h3>
                    <p className="text-ink font-medium capitalize">{result.emotional_tone}</p>
                  </div>

                  <div className="h-px bg-muted/10 w-full"></div>

                  <div className="bg-accent-calm/10 rounded-xl p-5 border border-accent-calm/20">
                    <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink mb-2">
                      <BookOpen className="h-5 w-5 text-accent-calm" /> Grounding Strategy
                    </h3>
                    <p className="text-ink/90 leading-relaxed">
                      {result.strategy}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
