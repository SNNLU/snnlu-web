# snnlu-web

SNNLU 官网（Nuxt 4 + TypeScript）。

## 本地开发

```bash
npm ci           # 安装依赖（仓库带 package-lock.json，请勿改用 npm install）
npm run dev      # 本地开发服务器
npm run build    # 生产构建，产物在 .output/
npm run preview  # 预览构建产物
```

部署目标是 Node 服务：构建后可 `node .output/server/index.mjs` 启动。

## CI 与自动化

| 工作流 | 作用 | 触发方式 |
| --- | --- | --- |
| `ci.yml` | `npm ci` → `npm run build` → 校验产物存在（job 名 `build`） | PR 与 main 推送 |
| `ai-review-merge.yml` | 调用大模型审查 PR diff，通过则自动审批并开启 auto-merge | PR 创建/更新 |

`main` 受 ruleset `protect-main` 保护：**只能通过 PR 合入**，且 `build` 检查必须通过，禁止强推与删除分支。

自动化在组织级 `.github` 仓库中有完整说明（含 bot 身份、secret 配置与安全边界）。
