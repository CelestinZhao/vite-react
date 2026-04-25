// 模拟数据生成：类似小红书的图文卡片
// 每条记录含：图片（picsum 随机图，带固定 seed 保证稳定）、标题、作者、点赞数

const titles = [
	'今日份治愈系下午茶 ☕️',
	'一个人的周末，也可以很精彩',
	'分享一组最近超爱的穿搭灵感',
	'记录一次说走就走的city walk',
	'这家小店真的被我挖到宝了！',
	'手把手教你拍出氛围感大片',
	'极简风房间改造，来抄作业啦',
	'夏日必备的5款平价好物',
	'被这家烘焙店的可颂惊艳到了',
	'晨间习惯养成第30天打卡',
	'新手友好｜10分钟快手早餐',
	'秋冬色系美甲合集｜低调又高级',
	'打卡网红书店，不输ins风',
	'露营初体验，原来这么治愈',
	'护肤心得｜敏感肌亲测有效',
	'在家也能做的咖啡馆拿铁',
	'今日穿搭｜通勤简约风',
	'宝藏小众香水分享',
	'周末探店｜藏在巷子里的咖啡馆',
	'我的桌面改造，氛围感拉满',
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
export function fetchList(page = 1, pageSize = 20, total = 1000) {
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
