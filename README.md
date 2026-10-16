# snnlu-web

遂宁奶龙大学官网（Nuxt 4 + TypeScript）。构建产物是 Node 服务（`.output/server/index.mjs`）。

## 本地开发

```bash
npm ci           # 安装依赖（仓库带 package-lock.json，不要改用 npm install）
npm run dev      # 开发服务器，端口 4321
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

## 自动化策略：两条车道

| 你的改动 | 会发生什么 |
| --- | --- |
| **只改 `content/**/*.md`**（发文章） | `content` 结构校验 + `build` 必须通过；AI 审查只拦"大病"，通过后**自动合并** |
| 其他任何改动（站点代码、`content/site.json`、`content/layout/*.json`、`public/` 资源、`.github/`、本 README） | AI 严格审查 + 测试必须通过，但**不会自动合并**，由维护者亲自合并 |

分流是白名单：只有确定是纯文章（`content/` 下的 markdown，且不超过 30 个文件）才走内容车道，其他一律落回代码车道。

### 发文章要注意什么

头部块必须用 `---` 包住，新闻类必须写全这几个字段：

```markdown
---
title: 文章标题
date: 2026-10-16 09:00     # YYYY-MM-DD 或 YYYY-MM-DD HH:mm
folder: news
source: 来源单位
---

正文第一段。
```

- `date` 不能省：新闻列表按它排序，缺了会让接口在**运行时**报错（500），而 `npm run build` 不会报错 —— 所以有单独的 `content` 检查来兜住这类问题。
- 文件名要含数字（如 `1005.md`）：文章 id 由文件名里的数字推导。
- 图片放 `public/img/`，正文里用 `![](/img/xxx.svg)` 引用；渲染器 `server/utils/markdown.ts` 只认段落、图片、`## 标题`、`- 列表` 四种块。

### 门禁

- `main` 受 ruleset `protect-main` 保护：**只能通过 PR 合入**，必需检查 `build` + `content` 全绿，禁止强推与删除分支。
- 策略细节、安全边界与运维手册见组织仓库 [SNNLU/.github](https://github.com/SNNLU/.github)。

## 目录

- `content/` 站内图文。`nitro.serverAssets` 会把它打包进服务端产物，所以**改完必须重新构建并部署才会生效**。
- `app/` 页面与组件
- `server/api/` 列表 / 栏目 / 计数接口
- `public/` 静态资源（图片、文件）
