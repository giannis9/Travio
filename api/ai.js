export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { prompt, maxTokens = 3000 } = req.body;
    const key = process.env.GROQ_API_KEY;
    if (!key) return res.status(500).json({ error: "GROQ_API_KEY not set in Vercel" });

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are Travio, an AI travel assistant. Always respond with valid JSON only. No markdown, no explanation." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      }),
    });

    const data = await groqRes.json();
    if (!groqRes.ok) throw new Error(data?.error?.message || `Groq error ${groqRes.status}`);
    const text = data.choices?.[0]?.message?.content || "{}";
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message, text: "{}" });
  }
}
