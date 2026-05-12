# KB-Web 个人知识库 Web 服务

基于 Node.js + Express + React + Vite 的个人知识库文件浏览器。支持 Markdown/HTML 渲染、文件级公开/私有权限控制、搜索功能。

## 功能特性

- 文件树浏览（仅显示 .md 和 .html 文件）
- Markdown 实时渲染（服务端 marked + highlight.js）
- HTML 沉浸式阅读（原样渲染，悬浮侧边栏/顶栏）
- 登录认证（bcrypt + session）
- 文件级公开/私有控制
- 文件名和内容搜索
- 响应式布局

## 本地开发

```bash
# 安装依赖
npm install

# 同时启动前后端开发服务器
npm run dev
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:3000

## Docker 部署

### 1. 准备环境变量

复制 `.env.example` 为 `.env` 并修改：

```bash
cp .env.example .env
```

```bash
KB_ROOT=/path/to/your/kb
SESSION_SECRET=your-super-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### 2. 一键部署

```bash
chmod +x deploy.sh
./deploy.sh
```

### 3. 手动部署

```bash
# 构建镜像
docker compose build

# 启动服务
docker compose up -d

# 查看日志
docker compose logs -f

# 停止服务
docker compose down
```

### 4. 数据持久化

- 知识库文件：`KB_ROOT` 挂载为只读 (`/kb:ro`)
- 用户和权限数据：Docker volume `kb-data` 自动挂载到 `/app/backend/data`

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
├── deploy.sh
└── .env.example
```

## 安全提示

- 生产环境务必修改 `SESSION_SECRET`
- 首次启动后修改默认密码
- 所有文件路径经过安全校验，防止目录遍历攻击
