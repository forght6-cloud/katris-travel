async function generatePlan() {
  const from = document.getElementById("from").value.trim();
  const to = document.getElementById("to").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const people = document.getElementById("people").value;
  const budget = document.getElementById("budget").value;
  const notes = document.getElementById("notes").value;
  const result = document.getElementById("result");

  if (!from || !to || !date || !time) {
    alert("请填写完整信息");
    return;
  }

  result.innerHTML = "🧭 正在生成旅行计划，请稍候...";

  const userPrompt = `
你是一名专业旅行规划师，请根据以下条件生成详细计划：
出发地：${from}
目的地：${to}
日期：${date} ${time}
人数：${people}
预算：${budget}
说明：${notes}
输出格式：按小时列出每日行程，附带景点链接。
`;

  try {
    const res = await fetch("https://openai-proxy.forght-6.workers.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "你是 Katris Travel AI 旅行助手，输出详细行程" },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const data = await res.json();
    result.innerHTML = `<h3>🗺️ 旅行计划</h3><pre>${data.choices?.[0]?.message?.content || "生成失败"}</pre>`;
  } catch (e) {
    result.innerHTML = "⚠️ 请求失败，请检查 Worker 地址或网络。";
  }
}

