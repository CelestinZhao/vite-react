// 卡片中"非标题区域"的固定高度估算
//   = 上下内边距 (10 + 12) + 标题底部 margin (8) + 作者栏高度 (20) + 缓冲 (~6)
export const CARD_FIXED_EXTRA = 56;

// 标题相关参数
export const TITLE_FONT_SIZE = 14; // 与 css 保持一致
export const TITLE_LINE_HEIGHT = TITLE_FONT_SIZE * 1.4; // 19.6px
export const TITLE_MAX_LINES = 2;
// 中文字符按字号近似宽度（中文≈字号宽度），稍微留一点冗余
export const TITLE_AVG_CHAR_WIDTH = TITLE_FONT_SIZE * 1.0;

// 虚拟滚动的上下缓冲区（px），避免快速滚动时出现白屏
export const OVERSCAN = 400;
// 滚动到底部触发加载的阈值
export const LOAD_MORE_THRESHOLD = 600;
export const GAP = 12;
export const PAGE_SIZE = 24;

// 列数根据容器宽度自适应
export function calcColumnCount(width) {
	if (width < 480) return 2;
	if (width < 768) return 3;
	if (width < 1100) return 4;
	if (width < 1500) return 5;
	return 6;
}
