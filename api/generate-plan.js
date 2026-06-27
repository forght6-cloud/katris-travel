"use strict";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const promptTemplate = {
  system: `
你是 KT MG · Katris Travel 的站内 AI 行程助手。

你的任务：
根据用户输入，生成一个高质量、可执行、清晰、方便落地的旅行计划与旅行辅助方案。

输出原则：
- 输出必须围绕“执行”展开
- 不允许伪造真实价格
- 如果信息不足，必须明确标注“推定”
- 使用提供的分析结果作为航班、酒店、地点和交通的事实来源
- Put the required Chinese output sections inside "uiSections"
- For every city, include at least 8 hotels and 8 attractions or place ideas
- For each day, include 3 to 5 planned items
- Return only valid JSON
`,
  inputTemplate: `
【基础信息】
- 出发地
- 目的地
- 天数
- 日期
- 人数
- 预算

【偏好】
- 兴趣
- 风格
- 节奏
`,
};

function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

function isTruthy(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function getTripDayCount(tripLength) {
  const text = String(tripLength || "").toLowerCase();
  const weekMatch = text.match(/(\d+)\s*weeks?/);
  const dayMatch = text.match(/(\d+)\s*days?/);
  const nightMatch = text.match(/(\d+)\s*nights?/);

  if (weekMatch) return Number(weekMatch[1]) * 7;
  if (dayMatch) return Number(dayMatch[1]);
  if (nightMatch) return Number(nightMatch[1]) + 1;
  return 7;
}

function getStopDayCount(totalDays, stopCount, stopIndex) {
  const divisor = Math.max(stopCount, 1);
  const base = Math.floor(totalDays / divisor);
  const remainder = totalDays % divisor;
  return Math.max(1, base + (stopIndex < remainder ? 1 : 0));
}

function buildFallbackDays(city, dayCount, startDay) {
  const themes = [
    `${city} arrival and orientation`,
    `${city} culture and central neighborhoods`,
    `${city} slower walking and local food`,
    `${city} recovery and flexible pacing`,
  ];

  return Array.from({ length: dayCount }, (_, index) => ({
    day: `Day ${startDay + index}`,
    theme: themes[index % themes.length],
    items: [
      { time: "Morning", title: "Arrival or route setup", detail: "Keep the first block flexible for transfer, check-in, and energy management." },
      { time: "Afternoon", title: `${city} core district`, detail: "Anchor the day around one compact area to reduce transport friction." },
      { time: "Evening", title: "Dinner and reset", detail: "End close to the hotel so the next day can start with a stable rhythm." },
    ],
  }));
}

function buildFallbackHotels(city) {
  return [
    "Central Hotel",
    "Boutique Stay",
    "Garden Residence",
    "Design Suites",
    "Station Hotel",
    "Quiet Apartment Hotel",
    "Harbour Hotel",
    "Spa Hotel",
  ].map((label) => ({
    name: `${city} ${label}`,
    style: "Placeholder shortlist",
    reason: "Use this as a placeholder until live inventory and contracted hotel APIs are connected.",
  }));
}

function buildFallbackAttractions(city) {
  return [
    "Historic core walk",
    "Main museum",
    "Central food hall",
    "Waterfront or park route",
    "Architecture stop",
    "Design district",
    "Transit anchor",
    "Evening dining area",
  ].map((label) => ({
    name: `${city} ${label}`,
    category: "Placeholder",
    reason: "Verified place selection should come from a live places provider in a later iteration.",
  }));
}

function buildFallbackPlan(payload) {
  const planner = payload?.planner || payload || {};
  const analysis = planner.analysis || payload?.analysis || {};
  const stops = Array.isArray(analysis.stops) && analysis.stops.length
    ? analysis.stops
    : [{ city: planner.to || "Destination", date: planner.date || "" }];
  const totalDays = getTripDayCount(planner.tripLength);
  let dayCursor = 1;

  const cities = stops.map((stop, index) => {
    const city = stop.city || "Destination";
    const dayCount = getStopDayCount(totalDays, stops.length, index);
    const days = buildFallbackDays(city, dayCount, dayCursor);
    dayCursor += dayCount;

    return {
      city,
      hotels: buildFallbackHotels(city),
      attractions: buildFallbackAttractions(city),
      days,
    };
  });

  return {
    title: `${cities.map((entry) => entry.city).join(" + ")} travel execution plan`,
    summary: "Structured itinerary, fallback hotel shortlist, and execution-oriented daily pacing are ready.",
    uiSections: {
      travelOverview: "【旅行总览】推定：当前为 Vercel Serverless MVP 版本，重点先保证路线、节奏、预算和执行结构清晰。",
      dailyPlan: `【每日计划】\n${cities.flatMap((city) => city.days.map((day) => `${day.day} · ${day.theme}\n- 上午：${day.items[0].title}｜${day.items[0].detail}\n- 下午：${day.items[1].title}｜${day.items[1].detail}\n- 晚上：${day.items[2].title}｜${day.items[2].detail}\n- 疲劳度：中低`)).join("\n\n")}`,
      budgetAdvice: "【预算分配建议】推定：住宿 40%，交通 30%，餐饮 20%，机动与门票 10%。",
      transportAndHotels: "【交通与住宿建议】先优先减少跨区折返；住宿先以位置和节奏适配为先，再进入最终预订。",
      internalSearchParams: "【站内查价参数】使用出发地、目的地、日期、人数和预算发起 serverless API 请求。",
      shortVideoKeywords: "【短视频攻略关键词】travel execution plan, calm itinerary, boutique hotel, city walk, trip checklist",
      ticketTextParsing: "【文本购票解析】推定：用户未提供购票文本。",
      risks: "【风险与提醒】当前酒店、地点与第三方预订仍为占位能力；不要将占位结果视为真实库存。",
    },
    cities,
    bookingNotes: [
      "OpenAI is used for live plan generation when OPENAI_API_KEY is configured.",
      "Amadeus data should be treated as live only when the server route returns a real provider response.",
      "Hotel and places endpoints are placeholder routes in this MVP phase.",
    ],
  };
}

function normalizePlan(plan) {
  const sections = plan?.uiSections || {};

  function ensureSection(title, value) {
    const text = String(value || "").trim();
    if (!text) {
      return `${title}\n推定：当前信息不足，需补充后进一步确认。`;
    }

    return text.startsWith(title) ? text : `${title}\n${text}`;
  }

  return {
    ...plan,
    uiSections: {
      travelOverview: ensureSection("【旅行总览】", sections.travelOverview),
      dailyPlan: ensureSection("【每日计划】", sections.dailyPlan),
      budgetAdvice: ensureSection("【预算分配建议】", sections.budgetAdvice),
      transportAndHotels: ensureSection("【交通与住宿建议】", sections.transportAndHotels),
      internalSearchParams: ensureSection("【站内查价参数】", sections.internalSearchParams),
      shortVideoKeywords: ensureSection("【短视频攻略关键词】", sections.shortVideoKeywords),
      ticketTextParsing: ensureSection("【文本购票解析】", sections.ticketTextParsing || "推定：用户未提供购票文本。"),
      risks: ensureSection("【风险与提醒】", sections.risks),
    },
  };
}

function buildPrompt(payload) {
  return {
    system: `${promptTemplate.system}\n${promptTemplate.inputTemplate}`,
    user: `User request and current site state:\n${JSON.stringify(payload, null, 2)}\n\nReturn JSON with keys: title, summary, uiSections, cities, bookingNotes.`,
  };
}

async function callOpenAi(prompt) {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: prompt.system,
        },
        {
          role: "user",
          content: prompt.user,
        },
      ],
      temperature: 0.6,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "OpenAI request failed.");
  }

  return JSON.parse(data?.choices?.[0]?.message?.content || "{}");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const payload = req.body || {};
  const forceFallbackMode = isTruthy(process.env.OPENAI_USE_FALLBACK);

  if (forceFallbackMode || !process.env.OPENAI_API_KEY) {
    sendJson(res, 200, {
      provider: "fallback",
      plan: buildFallbackPlan(payload),
      warning: forceFallbackMode
        ? "OPENAI_USE_FALLBACK is enabled; returned fallback structured plan for free development mode."
        : "OPENAI_API_KEY is not configured; returned fallback structured plan.",
    });
    return;
  }

  try {
    const plan = normalizePlan(await callOpenAi(buildPrompt(payload)));
    sendJson(res, 200, {
      provider: "openai",
      model: OPENAI_MODEL,
      plan,
    });
  } catch (error) {
    sendJson(res, 200, {
      provider: "fallback",
      plan: buildFallbackPlan(payload),
      warning: `OpenAI unavailable; returned fallback structured plan. ${error.message || "Unknown error"}`,
    });
  }
};
