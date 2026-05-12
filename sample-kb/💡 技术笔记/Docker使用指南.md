# Docker 使用指南

创建时间：2026-05-11

---

## 常用命令

```bash
# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 停止容器
docker stop <container_id>

# 删除容器
docker rm <container_id>
```

## Docker Compose

```yaml
version: '3'
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
```

---

*最后更新：2026-05-11*
