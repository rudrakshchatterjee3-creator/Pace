// server/index.ts
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

try {
  const envFile = fs.readFileSync(path.join(process.cwd(), ".env"), "utf8");
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
} catch (e) {}

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

function getExamDescription(exam: string): string {
  const descriptions: Record<string, string> = {
    NEET: "National Eligibility cum Entrance Test. Focused on medical admissions, intensive biology memorization, and competitive physics/chemistry.",
    JEE: "Joint Entrance Examination. Focused on engineering admissions, rigorous physics/maths problem solving under extreme speed and accuracy.",
    CUET: "Common University Entrance Test. Undergraduate admissions across multiple disciplines with high student competition.",
    CAT: "Common Admission Test. Business school admissions, testing analytical, reading speed, and quantitative reasoning.",
    GATE: "Graduate Aptitude Test in Engineering. Postgraduate entrance testing deep engineering and conceptual concepts.",
    UPSC: "Union Public Service Commission. Civil services exam, vast syllabus, multiple stages, and extreme mental endurance requirements.",
    SSC: "Staff Selection Commission. Government recruitment exams testing numerical aptitude and general awareness under tight time constraints.",
    Others: "General academic exam preparation, balancing syllabus load and exam stress."
  };
  return descriptions[exam] || "academic exam preparation.";
}

app.post("/api/agent", async (req, res) => {
  if (!apiKey) return res.status(503).json({ error: "Model unavailable: NVIDIA_API_KEY missing" });

  const { task, input, schemaHint, system, profile } = req.body ?? {};
  if (!task || !schemaHint) return res.status(400).json({ error: "task and schemaHint are required" });

  let finalSchemaHint = schemaHint;
  if (task === "analyze-journal" && !finalSchemaHint.includes("resilience_score")) {
    finalSchemaHint = "{ is_crisis: boolean, detected_stressors: string[], emotional_tone: string, strategy: string, resilience_score: number }";
  }

  const userPrompt = [
    `TASK: ${task}`,
    `Return ONLY valid JSON matching this shape: ${finalSchemaHint}`,
    `INPUT:\n${typeof input === "string" ? input : JSON.stringify(input, null, 2)}`,
  ].join("\n\n");

  let systemInstruction = system || "You are a supportive digital companion for students taking high-stakes exams. Analyze the journal entry. If the user expresses self-harm, suicidal ideation, or crisis-level distress, set is_crisis to true. Otherwise, identify their stressors, determine their emotional tone, and provide ONE short, actionable grounding strategy.";

  if (task === "analyze-journal") {
    if (systemInstruction.includes("Otherwise, identify their stressors, determine their emotional tone, and provide ONE short, actionable grounding strategy.")) {
      systemInstruction = systemInstruction.replace(
        "Otherwise, identify their stressors, determine their emotional tone, and provide ONE short, actionable grounding strategy.",
        "Otherwise, identify their stressors, determine their emotional tone, rate their resilience on a scale of 1 to 10 based on their coping capability and outlook in the entry, and provide ONE short, actionable grounding strategy."
      );
    } else if (!systemInstruction.includes("resilience")) {
      systemInstruction += " Instruct the model to rate the user's resilience from 1 to 10 based on their coping capability and outlook in the entry, and return this as resilience_score in the JSON.";
    }
    systemInstruction += " If is_crisis is set to true due to distress/self-harm/suicidal ideation, set resilience_score to 1.";
  }

  if (profile) {
    const rawName = typeof profile.name === "string" ? profile.name : "Student";
    const sanitizedName = rawName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 50) || "Student";

    const rawAge = parseInt(profile.age, 10);
    const sanitizedAge = !isNaN(rawAge) && rawAge > 0 && rawAge < 120 ? rawAge : 18;

    const rawExam = profile.targetExam || profile.exam || "Others";
    const allowedExams = ["NEET", "JEE", "CUET", "CAT", "GATE", "UPSC", "SSC", "Others"];
    const sanitizedExam = allowedExams.includes(rawExam) ? rawExam : "Others";

    const examDesc = getExamDescription(sanitizedExam);
    const profileContext = `Student Profile Context:\n- Name: ${sanitizedName}\n- Age: ${sanitizedAge}\n- Target Exam: ${sanitizedExam} (${examDesc})`;
    systemInstruction += `\n\n${profileContext}\n\nYou MUST customize your guidance and grounding strategies to this specific student profile. Address the user by their name. Provide practical, short strategies suited to a student of age ${sanitizedAge} preparing for the ${sanitizedExam} exam.`;
  }

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
          ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
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
    if (task === "analyze-journal" && data) {
      if (typeof data.resilience_score !== "undefined") {
        data.resilience_score = Number(data.resilience_score);
      } else {
        data.resilience_score = data.is_crisis ? 1 : 6;
      }
    }
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
