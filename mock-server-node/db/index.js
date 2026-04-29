/**
 * 数据库单例与初始化
 * @description 使用 better-sqlite3 同步驱动，启动时自动执行 schema.sql 建表
 */
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// DB 文件路径：mock-server/data/chat.db
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_PATH = path.join(DATA_DIR, 'chat.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;

/**
 * 获取 DB 单例
 */
export const getDB = () => {
	if (db) return db;

	// 确保 data 目录存在
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}

	db = new Database(DB_PATH);

	// 性能与一致性配置
	db.pragma('journal_mode = WAL'); // Write-Ahead Logging，并发读写性能更好
	db.pragma('synchronous = NORMAL');
	db.pragma('foreign_keys = ON');

	// 执行建表 SQL
	const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
	db.exec(schema);

	console.log(`[db] SQLite initialized at ${DB_PATH}`);
	return db;
};

/**
 * 关闭 DB（进程退出时调用）
 */
export const closeDB = () => {
	if (db) {
		db.close();
		db = null;
	}
};
