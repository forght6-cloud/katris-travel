declare const process: { env: Record<string, string | undefined> };

type AiProvider = {
  name: string;
  key?: string;
  model: string;
  run: (prompt: string, provider: AiProvider) => Promise<any>;
};

function buildPrompt(payload: any) {
  return `
You are Katris Travel AI, a production travel-planning assistant.
Return only valid JSON.

Requirements:
- For every city, include at least 5 hotels and 5 attractions.
- For each day, include 3 to 5 planned items.
- Keep plans practical, calm, premium, and bookable.
- Include flight context when available, but do not invent ticketing guarantees.
- Hotel recommendations can be confirmed on Katris, but final payment may happen through external booking links.

Input state:
${JSON.stringify(payload, null, 2)}

JSON schema:
{
  "title": "string",
  "summary": "string",
  "cities": [
    {
      "city": "string",
      "hotels": [{"name": "string", "style": "string", "reason": "string"}],
      "attractions": [{"name": "string", "category": "string", "reason": "string"}],
      "days": [
        {
          "day": "string",
          "theme": "string",
          "items": [{"time": "string", "title": "string", "detail": "string"}]
        }
      ]
    }
  ],
  "bookingNotes": ["string"]
}`;
}

function buildFallbackPlan(payload: any) {
  const planner = payload?.planner || payload || {};
  const analysis = planner.analysis || payload?.analysis || {};
  const stops = analysis.stops?.length ? analysis.stops : [{ city: planner.to || "Nordic journey", date: planner.date || "" }];
  const cities = stops.map((stop: any, stopIndex: number) => {
    const city = stop.city || "Destination";

    return {
      city,
      hotels: [
        { name: `${city} Central Hotel`, style: "External booking", reason: "Confirm preference in Katris, then open live rates externally." },
        { name: `${city} Boutique Stay`, style: "Boutique", reason: "A smaller property style for local character and calmer pacing." },
        { name: `${city} Garden Residence`, style: "Quiet stay", reason: "Good for recovery time and slower mornings." },
        { name: `${city} Harbour Hotel`, style: "Scenic", reason: "Useful when the trip prioritizes views and low-friction evenings." },
        { name: `${city} Design Suites`, style: "Design", reason: "A polished option for a premium travel mood." },
      ],
      attractions: [
        { name: `${city} Old Quarter`, category: "Culture", reason: "A compact first walk with orientation value." },
        { name: `${city} Waterfront`, category: "Scenery", reason: "Best for soft light, cafes, and low-friction exploration." },
        { name: `${city} Design Museum`, category: "Design", reason: "A strong indoor anchor for weather-proof planning." },
        { name: `${city} Market Hall`, category: "Food", reason: "Useful for local snacks and casual lunches." },
        { name: `${city} Lookout Route`, category: "Landscape", reason: "A scenic way to end the afternoon." },
      ],
      days: [
        {
          day: `Day ${stopIndex * 2 + 1}`,
          theme: `${city} arrival and orientation`,
          items: [
            { time: "Morning", title: "Arrival buffer", detail: "Keep the first block flexible for transport and check-in." },
            { time: "Midday", title: "Neighbourhood lunch", detail: "Choose a nearby local restaurant before heavy sightseeing." },
            { time: "Afternoon", title: `${city} Old Quarter`, detail: "Walk the historic core and identify cafes or galleries for later." },
            { time: "Evening", title: "Hotel shortlist", detail: "Pick one or two hotel candidates before opening external live rates." },
          ],
        },
        {
          day: `Day ${stopIndex * 2 + 2}`,
          theme: `${city} culture and scenery`,
          items: [
            { time: "Morning", title: `${city} Design Museum`, detail: "Start with an indoor cultural anchor." },
            { time: "Midday", title: `${city} Market Hall`, detail: "Build lunch around local vendors and seasonal produce." },
            { time: "Afternoon", title: `${city} Lookout Route`, detail: "Plan a scenic route with photo stops and rest time." },
            { time: "Evening", title: "External booking pass", detail: "Use hotel and transport links for payment confirmation." },
          ],
        },
      ],
    };
  });

  return {
    title: `${cities.map((entry: any) => entry.city).join(" + ")} travel plan`,
    summary: "A structured plan with flight context, hotel shortlists, attractions, and day-by-day pacing.",
    cities,
    bookingNotes: [
      "Flight prices are live only when the HasData provider returns results.",
      "Hotels are shortlisted in Katris and paid through external booking links until a contracted hotel API is approved.",
      "Set OPENROUTER_API_KEY, MISTRAL_API_KEY, GROQ_API_KEY, or a working GEMINI_API_KEY to use a live AI provider.",
    ],
  };
}

