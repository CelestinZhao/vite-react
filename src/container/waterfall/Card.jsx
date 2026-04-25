// 单张卡片组件：小红书风格——图片 + 标题 + 作者 + 点赞
import React, { useState, memo } from 'react';
import styles from './card.module.less';

function Card({ item, width, imgHeight }) {
	const [loaded, setLoaded] = useState(false);

	return (
		<div className={styles.card} style={{ width }}>
			<div className={styles.imgWrap} style={{ height: imgHeight }}>
				{!loaded && <div className={styles.imgSkeleton} />}
				<img
					className={styles.img}
					src={item.imgUrl}
					alt={item.title}
					loading="lazy"
					style={{ opacity: loaded ? 1 : 0 }}
					onLoad={() => setLoaded(true)}
				/>
			</div>
			<div className={styles.body}>
				<div className={styles.title}>{item.title}</div>
				<div className={styles.footer}>
					<div className={styles.author}>
						<img className={styles.avatar} src={item.avatar} alt={item.author} />
						<span className={styles.name}>{item.author}</span>
					</div>
					<div className={styles.likes}>
						<svg viewBox="0 0 24 24" width="14" height="14" fill="#ff2442">
							<path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6C19 16.5 12 21 12 21z" />
						</svg>
						<span>{formatLikes(item.likes)}</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function formatLikes(n) {
	if (n >= 10000) return `${(n / 10000).toFixed(1)}w`;
	if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
	return n;
}

export default memo(Card);
