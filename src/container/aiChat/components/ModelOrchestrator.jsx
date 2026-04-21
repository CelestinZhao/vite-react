/**
 * 模型编排面板
 * @description 支持选择模型、配置 temperature、max_tokens、topP、system prompt 等参数
 */
import React from 'react';
import { Select, Slider, InputNumber, Switch, Textarea, Tooltip } from 'tdesign-react';
import { InfoCircleIcon } from 'tdesign-icons-react';
import { MODEL_OPTIONS } from '../utils/constants';
import styles from '../index.module.less';

const LabelWithTip = ({ label, tip }) => (
	<div className={styles.configLabel}>
		<span>{label}</span>
		{tip && (
			<Tooltip content={tip} placement="top">
				<InfoCircleIcon className={styles.infoIcon} />
			</Tooltip>
		)}
	</div>
);

const ModelOrchestrator = ({ config, onChange }) => {
	// 更新单个字段
	const handleUpdate = (key, value) => {
		onChange({ ...config, [key]: value });
	};

	return (
		<div className={styles.orchestrator}>
			<div className={styles.orchestratorTitle}>模型编排</div>

			{/* 模型选择 */}
			<div className={styles.configItem}>
				<LabelWithTip label="模型" tip="选择用于对话的大语言模型" />
				<Select
					value={config.model}
					options={MODEL_OPTIONS}
					onChange={(val) => handleUpdate('model', val)}
					placeholder="请选择模型"
				/>
			</div>

			{/* Temperature */}
			<div className={styles.configItem}>
				<LabelWithTip
					label={`Temperature: ${config.temperature}`}
					tip="控制输出的随机性，值越高回复越多样，越低越确定"
				/>
				<Slider
					value={config.temperature}
					min={0}
					max={2}
					step={0.1}
					onChange={(val) => handleUpdate('temperature', val)}
				/>
			</div>

			{/* Top P */}
			<div className={styles.configItem}>
				<LabelWithTip label={`Top P: ${config.topP}`} tip="核采样参数，控制候选词范围" />
				<Slider
					value={config.topP}
					min={0}
					max={1}
					step={0.05}
					onChange={(val) => handleUpdate('topP', val)}
				/>
			</div>

			{/* 最大 Token */}
			<div className={styles.configItem}>
				<LabelWithTip label="最大输出 Token" tip="单次回复的最大长度" />
				<InputNumber
					value={config.maxTokens}
					min={256}
					max={128000}
					step={256}
					theme="column"
					style={{ width: '100%' }}
					onChange={(val) => handleUpdate('maxTokens', val)}
				/>
			</div>

			{/* 流式输出开关 */}
			<div className={styles.configItem}>
				<div className={styles.switchRow}>
					<LabelWithTip label="流式输出" tip="开启后 AI 会逐字返回内容" />
					<Switch value={config.stream} onChange={(val) => handleUpdate('stream', val)} />
				</div>
			</div>

			{/* 系统提示词 */}
			<div className={styles.configItem}>
				<LabelWithTip label="系统提示词 (System Prompt)" tip="设置 AI 的角色和行为规则" />
				<Textarea
					value={config.systemPrompt}
					onChange={(val) => handleUpdate('systemPrompt', val)}
					placeholder="例如：你是一个专业的 AI 助手..."
					autosize={{ minRows: 4, maxRows: 8 }}
				/>
			</div>
		</div>
	);
};

export default ModelOrchestrator;
