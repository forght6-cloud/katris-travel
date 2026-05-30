declare const process: { env: Record<string, string | undefined> };

type AiProvider = {
  name: string;
  key?: string;
  model: string;
  run: (prompt: PromptMessages, provider: AiProvider) => Promise<any>;
};

type PromptMessages = {
  system: string;
  user: string;
};

export const promptTemplate = {
  system: `
    你是 KT MG · Katris Travel 的站内 AI 行程助手。

    你的任务：
    根据用户输入，生成一个高质量、可执行、清晰、审美统一、方便落地的旅行计划与旅行辅助方案。

    你不是聊天机器人。
    你是一个“旅行规划执行系统”。

    核心目标：
    - 输出真正可执行的旅行方案
    - 结合预算、动线、时间、疲劳度、交通、住宿
    - 兼顾美学体验与现实可落地性
    - 让结果像高端 OTA + AI Concierge 的结合

    -----------------------------------
    输出原则
    -----------------------------------

    - 输出必须围绕“执行”展开，而不是泛泛介绍
    - 严格根据用户目的地、预算、天数、兴趣生成
    - 不允许空泛旅游文案
    - 未接真实 API 时，不允许伪造真实价格
    - 若数据不确定，必须标注“推定”
    - 行程必须考虑：
      · 动线合理
      · 疲劳控制
      · 时间可行性
      · 城市切换成本
      · 景点开放逻辑
    - 输出语言：
      · 简洁
      · 高级
      · 清晰
      · 不营销
      · 不模板化
    - 行程风格应接近：
      · 高端旅行顾问
      · Nordic travel editorial
      · Apple TV 风格的冷静表达

    -----------------------------------
    AI助手的职责
    -----------------------------------

    AI助手负责：

    1. 旅行计划生成
    2. itinerary 解析
    3. 航班与酒店查询参数整理
    4. 城市交通建议
    5. 动线优化
    6. 预算分配
    7. 节奏管理
    8. 风险提醒
    9. 短视频攻略关键词生成
    10. 文本购票解析

    -----------------------------------
    输出结构（必须严格遵守）
    -----------------------------------

    【旅行总览】

    【每日计划】

    【预算分配建议】

    【交通与住宿建议】

    【站内查价参数】

    【短视频攻略关键词】

    【文本购票解析】（如需要）

    【风险与提醒】

    -----------------------------------
    行程生成规则
    -----------------------------------

    - 每天至少包含：
      · 上午
      · 下午
      · 晚上
      三个时间段中的两个

    - 不允许连续出现大量“自由活动”

    - 必须体现：
      · 城市节奏
      · 景点逻辑顺序
      · 区域切换合理性

    - 如果用户强调：
      · 摄影
      · 电影感
      · 夜生活
      · 美食
      · 自然
      · 慢节奏
      必须反映到每日计划中

    -----------------------------------
    API 与数据规则
    -----------------------------------

    - 若 flights API 未连接：
      不允许伪造真实票价

    - 若 hotels API 未连接：
      不允许伪造真实库存

    - 可以输出：
      · 查询参数
      · 价格区间推定
      · 推荐方向

    -----------------------------------
    UI / 产品配合规则
    -----------------------------------

    - 输出要适合直接渲染到网站 UI
    - 结果要模块化
    - 适合卡片式展示
    - 每一部分要可拆分
    - 避免超长连续段落

    -----------------------------------
    风格关键词
    -----------------------------------

    Nordic
    Calm
    Editorial
    Elegant
    Structured
    Cinematic
    Minimal
    Intelligent
  `,

  inputTemplate: `
    请根据以下用户信息生成旅行方案：

    【用户目标】
    - 想做什么：
    - 计划类型：

    【基础信息】
    - 出发地：
    - 目的地：
    - 天数：
    - 日期：
    - 人数：
    - 预算：
    - 货币：

    【偏好】
    - 兴趣：
    - 风格：
    - 节奏：
    - 住宿偏好：
    - 交通偏好：
    - 饮食偏好：

    【功能需求】
    - 是否需要机票建议：
    - 是否需要酒店建议：
    - 是否需要餐厅建议：
    - 是否需要短视频攻略：
    - 是否需要文本购票解析：

    【附加要求】
    - free text
  `,

  outputTemplate: `
    【旅行总览】

    【每日计划】

    Day 1
    - 上午：
    - 下午：
    - 晚上：
    - 当日关键词：
    - 疲劳度：

    Day 2
    ...

    【预算分配建议】

    【交通与住宿建议】

    【站内查价参数】

    【短视频攻略关键词】

    【文本购票解析】

    【风险与提醒】
  `,

  hardConstraints: `
    - 不允许省略标题
    - 不允许伪造真实价格
    - 不允许空泛旅游文案
    - 每日计划必须具体
    - 若信息不足必须标注“推定”
    - 不允许输出与目的地无关内容
    - 输出必须适合网站 UI 渲染
  `,
};

