import { useMemo, useRef } from 'react';

/**
 * 瀑布流布局 Hook
 * - 接收 items，按"最短列优先"算法为每一项计算 (x, y, width, height)
 * - 支持动态列数（容器宽度变化时重排）
 * - 返回整体内容高度 containerHeight，供外层撑开滚动条
 *
 * 性能优化：
 *   - 增量布局：新增 item 时只计算新增部分，不重排已有 item
 *   - 仅当列数/列宽变化时才做全量重排
 *   - 使用 useMemo 同步计算（render 阶段），避免 useEffect 异步导致引用不更新的问题
 *
 * @param {Array}  items                 数据数组，每项必须含 imgWidth / imgHeight
 * @param {Object} options
 * @param {number} options.containerWidth 容器宽度
 * @param {number} options.columnCount    列数
 * @param {number} options.gap            列间距
 * @param {(item)=>number} options.getExtraHeight  除图片外的其它高度（文字、作者栏等）
 */
export default function useWaterfall(items, options) {
	const { containerWidth, columnCount, gap, getExtraHeight } = options;

	// 用 ref 缓存上一轮结果，以便在新增 item 时做增量布局
	const cacheRef = useRef({
		layoutKey: '',
		count: 0,
		columnHeights: [],
		positions: [],
	});

	const columnWidth = useMemo(() => {
		if (!containerWidth || !columnCount) return 0;
		return (containerWidth - gap * (columnCount - 1)) / columnCount;
	}, [containerWidth, columnCount, gap]);

	const { positions, containerHeight } = useMemo(() => {
		if (!columnWidth || columnCount <= 0 || !items.length) {
			return { positions: [], containerHeight: 0 };
		}

		const layoutKey = `${columnCount}-${columnWidth}-${gap}`;
		const cache = cacheRef.current;
		const needFullRelayout =
			cache.layoutKey !== layoutKey || items.length < cache.count;

		let columnHeights;
		let newPositions;
		let startIndex;

		if (needFullRelayout) {
			columnHeights = new Array(columnCount).fill(0);
			newPositions = [];
			startIndex = 0;
		} else {
			// 增量：基于缓存继续追加（拷贝一份以返回新引用）
			columnHeights = cache.columnHeights.slice();
			newPositions = cache.positions.slice();
			startIndex = cache.count;
		}

		for (let i = startIndex; i < items.length; i++) {
			const item = items[i];
			const imgH =
				item.imgWidth && item.imgHeight
					? (columnWidth * item.imgHeight) / item.imgWidth
					: columnWidth;
			const extra = getExtraHeight ? getExtraHeight(item) : 0;
			const height = imgH + extra;

			// 找最矮列
			let minCol = 0;
			for (let c = 1; c < columnCount; c++) {
				if (columnHeights[c] < columnHeights[minCol]) minCol = c;
			}
			const x = minCol * (columnWidth + gap);
			const y = columnHeights[minCol];

			newPositions[i] = { x, y, width: columnWidth, height, imgHeight: imgH };
			columnHeights[minCol] = y + height + gap;
		}

		// 更新缓存
		cacheRef.current = {
			layoutKey,
			count: items.length,
			columnHeights,
			positions: newPositions,
		};

		const maxH = columnHeights.length ? Math.max(...columnHeights) : 0;
		return { positions: newPositions, containerHeight: maxH };
	}, [items, columnCount, columnWidth, gap, getExtraHeight]);

	return {
		positions,
		containerHeight,
		columnWidth,
	};
}
