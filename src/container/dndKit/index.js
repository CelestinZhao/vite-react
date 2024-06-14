import React, { useState } from 'react';
import { Button } from 'tdesign-react';
import { MoveIcon } from 'tdesign-icons-react';
import DndKit from '../../utils/dndKit';
import styles from './index.module.css';

function DragItem(props) {
  const { item, dragHandleProps } = props;

  return (
    <div className={styles.SortableItem}>
      {item.id}
      <div {...dragHandleProps}>
        <Button variant="text" shape="square" icon={<MoveIcon />}/>
      </div>
    </div>
  )
}

export default function DndKitDemo() {
  const [items, setItems] = useState([...new Array(10)].map((_, index) => ({ id: index + 1 })));

  return (
    <div style={{ maxWidth: 500, margin: "30px auto" }}>
      <DndKit
        className={styles.SortableList}
        items={items}
        onChange={setItems}
        renderItem={(item) => (
          <DndKit.Item id={item.id}>
            <DragItem item={item}/>
          </DndKit.Item>
        )}
      />
    </div>
  );
}
