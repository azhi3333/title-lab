const titleInput = document.querySelector("#titleInput");
const platformSelect = document.querySelector("#platformSelect");
const categorySelect = document.querySelector("#categorySelect");
const analyzeButton = document.querySelector("#analyzeButton");
const resetButton = document.querySelector("#resetButton");
const shuffleButton = document.querySelector("#shuffleButton");
const shareCardButton = document.querySelector("#shareCardButton");
const clearHistoryButton = document.querySelector("#clearHistoryButton");
const importCsvButton = document.querySelector("#importCsvButton");
const exportLibraryButton = document.querySelector("#exportLibraryButton");
const clearCustomLibraryButton = document.querySelector("#clearCustomLibraryButton");
const saveExperimentButton = document.querySelector("#saveExperimentButton");
const useCurrentTitleButton = document.querySelector("#useCurrentTitleButton");
const clearExperimentsButton = document.querySelector("#clearExperimentsButton");
const scoreRing = document.querySelector("#scoreRing");
const scoreValue = document.querySelector("#scoreValue");
const scoreLabel = document.querySelector("#scoreLabel");
const scoreSummary = document.querySelector("#scoreSummary");
const meterList = document.querySelector("#meterList");
const scoreExplainList = document.querySelector("#scoreExplainList");
const titleType = document.querySelector("#titleType");
const issueList = document.querySelector("#issueList");
const rewriteList = document.querySelector("#rewriteList");
const templateList = document.querySelector("#templateList");
const libraryList = document.querySelector("#libraryList");
const libraryCount = document.querySelector("#libraryCount");
const customLibraryCount = document.querySelector("#customLibraryCount");
const csvInput = document.querySelector("#csvInput");
const importStatus = document.querySelector("#importStatus");
const experimentTitle = document.querySelector("#experimentTitle");
const experimentPlatform = document.querySelector("#experimentPlatform");
const experimentCategory = document.querySelector("#experimentCategory");
const metricViews = document.querySelector("#metricViews");
const metricLikes = document.querySelector("#metricLikes");
const metricSaves = document.querySelector("#metricSaves");
const metricComments = document.querySelector("#metricComments");
const experimentCount = document.querySelector("#experimentCount");
const experimentStatus = document.querySelector("#experimentStatus");
const experimentInsight = document.querySelector("#experimentInsight");
const experimentInsightText = document.querySelector("#experimentInsightText");
const metricSummary = document.querySelector("#metricSummary");
const experimentList = document.querySelector("#experimentList");
const historyList = document.querySelector("#historyList");
const shareStatus = document.querySelector("#shareStatus");
const baseTitleLibrary = window.titleLibrary || [];
let customTitleLibrary = loadCustomLibrary();
let titleLibrary = mergeLibraries(baseTitleLibrary, customTitleLibrary);
let lastAnalysis = null;

const platformTone = {
  xiaohongshu: {
    name: "小红书",
    hint: "更适合强场景、强人群、强收益。",
    suffixes: ["收藏版", "避坑版", "新手友好"],
  },
  bilibili: {
    name: "B站",
    hint: "更适合过程感、反差和可验证经验。",
    suffixes: ["完整复盘", "真实经验", "从 0 到 1"],
  },
  douyin: {
    name: "抖音",
    hint: "更适合短句、冲突和即时好奇。",
    suffixes: ["先别划走", "说人话版", "一分钟讲清"],
  },
  wechat: {
    name: "公众号",
    hint: "更适合观点、判断和结构化价值。",
    suffixes: ["深度拆解", "长期主义版", "给普通人的建议"],
  },
  x: {
    name: "X / Twitter",
    hint: "更适合尖锐观点和一句话钩子。",
    suffixes: ["thread", "quick note", "hot take"],
  },
};

const categoryWords = {
  side: ["副业", "赚钱", "接单", "普通人", "自由职业"],
  career: ["职场", "打工人", "简历", "面试", "老板"],
  ai: ["AI", "ChatGPT", "自动化", "提示词", "工作流"],
  growth: ["成长", "自律", "效率", "焦虑", "习惯"],
  content: ["小红书", "账号", "选题", "流量", "内容"],
  product: ["客户", "产品", "转化", "服务", "报价"],
};

const templates = [
  {
    pattern: "不是 X，而是 Y",
    reason: "制造认知反差，适合把老问题讲出新角度。",
    build: (topic) => `不是你不会${topic}，而是你一开始就选错了方法`,
  },
  {
    pattern: "我做了 X 天，发现 Y",
    reason: "自带实验感，容易让用户相信不是空泛建议。",
    build: (topic) => `我认真研究${topic} 7 天，发现真正卡住人的不是能力`,
  },
  {
    pattern: "适合 X 的 Y 方法",
    reason: "人群明确，用户能快速判断是否和自己有关。",
    build: (topic) => `适合普通人的${topic}方法：不鸡血，但能开始`,
  },
  {
    pattern: "别再 X 了，先 Y",
    reason: "有阻断感，适合纠正常见误区。",
    build: (topic) => `别再盲目学${topic}了，先把这 3 件小事做对`,
  },
  {
    pattern: "如果你也 X，先看完这个",
    reason: "用共鸣开场，适合痛点强的选题。",
    build: (topic) => `如果你也想靠${topic}改变现状，先看完这篇`,
  },
  {
    pattern: "X 清单：从 A 到 B",
    reason: "结构清楚，适合收藏型内容。",
    build: (topic) => `${topic}启动清单：从完全不会到跑通第一步`,
  },
];

