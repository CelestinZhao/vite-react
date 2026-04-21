/**
 * 单条消息组件
 */
import React from 'react';
import { Tag, Tooltip, MessagePlugin } from 'tdesign-react';
import { UserIcon, FileIcon, CopyIcon, RefreshIcon } from 'tdesign-icons-react';
import MarkdownRenderer from './MarkdownRenderer';
import { MESSAGE_ROLE, ATTACHMENT_TYPE } from '../utils/constants';
import styles from '../index.module.less';

const MessageItem = ({ message, onRegenerate }) => {
	const isUser = message.role === MESSAGE_ROLE.USER;

	// 复制消息内容
	const handleCopy = () => {
		try {
			navigator.clipboard.writeText(message.content || '');
			MessagePlugin.success('已复制');
		} catch {
			MessagePlugin.error('复制失败');
		}
	};

	// 附件展示
	const renderAttachments = () => {
		if (!message.attachments?.length) return null;
		return (
			<div className={styles.attachmentsRow}>
				{message.attachments.map((att, idx) => {
					if (att.type === ATTACHMENT_TYPE.IMAGE) {
						return (
							<div key={idx} className={styles.attachmentImage}>
								<img src={att.data} alt={att.name} />
							</div>
						);
					}
					return (
						<Tag
							key={idx}
							icon={att.type === ATTACHMENT_TYPE.MARKDOWN ? <FileIcon /> : <FileIcon />}
						>
							{att.name}
						</Tag>
					);
				})}
			</div>
		);
	};

	return (
		<div className={`${styles.messageItem} ${isUser ? styles.userMsg : styles.aiMsg}`}>
			{/* 头像 */}
			<div className={styles.avatar}>
				{isUser ? (
					<div className={styles.userAvatar}>
						<UserIcon />
					</div>
				) : (
					<div className={styles.aiAvatar}>AI</div>
				)}
			</div>

			{/* 消息主体 */}
			<div className={styles.messageBody}>
				{/* 消息顶部：模型名称 */}
				{!isUser && message.model && <div className={styles.modelTag}>{message.model}</div>}

				{/* 附件 */}
				{renderAttachments()}

				{/* 正文 */}
				<div className={`${styles.messageContent} ${message.error ? styles.errorMsg : ''}`}>
					{isUser ? (
						<div className={styles.userText}>{message.content}</div>
					) : (
						<MarkdownRenderer content={message.content} loading={message.loading} />
					)}
				</div>

				{/* 操作栏：仅 AI 消息 + 完成状态显示 */}
				{!isUser && !message.loading && message.id !== 'welcome' && (
					<div className={styles.messageActions}>
						<Tooltip content="复制">
							<span className={styles.actionBtn} onClick={handleCopy}>
								<CopyIcon />
							</span>
						</Tooltip>
						<Tooltip content="重新生成">
							<span className={styles.actionBtn} onClick={onRegenerate}>
								<RefreshIcon />
							</span>
						</Tooltip>
					</div>
				)}
			</div>
		</div>
	);
};

export default MessageItem;
