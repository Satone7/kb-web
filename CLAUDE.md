# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

个人知识库 Web 浏览器。NAS 上存储的 Markdown/HTML 知识库文件通过 Web 界面浏览，支持登录认证和文件级公开/私有控制。部署目标：NAS + Cloudflare Tunnel，无需暴露端口。

## Commands

```bash
# 开发（前后端同时启动）
npm run dev

# 仅后端
cd backend && node server.js

# 仅前端
cd frontend && npm run dev

# 生产构建
cd frontend && npm run build

# 生产运行
NODE_ENV=production KB_ROOT=/path/to/kb node backend/server.js

# Docker
docker build -t kb-web .
docker run -d -p 3000:3000 -v /path/to/kb:/kb:ro -e KB_ROOT=/kb kb-web
```

## Playwright (E2E 测试/调试)

使用系统安装的 Google Chrome（`/usr/bin/google-chrome-stable`），Ubuntu 26.04 暂不支持 Playwright 内置浏览器下载，已配置 `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`。

```bash
# 运行全部测试
npx playwright test

# 有界面运行（headed）
npx playwright test --headed

# UI 调试模式
npx playwright test --ui

# 运行单个测试文件
npx playwright test tests/example.spec.js

# 生成测试报告
npx playwright show-report
```

测试文件放 `tests/` 目录，配置见 `playwright.config.js`。

## Architecture

**Backend**: Express 5 (CommonJS) → routes → middleware → services
**Frontend**: React 19 + Vite 8 + Tailwind CSS 4 (ESM, .jsx)
**Data**: JSON 文件存储（无数据库），`backend/data/users.json` + `permissions.json`

### Request Flow

```
Request → Route Handler → checkAccess/requireAuth middleware → Service → Response
```

- `requireAuth`: 严格要求登录（文件树、权限管理）
- `checkAccess`: 公开文件直接放行，私有文件需登录（文件内容、搜索）
- `fileService.resolveSafePath()`: 防目录遍历，确保路径在 KB_ROOT 下

### API Surface

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/auth/login` | No | 登录 |
| `GET /api/auth/me` | No | 检查会话 |
| `GET /api/files/tree` | Required | 完整文件树 |
| `GET /api/public/tree` | No | 仅公开文件树 |
| `GET /api/files/content/*path` | Auth OR Public | 渲染后的文件内容 |
| `GET /api/files/search?q=` | Conditional | 搜索（匿名仅公开） |
| `GET/POST /api/permissions/*path` | Required | 文件公开/私有切换 |

### Frontend Data Flow

```
AuthProvider → useAuth (login/logout/checkAuth)
Home → useFileTree (GET /api/files/tree) + useFileContent (GET /api/files/content/{path})
FileTree → TreeNode (recursive, 点击文件触发 onSelect)
FileViewer → dangerouslySetInnerHTML (服务端已做 DOMPurify 清理)
PermissionToggle → GET/POST /api/permissions/{path}
```

## Key Decisions

- **Markdown 在服务端渲染**: marked + highlight.js + DOMPurify，前端用 `dangerouslySetInnerHTML` 直接展示
- **Express 5 路由语法**: 通配符用 `*path` 不是 `*`，参数 `req.params.path` 含路径部分（可能是数组需 join）
- **Tailwind CSS 4**: 直接 `@import "tailwindcss"`，不需要 postcss.config.js 或 tailwind.config.js
- **KB 挂载为只读**: Docker 中 `/kb:ro`，permissions.json 写在 `backend/data/` 独立挂载
- **Session cookie**: 名为 `kb.sid`，7 天有效期

## Environment

开发环境 `.env`:
- `KB_ROOT=/path/to/your/knowledge-base`
- `ADMIN_USERNAME=admin` / `ADMIN_PASSWORD=admin`
- `SESSION_SECRET` 生产环境务必更换

## Deployment (NAS)

NAS 上 Cloudflare Tunnel 已独立配置（不在本项目内），项目只需提供 HTTP 服务。`docker-compose.yml` 中的 cloudflared 容器可选用。生产部署时：

1. KB_ROOT volume 挂载为只读
2. `backend/data/` 单独挂载以持久化用户和权限数据
3. 修改 `SESSION_SECRET` 和 `ADMIN_PASSWORD`

## Known Quirks

- 仅显示 `.md` 和 `.html` 文件，隐藏文件（`.` 开头）被过滤
- 文件名支持中文/emoji（如 `💡 技术笔记/`）
- 首次启动自动生成 `users.json`，密码为 `ADMIN_PASSWORD` 的 bcrypt 哈希
- `express-session` 默认使用 MemoryStore（单进程够用，不适用于多实例）
