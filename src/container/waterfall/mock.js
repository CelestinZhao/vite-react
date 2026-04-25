// 模拟数据生成：类似小红书的图文卡片
// 每条记录含：图片（picsum 随机图，带固定 seed 保证稳定）、标题、作者、点赞数

// 标题混合：短标题（1行）+ 长标题（2行），用于演示标题区可变高度（最多2行省略）
const titles = [
	// —— 一行短标题 ——
	'今日份治愈系下午茶 ☕️',
	'宝藏小众香水分享',
	'今日穿搭｜通勤简约风',
	'夏日必备的5款平价好物',
	'晨间习惯养成第30天打卡',
	'露营初体验，原来这么治愈',
	'我的桌面改造，氛围感拉满',
	'打卡网红书店，不输ins风',
	// —— 两行长标题 ——
	'分享一组最近超爱的春日穿搭灵感｜温柔又显气质，新手也能轻松get',
	'手把手教你拍出氛围感大片：从构图到调色，零基础也能拍出ins风',
	'极简风房间改造全记录，从毛坯到出片，预算3000搞定全屋来抄作业啦',
	'被这家藏在巷子里的小众烘焙店惊艳到了，可颂酥到掉渣，强烈安利！',
	'护肤心得大公开｜敏感肌亲测有效的平价好物，连用三个月皮肤稳定不烂脸',
	'新手友好｜10分钟搞定一份高颜值快手早餐，营养满分还不会胖，打工人必备',
	'秋冬色系美甲合集来啦｜低调又高级的莫兰迪色，搭配大衣毛衣绝绝子',
	'记录一次说走就走的city walk，从胡同到咖啡馆，发现城市里被忽略的美好',
	'在家也能复刻咖啡馆同款拿铁｜手冲、奶泡、拉花详细教程一次讲清楚',
	'周末探店合集｜五家藏在巷子里的宝藏咖啡馆，氛围感、出片率拉满',
	'这家小店真的被我挖到宝了！装修治愈、出品在线，关键还是人均30的价格',
	'一个人的周末也可以过得很精彩｜从早餐到夜跑，超完整的一日独处指南',
];

const authors = [
	'栗子Lili',
	'小鹿酱',
	'芒果不忙',
	'阿尔卑斯🍬',
	'桃子pie',
	'一只鹤',
	'Miya的日常',
	'奶油小方',
	'十里',
	'晚风',
	'云朵先生',
	'Juno',
];

const avatars = Array.from({ length: 12 }, (_, i) => `https://i.pravatar.cc/80?img=${i + 10}`);

// 常见竖版/横版图片尺寸比例
const ratios = [
	{ w: 3, h: 4 },
	{ w: 3, h: 4 },
	{ w: 3, h: 4 }, // 竖版多一些
	{ w: 4, h: 3 },
	{ w: 1, h: 1 },
	{ w: 2, h: 3 },
	{ w: 3, h: 5 },
	{ w: 16, h: 9 },
];

function pick(arr, i) {
	return arr[i % arr.length];
}

function rand(seed) {
	// 简易可复现伪随机
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

/**
 * 按 id 生成一条数据（稳定），便于模拟分页
 * @param {number} id
 */
export function buildItem(id) {
	const ratio = ratios[id % ratios.length];
	// picsum 支持通过 seed 获取稳定图片
	const imgW = 300;
	const imgH = Math.round((imgW * ratio.h) / ratio.w);
	return {
		id,
		title: pick(titles, id + Math.floor(rand(id) * titles.length)),
		author: pick(authors, id + Math.floor(rand(id + 1) * authors.length)),
		avatar: pick(avatars, id),
		likes: Math.floor(rand(id + 7) * 9999),
		imgUrl: `https://picsum.photos/seed/xhs-${id}/${imgW}/${imgH}`,
		imgWidth: imgW,
		imgHeight: imgH,
	};
}

/**
 * 模拟分页接口
 * @param {number} page    从 1 开始
 * @param {number} pageSize
 * @param {number} total   总条数（用于模拟有限数据集）
 */
export function fetchList(page = 1, pageSize = 20, total = 100) {
	return new Promise((resolve) => {
		const start = (page - 1) * pageSize;
		const end = Math.min(start + pageSize, total);
		const list = [];
		for (let i = start; i < end; i++) {
			list.push(buildItem(i));
		}
		// 模拟 300ms 网络延迟
		setTimeout(() => {
			resolve({
				list,
				hasMore: end < total,
				page,
				total,
			});
		}, 300);
	});
}

// ---- HMR 边界声明 ----
// 本文件是纯数据 mock，没有 React 组件，无法走 Fast Refresh；
// 且导出的函数被 useCallback 闭包引用后，普通 HMR 无法刷新已捕获的旧引用。
// 因此显式声明：本文件改动直接整页刷新，保证最新 mock 数据立即生效。
if (import.meta.hot) {
	import.meta.hot.accept(() => {
		window.location.reload();
	});
}

