declare const process: { env: Record<string, string | undefined> };

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildPrompt(payload: any) {
  return `
You are Katris Travel AI, a production travel-planning assistant.
Return only valid JSON.

Requirements:
- For every city, include at least 5 hotels and 5 attractions.
- For each day, include 3 to 5 planned items.
- Keep plans practical, calm, premium, and bookable.
- Include flight context when available, but do not invent ticketing guarantees.

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
        { name: `${city} Grand Design Hotel`, style: "Design", reason: "A polished base near dining and transit." },
        { name: `${city} Harbour View Stay`, style: "Waterfront", reason: "Calm views and easy evening walks." },
        { name: `${city} Boutique House`, style: "Boutique", reason: "A smaller property with local character." },
        { name: `${city} Garden Residence`, style: "Quiet luxury", reason: "Good for slower mornings and recovery time." },
        { name: `${city} Central Suites`, style: "Convenient", reason: "Practical access for day trips and airport transfers." },
      ],
      attractions: [
        { name: `${city} Old Quarter`, category: "Culture", reason: "A compact first walk with orientation value." },
        { name: `${city} Waterfront`, category: "Scenery", reason: "Best for soft light, cafés, and low-friction exploration." },
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
            { time: "Afternoon", title: `${city} Old Quarter`, detail: "Walk the historic core and identify cafés or galleries for later." },
            { time: "Evening", title: "Waterfront dinner", detail: "Use the evening for a scenic, low-effort meal." },
          ],
        },
        {
          day: `Day ${stopIndex * 2 + 2}`,
          theme: `${city} culture and scenery`,
          items: [
            { time: "Morning", title: `${city} Design Museum`, detail: "Start with an indoor cultural anchor." },
            { time: "Midday", title: `${city} Market Hall`, detail: "Build lunch around local vendors and seasonal produce." },
            { time: "Afternoon", title: `${city} Lookout Route`, detail: "Plan a scenic route with photo stops and rest time." },
            { time: "Evening", title: "Quiet hotel reset", detail: "Leave room for spa, reading, or a calm bar reservation." },
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
      "Hotel and attraction picks are planning recommendations until connected to booking partners.",
      "Add a Gemini API key to replace fallback recommendations with model-generated plans.",
    ],
  };
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
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    res.status(200).json({
      provider: "fallback",
      plan: buildFallbackPlan(payload),
      warning: "GEMINI_API_KEY is not configured; fallback planning engine returned structured recommendations.",
    });
    return;
  }

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(payload) }],
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
      res.status(200).json({
        provider: "fallback",
        plan: buildFallbackPlan(payload),
        warning: data?.error?.message || "Gemini request failed; fallback planning engine returned structured recommendations.",
      });
      return;
    }

    const text = extractGeminiText(data);
    const plan = parseJsonFromText(text);
    res.status(200).json({ provider: "gemini", plan });
  } catch (error: any) {
    res.status(200).json({
      provider: "fallback",
      plan: buildFallbackPlan(payload),
      warning: error?.message || "AI planning failed; fallback planning engine returned structured recommendations.",
    });
  }
}
