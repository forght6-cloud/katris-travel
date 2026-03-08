function switchTab(name) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    const active = btn.dataset.tab === name;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", String(active));
  });

  document.querySelectorAll(".tab-content").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === name);
  });
}

function renderMockResult(type, payload) {
  const output = document.getElementById("searchResult");

  if (type === "flight") {
    output.innerHTML = `
      <h3>机票搜索结果（演示）</h3>
      <p><strong>${payload.from}</strong> → <strong>${payload.to}</strong>，${payload.departDate}</p>
      <ul>
        <li>北欧航空 SK998 · 12h 45m · 参考价 ¥4,820</li>
        <li>芬兰航空 AY088 · 13h 10m · 参考价 ¥5,160</li>
      </ul>
      <p class="muted">* 当前为静态演示数据，接入 API 后替换为真实查询结果。</p>
    `;
    return;
  }

  output.innerHTML = `
    <h3>酒店搜索结果（演示）</h3>
    <p><strong>${payload.city}</strong> · ${payload.checkIn} 至 ${payload.checkOut}</p>
    <ul>
      <li>Harbor Nordic Hotel · 9.1 分 · ¥1,080/晚</li>
      <li>Snowlight Design Stay · 8.8 分 · ¥860/晚</li>
    </ul>
    <p class="muted">* 当前为静态演示数据，接入 API 后替换为真实查询结果。</p>
  `;
}

async function generatePlan() {
  const from = document.getElementById("from").value.trim();
  const to = document.getElementById("to").value.trim();
  const date = document.getElementById("date").value;
  const notes = document.getElementById("notes").value.trim();
  const result = document.getElementById("result");

  if (!from || !to || !date) {
    alert("请先填写出发地、目的地和日期");
    return;
  }

  result.innerHTML = `
    <h3>AI 行程草案（示例）</h3>
    <p><strong>${date}</strong> 从 <strong>${from}</strong> 前往 <strong>${to}</strong>。</p>
    <ol>
      <li>上午：抵达后入住酒店，周边轻松步行。</li>
      <li>下午：城市地标 + 博物馆路线，配合公共交通。</li>
      <li>晚上：本地特色餐厅 + 夜景路线。</li>
    </ol>
    <p class="muted">偏好备注：${notes || "无"}。后续接入 API 后可生成完整多日计划。</p>
  `;
}

document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

document.getElementById("flightForm").addEventListener("submit", (event) => {
  event.preventDefault();
  renderMockResult("flight", Object.fromEntries(new FormData(event.target).entries()));
});

document.getElementById("hotelForm").addEventListener("submit", (event) => {
  event.preventDefault();
  renderMockResult("hotel", Object.fromEntries(new FormData(event.target).entries()));
});

document.querySelectorAll("[data-jump]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.jump);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (button.dataset.jump === "flight") {
      switchTab("flight");
    }
  });
});
