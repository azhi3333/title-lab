# Title Lab

爆款标题体检器。一个面向内容创作者的静态网页工具，用来诊断标题、生成改写版本、对标标题库，并记录发布后的 A/B 数据。

## Features

- 标题评分：从明确人群、明确收益、情绪张力、具体程度、信息缺口、可读性 6 个维度打分。
- 评分解释：每个维度都会展示判断依据，方便理解为什么得分高或低。
- 改写建议：根据平台、内容类型和目标生成可测试标题版本。
- 模板匹配：提供常见标题结构和可复用写法。
- 对标标题库：内置样本库，按相似度展示可参考标题。
- 自定义样本：支持 CSV 导入自定义标题样本，并导出 JSON。
- A/B 复盘：记录发布后的阅读、点赞、收藏、评论数据，自动排序并总结高表现特征。
- 本地保存：自定义样本、实验记录和历史分析保存在浏览器 localStorage。

## Quick Start

这个项目是纯静态页面，不需要安装依赖。推荐使用 npm 脚本启动，方便和 CI 保持一致。

```bash
npm start
```

然后打开：

```text
http://localhost:4173
```

也可以直接用浏览器打开 `index.html`。

## CSV Format

自定义标题库支持导入 CSV，字段如下：

```csv
title,platform,category,pattern,hook,signals
AI 工具越多，越要先固定自己的工作流,wechat,ai,趋势 + 反向建议,不是推荐更多工具，而是强调系统,AI 工具|工作流|越多
```

可用平台：

- `xiaohongshu`
- `bilibili`
- `douyin`
- `wechat`
- `x`

可用内容类型：

- `side`
- `career`
- `ai`
- `growth`
- `content`
- `product`

`signals` 使用 `|` 分隔。

## Tests

项目使用 Node.js 内置测试运行器，不需要额外依赖。

```bash
npm test
```

语法检查：

```bash
npm run check
```

完整检查：

```bash
npm run ci
```

## Deployment

Title Lab 可以部署到 GitHub Pages、Netlify、Vercel 或任意静态文件服务器。部署前建议运行：

```bash
npm run ci
```

更多发布步骤见 `docs/DEPLOYMENT.md`。

## Privacy

当前版本不需要账号，不依赖后端服务，也不会主动上传标题、样本库或 A/B 数据。自定义样本、实验记录和历史分析默认保存在当前浏览器的 `localStorage`。

详细说明见 `PRIVACY.md`。

## Project Structure

```text
.
├── app.js
├── docs
│   └── DEPLOYMENT.md
├── favicon.svg
├── index.html
├── library.js
├── package.json
├── PRIVACY.md
├── robots.txt
├── site.webmanifest
├── styles.css
└── tests
    └── title-lab.test.js
```

## Notes

- 当前评分逻辑是启发式规则，不等同于真实平台推荐系统。
- 所有数据默认保存在本地浏览器，不会上传到服务器。
- 清空实验、清空自定义样本、清除历史前会进行确认。
