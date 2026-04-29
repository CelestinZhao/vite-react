/**
 * 会话 DAO
 */
import { getDB } from '../index.js';

const genId = () => `conv_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/**
 * 创建会话
 */
export const createConversation = ({ title, model, systemPrompt }) => {
	const db = getDB();
	const now = Date.now();
	const id = genId();

	db.prepare(
		`INSERT INTO conversations (id, title, model, system_prompt, create_time, update_time)
		 VALUES (?, ?, ?, ?, ?, ?)`,
	).run(id, title || '新会话', model || null, systemPrompt || null, now, now);

	return { id, title: title || '新会话', model, systemPrompt, createTime: now, updateTime: now };
};

/**
 * 列出会话（按 update_time 倒序）
 */
export const listConversations = (limit = 100) => {
	const db = getDB();
	return db
		.prepare(
			`SELECT id, title, model, system_prompt AS systemPrompt,
			        create_time AS createTime, update_time AS updateTime
			 FROM conversations
			 ORDER BY update_time DESC
			 LIMIT ?`,
		)
		.all(limit);
};

/**
 * 获取单条会话
 */
export const getConversation = (id) => {
	const db = getDB();
	return db
		.prepare(
			`SELECT id, title, model, system_prompt AS systemPrompt,
			        create_time AS createTime, update_time AS updateTime
			 FROM conversations WHERE id = ?`,
		)
		.get(id);
};

/**
 * 更新会话（标题 / updateTime）
 */
export const updateConversation = (id, { title }) => {
	const db = getDB();
	const now = Date.now();
	if (typeof title === 'string') {
		db.prepare(`UPDATE conversations SET title = ?, update_time = ? WHERE id = ?`).run(
			title,
			now,
			id,
		);
	} else {
		db.prepare(`UPDATE conversations SET update_time = ? WHERE id = ?`).run(now, id);
	}
	return getConversation(id);
};

/**
 * 刷新会话 update_time（有新消息时）
 */
export const touchConversation = (id) => {
	const db = getDB();
	db.prepare(`UPDATE conversations SET update_time = ? WHERE id = ?`).run(Date.now(), id);
};

/**
 * 删除会话（级联删除消息）
 */
export const deleteConversation = (id) => {
	const db = getDB();
	const result = db.prepare(`DELETE FROM conversations WHERE id = ?`).run(id);
	return result.changes > 0;
};
