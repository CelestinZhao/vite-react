/**
 * 历史会话列表组件
 * @description
 *   - 展示会话列表（按 updateTime 倒序，后端已排好）
 *   - 点击切换会话
 *   - hover 显示删除按钮
 *   - 顶部提供"新建会话"按钮
 */
import React from 'react';
import { Button, Popconfirm, Tooltip } from 'tdesign-react';
import { AddIcon, DeleteIcon, ChatMessageIcon, RefreshIcon } from 'tdesign-icons-react';
import styles from '../index.module.less';

const ConversationList = ({
	conversations = [],
	activeId,
	loading = false,
	onSelect,
	onDelete,
	onNew,
	onRefresh,
}) => {
	return (
		<div className={styles.convPanel}>
			{/* 顶部操作栏 */}
			<div className={styles.convHeader}>
				<div className={styles.convHeaderTitle}>
					<ChatMessageIcon className={styles.convHeaderIcon} />
					<span>历史会话</span>
					{conversations.length > 0 && (
						<span className={styles.convCount}>{conversations.length}</span>
					)}
				</div>
				<div className={styles.convHeaderActions}>
					<Tooltip content="刷新">
						<Button
							variant="text"
							size="small"
							shape="square"
							icon={<RefreshIcon />}
							onClick={onRefresh}
							loading={loading}
						/>
					</Tooltip>
				</div>
			</div>

			{/* 新建会话按钮 */}
			<Button
				block
				theme="primary"
				variant="outline"
				icon={<AddIcon />}
				className={styles.convNewBtn}
				onClick={onNew}
			>
				新建会话
			</Button>

			{/* 列表 */}
			<div className={styles.convList}>
				{conversations.length === 0 && !loading && (
					<div className={styles.convEmpty}>暂无历史会话</div>
				)}
				{conversations.map((item) => {
					const isActive = item.id === activeId;
					return (
						<div
							key={item.id}
							className={`${styles.convItem} ${isActive ? styles.convItemActive : ''}`}
							onClick={() => onSelect?.(item.id)}
							title={item.title || '未命名会话'}
						>
							<div className={styles.convItemMain}>
								<div className={styles.convItemTitle}>{item.title || '未命名会话'}</div>
								<div className={styles.convItemMeta}>
									{item.model && <span className={styles.convModelTag}>{item.model}</span>}
									<span className={styles.convTime}>{item.updateTime}</span>
								</div>
							</div>
							<Popconfirm
								content="确定删除这个会话吗？"
								onConfirm={() => onDelete?.(item.id)}
							>
								<span
									className={styles.convItemDelete}
									onClick={(e) => e.stopPropagation()}
									role="button"
									aria-label="删除会话"
								>
									<DeleteIcon />
								</span>
							</Popconfirm>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default ConversationList;
