# AiChat 后端服务（Koa + SQLite + 多模型 Provider）

独立的 Node 服务，为前端 `aiChat` 页面提供 **SSE 长链接对话**、**会话持久化**、**多模型调用** 能力。无密钥时自动降级到 Mock，保证开箱即用。

## 架构

```
Koa (HTTP/SSE)
   ↓
Routes ──→ chatService ──→ Provider (OpenAI / Claude / 混元 / DeepSeek / Mock)
            ↓
         SQLite (better-sqlite3)
```

## 目录结构

```
mock-server/
├── server.js                    Koa 入口，启动时自动初始化 DB + Provider
├── .env.example                 环境变量模板（复制为 .env.local 填入真实密钥）
├── data/                        SQLite 数据文件（运行时生成，已 gitignore）
│   └── chat.db
├── db/
│   ├── index.js                 DB 单例
│   ├── schema.sql               建表 SQL
│   └── dao/
│       ├── conversations.js
│       └── messages.js
├── providers/                   模型提供商层
│   ├── base.js                  抽象基类
│   ├── openai.js                OpenAI 兼容（含混元/DeepSeek）
│   ├── anthropic.js             Claude
│   ├── mock.js                  Mock 降级
│   └── index.js                 注册表 + 路由
├── services/
│   └── chatService.js           核心编排：DB ↔ Provider ↔ SSE
├── routes/
│   ├── chat.js                  POST /api/chat/completions
│   ├── conversations.js         CRUD 会话
│   ├── models.js                GET /api/models
│   └── providers.js             GET /api/providers
├── mock/
│   ├── responses.js             离线兜底响应生成规则
│   └── conversations.js         (预留) 静态模型列表
└── utils/
    └── sse.js                   SSE 协议封装
```

## 启动

```bash
# 1. 安装依赖
cd mock-server && npm install

# 2.（可选）配置真实模型 API Key
cp .env.example .env.local
# 编辑 .env.local，填入你拥有的任一 Provider 密钥
# 不配置密钥，所有模型自动降级到 Mock，依然可用

# 3. 启动服务
npm run start         # 或 npm run dev（watch 模式）
```

## 接口一览

| Method | Path | 作用 |
|--------|------|------|
| POST | `/api/chat/completions` | SSE 流式对话（OpenAI 兼容协议 + 自定义 meta 首帧） |
| GET | `/api/conversations` | 会话列表（按更新时间倒序） |
| POST | `/api/conversations` | 创建会话 |
| GET | `/api/conversations/:id/messages` | 会话消息详情 |
| PATCH | `/api/conversations/:id` | 修改会话（标题） |
| DELETE | `/api/conversations/:id` | 删除会话（级联删除消息） |
| GET | `/api/models` | 可选模型列表 |
| GET | `/api/providers` | 各 Provider 可用性状态 |
| GET | `/health` | 健康检查 |

## SSE 协议

**请求**：
```http
POST /api/chat/completions
Content-Type: application/json

{
  "conversationId": "conv_xxx",    // 可选：为空则自动创建新会话
  "content": "你好",
  "model": "gpt-4o",
  "stream": true
}
```

**响应（事件流）**：
```
data: {"type":"meta","conversationId":"conv_xxx","assistantMessageId":"msg_xxx","provider":"openai","fallback":false}

data: {"delta":{"content":"你"},"choices":[{"delta":{"content":"你"}}]}

data: {"delta":{"content":"好"},"choices":[{"delta":{"content":"好"}}]}

data: [DONE]
```

## 多模型支持

| 前端 model 值 | Provider | 所需环境变量 |
|---------------|----------|--------------|
| `gpt-4o` / `gpt-4o-mini` | OpenAI | `OPENAI_API_KEY` |
| `claude-3.5-sonnet` / `claude-3-opus` | Anthropic | `ANTHROPIC_API_KEY` |
| `hunyuan-pro` / `hunyuan-lite` | 混元 | `HUNYUAN_API_KEY` |
| `deepseek-v3` | DeepSeek | `DEEPSEEK_API_KEY` |
| 任意（无密钥） | Mock 降级 | 无需配置 |

## 数据库

- **类型**：SQLite（better-sqlite3）
- **文件**：`mock-server/data/chat.db`（已 gitignore）
- **表**：`conversations`、`messages`（参见 `db/schema.sql`）
- **清空**：直接删除 `data/chat.db` 文件即可

## 调试开关

| 方式 | 作用 |
|------|------|
| `POST /api/chat/completions?mockError=1` | 强制返回错误流，测试前端错误分支 |

## 安全

- 所有 API Key **仅从环境变量读取**，不写入代码或日志
- `.env.local` 已由 `.gitignore` 屏蔽
- 日志仅打印 `provider / model`，不打印 key 与完整 prompt
