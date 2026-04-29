/**
 * 消息 DAO
 */
import { getDB } from '../index.js';

const genId = () => `msg_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/**
 * 插入消息
 */
export const createMessage = ({
	conversationId,
	role,
	content = '',
	model = null,
	attachments = null,
	tokensIn = 0,
	tokensOut = 0,
	finishReason = null,
	error = null,
}) => {
	const db = getDB();
	const id = genId();
	const now = Date.now();
	const attachmentsStr = attachments ? JSON.stringify(attachments) : null;

	db.prepare(
		`INSERT INTO messages
		 (id, conversation_id, role, content, model, attachments,
		  tokens_in, tokens_out, finish_reason, error, create_time)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	).run(
		id,
		conversationId,
		role,
		content,
		model,
		attachmentsStr,
		tokensIn,
		tokensOut,
		finishReason,
		error,
		now,
	);

	return { id, conversationId, role, content, model, createTime: now };
};

/**
 * 更新消息内容与结束状态（assistant 流式完成时调用）
 */
export const finalizeMessage = (id, { content, tokensIn, tokensOut, finishReason, error }) => {
	const db = getDB();
	db.prepare(
		`UPDATE messages
		 SET content = ?, tokens_in = ?, tokens_out = ?, finish_reason = ?, error = ?
		 WHERE id = ?`,
	).run(content ?? '', tokensIn ?? 0, tokensOut ?? 0, finishReason ?? null, error ?? null, id);
};

/**
 * 获取某会话的全部消息（升序）
 */
export const listMessagesByConversation = (conversationId) => {
	const db = getDB();
	const rows = db
		.prepare(
			`SELECT id, conversation_id AS conversationId, role, content, model,
			        attachments, tokens_in AS tokensIn, tokens_out AS tokensOut,
			        finish_reason AS finishReason, error, create_time AS createTime
			 FROM messages WHERE conversation_id = ?
			 ORDER BY create_time ASC`,
		)
		.all(conversationId);

	// 反序列化 attachments
	return rows.map((row) => ({
		...row,
		attachments: row.attachments ? safeParseJSON(row.attachments, []) : [],
	}));
};

/**
 * 获取最近 N 条消息作为上下文（升序返回，便于直接喂给 LLM）
 */
export const getRecentMessages = (conversationId, limit = 20) => {
	const db = getDB();
	const rows = db
		.prepare(
			`SELECT role, content FROM messages
			 WHERE conversation_id = ? AND content != ''
			 ORDER BY create_time DESC LIMIT ?`,
		)
		.all(conversationId, limit);
	return rows.reverse();
};

const safeParseJSON = (str, fallback) => {
	try {
		return JSON.parse(str);
	} catch {
		return fallback;
	}
};
