import React, { useEffect, useRef, useState } from 'react';
import { Popup, Tag } from 'tdesign-react';
import { CloseCircleFilledIcon, PlayIcon } from 'tdesign-icons-react';
import { get, noop } from 'lodash';
import classNames from 'classnames';
import MachineLabelPopup from '../MachineLabelPopup';
import { getRemove, getReasonText, hasReason, getTipPopup, getLabelList } from './utils';
import styles from './markItem.module.less';

const labelAnnotationTypeMap = {
	1: 'classificationAnnotation',
	2: 'attributeAnnotations',
	3: 'labelLocationAnnotations',
};

function LabelTag(props) {
	const {
		reDraw, // 是否重绘
		width,
		reason = {},
		drawLine = noop,
		onClick = noop,
		onReasonDelete = noop,
		onReasonInfoChange = noop,
	} = props;
	const { remove, engine, elements, id } = reason || {};
	const { labelAnnotationType, labelAnnotationDetailList } = reason?.reason || {};
	const [style, setStyle] = useState([]);
	const [labelList, setLabelList] = useState(getLabelList(reason));
	const tag = useRef();
	const labelAnnotationDetail = (labelAnnotationDetailList || []).map((item) => ({
		id: item?.labelId,
		cname: item?.cname,
	}));

	const onTagChange = (list) => {
		setLabelList(list);
		const newElements = elements.map((element) => ({
			...element,
			[labelAnnotationTypeMap[labelAnnotationType]]: labelAnnotationType === 1 ? list[0] : list,
		}));
		onReasonInfoChange(id, {
			...reason,
			elements: newElements,
		});
	};

	useEffect(() => {
		const position = tag.current?.getBoundingClientRect();
		setStyle(drawLine(position));
	}, [drawLine, reDraw]);

	useEffect(() => {
		const newList = getLabelList(reason);
		setLabelList(newList);
	}, [reason]);

	return (
		<div className={styles.label}>
			<div className={styles.line} style={style} />
			{remove && (
				<div className={styles['close-icon']} onClick={onReasonDelete}>
					<CloseCircleFilledIcon size={18} />
				</div>
			)}
			<Popup content={getTipPopup(reason?.aiPrediction)} hideEmptyPopup placement="right-top">
				<Tag
					ref={tag}
					className={classNames(styles['label-tag'], {
						[styles.engine]: engine,
						[styles.remove]: getRemove(reason),
					})}
					style={{ width }}
					variant="dark"
					onClick={() => {
						if (hasReason(reason)) {
							onClick();
						}
					}}
				>
					<div className={styles['label-tag-content']}>
						<span>{getReasonText(reason, id, onReasonInfoChange)}</span>
						{labelAnnotationType ? (
							<Popup
								content={
									<MachineLabelPopup
										list={labelAnnotationDetail}
										labelList={labelList}
										onTagChange={onTagChange}
										simpleMode={labelAnnotationType === 1}
									/>
								}
								placement="bottom"
							>
								<span className={styles['play-icon']}>
									<PlayIcon />
								</span>
							</Popup>
						) : null}
						<span className={styles['tag-list']}>
							{labelList.map((label, index) => (
								<span key={`cname_${index}`}>
									{get(label, 'cname')}
									<span style={{ marginLeft: 5 }}>{get(label, 'score')?.toFixed(2)}</span>
									{index < labelList.length - 1 ? '、' : ''}
								</span>
							))}
						</span>
					</div>
				</Tag>
			</Popup>
		</div>
	);
}

export default LabelTag;
