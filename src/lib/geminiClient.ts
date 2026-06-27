import { UserProfile } from "./history";

export interface AgentRequest<TIn> {
  /** A short id for the task, e.g. "triage", "plan", "extract". */
  task: string;
  /** Structured input the model should act on. */
  input: TIn;
  /**
   * Plain-language description of the JSON shape you want back.
   * Mirror this in your TOut type so the UI is fully typed.
   */
  schemaHint: string;
  /** Optional extra system guidance for this specific call. */
  system?: string;
  /** User profile to customize AI suggestions */
  profile?: UserProfile;
}


export interface AgentOptions<TOut> {
  /** Deterministic fallback so the live demo NEVER shows an error state. */
  mock: () => TOut;
  /** Retries on transient failure (network / 429 / 5xx). Default 2. */
  retries?: number;
  /** Use the heavier model for this call (maps to gemini-3.1-pro: long-context/deep reasoning). */
  heavy?: boolean;
  /** Abort signal for cancel-on-unmount. */
  signal?: AbortSignal;
}

export interface AgentResult<TOut> {
  data: TOut;
  /** "live" = real model output, "mock" = fallback was used. */
  source: "live" | "mock";
  ms: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Call the agent proxy and get back typed, structured data.
 *
 * @example
 * const { data, source } = await callAgent<TriageIn, TriageOut>(
 *   { task: "triage", input: ticket, schemaHint: "{ severity: 'low'|'high', summary: string, steps: string[] }" },
 *   { mock: () => DEMO_TRIAGE }
 * );
 */
export async function callAgent<TIn, TOut>(
  req: AgentRequest<TIn>,
  opts: AgentOptions<TOut>
): Promise<AgentResult<TOut>> {
  const started = performance.now();
  const retries = opts.retries ?? 2;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { profile, ...restReq } = req;
      const bodyPayload = {
        ...restReq,
        profile: profile ? {
          name: profile.name,
          age: profile.age,
          exam: profile.targetExam,
          avatar: profile.avatar,
        } : undefined,
        heavy: !!opts.heavy
      };

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
        signal: opts.signal,
      });

      if (!res.ok) {
        // 429 / 5xx are worth retrying; 4xx (bad request) are not.
        if (res.status >= 500 || res.status === 429) throw new Error(`HTTP ${res.status}`);
        throw new Error(`HTTP ${res.status} (no retry)`);
      }

      const json = (await res.json()) as { data?: unknown; error?: string };
      if (json.error) throw new Error(json.error);

      // Server already validated/parsed JSON, but guard anyway.
      const data = (typeof json.data === "string" ? JSON.parse(json.data) : json.data) as TOut;
      return { data, source: "live", ms: Math.round(performance.now() - started) };
    } catch (err) {
      const isLast = attempt === retries;
      const noRetry = err instanceof Error && err.message.includes("no retry");
      if (isLast || noRetry) break;
      await sleep(400 * 2 ** attempt); // 400ms, 800ms backoff
    }
  }

  // Fallback keeps the demo flawless under rate limits / flaky venue wifi.
  return { data: opts.mock(), source: "mock", ms: Math.round(performance.now() - started) };
}
