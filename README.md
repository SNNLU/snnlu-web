# snnlu-web

遂宁奶龙大学官网（Nuxt 4 + TypeScript）。**纯静态站**：`npm run generate` 在构建时把每一页都生成成 HTML，产物在 `.output/public/`，发布到 GitHub Pages，域名 [遂宁奶龙大学.lol](https://遂宁奶龙大学.lol/)。线上没有服务端。

## 本地开发

```bash
npm ci           # 安装依赖（仓库带 package-lock.json，不要改用 npm install）
npm run dev      # 开发服务器，端口 4321
npm run generate # 生成静态站到 .output/public/（与线上同一条命令）
npx serve .output/public   # 本地预览生成结果
```

## 自动化怎么分工

| 改动类型 | 谁负责 | 结果 |
| --- | --- | --- |
| **`content/` 下的 Markdown**（`md-fastlane.yml`） | GitHub Actions + 大模型审查 | 审查结论为 `[PASS]` 就审批并**自动合并**；`[REJECT]` 则 Request Changes 挡住 |
| **含代码/配置的 PR** | CodeRabbit（`.coderabbit.yaml`） | 专家级代码审查，**不会自动合并** —— 测试与审查都通过后由维护者亲自合并 |
| **合并到 main 之后** | `deploy-on-merge.yml` | `npm ci` → `npm run generate` → 发布到 GitHub Pages，几分钟后线上更新 |

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

- `date` 不能省：新闻列表按它排序，缺了整站生成会失败。仓库里的 `content` 检查会提前给出看得懂的提示。
- `folder` 决定文章出现在哪个栏目，只能填下表里的代号；写错的话文章不会出现在任何栏目，`content` 检查会挡住。
- 文件名要含数字（如 `1005.md`），且不能和已有文章重复：文章地址是 `/news/<数字>/`。
- 图片放 `public/img/`，正文里用 `![](/img/xxx.svg)` 引用；渲染器 `server/utils/markdown.ts` 只认段落、图片、`## 标题`、`- 列表` 四种块。

### 栏目怎么归属

文章头部的 `folder` 决定它进哪个栏目；栏目代号、名称、编号都在 `content/site.json` 的 `folders` 里。页面上哪块位置显示哪个栏目，由 `content/layout/<页面号>.json` 里列表模块的 `folder` 决定。

| folder | 栏目 | 栏目列表页 |
| --- | --- | --- |
| `news` | 学校新闻 | `/list/101/` |
| `life` | 奶龙生活 | `/list/102/` |
| `student` | 学生工作 | `/list/103/` |
| `notice` | 通知公告 | `/list/104/` |
| `dept` | 院系动态 | `/list/105/` |
| `media` | 媒体报道 | `/list/106/` |
| `teachers` | 教师介绍 | `/list/107/` |
| `recruit` | 人才招聘 | `/list/108/` |
| `faq` | 招生问答 | `/list/109/` |
| `job` | 就业信息 | `/list/110/` |
| `research` | 研究平台 | `/list/111/` |
| `coop` | 合作交流 | `/list/112/` |
| `rules` | 规章制度 | `/list/113/` |
| `essay` | 团学有感 | `/list/114/` |

- 「奶龙团学」（`/list/120/`）合并显示 `notice`、`life`、`student`、`essay`

新增栏目：在 `folders` 里加一项（代号、`id`、`name`），再在要显示它的版式文件里放一个 `"folder": "<代号>"` 的列表模块。

### 网址

| 页面 | 地址 |
| --- | --- |
| 栏目页（导航里的各页） | `/p/<页面号>/` |
| 文章正文 | `/news/<文章号>/` |
| 文章手机版 | `/wx/news/<文章号>/` |
| 栏目全部文章 | `/list/<栏目编号>/` |
| 站内检索 | `/search/?kw=<关键词>` |

旧的 `/p/<号>/?StId=…` 链接会在浏览器里自动跳到新地址。

### 门禁

`main` 受 ruleset `protect-main` 保护：**只能通过 PR 合入**，必需检查 `build` + `content`（来自 `ci.yml`）全绿，禁止强推与删除分支。快车道开启的自动合并也会等这两个检查通过后才真正合入。

## 目录

- `content/` 站内图文。生成时由服务端代码读出、写进静态页，所以**改完必须合并到 main、等部署跑完才会生效**。
- `nuxt.config.ts` 里的 `pages()` 从 `content/` 列出全部要生成的页面；新增页面类型时要加进去，漏了线上就是 404。
- `app/` 页面与组件
- `server/api/` 构建时给页面供数据的接口（线上不存在）
- `public/` 静态资源（图片、文件）
