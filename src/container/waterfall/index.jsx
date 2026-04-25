import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Card from './Card';
import useWaterfall from './useWaterfall';
import { fetchList } from './mock';
import styles from './index.module.less';

// 固定卡片"非图片"区域的高度估算（标题两行 + 内边距 + 作者栏）
// 用于在布局阶段提前计算卡片总高度，无需等图片加载
const CARD_EXTRA_HEIGHT = 76;

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
	const getExtraHeight = useCallback(() => CARD_EXTRA_HEIGHT, []);
	const { positions, containerHeight, columnWidth } = useWaterfall(items, {
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
