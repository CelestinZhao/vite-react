import React, { useState } from 'react';
import DragComponent from '../../utils/DragComponent';
import DragItem from './DragItem';

function DragDemo() {
	const [list, setList] = useState(['案例一', '案例二', '案例三', '案例四']);

	const onDragEnd = (result) => {
		const newList = Array.from(list);
		const [removed] = newList.splice(result.source.index, 1);
		newList.splice(result.destination.index, 0, removed);
		setList(newList);
	};

	return (
		<DragComponent onDragEnd={onDragEnd}>
			{
				list.map((item, index) => (
					<DragItem key={index} index={index} item={item} />
				))
			}
		</DragComponent>
	);
}

export default DragDemo;
