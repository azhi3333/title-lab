# Deployment

Title Lab 是纯静态站点，可以部署到任意静态托管平台。

## Local Preview

```bash
npm start
```

打开：

```text
http://localhost:4173
```

## Preflight Checks

```bash
npm run ci
```

这个命令会执行语法检查和 Node.js 内置测试。

## GitHub Pages

1. 将仓库推送到 GitHub。
2. 进入仓库 Settings → Pages。
3. Source 选择 `Deploy from a branch`。
4. Branch 选择 `main`，目录选择 `/root`。
5. 保存后等待 Pages 构建完成。

## Static Hosts

部署目录使用项目根目录，入口文件是 `index.html`。不需要构建命令。

常见平台配置：

- Build command：留空，或填 `npm run ci` 作为发布前检查。
- Output directory：`.`
- Node version：20 或更高。

## Release Checklist

- `npm run ci` 通过。
- README 的功能说明与界面一致。
- `PRIVACY.md` 与当前数据行为一致。
- `index.html` 中静态资源版本号已更新，避免浏览器缓存旧文件。