const dimensions = [
  { key: "audience", label: "明确人群", weight: 1.15 },
  { key: "benefit", label: "明确收益", weight: 1.25 },
  { key: "tension", label: "情绪张力", weight: 1.25 },
  { key: "specific", label: "具体程度", weight: 1 },
  { key: "curiosity", label: "信息缺口", weight: 1.2 },
  { key: "readable", label: "可读性", weight: 0.95 },
];

let lastSeed = 0;

function getGoal() {
  return document.querySelector("input[name='goal']:checked").value;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function includesAny(text, words) {
  return words.some((word) => text.toLowerCase().includes(word.toLowerCase()));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function confirmAction(message) {
  return window.confirm(message);
}

function loadCustomLibrary() {
  try {
    const parsed = JSON.parse(localStorage.getItem("titleLabCustomLibrary") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadExperiments() {
  try {
    const parsed = JSON.parse(localStorage.getItem("titleLabExperiments") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveExperiments(items) {
  localStorage.setItem("titleLabExperiments", JSON.stringify(items));
  renderExperiments();
}

function saveCustomLibrary(items) {
  customTitleLibrary = items;
  localStorage.setItem("titleLabCustomLibrary", JSON.stringify(customTitleLibrary));
  titleLibrary = mergeLibraries(baseTitleLibrary, customTitleLibrary);
  renderLibraryStats();
}

function mergeLibraries(baseItems, customItems) {
  const seen = new Set();
  return [...baseItems, ...customItems].filter((item) => {
    const key = `${item.title}|${item.platform}|${item.category}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderLibraryStats() {
  if (libraryCount) libraryCount.textContent = `${titleLibrary.length} 条样本`;
  if (customLibraryCount) customLibraryCount.textContent = `${customTitleLibrary.length} 条自定义`;
}

function tokenize(text) {
  const normalized = text.toLowerCase();
  const zhTokens = normalized.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  const enTokens = normalized.match(/[a-z0-9]+/g) || [];
  const phraseTokens = ["不是", "别", "先", "真正", "发现", "清单", "普通人", "新手", "客户", "标题", "AI", "ChatGPT", "副业", "职场", "工作流"]
    .filter((token) => normalized.includes(token.toLowerCase()))
    .map((token) => token.toLowerCase());
  return [...new Set([...zhTokens, ...enTokens, ...phraseTokens])];
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeCsvItems(text) {
  const rows = parseCsv(text);
  if (!rows.length) return [];

  const header = rows[0].map((cell) => cell.toLowerCase());
  const hasHeader = header.includes("title");
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const columns = hasHeader ? header : ["title", "platform", "category", "pattern", "hook", "signals"];
  const validPlatforms = new Set(Object.keys(platformTone));
  const validCategories = new Set(Object.keys(categoryWords));

  return dataRows
    .map((row) => Object.fromEntries(columns.map((name, index) => [name, row[index] || ""])))
    .map((item) => ({
      title: item.title?.trim(),
      platform: item.platform?.trim() || "xiaohongshu",
      category: item.category?.trim() || "content",
      pattern: item.pattern?.trim() || "自定义样本",
      hook: item.hook?.trim() || "来自你的自定义标题库。",
      signals: (item.signals || "")
        .split("|")
        .map((signal) => signal.trim())
        .filter(Boolean),
      source: "custom",
    }))
    .filter((item) => item.title && validPlatforms.has(item.platform) && validCategories.has(item.category))
    .map((item) => ({
      ...item,
      signals: item.signals.length ? item.signals : tokenize(item.title).slice(0, 5),
    }));
}

function overlapScore(a, b) {
  const left = tokenize(a);
  const right = tokenize(b);
  if (!left.length || !right.length) return 0;
  const rightSet = new Set(right);
  const overlap = left.filter((token) => rightSet.has(token)).length;
  return overlap / Math.max(left.length, right.length);
}

function extractTopic(title, category) {
  if (/AI|ChatGPT/i.test(title) && /网站|页面|网页/.test(title)) return "AI 生成网站";
  if (/AI|ChatGPT/i.test(title) && /代码|脚本|报错|跑不起来|bug/i.test(title)) return "AI 生成代码";
  if (/标题|选题|爆款|小红书/.test(title)) return "内容标题";
  if (/接单|外包|兼职/.test(title)) return "接单";

  const audienceWords = ["普通人", "新手", "小白", "打工人", "老板", "创作者"];
  const allPriorityWords = Object.values(categoryWords)
    .flat()
    .filter((word) => !audienceWords.includes(word));
  const directMatched = allPriorityWords.find((word) => title.toLowerCase().includes(word.toLowerCase()));
  if (directMatched) return directMatched;

  const priorityWords = categoryWords[category].filter((word) => !audienceWords.includes(word));
  const matched = priorityWords.find((word) => title.toLowerCase().includes(word.toLowerCase()));
  if (matched) return matched;

  const cleaned = title
    .replace(/[？?！!。.,，:：]/g, " ")
    .replace(/普通人|新手|小白|打工人|创作者|怎么|如何|为什么|到底|一个|一种|这些|那些|开始/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const categoryWord = categoryWords[category][0];
  if (!cleaned) return categoryWord;
  return cleaned.length > 10 ? categoryWord : cleaned;
}

function scoreTitle(title, platform, category, goal) {
  const length = [...title].length;
  const hasNumber = /\d|一|二|三|四|五|六|七|八|九|十/.test(title);
  const hasAudience = includesAny(title, ["普通人", "新手", "小白", "打工人", "博主", "老板", "创作者", "学生", "自由职业"]) || includesAny(title, categoryWords[category]);
  const hasBenefit = includesAny(title, ["赚钱", "省", "提高", "搞定", "解决", "避坑", "清单", "方法", "模板", "涨粉", "成交", "效率", "开始"]);
  const hasTension = includesAny(title, ["不是", "别", "反而", "真相", "后悔", "错", "坑", "焦虑", "救", "普通", "居然", "只"]);
  const hasCuriosity = includesAny(title, ["发现", "到底", "为什么", "真正", "秘密", "底层", "看完", "之前", "之后"]);
  const hasQuestion = /怎么|如何|为什么|吗|？|\?/.test(title);
  const platformFit = platform === "wechat" ? length >= 12 : length <= 28;
  const facts = {
    hasNumber,
    hasAudience,
    hasBenefit,
    hasTension,
    hasCuriosity,
    hasQuestion,
    platformFit,
    length,
  };

  const raw = {
    audience: 22 + (hasAudience ? 56 : 0) + (title.includes("你") ? 8 : 0),
    benefit: 18 + (hasBenefit ? 48 : 0) + (hasNumber ? 12 : 0) + (goal === "save" && title.includes("清单") ? 12 : 0),
    tension: 20 + (hasTension ? 48 : 0) + (goal === "click" && hasQuestion ? 10 : 0),
    specific: 24 + (hasNumber ? 34 : 0) + (hasAudience ? 14 : 0) + (length >= 12 ? 12 : 0),
    curiosity: 20 + (hasCuriosity ? 42 : 0) + (hasQuestion ? 18 : 0),
    readable: 82 - Math.max(0, length - 30) * 2 + (platformFit ? 8 : -8),
  };

  const meters = dimensions.map((dimension) => ({
    ...dimension,
    value: clamp(Math.round(raw[dimension.key])),
    reason: explainDimension(dimension.key, facts, goal, platform),
  }));

  const weighted = meters.reduce((sum, item) => sum + item.value * item.weight, 0);
  const totalWeight = meters.reduce((sum, item) => sum + item.weight, 0);
  const score = clamp(Math.round(weighted / totalWeight));

  return { score, meters, facts };
}

function explainDimension(key, facts, goal, platform) {
  const platformName = platformTone[platform]?.name || platform;
  const explanations = {
    audience: facts.hasAudience ? "命中了人群或内容关键词。" : "缺少明确人群或领域词。",
    benefit: facts.hasBenefit ? "出现了收益、方法或结果承诺。" : "还没有清楚说明读者能得到什么。",
    tension: facts.hasTension || facts.hasQuestion ? "有提问、反差或阻断动作。" : "缺少让人停下来的冲突点。",
    specific: facts.hasNumber ? "数字让承诺更可验证。" : "缺少数字、阶段或具体场景。",
    curiosity: facts.hasCuriosity || facts.hasQuestion ? "制造了信息缺口。" : "读者不太需要点开才能知道答案。",
    readable: facts.platformFit ? `长度适合${platformName}快速扫读。` : `长度和${platformName}的阅读节奏不太匹配。`,
  };

  if (key === "benefit" && goal === "save" && !facts.hasNumber) {
    return `${explanations[key]} 收藏目标下可补清单或步骤。`;
  }
  return explanations[key];
}

function detectType(title) {
  if (/\d|一|二|三|四|五|六|七|八|九|十|清单/.test(title)) return "数字清单型";
  if (/不是|别|反而|真相|错|坑/.test(title)) return "反差纠偏型";
  if (/怎么|如何|为什么|到底|？|\?/.test(title)) return "问题悬念型";
  if (/赚钱|提高|搞定|解决|省|涨粉|成交/.test(title)) return "利益承诺型";
  if (/普通人|打工人|新手|小白|博主|创作者/.test(title)) return "身份共鸣型";
  return "观点陈述型";
}

function diagnose(title, result, category) {
  const issues = [];
  if (result.meters.find((m) => m.key === "audience").value < 55) issues.push("人群不够明确，可以写出谁最该点开。");
  if (result.meters.find((m) => m.key === "benefit").value < 58) issues.push("结果感偏弱，可以补上省钱、省时、避坑或成长收益。");
  if (result.meters.find((m) => m.key === "tension").value < 58) issues.push("冲突不够强，可以加入反差、误区或真实经历。");
  if (result.meters.find((m) => m.key === "specific").value < 58) issues.push("还可以更具体，数字、场景和阶段会提高可信度。");
  if ([...title].length > 32) issues.push("标题略长，移动端第一眼可能扫不完。");
  if (!includesAny(title, categoryWords[category])) issues.push("和内容类型的关键词连接偏弱，平台可能更难识别受众。");
  return issues.slice(0, 6);
}

function labelForScore(score) {
  if (score >= 82) return "强标题";
  if (score >= 68) return "可测试";
  if (score >= 52) return "需要加钩子";
  return "偏平";
}

function numberValue(input) {
  const value = Number(input.value || 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function percent(value) {
  return `${(value * 100).toFixed(value >= 0.1 ? 1 : 2)}%`;
}

function experimentMetrics(item) {
  const views = Math.max(1, Number(item.views) || 0);
  const engagement = ((Number(item.likes) || 0) + (Number(item.saves) || 0) * 1.6 + (Number(item.comments) || 0) * 2.2) / views;
  const saveRate = (Number(item.saves) || 0) / views;
  const commentRate = (Number(item.comments) || 0) / views;
  const score = Math.round(clamp((engagement * 1000) + (saveRate * 600) + (commentRate * 500), 0, 100));
  return { engagement, saveRate, commentRate, score };
}

function titleFeatures(title) {
  return [
    /\d|一|二|三|四|五|六|七|八|九|十/.test(title) ? "数字" : "",
    /不是|别|反而|真相|错|坑/.test(title) ? "反差" : "",
    /怎么|如何|为什么|？|\?/.test(title) ? "问题" : "",
    /普通人|新手|小白|打工人|客户|老板|创作者/.test(title) ? "人群" : "",
    /清单|方法|模板|流程|步骤/.test(title) ? "方法" : "",
    /发现|真正|秘密|底层|看完/.test(title) ? "好奇" : "",
  ].filter(Boolean);
}

function colorForScore(score) {
  if (score >= 76) return "var(--good)";
  if (score >= 56) return "var(--warn)";
  return "var(--bad)";
}

function cleanTitlePart(value) {
  return String(value)
    .replace(/^[，,：:。！？!?\s]+|[，,：:。！？!?\s]+$/g, "")
    .replace(/^(你|我|他|她|它)\s*/, "")
    .trim();
}

function originalTitleRewrites(title) {
  const normalized = title.replace(/\s+/g, " ").trim();
  const contrastMatch = normalized.match(/^(.*?)[，,]\s*(?:你|我)?不是(.+?)[，,]\s*(?:而是|只是)(.+?)[。！？!?]*$/);

  if (contrastMatch) {
    const scene = cleanTitlePart(contrastMatch[1]);
    const assumedCause = cleanTitlePart(contrastMatch[2]);
    const realCause = cleanTitlePart(contrastMatch[3]);
    return [
      `${scene}，问题可能不在${assumedCause}，而在${realCause}`,
      `${scene}总不顺？先别怪${assumedCause}，检查是不是${realCause}`,
      `很多人${scene}卡住，不是因为${assumedCause}，而是${realCause}`,
      `${scene}：比起${assumedCause}，更该先解决${realCause}`,
      `为什么${scene}读起来不顺？可能是${realCause}`,
      `${scene}先改这一点：别让${realCause}拖累表达`,
      `${scene}避坑：你以为是${assumedCause}，其实是${realCause}`,
      `${scene}自查清单：重点看看是不是${realCause}`,
    ];
  }

  const discoveryMatch = normalized.match(/^(.*?)[，,]\s*(?:你|我)?才知道(.+?)[。！？!?]*$/);
  if (discoveryMatch) {
    const experience = cleanTitlePart(discoveryMatch[1]);
    const discovery = cleanTitlePart(discoveryMatch[2]);
    const naturalDiscovery = discovery.replace(/该这样/g, "原来要这样").replace(/应该这样/g, "原来要这样");
    return [
      `${experience}，我才明白：${discovery}`,
      `${naturalDiscovery}，我居然现在才知道`,
      `${experience}才弄明白，${naturalDiscovery}`,
      `${discovery}？这次终于整理清楚了`,
      `${naturalDiscovery}，以前真的做错了`,
      `${discovery}，记住这几个关键步骤`,
      `${experience}才发现，${naturalDiscovery}`,
      `${discovery}：一份更容易照着做的清单`,
    ];
  }

  const core = cleanTitlePart(normalized);
  return [
    `${core}，真正关键的是这 3 点`,
    `${core}？先把最容易忽略的一点讲清楚`,
    `关于${core}，很多人第一步就做反了`,
    `${core}：一份可以直接照着做的清单`,
    `别急着下结论，${core}还有一个关键细节`,
    `${core}，我更建议先从这一步开始`,
    `为什么大家都在讨论${core}？`,
    `${core}，这几个常见误区值得先避开`,
  ];
}

function makeRewrites(title, platform, category, goal) {
  const topic = extractTopic(title, category);
  const tone = platformTone[platform];
  const suffix = tone.suffixes[lastSeed % tone.suffixes.length];
  const originalVariants = originalTitleRewrites(title);
  const fallbackVariants = [
    `普通人想搞定${topic}，最该先跑通的不是技巧`,
    `别再盲目折腾${topic}了，先看这 3 个避坑点`,
    `我把${topic}拆成一张清单后，新手终于能开始了`,
    `不是你不适合${topic}，是第一步太容易走错`,
    `想靠${topic}打开局面？先做这 5 个小动作`,
    `${topic}${suffix}：从想法到第一次验证`,
    `如果你也卡在${topic}，这套方法比鸡血更有用`,
    `做${topic}前，我希望有人早点告诉我这些`,
  ];

  const variants = [...originalVariants, ...fallbackVariants];

  if (goal === "trust") {
    variants.unshift(`${cleanTitlePart(title)}，先别急着相信结论，看看完整过程`);
  }

  if (goal === "save") {
    variants.unshift(`${cleanTitlePart(title)}：把关键步骤整理成一份清单`);
  }

  const start = lastSeed % 3;
  return variants.slice(start, start + 6).map((text, index) => ({
    text,
    tags: [tone.name, index % 2 ? "反差" : "收益", goal === "save" ? "收藏" : "点击"],
  }));
}

function renderMeters(meters) {
  meterList.innerHTML = meters
    .map(
      (meter) => `
        <div class="meter">
          <div class="meter-head">
            <span>${escapeHtml(meter.label)}</span>
            <span>${meter.value}</span>
          </div>
          <div class="bar"><span style="--width:${meter.value}%"></span></div>
          <p>${escapeHtml(meter.reason)}</p>
        </div>
      `,
    )
    .join("");
}

function renderIssues(issues) {
  issueList.innerHTML = issues.length
    ? issues.map((issue) => `<li>${escapeHtml(issue)}</li>`).join("")
    : "<li>结构已经比较完整，可以直接拿去做 A/B 测试。</li>";
}

function goalLabel(goal) {
  const labels = {
    click: "点击",
    save: "收藏",
    trust: "信任",
  };
  return labels[goal] || goal;
}

function renderScoreExplanation(result, platform, category, goal) {
  const lowest = [...result.meters].sort((a, b) => a.value - b.value).slice(0, 2);
  const strengths = result.meters.filter((meter) => meter.value >= 76).slice(0, 2);
  const items = [
    `综合分按 6 个维度加权计算，当前目标是「${goalLabel(goal)}」。`,
    `平台判断：${platformTone[platform].hint}`,
    `优先补强：${lowest.map((meter) => `${meter.label} ${meter.value}`).join("、")}。`,
    strengths.length ? `已有优势：${strengths.map((meter) => meter.label).join("、")}。` : "还没有特别突出的强项。",
    `内容类型关键词：${categoryWords[category].join(" / ")}。`,
  ];

  scoreExplainList.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderRewrites(items) {
  rewriteList.innerHTML = items
    .map(
      (item) => `
        <article class="rewrite">
          <div class="rewrite-title">${escapeHtml(item.text)}</div>
          <div class="rewrite-footer">
            <div class="meta">${item.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
            <button class="copy-button" type="button" data-copy-title="${escapeHtml(item.text)}">复制</button>
          </div>
        </article>
      `,
    )
    .join("");
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Some embedded browsers block Clipboard API writes even on localhost.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-999px";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy command failed");
}

async function handleRewriteCopy(event) {
  const button = event.target.closest("[data-copy-title]");
  if (!button) return;

  const text = button.dataset.copyTitle;
  try {
    await copyText(text);
    button.textContent = "已复制";
    button.classList.add("is-copied");
    window.setTimeout(() => {
      button.textContent = "复制";
      button.classList.remove("is-copied");
    }, 1400);
  } catch {
    button.textContent = "复制失败";
    window.setTimeout(() => {
      button.textContent = "复制";
    }, 1600);
  }
}

function renderTemplates(title, category) {
  const topic = extractTopic(title, category);
  templateList.innerHTML = templates
    .slice(0, 5)
    .map(
      (template) => `
        <article class="template">
          <code>${escapeHtml(template.pattern)}</code>
          <p>${escapeHtml(template.build(topic))}</p>
          <p>${escapeHtml(template.reason)}</p>
        </article>
      `,
    )
    .join("");
}

function findLibraryMatches(title, platform, category) {
  return titleLibrary
    .map((sample) => {
      const textScore = overlapScore(title, `${sample.title} ${sample.signals.join(" ")}`);
      const platformBonus = sample.platform === platform ? 0.12 : 0;
      const categoryBonus = sample.category === category ? 0.34 : -0.06;
      const signalBonus = sample.signals.some((signal) => title.toLowerCase().includes(signal.toLowerCase())) ? 0.18 : 0;
      return {
        ...sample,
        matchScore: Math.min(1, textScore + platformBonus + categoryBonus + signalBonus),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4);
}

function renderLibraryMatches(matches) {
  renderLibraryStats();
  libraryList.innerHTML = matches
    .map(
      (item) => `
        <article class="library-item">
          <div class="match-score">${Math.round(item.matchScore * 100)}%</div>
          <div class="library-body">
            <h3>${escapeHtml(item.title)}</h3>
            <div class="meta">
              <span class="tag">${escapeHtml(platformTone[item.platform]?.name || item.platform)}</span>
              <span class="tag">${escapeHtml(item.pattern)}</span>
            </div>
            <p>${escapeHtml(item.hook)}</p>
            <p class="signals">${escapeHtml(item.signals.slice(0, 5).join(" / "))}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

function buildShareCardData({ title, platform, category, goal, result, type, issues, rewrites }) {
  const weakest = [...result.meters]
    .sort((a, b) => a.value - b.value)
    .slice(0, 3)
    .map((meter) => ({
      label: meter.label,
      value: meter.value,
      reason: meter.reason,
    }));
  const strengths = result.meters
    .filter((meter) => meter.value >= 76)
    .slice(0, 2)
    .map((meter) => meter.label);

  return {
    title,
    score: result.score,
    label: labelForScore(result.score),
    type,
    platformName: platformTone[platform]?.name || platform,
    categoryName: categoryWords[category]?.[0] || category,
    goalName: goalLabel(goal),
    summary: platformTone[platform]?.hint || "",
    weakest,
    strengths,
    issue: issues[0] || "结构已经比较完整，可以直接拿去做 A/B 测试。",
    rewrite: rewrites[0]?.text || title,
  };
}

function drawRoundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const characters = [...String(text)];
  const lines = [];
  let line = "";

  characters.forEach((character) => {
    const nextLine = line + character;
    if (context.measureText(nextLine).width > maxWidth && line) {
      lines.push(line);
      line = character;
    } else {
      line = nextLine;
    }
  });
  if (line) lines.push(line);

  const visible = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    visible[maxLines - 1] = `${visible[maxLines - 1].slice(0, Math.max(0, visible[maxLines - 1].length - 1))}...`;
  }
  visible.forEach((item, index) => context.fillText(item, x, y + index * lineHeight));
  return y + visible.length * lineHeight;
}

function fillRoundedRect(context, x, y, width, height, radius, color) {
  context.fillStyle = color;
  drawRoundRect(context, x, y, width, height, radius);
  context.fill();
}

function drawShareCard(canvas, data) {
  const context = canvas.getContext("2d");
  const width = 1080;
  const height = 1440;
  const scale = window.devicePixelRatio || 1;
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.scale(scale, scale);

  context.fillStyle = "#f6f3ee";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "rgba(255, 253, 250, 0.72)";
  context.fillRect(0, 0, width, height);

  fillRoundedRect(context, 64, 64, 952, 1312, 34, "#fffdfa");
  context.strokeStyle = "#ded7cc";
  context.lineWidth = 2;
  drawRoundRect(context, 64, 64, 952, 1312, 34);
  context.stroke();

  context.fillStyle = "#46543e";
  context.font = "800 30px Inter, system-ui, sans-serif";
  context.fillText("TITLE LAB", 112, 134);

  context.fillStyle = "#756f66";
  context.font = "700 28px Inter, system-ui, sans-serif";
  context.fillText(`${data.platformName} / ${data.categoryName} / ${data.goalName}`, 112, 180);

  context.fillStyle = "#24211d";
  context.font = "860 58px Inter, system-ui, sans-serif";
  const titleBottom = wrapCanvasText(context, data.title, 112, 270, 560, 72, 3);

  const scoreX = 824;
  const scoreY = 246;
  context.beginPath();
  context.arc(scoreX, scoreY, 118, 0, Math.PI * 2);
  context.fillStyle = "#fbf8f2";
  context.fill();
  context.strokeStyle = scoreColor(data.score);
  context.lineWidth = 18;
  context.beginPath();
  context.arc(scoreX, scoreY, 100, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (data.score / 100));
  context.stroke();
  context.fillStyle = "#24211d";
  context.font = "900 72px Inter, system-ui, sans-serif";
  context.textAlign = "center";
  context.fillText(data.score, scoreX, scoreY + 18);
  context.font = "800 26px Inter, system-ui, sans-serif";
  context.fillStyle = "#756f66";
  context.fillText(data.label, scoreX, scoreY + 60);
  context.textAlign = "left";

  let cursorY = Math.max(450, titleBottom + 40);
  fillRoundedRect(context, 112, cursorY, 856, 104, 18, "#fbf8f2");
  context.fillStyle = "#46543e";
  context.font = "850 28px Inter, system-ui, sans-serif";
  context.fillText(`标题类型：${data.type}`, 144, cursorY + 42);
  context.fillStyle = "#756f66";
  context.font = "700 23px Inter, system-ui, sans-serif";
  wrapCanvasText(context, data.summary, 144, cursorY + 76, 780, 30, 1);

  cursorY += 145;
  context.fillStyle = "#24211d";
  context.font = "850 32px Inter, system-ui, sans-serif";
  context.fillText("优先补强", 112, cursorY);
  cursorY += 24;

  data.weakest.forEach((meter) => {
    cursorY += 36;
    context.fillStyle = "#24211d";
    context.font = "820 26px Inter, system-ui, sans-serif";
    context.fillText(`${meter.label} ${meter.value}`, 112, cursorY);
    context.fillStyle = "#ebe5dc";
    fillRoundedRect(context, 312, cursorY - 20, 420, 14, 7, "#ebe5dc");
    fillRoundedRect(context, 312, cursorY - 20, Math.max(18, 420 * (meter.value / 100)), 14, 7, scoreColor(meter.value));
    context.fillStyle = "#756f66";
    context.font = "700 21px Inter, system-ui, sans-serif";
    wrapCanvasText(context, meter.reason, 112, cursorY + 30, 780, 28, 1);
    cursorY += 38;
  });

  cursorY += 28;
  fillRoundedRect(context, 112, cursorY, 856, 150, 20, "#24211d");
  context.fillStyle = "#fffdfa";
  context.font = "850 28px Inter, system-ui, sans-serif";
  context.fillText("建议改写", 144, cursorY + 44);
  context.font = "820 30px Inter, system-ui, sans-serif";
  wrapCanvasText(context, data.rewrite, 144, cursorY + 92, 790, 40, 2);

  cursorY += 190;
  context.fillStyle = "#24211d";
  context.font = "850 30px Inter, system-ui, sans-serif";
  context.fillText("一句诊断", 112, cursorY);
  context.fillStyle = "#756f66";
  context.font = "720 25px Inter, system-ui, sans-serif";
  wrapCanvasText(context, data.issue, 112, cursorY + 42, 856, 34, 2);

  context.fillStyle = "#a39b8f";
  context.font = "760 21px Inter, system-ui, sans-serif";
  context.fillText("生成自 Title Lab / 爆款标题体检器", 112, 1314);
  context.fillText("把标题先体检，再改写，最后复盘。", 112, 1348);
}

function scoreColor(score) {
  if (score >= 76) return "#557a4a";
  if (score >= 56) return "#a46a34";
  return "#9f4f45";
}

function downloadCanvas(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  document.body.append(link);
  link.click();
  link.remove();
}

function generateShareCard() {
  const analysis = analyze();
  if (!analysis) return;
  const canvas = document.createElement("canvas");
  drawShareCard(canvas, buildShareCardData(analysis));
  downloadCanvas(canvas, `title-lab-${Date.now()}.png`);
  shareStatus.textContent = "分享卡片已生成并下载。";
}

function importCsv() {
  const items = normalizeCsvItems(csvInput.value);
  if (!items.length) {
    importStatus.textContent = "没有识别到有效样本，请检查字段名、平台和内容类型。";
    return;
  }

  const before = customTitleLibrary.length;
  saveCustomLibrary(mergeLibraries(customTitleLibrary, items));
  const imported = customTitleLibrary.length - before;
  importStatus.textContent = imported > 0 ? `已导入 ${imported} 条新样本。` : "这些样本已经存在，没有重复导入。";
  csvInput.value = "";
  analyze();
}

function exportLibrary() {
  const payload = JSON.stringify(customTitleLibrary, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "title-lab-custom-library.json";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  importStatus.textContent = `已导出 ${customTitleLibrary.length} 条自定义样本。`;
}

function clearCustomLibrary() {
  if (!customTitleLibrary.length) {
    importStatus.textContent = "当前没有自定义样本。";
    return;
  }
  if (!confirmAction("确定清空所有自定义标题样本吗？")) return;
  saveCustomLibrary([]);
  importStatus.textContent = "自定义样本已清空。";
  analyze();
}

function saveExperiment() {
  const title = experimentTitle.value.trim();
  const views = numberValue(metricViews);
  if (!title || !views) {
    experimentStatus.textContent = "请至少填写标题和曝光/阅读数。";
    return;
  }

  const item = {
    id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    platform: experimentPlatform.value,
    category: experimentCategory.value,
    views,
    likes: numberValue(metricLikes),
    saves: numberValue(metricSaves),
    comments: numberValue(metricComments),
    type: detectType(title),
    features: titleFeatures(title),
    createdAt: new Date().toISOString(),
  };

  const experiments = loadExperiments();
  saveExperiments([item, ...experiments].slice(0, 80));
  experimentStatus.textContent = "实验已保存。";
  experimentTitle.value = "";
  metricViews.value = "";
  metricLikes.value = "";
  metricSaves.value = "";
  metricComments.value = "";
}

function useCurrentTitle() {
  experimentTitle.value = titleInput.value.trim();
  experimentPlatform.value = platformSelect.value;
  experimentCategory.value = categorySelect.value;
  experimentTitle.focus();
}

function clearExperiments() {
  if (!loadExperiments().length) {
    experimentStatus.textContent = "当前没有实验记录。";
    return;
  }
  if (!confirmAction("确定清空所有实验记录吗？")) return;
  localStorage.removeItem("titleLabExperiments");
  experimentStatus.textContent = "实验记录已清空。";
  renderExperiments();
}

function renderExperiments() {
  const experiments = loadExperiments();
  const ranked = experiments
    .map((item) => ({ ...item, metrics: experimentMetrics(item) }))
    .sort((a, b) => b.metrics.score - a.metrics.score);

  experimentCount.textContent = `${experiments.length} 条实验`;
  renderExperimentInsight(ranked);
  experimentList.innerHTML = ranked.length
    ? ranked
        .slice(0, 12)
        .map(
          (item) => `
            <article class="experiment-item">
              <div class="experiment-score">${item.metrics.score}</div>
              <div class="experiment-body">
                <h3>${escapeHtml(item.title)}</h3>
                <div class="meta">
                  <span class="tag">${escapeHtml(platformTone[item.platform]?.name || item.platform)}</span>
                  <span class="tag">${escapeHtml(item.type)}</span>
                  ${item.features.slice(0, 3).map((feature) => `<span class="tag">${escapeHtml(feature)}</span>`).join("")}
                </div>
                <div class="experiment-metrics">
                  <span>${item.views} 阅读</span>
                  <span>${item.likes} 赞</span>
                  <span>${item.saves} 收藏</span>
                  <span>${item.comments} 评论</span>
                  <span>互动 ${percent(item.metrics.engagement)}</span>
                  <span>收藏 ${percent(item.metrics.saveRate)}</span>
                </div>
              </div>
            </article>
          `,
        )
        .join("")
    : '<p class="empty">暂无实验记录</p>';
}

function renderExperimentInsight(ranked) {
  if (!ranked.length) {
    experimentInsight.textContent = "暂无足够数据";
    experimentInsightText.textContent = "保存实验后会开始总结高表现标题特征，样本越多判断越稳。";
    metricSummary.innerHTML = "";
    return;
  }

  const top = ranked.slice(0, Math.min(5, ranked.length));
  const avgScore = Math.round(ranked.reduce((sum, item) => sum + item.metrics.score, 0) / ranked.length);
  const avgEngagement = ranked.reduce((sum, item) => sum + item.metrics.engagement, 0) / ranked.length;
  const featureCounts = new Map();
  top.forEach((item) => item.features.forEach((feature) => featureCounts.set(feature, (featureCounts.get(feature) || 0) + 1)));
  const bestFeatures = [...featureCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([feature]) => feature);
  const best = ranked[0];

  experimentInsight.textContent = bestFeatures.length ? `高表现特征：${bestFeatures.join(" / ")}` : "高表现标题还没有稳定特征";
  experimentInsightText.textContent = `当前最佳是「${best.title}」，综合分 ${best.metrics.score}。继续记录会让判断更准。`;
  metricSummary.innerHTML = `
    <div><strong>${avgScore}</strong><span>平均分</span></div>
    <div><strong>${percent(avgEngagement)}</strong><span>平均互动率</span></div>
    <div><strong>${ranked.length}</strong><span>样本量</span></div>
  `;
}

function saveHistory(entry) {
  const history = loadHistory();
  const next = [entry, ...history].slice(0, 6);
  localStorage.setItem("titleLabHistory", JSON.stringify(next));
  renderHistory();
}

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem("titleLabHistory") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function renderHistory() {
  const history = loadHistory();
  historyList.innerHTML = history.length
    ? history
        .map(
          (item) => `
            <article class="history-item">
              <div class="history-score">${item.score}</div>
              <div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.platform)} · ${escapeHtml(item.type)}</p>
              </div>
            </article>
          `,
        )
        .join("")
    : '<p class="empty">暂无记录</p>';
}

function analyze() {
  const title = titleInput.value.trim();
  if (!title) {
    titleInput.focus();
    return null;
  }

  const platform = platformSelect.value;
  const category = categorySelect.value;
  const goal = getGoal();
  const result = scoreTitle(title, platform, category, goal);
  const type = detectType(title);
  const issues = diagnose(title, result, category);
  const label = labelForScore(result.score);
  const rewrites = makeRewrites(title, platform, category, goal);
  const matches = findLibraryMatches(title, platform, category);

  scoreValue.textContent = result.score;
  scoreRing.style.setProperty("--score", result.score);
  scoreRing.style.setProperty("--score-color", colorForScore(result.score));
  scoreLabel.textContent = label;
  scoreSummary.textContent = `${platformTone[platform].hint} 当前标题是${type}，${issues.length ? "优先补强诊断区里的短板。" : "可以进入多版本测试。"}`;
  titleType.textContent = type;

  renderMeters(result.meters);
  renderScoreExplanation(result, platform, category, goal);
  renderIssues(issues);
  renderRewrites(rewrites);
  renderTemplates(title, category);
  renderLibraryMatches(matches);
  lastAnalysis = {
    title,
    platform,
    category,
    goal,
    result,
    type,
    issues,
    rewrites,
    matches,
  };
  saveHistory({
    title,
    score: result.score,
    platform: platformTone[platform].name,
    type,
  });
  return lastAnalysis;
}

analyzeButton.addEventListener("click", analyze);

shuffleButton.addEventListener("click", () => {
  lastSeed += 1;
  analyze();
});

resetButton.addEventListener("click", () => {
  titleInput.value = "";
  titleInput.focus();
});

clearHistoryButton.addEventListener("click", () => {
  if (!loadHistory().length) return;
  if (!confirmAction("确定清除最近分析记录吗？")) return;
  localStorage.removeItem("titleLabHistory");
  renderHistory();
});

shareCardButton.addEventListener("click", generateShareCard);
rewriteList.addEventListener("click", handleRewriteCopy);

importCsvButton.addEventListener("click", importCsv);
exportLibraryButton.addEventListener("click", exportLibrary);
clearCustomLibraryButton.addEventListener("click", clearCustomLibrary);
saveExperimentButton.addEventListener("click", saveExperiment);
useCurrentTitleButton.addEventListener("click", useCurrentTitle);
clearExperimentsButton.addEventListener("click", clearExperiments);

titleInput.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    analyze();
  }
});

renderLibraryStats();
renderExperiments();
renderHistory();
analyze();

window.titleLabCore = {
  buildShareCardData,
  clamp,
  detectType,
  diagnose,
  drawShareCard,
  escapeHtml,
  experimentMetrics,
  findLibraryMatches,
  goalLabel,
  labelForScore,
  makeRewrites,
  normalizeCsvItems,
  originalTitleRewrites,
  parseCsv,
  renderRewrites,
  scoreTitle,
  titleFeatures,
  tokenize,
};
