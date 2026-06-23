const STORAGE_KEY = "contentWorkbenchItems";

const categoryProfiles = {
  ai: ["AI 工具", "想用 AI 提效、却经常被工具淹没的创作者", "工具很多，却没有稳定流程，最后仍然靠手工推进", "少谈工具数量，多谈能重复执行的工作流"],
  side: ["副业", "想开始副业、但不知道第一步做什么的普通人", "信息看了很多，仍然无法判断什么值得投入", "不卖焦虑，拆出一条能低成本验证的行动路径"],
  career: ["职场", "希望提高竞争力、但不想只靠加班的人", "投入很多时间，却没有形成可见成果", "从忙碌转向结果，从动作转向可复用能力"],
  growth: ["个人成长", "想改变自己、却总在计划和中断之间循环的人", "目标过大、反馈太慢，很难保持行动", "降低行动摩擦，用小结果替代意志力消耗"],
  content: ["自媒体", "有表达欲、但选题和更新不稳定的创作者", "灵感散落，写作时总要重新从零开始", "把创作从临场发挥变成可积累的内容系统"],
  product: ["产品服务", "有技能和服务、但不会表达价值的自由职业者", "客户只看到执行动作，看不到结果和确定性", "从卖能力转向卖结果、边界和交付确定性"],
};

const statusLabels = { draft: "草稿", ready: "待发布", published: "已发布", review: "待复盘" };
const state = { currentId: null, analysis: null, titles: [], selectedTitle: "", titleSeed: 0 };

const $ = (selector) => document.querySelector(selector);
const ideaInput = $("#ideaInput");
const categoryInput = $("#workbenchCategory");
const audienceInput = $("#audienceInput");
const analysisAudience = $("#analysisAudience");
const analysisPain = $("#analysisPain");
const analysisAngle = $("#analysisAngle");
const outlineInput = $("#outlineInput");
const draftInput = $("#draftInput");
const candidateList = $("#candidateList");
const statusFilter = $("#statusFilter");

function loadItems() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function storeItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  renderTable();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function makeId() {
  return window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function setStep(step) {
  const order = ["idea", "outline", "draft", "titles", "save"];
  const activeIndex = order.indexOf(step);
  document.querySelectorAll(".step-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === step);
  });
  document.querySelectorAll(".workflow-step").forEach((button) => {
    const index = order.indexOf(button.dataset.step);
    button.classList.toggle("is-active", button.dataset.step === step);
    button.classList.toggle("is-complete", index < activeIndex);
  });
}

function switchView(view) {
  document.querySelectorAll(".view-tab").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
  $("#editorView").classList.toggle("is-active", view === "editor");
  $("#tableView").classList.toggle("is-active", view === "table");
  if (view === "table") renderTable();
}

