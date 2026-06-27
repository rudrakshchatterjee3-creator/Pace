import { useState } from "react";
import { Sparkles, Loader2, AlertCircle, Phone, BookOpen, Activity, LogOut } from "lucide-react";
import { callAgent } from "./lib/geminiClient";
import { GoogleLogin, googleLogout, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

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
  
  // Auth state
  const [user, setUser] = useState<any>(null);

  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const decoded = jwtDecode(credentialResponse.credential);
      setUser(decoded);
    }
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    setResult(null);
    setEntry("");
  };

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

  // --- LANDING PAGE ---
  if (!user) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-paper px-6 font-body overflow-hidden">
        {/* Background Shader / Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-calm/20 via-paper to-paper pointer-events-none"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent-warm/20 rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none animate-pulse"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-accent-calm/20 rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-6">
            <div className="mx-auto h-24 w-24 bg-ink rounded-full flex items-center justify-center shadow-2xl ring-8 ring-ink/5">
              <Sparkles className="h-12 w-12 text-paper" />
            </div>
            <div>
              <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-ink mb-4">
                Welcome to Pace
              </h1>
              <p className="text-xl text-ink/70 font-medium max-w-sm mx-auto leading-relaxed">
                Your digital companion for the exam marathon.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/40 bg-white/60 p-10 shadow-xl backdrop-blur-xl transition-all hover:bg-white/70">
            <h2 className="font-display text-2xl font-bold text-ink mb-8">Start Your Journey</h2>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => console.log('Login Failed')}
                useOneTap
                theme="filled_black"
                shape="pill"
                size="large"
                text="continue_with"
              />
            </div>
            <p className="text-sm text-muted mt-8 font-medium">
              Pace is a safe space. Your entries are processed securely and never shared.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // --- DAILY DEBRIEF UI (LOGGED IN) ---
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-8 md:py-12 font-body relative">
      {/* Signature Element: Breath Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-accent-calm/20 overflow-hidden">
        <div className="h-full bg-accent-calm animate-breath rounded-r-full"></div>
      </div>

      <header className="flex items-start justify-between mb-12 mt-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-3">
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
            Pace
          </h1>
          <p className="text-xl text-ink/80 font-medium">
            Hey {user.given_name || 'there'}, how did today's prep go?
          </p>
          <p className="text-muted leading-relaxed max-w-md">
            Exam prep is a marathon. Drop your thoughts, stress, or burnout below. 
            We'll help you find your footing before the next study session.
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2.5 text-muted hover:bg-muted/10 rounded-full transition-colors group"
          aria-label="Log out"
        >
          <LogOut className="h-5 w-5 group-hover:text-ink transition-colors" />
        </button>
      </header>

      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
        <label htmlFor="journal" className="sr-only">Daily Debrief Entry</label>
        <textarea
          id="journal"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="I'm feeling overwhelmed after today's mock test..."
          className="min-h-[180px] w-full resize-y rounded-2xl border-2 border-transparent bg-white p-6 text-lg text-ink shadow-sm placeholder:text-muted/50 focus:border-accent-calm focus:outline-none focus:ring-4 focus:ring-accent-calm/10 transition-all"
        />
        
        <div className="flex flex-wrap gap-3 items-center mt-2">
          <button
            onClick={() => run({ journalEntry: entry })}
            disabled={loading || !entry.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-8 py-3.5 font-semibold text-paper disabled:opacity-50 transition-all hover:bg-ink/90 hover:shadow-lg active:scale-[0.98] shadow-md"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            Reflect
          </button>
          <div className="flex-1"></div>
          <button
            onClick={() => run({ journalEntry: entry || "sample" })}
            className="rounded-xl border border-muted/20 bg-white px-5 py-3 font-medium text-muted transition-all hover:bg-paper hover:text-ink hover:border-muted/40"
          >
            Load Demo
          </button>
          <button
            onClick={() => run({ journalEntry: "I can't take this anymore, I want to end it" }, true)}
            className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-medium text-red-700 transition-all hover:bg-red-100 hover:border-red-300"
          >
            Test Crisis
          </button>
        </div>
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
              </div>
            ) : (
              /* --- REFLECTION RESULT UI --- */
              <div className="space-y-8 rounded-[2rem] border border-muted/10 bg-white p-8 md:p-10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-calm to-accent-warm"></div>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted/70 bg-paper px-3 py-1 rounded-full">
                    {source === "mock" ? "Demo Analysis" : "AI Reflection"}
                  </p>
                </div>

                <div className="space-y-8">
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

                  <div>
                     <h3 className="text-sm font-bold text-muted mb-3 uppercase tracking-widest">
                      Emotional Tone
                    </h3>
                    <p className="text-ink text-xl font-medium capitalize">{result.emotional_tone}</p>
                  </div>

                  <div className="h-px bg-muted/10 w-full"></div>

                  <div className="bg-gradient-to-br from-accent-calm/10 to-transparent rounded-2xl p-6 md:p-8 border border-accent-calm/20">
                    <h3 className="flex items-center gap-3 font-display text-2xl font-bold text-ink mb-4">
                      <BookOpen className="h-6 w-6 text-accent-calm" /> Grounding Strategy
                    </h3>
                    <p className="text-ink/90 text-lg leading-relaxed">
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