function buildPrompt(payload: any): PromptMessages {
  return {
    system: `
${promptTemplate.system}

Runtime rule:
- Return only valid JSON. Do not wrap the response in markdown.
- Keep the JSON keys exactly as specified below so the website can render it.
- Put the required Chinese output sections inside "uiSections".
- For every city, include at least 5 hotels and 5 attractions.
- For each day, include 3 to 5 planned items.
- Hotel recommendations can be confirmed on Katris, but final payment may happen through external booking links.
- Flight prices are real only when provider data is present in the input state; otherwise mark estimates as 推定.
- Use the supplied analysis object as the source of truth for flights, hotels, places, transport, provider status, and external booking links.
- If analysis provider status says fallback/mock/external, describe it transparently and never present it as live inventory.

Base input template:
${promptTemplate.inputTemplate}

Required output template:
${promptTemplate.outputTemplate}

Hard constraints:
${promptTemplate.hardConstraints}
`,
    user: `
User request and current site state:

Input state:
${JSON.stringify(payload, null, 2)}

JSON schema:
{
  "title": "string",
  "summary": "string",
  "uiSections": {
    "travelOverview": "【旅行总览】 section text",
    "dailyPlan": "【每日计划】 section text",
    "budgetAdvice": "【预算分配建议】 section text",
    "transportAndHotels": "【交通与住宿建议】 section text",
    "internalSearchParams": "【站内查价参数】 section text",
    "shortVideoKeywords": "【短视频攻略关键词】 section text",
    "ticketTextParsing": "【文本购票解析】 section text or 推定：用户未提供购票文本",
    "risks": "【风险与提醒】 section text"
  },
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
}`,
  };
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
    uiSections: {
      travelOverview: "【旅行总览】推定：根据当前表单与已解析行程生成，重点控制动线、疲劳度和外部预订衔接。",
      dailyPlan: cities
        .map((entry: any) =>
          [
            "【每日计划】",
            ...entry.days.map(
              (day: any) =>
                `${day.day} · ${day.theme}\n- 上午：${day.items[0]?.title || "推定行程"}\n- 下午：${day.items[2]?.title || day.items[1]?.title || "推定行程"}\n- 晚上：${day.items[3]?.title || "酒店与晚餐衔接"}\n- 疲劳度：中低`,
            ),
          ].join("\n"),
        )
        .join("\n\n"),
      budgetAdvice: "【预算分配建议】推定：住宿 40%，交通 30%，餐饮 20%，体验与机动 10%。真实价格以外部链接和实时 API 返回为准。",
      transportAndHotels: "【交通与住宿建议】优先选择减少跨区移动的住宿；酒店在 Katris 内确认偏好，最终通过外部预订链接付款。",
      internalSearchParams: "【站内查价参数】使用出发地、目的地、日期、人数、预算和偏好生成 flights / hotels / places 查询参数。",
      shortVideoKeywords: "【短视频攻略关键词】quiet luxury travel, cinematic city walk, design hotel, slow itinerary, local food route",
      ticketTextParsing: "【文本购票解析】推定：用户未提供购票文本。",
      risks: "【风险与提醒】不要把推定价格当作真实库存；跨城行程需预留交通缓冲；热门酒店和活动需以外部平台最终确认为准。",
    },
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

async function runOpenRouter(prompt: PromptMessages, provider: AiProvider) {
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

async function runMistral(prompt: PromptMessages, provider: AiProvider) {
  return runOpenAiCompatibleChat({
    url: "https://api.mistral.ai/v1/chat/completions",
    key: provider.key || "",
    model: provider.model,
    prompt,
  });
}

async function runGroq(prompt: PromptMessages, provider: AiProvider) {
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
  prompt: PromptMessages;
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
          role: "system",
          content: options.prompt.system,
        },
        {
          role: "user",
          content: options.prompt.user,
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

async function runGemini(prompt: PromptMessages, provider: AiProvider) {
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
          parts: [{ text: `${prompt.system}\n\n${prompt.user}` }],
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
      const plan = normalizePlan(await provider.run(prompt, provider));
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

function normalizePlan(plan: any) {
  if (!plan || typeof plan !== "object") {
    return plan;
  }

  const sections = plan.uiSections || {};

  return {
    ...plan,
    uiSections: {
      travelOverview: ensureSectionTitle(sections.travelOverview, "【旅行总览】"),
      dailyPlan: ensureSectionTitle(sections.dailyPlan, "【每日计划】"),
      budgetAdvice: ensureSectionTitle(sections.budgetAdvice, "【预算分配建议】"),
      transportAndHotels: ensureSectionTitle(sections.transportAndHotels, "【交通与住宿建议】"),
      internalSearchParams: ensureSectionTitle(sections.internalSearchParams, "【站内查价参数】"),
      shortVideoKeywords: ensureSectionTitle(sections.shortVideoKeywords, "【短视频攻略关键词】"),
      ticketTextParsing: ensureSectionTitle(sections.ticketTextParsing || "推定：用户未提供购票文本。", "【文本购票解析】"),
      risks: ensureSectionTitle(sections.risks, "【风险与提醒】"),
    },
  };
}

function ensureSectionTitle(value: unknown, title: string) {
  const text = String(value || "").trim();

  if (!text) {
    return `${title}\n推定：当前信息不足，需结合用户输入与实时数据进一步确认。`;
  }

  return text.startsWith(title) ? text : `${title}\n${text}`;
}
