import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function DragComponent(props) {
  const { items = [], callback } = props;

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const newItems = Array.from(items);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    callback && callback(newItems);
  };

  return (
    <div>
      {!props.children.length && props.children}
      {
        !!props.children.length && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {
                (provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {
                      props.children.map((item, index) => (
                        <Draggable key={item.key} draggableId={item.key} index={index}>
                          {
                            (provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps}>
                                {React.cloneElement(item, { dragHandleProps: provided.dragHandleProps })}
                              </div>
                            )
                          }
                        </Draggable>
                      ))
                    }
                    {provided.placeholder}
                  </div>
                )
              }
            </Droppable>
          </DragDropContext>
        )
      }
    </div>
  );
}

export default DragComponent;