function getPreferredProviderName() {
  return (process.env.AI_PROVIDER || "auto").trim().toLowerCase();
}

function getProviders(): AiProvider[] {
  return [
    {
      name: "openrouter",
      key: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || "openrouter/auto",
      run: runOpenRouter,
    },
    {
      name: "mistral",
      key: process.env.MISTRAL_API_KEY,
      model: process.env.MISTRAL_MODEL || "mistral-small-latest",
      run: runMistral,
    },
    {
      name: "groq",
      key: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      run: runGroq,
    },
    {
      name: "gemini",
      key: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      run: runGemini,
    },
  ];
}

function getProviderQueue() {
  const preferred = getPreferredProviderName();
  const providers = getProviders();

  if (preferred === "auto") {
    return providers;
  }

  const selected = providers.find((provider) => provider.name === preferred);
  return selected ? [selected, ...providers.filter((provider) => provider.name !== preferred)] : providers;
}

async function runOpenRouter(prompt: string, provider: AiProvider) {
  return runOpenAiCompatibleChat({
    url: "https://openrouter.ai/api/v1/chat/completions",
    key: provider.key || "",
    model: provider.model,
    prompt,
    headers: {
      "HTTP-Referer": "https://katris-travel-pearl.vercel.app",
      "X-Title": "Katris Travel AI",
    },
  });
}

async function runMistral(prompt: string, provider: AiProvider) {
  return runOpenAiCompatibleChat({
    url: "https://api.mistral.ai/v1/chat/completions",
    key: provider.key || "",
    model: provider.model,
    prompt,
  });
}

async function runGroq(prompt: string, provider: AiProvider) {
  return runOpenAiCompatibleChat({
    url: "https://api.groq.com/openai/v1/chat/completions",
    key: provider.key || "",
    model: provider.model,
    prompt,
  });
}

async function runOpenAiCompatibleChat(options: {
  url: string;
  key: string;
  model: string;
  prompt: string;
  headers?: Record<string, string>;
}) {
  const response = await fetch(options.url, {
    method: "POST",
    signal: getTimeoutSignal(),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.key}`,
      ...(options.headers || {}),
    },
    body: JSON.stringify({
      model: options.model,
      messages: [
        {
          role: "user",
          content: options.prompt,
        },
      ],
      temperature: 0.6,
      response_format: { type: "json_object" },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || "AI provider request failed.");
  }

  const text = data?.choices?.[0]?.message?.content || "";
  return parseJsonFromText(text);
}

async function runGemini(prompt: string, provider: AiProvider) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent`, {
    method: "POST",
    signal: getTimeoutSignal(),
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": provider.key || "",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Gemini request failed.");
  }

  return parseJsonFromText(extractGeminiText(data));
}

function getTimeoutSignal() {
  return AbortSignal.timeout(18000);
}

function extractGeminiText(data: any) {
  return data?.candidates?.[0]?.content?.parts?.map((part: any) => part.text || "").join("").trim() || "";
}

function parseJsonFromText(text: string) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const payload = req.body || {};
  const prompt = buildPrompt(payload);
  const failures: string[] = [];

  for (const provider of getProviderQueue()) {
    if (!provider.key) {
      failures.push(`${provider.name}: API key is not configured`);
      continue;
    }

    try {
      const plan = await provider.run(prompt, provider);
      res.status(200).json({ provider: provider.name, model: provider.model, plan });
      return;
    } catch (error: any) {
      failures.push(`${provider.name}: ${error?.message || "request failed"}`);
    }
  }

  res.status(200).json({
    provider: "fallback",
    plan: buildFallbackPlan(payload),
    warning: `Live AI provider unavailable; fallback planning engine returned structured recommendations. ${failures.join(" | ")}`,
  });
}
