import React, { useRef, useState } from 'react';
import { Popup } from 'tdesign-react';
import { Rnd } from 'react-rnd';
import classNames from 'classnames';
import RejectReasonPopup from './RejectReasonPopup';
import styles from './markItem.module.less';

function MarkItem(props) {
	const {
		value = {}, // 位置信息，x, y, width, height
		engine, // 是否人机协同标签
		placement, // popup位置
		allReasons,
		latestUseReasons,
		selected,
		element,
		aiLabelInfo,
		latestUseKeyWords,
		rejectPopupConfig = {},
		onChange,
		onStopChange,
		onReasonSelect,
		onMarkClick,
	} = props;
	const [visible, setVisible] = useState(true);
	const content = useRef();
	const dragging = useRef(false);

	const onDrag = (e, d) => {
		if (e.target === content.current) {
			dragging.current = true;
			setVisible(false);
			onChange({ ...value, x: d.x, y: d.y });
		}
	};

	const onDragStop = (e, d) => {
		onStopChange({ ...value, x: d.x, y: d.y });
		setVisible(true);
		setTimeout(() => (dragging.current = false), 0);
	};

	const onResize = (e, direction, ref, delta, position) => {
		setVisible(false);
		if (!ref) return;
		const { width, height } = ref.getBoundingClientRect();
		onChange({ width, height, ...position });
	};

	const onResizeStop = (e, direction, ref, delta, position) => {
		if (!ref) return;
		const { width, height } = ref.getBoundingClientRect();
		onStopChange({ width, height, ...position });
		setVisible(true);
		dragging.current = false;
	};

	const onDoubleClick = (e) => e.stopPropagation();

	const onClick = (e) => {
		if (!dragging.current) {
			e.stopPropagation();
			onMarkClick();
		}
	};

	return (
		<Rnd
			className={styles.mark}
			bounds="parent"
			size={{ width: value?.width, height: value?.height }}
			position={{ x: value?.x, y: value?.y }}
			onDragStop={onDragStop}
			onResizeStop={onResizeStop}
			onDrag={onDrag}
			onResize={onResize}
		>
			<Popup
				hideEmptyPopup
				delay={[200, 500]}
				placement={placement}
				content={
					visible ? (
						<RejectReasonPopup
							element={element}
							aiLabelInfo={aiLabelInfo}
							allReasons={allReasons}
							latestUseReasons={latestUseReasons}
							latestUseKeyWords={latestUseKeyWords}
							rejectPopupConfig={rejectPopupConfig}
							onReasonSelect={onReasonSelect}
						/>
					) : null
				}
			>
				<div
					ref={content}
					className={classNames(
						styles.content,
						engine ? styles.engine : '',
						selected ? styles.selected : '',
					)}
					onDoubleClick={onDoubleClick}
					onClick={onClick}
				/>
			</Popup>
		</Rnd>
	);
}

export default MarkItem;
