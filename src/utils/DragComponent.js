import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { noop } from 'lodash';

/**
 * props.direction String 拖拽方向
 * props.getListStyle Function 获取list样式方法
 * props.onDragEnd Function 拖拽结束后的回调
 * @returns {JSX.Element}
 * @constructor
 */

function DragComponent(props) {
  const { direction = 'vertical', getListStyle = noop } = props;

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    props.onDragEnd && props.onDragEnd(result);
  };

  return (
    <div>
      {!props.children.length && props.children}
      {
        !!props.children.length && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable" direction={direction}>
              {
                (provided, snapshot) => (
                  <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)} {...provided.droppableProps}>
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
