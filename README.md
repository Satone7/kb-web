# KB-Web 个人知识库 Web 服务

基于 Node.js + Express + React + Vite 的个人知识库文件浏览器。支持 Markdown/HTML 渲染、文件级公开/私有权限控制、搜索功能。

## 功能特性

- 📁 文件树浏览（仅显示 .md 和 .html 文件）
- 📝 Markdown 实时渲染（服务端 marked + highlight.js）
- 🔒 登录认证（bcrypt + session）
- 🌐 文件级公开/私有控制
- 🔍 文件名和内容搜索
- 📱 响应式布局

## 本地开发

```bash
# 安装根目录依赖（concurrently）
npm install

# 同时启动前后端开发服务器
npm run dev
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:3000

## 生产部署（NAS + Docker）

### 1. 配置环境变量

复制 `.env.example` 并根据实际情况修改：

```bash
KB_ROOT=/path/to/your/kb
SESSION_SECRET=your-super-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
CF_TUNNEL_TOKEN=your-cloudflare-tunnel-token
```

### 2. 使用 Docker Compose 启动

```bash
docker-compose up -d
```

### 3. Cloudflare Tunnel 配置

1. 在 Cloudflare Zero Trust 中创建 Tunnel
2. 配置 Public Hostname 指向 `http://kb-web:3000`
3. 将 Tunnel Token 填入 `.env` 的 `CF_TUNNEL_TOKEN`

### 4. 首次使用

默认账号密码为 `admin` / `changeme`（可在环境变量中修改）。

## 项目结构

```
.
├── backend/           # Express 后端
│   ├── server.js      # 入口
│   ├── routes/        # API 路由
│   ├── services/      # 业务逻辑
│   └── middleware/    # 中间件
├── frontend/          # React 前端
│   ├── src/
│   └── dist/          # 构建产物
├── sample-kb/         # 示例知识库
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## 安全提示

- 生产环境务必修改 `SESSION_SECRET`
- 首次启动后修改默认密码
- 通过 Cloudflare Tunnel 暴露服务，无需开放 NAS 端口
- 所有文件路径经过安全校验，防止目录遍历攻击
