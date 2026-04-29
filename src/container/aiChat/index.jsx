/**
 * AI 对话页面
 * @description 基于 SSE 的流式 AI 对话页面，支持模型编排、多模态输入（文本、图片、Markdown）
 */
import React, { useState } from 'react';
import { Button, Tooltip } from 'tdesign-react';
import { ClearIcon, ChatMessageIcon } from 'tdesign-icons-react';
import ModelOrchestrator from './components/ModelOrchestrator';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import ConversationList from './components/ConversationList';
import { useSSEChat } from './hooks/useSSEChat';
import { DEFAULT_MODEL_CONFIG } from './utils/constants';
import styles from './index.module.less';

const AiChat = () => {
	// 模型编排配置
	const [modelConfig, setModelConfig] = useState(DEFAULT_MODEL_CONFIG);

	// SSE 对话 Hook
	const {
		conversationId,
		messages,
		loading,
		sendMessage,
		abort,
		clearMessages,
		regenerate,
		loadConversation,
		conversations,
		conversationsLoading,
		fetchConversationList,
		deleteConversation,
	} = useSSEChat();

	// 发送消息（携带模型配置）
	const handleSend = (payload) => {
		sendMessage({ ...payload, modelConfig });
	};

	// 新建会话（清空当前 UI 状态，下次发送即开新会话）
	const handleNewChat = () => {
		clearMessages();
	};

	return (
		<div className={styles.aiChatPage}>
			{/* 左侧：历史会话 + 模型编排 */}
			<aside className={styles.sidebar}>
				<ConversationList
					conversations={conversations}
					activeId={conversationId}
					loading={conversationsLoading}
					onSelect={loadConversation}
					onDelete={deleteConversation}
					onNew={handleNewChat}
					onRefresh={fetchConversationList}
				/>
				<div className={styles.sidebarDivider} />
				<ModelOrchestrator config={modelConfig} onChange={setModelConfig} />
			</aside>

			{/* 右侧：对话区 */}
			<section className={styles.chatMain}>
				{/* 顶部工具栏 */}
				<div className={styles.chatHeader}>
					<div className={styles.headerLeft}>
						<ChatMessageIcon className={styles.headerIcon} />
						<span className={styles.headerTitle}>AI 对话</span>
						<span className={styles.headerSubTitle}>当前模型：{modelConfig.model}</span>
					</div>
					<div className={styles.headerRight}>
						<Tooltip content="清空对话（开启新会话）">
							<Button
								variant="text"
								icon={<ClearIcon />}
								onClick={handleNewChat}
								disabled={loading}
							>
								清空
							</Button>
						</Tooltip>
					</div>
				</div>

				{/* 消息列表 */}
				<MessageList messages={messages} onRegenerate={regenerate} />

				{/* 底部输入区 */}
				<ChatInput loading={loading} onSend={handleSend} onStop={abort} />
			</section>
		</div>
	);
};

export default AiChat;
