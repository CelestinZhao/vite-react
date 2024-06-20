import React, { useState } from 'react';
import DragComponent from '../../utils/DragComponent';
import DragItem from './DragItem';
import styles from './index.module.css';

const getHorizontalStyle = () => ({
	display: 'flex',
	gap: 20,
});

const getVerticalStyle = () => ({
	display: 'flex',
	gap: 10,
	flexDirection: 'column',
	marginBottom: 50,
});

function DragDemo() {
	const [list, setList] = useState(['示例一', '示例二', '示例三', '示例四']);
	const [list2, setList2] = useState(['示例一', '示例二', '示例三', '示例四']);

	return (
		<div className={styles.list}>
			<DragComponent items={list} onChange={setList} direction="vertical" getListStyle={getVerticalStyle} >
				{
					list.map((item, index) => (
						<DragItem key={index} index={index} item={item} />
					))
				}
			</DragComponent>
			<DragComponent items={list2} onChange={setList2} direction="horizontal" getListStyle={getHorizontalStyle}>
				{
					list2.map((item, index) => (
						<DragItem key={index} index={index} item={item} />
					))
				}
			</DragComponent>
		</div>
	);
}

export default DragDemo;
