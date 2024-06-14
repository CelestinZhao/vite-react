import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem({ children, id }) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style}>
      {
        React.cloneElement(children, { dragHandleProps: { ...attributes, ...listeners, ref: setActivatorNodeRef } })
      }
    </li>
  );
}
