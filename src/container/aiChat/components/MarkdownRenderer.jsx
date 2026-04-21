/**
 * 流式 Markdown 渲染组件
 * @description 支持 GFM 语法、代码块高亮、链接新窗口打开等
 */
import React, { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessagePlugin } from 'tdesign-react';
import { CopyIcon } from 'tdesign-icons-react';
import styles from '../index.module.less';

/**
 * 代码块组件（支持复制）
 */
const CodeBlock = ({ inline, className, children }) => {
	const match = /language-(\w+)/.exec(className || '');
	const codeString = String(children).replace(/\n$/, '');

	// 行内代码
	if (inline) {
		return <code className={styles.inlineCode}>{children}</code>;
	}

	const handleCopy = () => {
		try {
			navigator.clipboard.writeText(codeString);
			MessagePlugin.success('代码已复制');
		} catch {
			MessagePlugin.error('复制失败');
		}
	};

	return (
		<div className={styles.codeBlockWrap}>
			<div className={styles.codeBlockHeader}>
				<span className={styles.codeLang}>{match ? match[1] : 'text'}</span>
				<span className={styles.copyBtn} onClick={handleCopy}>
					<CopyIcon />
					复制
				</span>
			</div>
			<pre className={styles.codeBlock}>
				<code>{codeString}</code>
			</pre>
		</div>
	);
};

const MarkdownRenderer = memo(({ content, loading }) => {
	const components = useMemo(
		() => ({
			code: CodeBlock,
			// eslint-disable-next-line no-unused-vars
			a: ({ node, ...props }) => (
				<a {...props} target="_blank" rel="noopener noreferrer" className={styles.markdownLink} />
			),
			// eslint-disable-next-line no-unused-vars
			table: ({ node, ...props }) => (
				<div className={styles.tableWrap}>
					<table className={styles.markdownTable} {...props} />
				</div>
			),
			// eslint-disable-next-line no-unused-vars
			img: ({ node, ...props }) => (
				<img {...props} className={styles.markdownImage} alt={props.alt || ''} />
			),
		}),
		[],
	);

	return (
		<div className={styles.markdownBody}>
			<ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
				{content || ''}
			</ReactMarkdown>
			{loading && <span className={styles.blinkCursor}>▌</span>}
		</div>
	);
});

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;
