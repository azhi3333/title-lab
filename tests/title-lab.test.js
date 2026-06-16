const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const rootDir = path.resolve(__dirname, "..");

class FakeElement {
  constructor(id, value = "") {
    this.id = id;
    this.value = value;
    this.textContent = "";
    this.innerHTML = "";
    this.children = [];
    this.listeners = {};
    this.style = {
      values: {},
      setProperty: (name, nextValue) => {
        this.style.values[name] = nextValue;
      },
    };
  }

  addEventListener(name, handler) {
    this.listeners[name] = handler;
  }

  append(child) {
    this.children.push(child);
  }

  click() {
    if (this.listeners.click) this.listeners.click({ preventDefault() {} });
  }

  focus() {
    this.focused = true;
  }

  remove() {
    this.removed = true;
  }
}

function createHarness() {
  const ids = [
    "titleInput",
    "platformSelect",
    "categorySelect",
    "analyzeButton",
    "resetButton",
    "shuffleButton",
    "clearHistoryButton",
    "importCsvButton",
    "exportLibraryButton",
    "clearCustomLibraryButton",
    "saveExperimentButton",
    "useCurrentTitleButton",
    "clearExperimentsButton",
    "scoreRing",
    "scoreValue",
    "scoreLabel",
    "scoreSummary",
    "meterList",
    "scoreExplainList",
    "titleType",
    "issueList",
    "rewriteList",
    "templateList",
    "libraryList",
    "libraryCount",
    "customLibraryCount",
    "csvInput",
    "importStatus",
    "experimentTitle",
    "experimentPlatform",
    "experimentCategory",
    "metricViews",
    "metricLikes",
    "metricSaves",
    "metricComments",
    "experimentCount",
    "experimentStatus",
    "experimentInsight",
    "experimentInsightText",
    "metricSummary",
    "experimentList",
    "historyList",
  ];
  const elements = Object.fromEntries(ids.map((id) => [id, new FakeElement(id)]));
  const radios = {
    click: { value: "click", checked: true },
    save: { value: "save", checked: false },
    trust: { value: "trust", checked: false },
  };
  const storage = new Map();

  elements.titleInput.value = "普通人怎么开始副业";
  elements.platformSelect.value = "xiaohongshu";
  elements.categorySelect.value = "side";
  elements.experimentPlatform.value = "xiaohongshu";
  elements.experimentCategory.value = "side";

  const context = {
    Blob: class Blob {
      constructor(parts, options) {
        this.parts = parts;
        this.options = options;
      }
    },
    console,
    crypto: { randomUUID: () => "test-id" },
    document: {
      body: new FakeElement("body"),
      createElement: (tagName) => new FakeElement(tagName),
      getElementById: (id) => elements[id] || null,
      querySelector: (selector) => {
        if (selector.startsWith("#")) return elements[selector.slice(1)] || null;
        if (selector === "input[name='goal']:checked") {
          return Object.values(radios).find((radio) => radio.checked);
        }
        return null;
      },
    },
    localStorage: {
      getItem: (key) => (storage.has(key) ? storage.get(key) : null),
      removeItem: (key) => storage.delete(key),
      setItem: (key, value) => storage.set(key, String(value)),
    },
    URL: {
      createObjectURL: () => "blob:test",
      revokeObjectURL: () => {},
    },
    window: {
      confirm: () => true,
      crypto: { randomUUID: () => "test-id" },
    },
  };
  context.window.window = context.window;
  context.window.document = context.document;
  context.window.localStorage = context.localStorage;
  context.window.URL = context.URL;
  context.window.Blob = context.Blob;

  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(rootDir, "library.js"), "utf8"), context);
  vm.runInContext(fs.readFileSync(path.join(rootDir, "app.js"), "utf8"), context);

  return { core: context.window.titleLabCore, elements, radios, storage };
}

test("scores stronger titles above flat titles", () => {
  const { core } = createHarness();
  const strong = core.scoreTitle("我试了 7 天 AI 自动化，真正省时间的是这 3 个流程", "xiaohongshu", "ai", "save");
  const flat = core.scoreTitle("一些关于工具的想法", "xiaohongshu", "ai", "click");

  assert.ok(strong.score > flat.score);
  assert.ok(strong.meters.every((meter) => typeof meter.reason === "string" && meter.reason.length > 0));
});

test("parses quoted CSV and normalizes signals", () => {
  const { core } = createHarness();
  const items = core.normalizeCsvItems(
    'title,platform,category,pattern,hook,signals\n"普通人做副业，先别买课",xiaohongshu,side,"人群, 阻断","命中新手",普通人|副业',
  );

  assert.equal(items.length, 1);
  assert.equal(items[0].pattern, "人群, 阻断");
  assert.deepEqual(Array.from(items[0].signals), ["普通人", "副业"]);
});

test("escapes rendered user content", () => {
  const { core } = createHarness();

  assert.equal(core.escapeHtml('<img src=x onerror="alert(1)">'), "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
});

test("experiment metrics reward real engagement", () => {
  const { core } = createHarness();
  const high = core.experimentMetrics({ views: 1000, likes: 90, saves: 60, comments: 20 });
  const low = core.experimentMetrics({ views: 1000, likes: 5, saves: 0, comments: 0 });

  assert.ok(high.score > low.score);
  assert.equal(low.saveRate, 0);
});
