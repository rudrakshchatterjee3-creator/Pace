// server/index.ts
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8081;
const NIM_MODEL = "meta/llama-3.1-70b-instruct";

const apiKey = process.env.NVIDIA_API_KEY;
if (!apiKey) {
  console.warn("[server] NVIDIA_API_KEY not set. /api/agent will return 503.");
}

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/healthz", (_req, res) => res.json({ ok: true }));

app.post("/api/agent", async (req, res) => {
  if (!apiKey) return res.status(503).json({ error: "Model unavailable: NVIDIA_API_KEY missing" });

  const { task, input, schemaHint, system } = req.body ?? {};
  if (!task || !schemaHint) return res.status(400).json({ error: "task and schemaHint are required" });

  const userPrompt = [
    `TASK: ${task}`,
    `Return ONLY valid JSON matching this shape: ${schemaHint}`,
    `INPUT:\n${typeof input === "string" ? input : JSON.stringify(input, null, 2)}`,
  ].join("\n\n");

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        model: NIM_MODEL,
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NVIDIA NIM API error: ${response.status} - ${errText}`);
    }

    const json = await response.json();
    let text = json.choices[0]?.message?.content ?? "";
    text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

    const data = JSON.parse(text); 
    return res.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown model error";
    return res.status(502).json({ error: message });
  }
});

const dist = path.resolve(__dirname, "../dist");
app.use(express.static(dist));
app.get(/.*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));

app.listen(PORT, () => console.log(`[server] listening on :${PORT} (model ${NIM_MODEL})`));
