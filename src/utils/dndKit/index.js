import React, { useMemo, useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { SortableOverlay } from './SortableOverlay';

export default function DndKit(props) {
  const { className, items, onChange, renderItem } = props;
  const [active, setActive] = useState(null);
  const activeItem = useMemo(() => (
    items.find((item) => item.id === active?.id)
  ), [active, items]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragStart = ({ active }) => {
    setActive(active);
  };

  const onDragEnd = ({ active, over }) => {
    if (over && active.id !== over?.id) {
      const activeIndex = items.findIndex(({ id }) => id === active.id);
      const overIndex = items.findIndex(({ id }) => id === over.id);
      onChange(arrayMove(items, activeIndex, overIndex));
    }
    setActive(null);
  };

  const onDragCancel = () => {
    setActive(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <SortableContext items={items}>
        <ul className={className} role="application">
          {
            items.map((item) => (
              <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>
            ))
          }
        </ul>
      </SortableContext>
      <SortableOverlay>
        {activeItem ? renderItem(activeItem) : null}
      </SortableOverlay>
    </DndContext>
  );
}

DndKit.Item = SortableItem;
