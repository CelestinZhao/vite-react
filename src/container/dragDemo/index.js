import React, { useState } from 'react';
import { Space } from 'tdesign-react';
import DragComponent from '../../utils/DragComponent';
import DragItem from './DragItem';

const getHorizontalStyle = () => ({
	display: 'flex',
	gap: 20,
});

const getVerticalStyle = () => ({
	display: 'flex',
	gap: 10,
	flexDirection: 'column',
});

function DragDemo() {
	const [list, setList] = useState(['示例一', '示例二', '示例三', '示例四']);
	const [list2, setList2] = useState(['示例一', '示例二', '示例三', '示例四']);

	return (
		<Space size="large" direction="vertical">
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
		</Space>
	);
}

export default DragDemo;
