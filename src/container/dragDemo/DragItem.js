import React from 'react';
import { ViewListIcon } from 'tdesign-icons-react';

function DragItem(props) {
	const { index, item, dragHandleProps } = props;

	return (
		<div style={{ display: 'flex', gap: 10 }}>
			<div {...dragHandleProps} style={{ display: 'flex' }}>
				<ViewListIcon style={{ display: 'block', fontSize: 18, margin: 'auto' }}/>
			</div>
			<div>{index}. {item}</div>
		</div>
	)
}

export default DragItem;