function shortenIdea(idea) {
  const cleaned = idea
    .replace(/[？?！!。,.，:：]/g, " ")
    .replace(/怎么|如何|为什么|是不是|现在|这个|那个/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 18 ? cleaned.slice(0, 18) : cleaned;
}

function analyzeIdea() {
  const idea = ideaInput.value.trim();
  if (!idea) {
    $("#ideaStatus").textContent = "先写下一句内容想法。";
    ideaInput.focus();
    return;
  }

  const [, defaultAudience, pain, angle] = categoryProfiles[categoryInput.value];
  const topic = shortenIdea(idea) || categoryProfiles[categoryInput.value][0];
  const audience = audienceInput.value.trim() || defaultAudience;
  state.analysis = { topic, audience, pain, angle };
  analysisAudience.value = audience;
  analysisPain.value = pain;
  analysisAngle.value = angle;
  outlineInput.value = [
    `开头钩子：从“${idea}”这个真实疑问切入，先说出读者正在担心的事。`,
    "",
    "01｜表面问题",
    `大家以为问题是「${topic}」，但真正卡住人的往往不是信息不足。`,
    "",
    "02｜核心冲突",
    `${pain}。指出一个常见但无效的做法，让读者产生认知反差。`,
    "",
    "03｜关键观点",
    `${angle}。用一个具体场景解释为什么。`,
    "",
    "04｜行动方法",
    "给出 3 个今天就能开始的小步骤，每一步都能观察结果。",
    "",
    "结尾互动",
    "邀请读者说出目前最卡的一步，并给出下一篇内容的承诺。",
  ].join("\n");
  setStep("outline");
}

function generateDraft() {
  const idea = ideaInput.value.trim();
  const audience = analysisAudience.value.trim();
  const pain = analysisPain.value.trim();
  const angle = analysisAngle.value.trim();
  const topic = state.analysis?.topic || shortenIdea(idea);
  draftInput.value = [
    idea,
    "",
    "最近我一直在想这个问题。",
    "",
    `很多${audience}，第一反应是继续找工具、找教程、找更完整的方法。`,
    "",
    `但真正让人停在原地的，通常不是知道得太少，而是：${pain}。`,
    "",
    "我后来发现，一个更有效的思路是：",
    "",
    "不是急着把所有事情都做完，而是先跑通一个能看到结果的小闭环。",
    "",
    "具体可以从这 3 步开始：",
    "",
    `1. 写清楚你真正想解决的问题`,
    `不要写“我要学会${topic}”，而要写“我希望完成一个什么结果”。`,
    "",
    "2. 把任务缩到今天能验证",
    "先做一个最小版本，看看是否真的有人需要，或者自己是否会持续使用。",
    "",
    "3. 记录结果，而不是只记录努力",
    "什么有效、哪里卡住、下一次要改什么，这些才会慢慢变成你的方法。",
    "",
    angle,
    "",
    `如果你也在纠结「${topic}」，可以先别逼自己找到完美答案。`,
    "先完成一次小验证，答案通常会在行动里变清楚。",
    "",
    "你目前最卡的是哪一步？",
  ].join("\n");
  updateDraftLength();
  setStep("draft");
}

function scoreTitle(title) {
  let score = 42;
  if (/普通人|新手|创作者|打工人|客户|你/.test(title)) score += 12;
  if (/\d|一|二|三|四|五|六|七|八|九|十/.test(title)) score += 10;
  if (/不是|别|反而|真正|错|坑/.test(title)) score += 12;
  if (/怎么|如何|为什么|？|\?/.test(title)) score += 8;
  if (/方法|步骤|清单|结果|省|提高|搞定|开始/.test(title)) score += 10;
  if ([...title].length >= 12 && [...title].length <= 28) score += 7;
  return Math.min(96, score);
}

function generateTitles() {
  const topic = state.analysis?.topic || shortenIdea(ideaInput.value);
  const angle = analysisAngle.value.trim();
  const sets = [
    [
      `不是你不会${topic}，而是第一步就做重了`,
      `普通人想开始${topic}，先跑通这 3 步`,
      `${topic}迟迟没结果？问题可能不在执行力`,
      `我把${topic}缩小后，反而更容易开始了`,
      `别再盲目学${topic}了，先完成一次小验证`,
      `关于${topic}，我希望有人早点告诉我这件事`,
      `真正拉开差距的，不是知道多少${topic}`,
      `${topic}行动清单：从想法到第一次结果`,
    ],
    [
      `为什么你学了很多${topic}，还是没有结果？`,
      `想搞定${topic}，最该先解决的不是工具`,
      `我用 3 个问题，筛掉了一半无效的${topic}`,
      `${topic}越做越累，可能是流程一开始就错了`,
      `适合新手的${topic}方法：不复杂，但能开始`,
      `别把${topic}做成新的手工活`,
      `从 0 开始${topic}，先别追求完整`,
      `关于${topic}，一个反常识但有用的判断`,
    ],
  ];
  state.titles = sets[state.titleSeed % sets.length]
    .map((title) => ({
      title,
      score: scoreTitle(title),
      type: /不是|别|反而|错/.test(title) ? "反差型" : /\d|三|清单/.test(title) ? "清单型" : /？|为什么/.test(title) ? "悬念型" : "观点型",
      reason: angle,
    }))
    .sort((a, b) => b.score - a.score);
  state.selectedTitle = "";
  renderCandidates();
  setStep("titles");
}

function renderCandidates() {
  candidateList.innerHTML = state.titles.map((item, index) => `
    <article class="candidate-item ${item.title === state.selectedTitle ? "is-selected" : ""}">
      <div class="candidate-score">${item.score}</div>
      <div class="candidate-copy"><strong>${escapeHtml(item.title)}</strong><p>${item.type} · ${escapeHtml(item.reason)}</p></div>
      <button class="ghost-button choose-title-button" data-title-index="${index}" type="button">${item.title === state.selectedTitle ? "已选择" : "选择"}</button>
    </article>
  `).join("");
  $("#selectedTitleText").textContent = state.selectedTitle || "尚未选择";
}

function prepareSave() {
  if (!state.selectedTitle) {
    $("#selectedTitleText").textContent = "请先选择一个标题";
    return;
  }
  $("#saveIdeaSummary").textContent = ideaInput.value.trim();
  $("#saveTitleSummary").textContent = state.selectedTitle;
  $("#saveStatusText").textContent = "";
  setStep("save");
}

function saveContent() {
  const now = new Date().toISOString();
  const item = {
    id: state.currentId || makeId(),
    idea: ideaInput.value.trim(),
    category: categoryInput.value,
    audience: analysisAudience.value.trim(),
    pain: analysisPain.value.trim(),
    angle: analysisAngle.value.trim(),
    outline: outlineInput.value.trim(),
    draft: draftInput.value.trim(),
    titles: state.titles,
    selectedTitle: state.selectedTitle,
    status: $("#saveStatus").value,
    createdAt: now,
    updatedAt: now,
  };
  const items = loadItems();
  const index = items.findIndex((entry) => entry.id === item.id);
  if (index >= 0) {
    item.createdAt = items[index].createdAt;
    items[index] = item;
  } else {
    items.unshift(item);
  }
  state.currentId = item.id;
  storeItems(items);
  $("#saveStatusText").textContent = "已保存到内容表格。";
}

function resetEditor() {
  Object.assign(state, { currentId: null, analysis: null, titles: [], selectedTitle: "", titleSeed: 0 });
  [ideaInput, audienceInput, analysisAudience, analysisPain, analysisAngle, outlineInput, draftInput].forEach((input) => { input.value = ""; });
  $("#saveStatus").value = "draft";
  $("#saveStatusText").textContent = "";
  updateDraftLength();
  switchView("editor");
  setStep("idea");
  ideaInput.focus();
}

function openItem(id) {
  const item = loadItems().find((entry) => entry.id === id);
  if (!item) return;
  state.currentId = item.id;
  state.analysis = { topic: shortenIdea(item.idea), audience: item.audience, pain: item.pain, angle: item.angle };
  state.titles = Array.isArray(item.titles) ? item.titles : [];
  state.selectedTitle = item.selectedTitle || "";
  ideaInput.value = item.idea || "";
  categoryInput.value = item.category || "content";
  audienceInput.value = item.audience || "";
  analysisAudience.value = item.audience || "";
  analysisPain.value = item.pain || "";
  analysisAngle.value = item.angle || "";
  outlineInput.value = item.outline || "";
  draftInput.value = item.draft || "";
  $("#saveStatus").value = item.status || "draft";
  $("#saveIdeaSummary").textContent = item.idea || "-";
  $("#saveTitleSummary").textContent = item.selectedTitle || "-";
  renderCandidates();
  updateDraftLength();
  switchView("editor");
  setStep(item.selectedTitle ? "save" : item.draft ? "titles" : item.outline ? "draft" : "outline");
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
}

function renderTable() {
  const all = loadItems();
  const filter = statusFilter.value;
  const items = filter === "all" ? all : all.filter((item) => item.status === filter);
  $("#contentCount").textContent = all.length;
  $("#tableEmpty").hidden = items.length > 0;
  $("#contentTableBody").innerHTML = items.map((item) => `
    <tr>
      <td><div class="content-title-cell"><strong>${escapeHtml(item.selectedTitle || "未选择标题")}</strong><span>${escapeHtml(item.idea)}</span></div></td>
      <td>${escapeHtml(categoryProfiles[item.category]?.[0] || item.category)}</td>
      <td><select class="table-status" data-status-id="${item.id}">${Object.entries(statusLabels).map(([value,label]) => `<option value="${value}" ${item.status === value ? "selected" : ""}>${label}</option>`).join("")}</select></td>
      <td>${formatDate(item.updatedAt)}</td>
      <td><div class="row-actions"><button data-open-id="${item.id}" type="button">打开</button><button class="delete-row" data-delete-id="${item.id}" type="button">删除</button></div></td>
    </tr>
  `).join("");
}

function updateDraftLength() {
  $("#draftLength").textContent = `${[...draftInput.value].length} 字`;
}

document.querySelectorAll(".view-tab").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
document.querySelectorAll(".workflow-step").forEach((button) => button.addEventListener("click", () => setStep(button.dataset.step)));
document.querySelectorAll("[data-go-step]").forEach((button) => button.addEventListener("click", () => setStep(button.dataset.goStep)));
$("#analyzeIdeaButton").addEventListener("click", analyzeIdea);
$("#generateDraftButton").addEventListener("click", generateDraft);
$("#generateTitlesButton").addEventListener("click", generateTitles);
$("#regenerateTitlesButton").addEventListener("click", () => { state.titleSeed += 1; generateTitles(); });
$("#goSaveButton").addEventListener("click", prepareSave);
$("#saveContentButton").addEventListener("click", saveContent);
$("#newContentButton").addEventListener("click", resetEditor);
$("#tableNewContentButton").addEventListener("click", resetEditor);
statusFilter.addEventListener("change", renderTable);
draftInput.addEventListener("input", updateDraftLength);

candidateList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-title-index]");
  if (!button) return;
  state.selectedTitle = state.titles[Number(button.dataset.titleIndex)]?.title || "";
  renderCandidates();
});

$("#contentTableBody").addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-id]");
  const deleteButton = event.target.closest("[data-delete-id]");
  if (openButton) openItem(openButton.dataset.openId);
  if (deleteButton) {
    storeItems(loadItems().filter((entry) => entry.id !== deleteButton.dataset.deleteId));
    if (state.currentId === deleteButton.dataset.deleteId) resetEditor();
  }
});

$("#contentTableBody").addEventListener("change", (event) => {
  const select = event.target.closest("[data-status-id]");
  if (!select) return;
  const items = loadItems();
  const item = items.find((entry) => entry.id === select.dataset.statusId);
  if (item) {
    item.status = select.value;
    item.updatedAt = new Date().toISOString();
    storeItems(items);
  }
});

renderTable();
updateDraftLength();
