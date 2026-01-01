const result = document.getElementById("result");
const pagination = document.getElementById("pagination");
const planButton = document.getElementById("plan-button");
const sampleButton = document.getElementById("sample-button");
const recognizeButton = document.getElementById("recognize-button");
const clearButton = document.getElementById("clear-button");
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");

const sectionLabels = [
  "行程亮点",
  "酒店推荐",
  "餐厅推荐",
  "预算报告",
  "祝福语"
];

let currentSections = [];

document.body.classList.add("loading");
setTimeout(() => {
  document.getElementById("splash")?.remove();
  document.body.classList.remove("loading");
}, 2800);

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    panels.forEach((panel) => panel.classList.remove("active"));
    tab.classList.add("active");
    const target = document.getElementById(`tab-${tab.dataset.tab}`);
    if (target) target.classList.add("active");
  });
});

sampleButton?.addEventListener("click", () => {
  document.getElementById("from").value = "上海";
  document.getElementById("to").value = "京都";
  document.getElementById("date").value = "2025-06-12";
  document.getElementById("time").value = "09:30";
  document.getElementById("people").value = "2";
  document.getElementById("budget").value = "1200";
  document.getElementById("notes").value = "希望体验温泉、寺庙文化、素食餐厅。";
});

clearButton?.addEventListener("click", () => {
  document.getElementById("plan-text").value = "";
});

planButton?.addEventListener("click", () => generatePlan("form"));
recognizeButton?.addEventListener("click", () => generatePlan("text"));

function buildPromptFromForm() {
  const from = document.getElementById("from").value.trim();
  const to = document.getElementById("to").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const people = document.getElementById("people").value;
  const budget = document.getElementById("budget").value;
  const notes = document.getElementById("notes").value.trim();

  if (!from || !to || !date || !time) {
    alert("请填写完整信息");
    return null;
  }

  return `
你是一名专业旅行规划师，请根据以下条件生成详细计划：
出发地：${from}
目的地：${to}
日期：${date} ${time}
人数：${people}
预算：${budget}
说明：${notes}
输出格式：用中文分成「行程亮点、酒店推荐、餐厅推荐、预算报告、祝福语」五个部分，每个部分条理清晰。
`;
}

function buildPromptFromText() {
  const planText = document.getElementById("plan-text").value.trim();
  if (!planText) {
    alert("请先输入你的旅行计划描述");
    return null;
  }

  return `
你是一名专业旅行规划师，需要先识别用户描述中的目的地、日期、偏好、预算等信息，再给出最终方案。
用户描述：${planText}
请输出：
1. 识别结果摘要（包含目的地、人数、日期、预算、偏好）
2. 行程亮点（3-5条）
3. 酒店推荐（3家，给出价格区间、亮点）
4. 餐厅推荐（3家，给出风味与人均预算）
5. 预算报告（交通、住宿、餐饮、门票/体验，给出合计）
6. 祝福语（一句温暖祝福）
`;
}

function renderPagination(sections) {
  pagination.innerHTML = "";
  sections.forEach((section, index) => {
    const button = document.createElement("button");
    button.className = `page-btn ${index === 0 ? "active" : ""}`;
    button.textContent = section.title;
    button.addEventListener("click", () => showSection(index));
    pagination.appendChild(button);
  });
}

function showSection(index) {
  const section = currentSections[index];
  if (!section) return;
  const buttons = pagination.querySelectorAll(".page-btn");
  buttons.forEach((btn, idx) => {
    btn.classList.toggle("active", idx === index);
  });
  result.innerHTML = `<h3>${section.title}</h3><pre>${section.content}</pre>`;
}

function parseSections(text) {
  const sections = [];
  const chunks = text.split(/\n(?=[一二三四五六七八九十]、|\n?\*\*|##|###|\d+\.)/g);
  const cleaned = chunks.filter((chunk) => chunk.trim().length > 0);

  if (cleaned.length === 0) {
    return [{ title: "行程计划", content: text }];
  }

  cleaned.forEach((chunk, index) => {
    const titleMatch = chunk.match(/^(?:[一二三四五六七八九十]、|\d+\.)\s*([^\n]+)/);
    const title = titleMatch ? titleMatch[1].trim() : sectionLabels[index] || "行程计划";
    const content = chunk.replace(titleMatch?.[0] || "", "").trim() || chunk.trim();
    sections.push({ title, content });
  });
  return sections;
}

async function generatePlan(source) {
  const prompt = source === "text" ? buildPromptFromText() : buildPromptFromForm();
  if (!prompt) return;

  result.innerHTML = "🧭 正在生成旅行计划，请稍候...";
  pagination.innerHTML = "";

  try {
    const res = await fetch("https://openai-proxy.forght-6.workers.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "你是 Katris Travel AI 旅行助手，输出详细行程、酒店与餐厅推荐、预算报告及祝福语。" },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "生成失败";
    currentSections = parseSections(content);
    renderPagination(currentSections);
    showSection(0);
  } catch (e) {
    result.innerHTML = "⚠️ 请求失败，请检查 Worker 地址或网络。";
  }
}

