-- AiChat 数据库 Schema
-- 使用 SQLite，支持外键 + WAL 模式

PRAGMA foreign_keys = ON;

-- 会话表
CREATE TABLE IF NOT EXISTS conversations (
	id            TEXT PRIMARY KEY,
	title         TEXT NOT NULL,
	model         TEXT,
	system_prompt TEXT,
	create_time   INTEGER NOT NULL,
	update_time   INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conv_update ON conversations(update_time DESC);

-- 消息表
CREATE TABLE IF NOT EXISTS messages (
	id              TEXT PRIMARY KEY,
	conversation_id TEXT NOT NULL,
	role            TEXT NOT NULL,               -- user / assistant / system
	content         TEXT NOT NULL DEFAULT '',
	model           TEXT,
	attachments     TEXT,                        -- JSON 字符串
	tokens_in       INTEGER DEFAULT 0,
	tokens_out      INTEGER DEFAULT 0,
	finish_reason   TEXT,                        -- stop / abort / error / null
	error           TEXT,
	create_time     INTEGER NOT NULL,
	FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id, create_time ASC);
