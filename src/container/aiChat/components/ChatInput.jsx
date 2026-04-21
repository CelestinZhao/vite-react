/**
 * 聊天输入区组件
 * @description 支持文本输入、图片/MD/TXT 文件上传、快捷键发送、停止生成
 */
import React, { useState, useRef } from 'react';
import { Button, Textarea, Upload, Tooltip, MessagePlugin } from 'tdesign-react';
import {
	AttachIcon,
	SendIcon,
	ImageIcon,
	FileIcon,
	StopCircleIcon,
	CloseIcon,
} from 'tdesign-icons-react';
import {
	ATTACHMENT_TYPE,
	ACCEPT_FILE_TYPES,
	MAX_FILE_SIZE,
	MAX_ATTACHMENT_COUNT,
} from '../utils/constants';
import styles from '../index.module.less';

const ChatInput = ({ loading, onSend, onStop }) => {
	const [text, setText] = useState('');
	const [attachments, setAttachments] = useState([]);
	const textareaRef = useRef(null);

	/**
	 * 处理文件上传
	 */
	const handleFileChange = async (fileList) => {
		const file = fileList[0];
		if (!file) return;

		const { raw } = file;

		// 大小校验
		if (raw.size > MAX_FILE_SIZE) {
			MessagePlugin.warning(`文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`);
			return;
		}

		// 附件数量校验
		if (attachments.length >= MAX_ATTACHMENT_COUNT) {
			MessagePlugin.warning(`最多支持上传 ${MAX_ATTACHMENT_COUNT} 个附件`);
			return;
		}

		const isImage = raw.type.startsWith('image/');
		const isMd = raw.name.endsWith('.md');
		const isTxt = raw.name.endsWith('.txt') || raw.type === 'text/plain';

		try {
			if (isImage) {
				// 图片转 base64（mock 场景），实际业务应上传到 COS
				const reader = new FileReader();
				reader.onload = (e) => {
					setAttachments((prev) => [
						...prev,
						{ type: ATTACHMENT_TYPE.IMAGE, data: e.target.result, name: raw.name, size: raw.size },
					]);
				};
				reader.onerror = () => MessagePlugin.error('图片读取失败');
				reader.readAsDataURL(raw);
			} else if (isMd || isTxt) {
				const content = await raw.text();
				setAttachments((prev) => [
					...prev,
					{
						type: isMd ? ATTACHMENT_TYPE.MARKDOWN : ATTACHMENT_TYPE.FILE,
						data: content,
						name: raw.name,
						size: raw.size,
					},
				]);
			} else {
				MessagePlugin.warning('暂不支持该文件类型，请上传图片、.md 或 .txt 文件');
			}
		} catch (e) {
			MessagePlugin.error('文件处理失败');
			console.error(e);
		}
	};

	/**
	 * 移除附件
	 */
	const handleRemoveAttachment = (idx) => {
		setAttachments((prev) => prev.filter((_, i) => i !== idx));
	};

	/**
	 * 发送消息
	 */
	const handleSend = () => {
		if (loading) return;
		if (!text.trim() && attachments.length === 0) {
			MessagePlugin.warning('请输入内容或上传附件');
			return;
		}

		onSend({
			content: text.trim(),
			attachments: [...attachments],
		});

		// 清空输入
		setText('');
		setAttachments([]);
	};

	/**
	 * 快捷键：
	 *  - Enter：发送消息
	 *  - Shift / Ctrl / Cmd + Enter：换行（使用浏览器默认行为）
	 *  - 中文输入法组合中的 Enter（isComposing）不触发发送
	 */
	const handleKeydown = (val, { e }) => {
		console.log(e.key, e.isComposing, e.shiftKey, e.metaKey, e.ctrlKey);
		if (e.key !== 'Enter') return;

		// 输入法组合期间，不触发发送（避免中文候选词确认误发）
		if (e.isComposing || e.keyCode === 229) return;

		// 组合键：换行，走默认行为即可
		if (e.shiftKey || e.ctrlKey || e.metaKey) return;

		// 纯 Enter：阻止换行，触发发送
		e.preventDefault();
		handleSend();
	};

	/**
	 * 附件图标
	 */
	const getAttachmentIcon = (type) => {
		if (type === ATTACHMENT_TYPE.IMAGE) return <ImageIcon />;
		return <FileIcon />;
	};

	return (
		<div className={styles.chatInput}>
			{/* 附件预览区 */}
			{attachments.length > 0 && (
				<div className={styles.attachmentsPreview}>
					{attachments.map((att, idx) => (
						<div key={idx} className={styles.attachmentChip}>
							{att.type === ATTACHMENT_TYPE.IMAGE ? (
								<img src={att.data} alt={att.name} className={styles.chipThumb} />
							) : (
								<span className={styles.chipIcon}>{getAttachmentIcon(att.type)}</span>
							)}
							<span className={styles.chipName} title={att.name}>
								{att.name}
							</span>
							<span className={styles.chipClose} onClick={() => handleRemoveAttachment(idx)}>
								<CloseIcon />
							</span>
						</div>
					))}
				</div>
			)}

			{/* 输入区 */}
			<div className={styles.inputWrap}>
				<Textarea
					ref={textareaRef}
					value={text}
					onChange={setText}
					onKeydown={handleKeydown}
					placeholder="输入消息，Enter 发送，Shift + Enter 换行"
					autosize={{ minRows: 2, maxRows: 6 }}
					className={styles.textareaBox}
					disabled={loading}
				/>

				<div className={styles.inputFooter}>
					<div className={styles.inputLeft}>
						{/* 附件上传 */}
						<Upload
							theme="custom"
							accept={ACCEPT_FILE_TYPES}
							autoUpload={false}
							multiple={false}
							showUploadProgress={false}
							onChange={handleFileChange}
						>
							<Tooltip content="上传图片 / Markdown / 文本文件">
								<Button variant="text" shape="square" icon={<AttachIcon />} disabled={loading} />
							</Tooltip>
						</Upload>

						<span className={styles.tipText}>支持图片、.md、.txt 文件</span>
					</div>

					<div className={styles.inputRight}>
						{loading ? (
							<Button theme="default" icon={<StopCircleIcon />} onClick={onStop}>
								停止
							</Button>
						) : (
							<Button theme="primary" icon={<SendIcon />} onClick={handleSend}>
								发送
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChatInput;
