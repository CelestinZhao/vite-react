/**
 * 消息列表组件
 * @description 展示对话消息，自动滚动到底部
 */
import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import styles from '../index.module.less';

const MessageList = ({ messages, onRegenerate }) => {
	const listRef = useRef(null);

	// 消息更新时自动滚动到底部
	useEffect(() => {
		if (!listRef.current) return;
		// 使用 requestAnimationFrame 确保 DOM 更新完成后再滚动
		requestAnimationFrame(() => {
			if (listRef.current) {
				listRef.current.scrollTop = listRef.current.scrollHeight;
			}
		});
	}, [messages]);

	return (
		<div className={styles.messageList} ref={listRef}>
			{messages.map((msg) => (
				<MessageItem key={msg.id} message={msg} onRegenerate={onRegenerate} />
			))}
		</div>
	);
};

export default MessageList;
