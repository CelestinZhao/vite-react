import React, { useState } from 'react';
import { SortableList } from './components/SortableList';
import './SortableItem.css';
import './SortableList.css';

function DragItem(props) {
  const { item, dragHandleProps } = props;

  return (
    <div className="SortableItem">
      {item.id}
      <div {...dragHandleProps}>
        <button className="DragHandle">
          <svg viewBox="0 0 20 20" width="12">
            <path
              d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function DndKit() {
  const [items, setItems] = useState([...new Array(10)].map((_, index) => ({ id: index + 1 })));

  return (
    <div style={{ maxWidth: 500, margin: "30px auto" }}>
      <SortableList
        className="SortableList"
        items={items}
        onChange={setItems}
        renderItem={(item) => (
          <SortableList.Item id={item.id}>
            <DragItem item={item}/>
          </SortableList.Item>
        )}
      />
    </div>
  );
}
