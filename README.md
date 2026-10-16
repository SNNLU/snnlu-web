# snnlu-web

遂宁奶龙大学官网（Nuxt 4 + TypeScript）。构建产物是 Node 服务（`.output/server/index.mjs`）。

## 本地开发

```bash
npm ci           # 安装依赖（仓库带 package-lock.json，不要改用 npm install）
npm run dev      # 开发服务器，端口 4321
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

## 自动化怎么分工

| 改动类型 | 谁负责 | 结果 |
| --- | --- | --- |
| **`content/` 下的 Markdown**（`md-fastlane.yml`） | GitHub Actions + 大模型审查 | 审查结论为 `[PASS]` 就审批并**自动合并**；`[REJECT]` 则 Request Changes 挡住 |
| **含代码/配置的 PR** | CodeRabbit（`.coderabbit.yaml`） | 专家级代码审查，**不会自动合并** —— 测试与审查都通过后由维护者亲自合并 |
| **合并到 main 之后** | `deploy-on-merge.yml` | `npm ci` → `npm run build` → 部署（部署步骤是占位，待按宿主机补全） |

### 发文章要注意什么

快车道的白名单很窄：**改动文件必须全部位于 `content/` 下且是 `.md`**。只要出现一个其它文件——`README.md`、`docs/` 下的 md、`content/layout/*.json`、`site.json`、图片、代码——就自动退出快车道转人工审查。（`.mdx` 也不放行：渲染器只处理 `.md`。）

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

- `date` 不能省：新闻列表按它排序，缺了会让接口在**运行时**报错（500），而 `npm run build` 不会报错。仓库里的 `content` 检查专门兜这类问题。
- 文件名要含数字（如 `1005.md`）：文章 id 由文件名里的数字推导。
- 图片放 `public/img/`，正文里用 `![](/img/xxx.svg)` 引用；渲染器 `server/utils/markdown.ts` 只认段落、图片、`## 标题`、`- 列表` 四种块。

### 门禁

`main` 受 ruleset `protect-main` 保护：**只能通过 PR 合入**，必需检查 `build` + `content`（来自 `ci.yml`）全绿，禁止强推与删除分支。快车道开启的自动合并也会等这两个检查通过后才真正合入。

## 目录

- `content/` 站内图文。`nitro.serverAssets` 会把它打包进服务端产物，所以**改完必须重新构建并部署才会生效**。
- `app/` 页面与组件
- `server/api/` 列表 / 栏目 / 计数接口
- `public/` 静态资源（图片、文件）
