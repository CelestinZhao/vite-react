import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Card from './Card';
import useWaterfall from './useWaterfall';
import { fetchList } from './mock';
import styles from './index.module.less';

// 卡片中"非标题区域"的固定高度估算
//   = 上下内边距 (10 + 12) + 标题底部 margin (8) + 作者栏高度 (20) + 缓冲 (~6)
const CARD_FIXED_EXTRA = 56;
// 标题相关参数
const TITLE_FONT_SIZE = 14; // 与 css 保持一致
const TITLE_LINE_HEIGHT = TITLE_FONT_SIZE * 1.4; // 19.6px
const TITLE_MAX_LINES = 2;
// 中文字符按字号近似宽度（中文≈字号宽度），稍微留一点冗余
const TITLE_AVG_CHAR_WIDTH = TITLE_FONT_SIZE * 1.0;

// 列数根据容器宽度自适应
function calcColumnCount(width) {
	if (width < 480) return 2;
	if (width < 768) return 3;
	if (width < 1100) return 4;
	if (width < 1500) return 5;
	return 6;
}

// 虚拟滚动的上下缓冲区（px），避免快速滚动时出现白屏
const OVERSCAN = 400;
// 滚动到底部触发加载的阈值
const LOAD_MORE_THRESHOLD = 600;
const GAP = 12;
const PAGE_SIZE = 24;

function Waterfall() {
	// ================= 容器尺寸监听 =================
	const scrollerRef = useRef(null);
	const [size, setSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const el = scrollerRef.current;
		if (!el) return undefined;

		const update = () => {
			// clientWidth 包含 padding，需要减去左右 padding 得到真正可用内容宽度
			// 否则卡片会从 padding 内侧开始铺，但总宽按 clientWidth 计算，导致溢出
			const cs = window.getComputedStyle(el);
			const pl = parseFloat(cs.paddingLeft) || 0;
			const pr = parseFloat(cs.paddingRight) || 0;
			setSize({
				width: Math.max(0, el.clientWidth - pl - pr),
				height: el.clientHeight,
			});
		};
		update();

		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const columnCount = useMemo(() => calcColumnCount(size.width), [size.width]);

	// ================= 数据 & 分页 =================
	const [items, setItems] = useState([]);
	const [page, setPage] = useState(0);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const loadingRef = useRef(false);

	const loadMore = useCallback(async () => {
		if (loadingRef.current || !hasMore) return;
		loadingRef.current = true;
		setLoading(true);
		try {
			const next = page + 1;
			const res = await fetchList(next, PAGE_SIZE);
			setItems((prev) => prev.concat(res.list));
			setHasMore(res.hasMore);
			setPage(next);
		} finally {
			loadingRef.current = false;
			setLoading(false);
		}
	}, [page, hasMore]);

	// 首次加载
	useEffect(() => {
		loadMore();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ================= 瀑布流布局 =================
	// 提前算一份 columnWidth（与 useWaterfall 内部口径保持一致），
	// 供 getExtraHeight 使用来估算标题行数（1 行或 2 行）。
	const columnWidth = useMemo(() => {
		if (!size.width || !columnCount) return 0;
		return (size.width - GAP * (columnCount - 1)) / columnCount;
	}, [size.width, columnCount]);

	// 根据标题字符数 + 当前列宽估算标题占 1 行还是 2 行（最多 2 行省略），
	// 从而提前算出准确的卡片总高度，让布局更贴合真实渲染结果。
	const getExtraHeight = useCallback(
		(item) => {
			const title = item?.title || '';
			// 当前列内容宽度 = columnWidth - 左右 padding(12*2)
			const titleContentWidth = Math.max(0, columnWidth - 24);
			const charsPerLine = Math.max(1, Math.floor(titleContentWidth / TITLE_AVG_CHAR_WIDTH));
			const estimatedLines = Math.min(
				TITLE_MAX_LINES,
				Math.max(1, Math.ceil(title.length / charsPerLine)),
			);
			return CARD_FIXED_EXTRA + estimatedLines * TITLE_LINE_HEIGHT;
		},
		[columnWidth],
	);
	const { positions, containerHeight } = useWaterfall(items, {
		containerWidth: size.width,
		columnCount,
		gap: GAP,
		getExtraHeight,
	});

	// ================= 虚拟滚动 =================
	const [scrollTop, setScrollTop] = useState(0);
	// rAF 节流，避免 scroll 事件过于频繁触发 setState
	const tickingRef = useRef(false);

	const onScroll = useCallback(
		(e) => {
			const target = e.currentTarget;
			if (!tickingRef.current) {
				tickingRef.current = true;
				requestAnimationFrame(() => {
					setScrollTop(target.scrollTop);
					// 检测是否接近底部
					const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
					if (distanceToBottom < LOAD_MORE_THRESHOLD) {
						loadMore();
					}
					tickingRef.current = false;
				});
			}
		},
		[loadMore],
	);

	// 根据 scrollTop 计算可见 items
	// 由于 positions 已按 index 顺序记录，直接线性过滤即可。
	// 数据量巨大时可改用按列分桶 + 二分查找优化。
	const visibleItems = useMemo(() => {
		if (!positions.length || !size.height) return [];
		const viewTop = scrollTop - OVERSCAN;
		const viewBottom = scrollTop + size.height + OVERSCAN;

		const result = [];
		for (let i = 0; i < positions.length; i++) {
			const p = positions[i];
			if (!p) continue;
			const top = p.y;
			const bottom = p.y + p.height;
			if (bottom < viewTop) continue;
			if (top > viewBottom) break; // items 后续不一定严格递增（多列），但整体趋势递增，配合 overscan 足够安全
			result.push({ item: items[i], pos: p });
		}
		return result;
	}, [positions, items, scrollTop, size.height]);

	return (
		<div className={styles.page}>
			<header className={styles.header}>
				<h2 className={styles.logo}>🌸 瀑布流广场</h2>
				<span className={styles.subtitle}>
					已加载 {items.length} 条 · {columnCount} 列 · 虚拟渲染 {visibleItems.length} 条
				</span>
			</header>

			<div className={styles.scroller} ref={scrollerRef} onScroll={onScroll}>
				<div className={styles.canvas} style={{ height: containerHeight, width: size.width }}>
					{visibleItems.map(({ item, pos }) => (
						<div
							key={item.id}
							className={styles.cardWrap}
							style={{
								transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
								width: columnWidth,
							}}
						>
							<Card item={item} width={columnWidth} imgHeight={pos.imgHeight} />
						</div>
					))}
				</div>

				<div className={styles.footer}>
					{loading && <span className={styles.loading}>加载中...</span>}
					{!hasMore && !loading && <span className={styles.end}>— 我也是有底线的 —</span>}
				</div>
			</div>
		</div>
	);
}

export default Waterfall;
