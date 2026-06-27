import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

const PHASES = [
  { label: "Inhale", seconds: 4 },
  { label: "Hold", seconds: 4 },
  { label: "Exhale", seconds: 4 },
  { label: "Hold", seconds: 4 },
] as const;

export default function BreathingTimer() {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(PHASES[0].seconds);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        setPhaseIdx((p) => (p + 1) % PHASES.length);
        return PHASES[(phaseIdx + 1) % PHASES.length].seconds;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, phaseIdx]);

  function reset() {
    setRunning(false);
    setPhaseIdx(0);
    setSecondsLeft(PHASES[0].seconds);
  }

  const phase = PHASES[phaseIdx];
  const scale = phase.label === "Inhale" ? 1.15 : phase.label === "Exhale" ? 0.85 : 1;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="relative flex h-36 w-36 items-center justify-center">
        <div
          className="absolute h-full w-full rounded-full bg-accent-calm/20 transition-transform duration-[4000ms] ease-in-out"
          style={{ transform: `scale(${running ? scale : 1})` }}
        ></div>
        <div className="relative flex flex-col items-center">
          <span className="font-display text-3xl font-bold text-ink">{secondsLeft}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-muted">{phase.label}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setRunning((r) => !r)}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 font-semibold text-paper transition-all hover:bg-ink/90 active:scale-[0.98]"
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={reset}
          aria-label="Reset breathing timer"
          className="rounded-xl border border-muted/20 bg-white p-2.5 text-muted transition-all hover:bg-paper hover:text-ink"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
