import React, { useEffect, useRef, useState } from 'react';
import { Divider, Input, Link, Loading, Select, Tag, TreeSelect } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import { isEqual, isFunction, get, noop, uniqBy } from 'lodash';
import classNames from 'classnames';
import ReasonList from '../reject-reason-drawer/components/_common/ReasonList';
import HighlightFragment from '../reject-reason-drawer/components/RejectReasonDrawer/HighlightFragment';
import filterReason from '../reject-reason-drawer/components/RejectReasonDrawer/utils/filterReason';
import levelReason from '../reject-reason-drawer/components/RejectReasonDrawer/utils/levelReason';
import { getElementField } from '../reject-reason-drawer/components/RejectReasonDrawer/getElementField';
import { REJECT_REASON_INDUSTRY } from '../reject-reason-drawer/consts/RejectReasonIndustry';
import styles from './rejectReasonPopup.module.css';

const onClickDeal = (e) => e.stopPropagation();

function RejectReasonPopup(props) {
	const {
		element = {},
		aiLabelInfo = {},
		allReasons = [],
		latestUseReasons = [],
		latestUseKeyWords = [],
		rejectPopupConfig,
		onReasonSelect = noop,
	} = props;
	const { showV5SelectFilter, showThreeLevelAbbreviation, labelTreeList, asyncGetTop20List } =
		rejectPopupConfig || {};
	const [keyWordsStr, setKeyWordsStr] = useState('');
	const [reasonFilters, setReasonFilters] = useState([]);
	const [filterLabels, setFilterLabels] = useState([]);
	const [labelList, setLabelList] = useState([]);
	const [loadingTop20, setLoadingTop20] = useState(false);
	const [top20List, setTop20List] = useState([]);
	const prevElementRef = useRef();

	const getTop20List = async () => {
		if (!top20List.length) {
			if (loadingTop20) {
				return;
			}
			setLoadingTop20(true);
			const result = await asyncGetTop20List();
			setTop20List(result || []);
			setLoadingTop20(false);
		} else {
			setTop20List([]);
		}
	};

	const getFinalReasons = () => {
		if (showV5SelectFilter && labelList?.length) {
			return uniqBy(allReasons.concat(latestUseReasons), 'reviewPolicyId');
		}
		const reasonFilter = reasonFilters.find((item) =>
			['applyIndustry', 'gzhElementTypeList', 'rejectReasonLabelId'].includes(item?.field),
		);
		if (keyWordsStr || !!reasonFilter) {
			return allReasons.concat(latestUseReasons);
		}
		return latestUseReasons?.length ? latestUseReasons : allReasons;
	};

	const filteredReasons = filterReason(
		getFinalReasons(),
		true,
		reasonFilters,
		keyWordsStr,
		labelList,
	);
	const needLevelReason =
		filteredReasons.length &&
		keyWordsStr &&
		keyWordsStr.trim() &&
		get(filteredReasons, '0.applyType') === 'Creative' &&
		filteredReasons.find((item) => item.version === 2);
	let afterInterceptReasons;
	let count;
	if (needLevelReason) {
		({ reasons: afterInterceptReasons, count } = levelReason(
			filteredReasons,
			allReasons,
			keyWordsStr,
		));
	} else {
		afterInterceptReasons = [...filteredReasons].slice(0, 100);
		count = Math.min(100, filteredReasons.length);
	}

	useEffect(() => {
		if (!isEqual(prevElementRef.current, element)) {
			const checkedElementTypes = [];
			const elementsHitLabels = [];
			const { channelElementReviewInfoMap } = element;
			const elementType = getElementField(element, 'elementType');
			if (checkedElementTypes.indexOf(elementType) === -1) {
				checkedElementTypes.push(elementType);
			}
			if (channelElementReviewInfoMap) {
				const channelReviewInfo = channelElementReviewInfoMap['0'];
				if (
					channelReviewInfo &&
					channelReviewInfo.rejectReasonLabels &&
					channelReviewInfo.rejectReasonLabels.length
				) {
					channelReviewInfo.rejectReasonLabels.forEach((labelId) => {
						if (labelId && elementsHitLabels.findIndex((item) => item.value === labelId) === -1) {
							elementsHitLabels.push({
								label: aiLabelInfo[labelId],
								value: labelId,
								field: 'rejectReasonLabelId',
							});
						}
					});
				}
			}
			setFilterLabels(elementsHitLabels);
			const newReasonFilters = [...reasonFilters];
			const elementTypeFilter = newReasonFilters.find(
				(item) => item.field === 'applyElementTypeList',
			);
			if (elementTypeFilter) {
				elementTypeFilter.value = checkedElementTypes;
			} else {
				newReasonFilters.push({
					type: 'field',
					value: checkedElementTypes,
					field: 'applyElementTypeList',
				});
			}
			setReasonFilters(newReasonFilters);
			prevElementRef.current = element;
		}
	}, [element, aiLabelInfo, reasonFilters]);

	return (
		<div className={styles.container} onClick={onClickDeal} onDoubleClick={onClickDeal}>
			<div className={styles['search-bar']}>
				<div className={`spaui-search has-search ${styles['spaui-search']}`}>
					<Input
						prefixIcon={<SearchIcon />}
						style={{ height: '36px' }}
						placeholder="请输入关键词，多个关键词以空格隔开"
						onChange={(v) => setKeyWordsStr(v)}
						value={keyWordsStr}
					/>
					{latestUseKeyWords && latestUseKeyWords.length ? (
						<div className={`spaui-search-addons ${styles['spaui-search-addons']}`}>
							{latestUseKeyWords.map((word) => (
								<a
									href="javascript:void(0);"
									key={word}
									title={word}
									onClick={() => {
										setKeyWordsStr(word);
									}}
								>
									<span>{word.length > 5 ? `${word.substr(0, 6)}...` : word}</span>
								</a>
							))}
						</div>
					) : null}
				</div>
			</div>
			<div className={styles['smart-labels-bar']}>
				<div style={{ display: 'flex', gap: 10 }}>
					<div>
						<Select
							placeholder={'全部行业分类'}
							width={105}
							borderless
							clearable={true}
							options={REJECT_REASON_INDUSTRY}
							onChange={(value) => {
								const industryFilter = reasonFilters.find((item) => item.field === 'applyIndustry');
								if (industryFilter) {
									const newReasonFilter = [...reasonFilters];
									const index = newReasonFilter.indexOf(industryFilter);
									if (value) {
										newReasonFilter[index].value = value;
									} else {
										newReasonFilter.splice(index, 1);
									}
									setReasonFilters(newReasonFilter);
								} else {
									const newReasonFilter = [...reasonFilters];
									newReasonFilter.push({
										field: 'applyIndustry',
										value,
									});
									setReasonFilters(newReasonFilter);
								}
							}}
							value={reasonFilters.find((item) => item.field === 'applyIndustry')?.value}
							clear={true}
						/>
					</div>
					{!!showV5SelectFilter && (
						<div>
							<TreeSelect
								data={labelTreeList}
								value={labelList}
								onChange={setLabelList}
								autoWidth
								placeholder="V5标签库"
								multiple
								clearable
								filterable
								borderless
								minCollapsedNum={1}
								popupProps={{ placement: 'bottom-right', overlayClassName: 'v5-tree-select' }}
								tagProps={{ maxWidth: 120 }}
							/>
						</div>
					)}
				</div>
				{!!filterLabels.length && (
					<div className={styles['smart-labels']}>
						{filterLabels.map((item, index) => (
							<Link
								key={index}
								hover="color"
								className={classNames({
									[styles.active]: reasonFilters.find(
										(f) => item.field === f.field && item.value === f.value,
									),
								})}
								onClick={() => {
									const newReasonFilters = [...reasonFilters];
									const thisFieldFilter = newReasonFilters.find(
										(innerItem) => innerItem.field === item.field,
									);
									if (thisFieldFilter) {
										if (thisFieldFilter.value === item.value) {
											newReasonFilters.splice(newReasonFilters.indexOf(thisFieldFilter), 1);
										} else {
											newReasonFilters[newReasonFilters.indexOf(thisFieldFilter)].value =
												item.value;
										}
									} else {
										newReasonFilters.push({
											type: 'field',
											value: item.value,
											field: item.field,
										});
									}
									setReasonFilters(newReasonFilters);
								}}
							>
								{item.field === 'rejectReasonLabelId' ? aiLabelInfo[item.value] : item.label}
							</Link>
						))}
					</div>
				)}
				{isFunction(asyncGetTop20List) && (
					<div>
						<Tag
							shape="round"
							theme="primary"
							variant="light"
							style={{ cursor: 'pointer' }}
							onClick={getTop20List}
						>
							<div style={{ display: 'flex', gap: 5 }}>
								<Loading size={'14px'} loading={loadingTop20} />
								<span>可能想搜</span>
							</div>
						</Tag>
					</div>
				)}
			</div>
			<div className={styles['reason-list-container']}>
				{!!top20List.length && (
					<div>
						<h4 style={{ fontSize: 16, margin: '20px 20px 0 20px' }}>该通道top20四级标签</h4>
						<ReasonList
							reasons={top20List}
							selectReason={onReasonSelect}
							showThreeLevelAbbreviation={showThreeLevelAbbreviation}
							theme={'label-style'}
						/>
						<Divider style={{ margin: '10px 0' }} />
					</div>
				)}
				{needLevelReason ? (
					afterInterceptReasons.map((item, index) => {
						const reviewPolicyId = get(item, 'reviewPolicyId');
						const threeLevelReasonName = item.reviewPolicyName;
						const children = get(item, 'children');

						return threeLevelReasonName ? (
							<div key={reviewPolicyId || index} className={styles['reason-section']}>
								{threeLevelReasonName && (
									<p className={styles['level-3']}>
										<HighlightFragment
											description={threeLevelReasonName}
											keyWordStr={keyWordsStr}
										/>
									</p>
								)}
								<ReasonList
									reasons={children}
									selectReason={onReasonSelect}
									keyWordStr={keyWordsStr}
									showThreeLevelAbbreviation
									theme={'label-style'}
								/>
							</div>
						) : (
							<ReasonList
								key={index}
								reasons={children}
								selectReason={onReasonSelect}
								keyWordStr={keyWordsStr}
								showThreeLevelAbbreviation
								theme={'label-style'}
							/>
						);
					})
				) : (
					<ReasonList
						theme={'label-style'}
						reasons={afterInterceptReasons}
						selectReason={onReasonSelect}
						keyWordStr={keyWordsStr}
						latestChecked
						showThreeLevelAbbreviation
					/>
				)}
				<p className={styles['reason-tip']}>
					共{filteredReasons.length}条，当前展示前{count}条，更多条目请搜索...
				</p>
			</div>
		</div>
	);
}

export default RejectReasonPopup;
