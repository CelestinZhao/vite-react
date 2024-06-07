import React, { useState } from 'react';
import { SortableList } from './components/SortableList';

export default function Index() {
  const [items, setItems] = useState([...new Array(10)].map((_, index) => ({ id: index + 1 })));

  return (
    <div style={{ maxWidth: 500, margin: "30px auto" }}>
      <SortableList
        items={items}
        onChange={setItems}
        renderItem={(item) => (
          <SortableList.Item id={item.id}>
            {item.id}
          </SortableList.Item>
        )}
      />
    </div>
  );
}
