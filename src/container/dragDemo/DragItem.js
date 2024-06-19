import React from 'react';
import { Button } from 'tdesign-react';
import { ViewListIcon } from 'tdesign-icons-react';
import styles from './index.module.css';

function DragItem(props) {
	const { index, item, dragHandleProps } = props;

	return (
		<div className={styles.SortableItem}>
			<div {...dragHandleProps} style={{ display: 'flex' }}>
				<Button variant="text" shape="square" icon={<ViewListIcon />}/>
			</div>
			<div>{index}. {item}</div>
		</div>
	)
}

export default DragItem;
