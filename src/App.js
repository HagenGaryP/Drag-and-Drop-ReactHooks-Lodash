import React, { useState, useCallback } from "react";
import styled from "styled-components";
import Draggable from './Draggable';
import { inRange, range } from "lodash";

// global variable to set the maximum value for range
const MAX = 5;
// set a constant height for Rect (globally)
const HEIGHT = 80;

function App() {
  const items = range(MAX);
  // add a state to functional component
  const [state, setState] = useState({
    order: items, // for sorting list in idle state
    dragOrder: items, // for sorting list while dragging
    draggedIndex: null, // current drag row in our list
  });

  // handleDrag - useCallback hook
  const handleDrag = useCallback(({translation, id}) => {
    // delta
    const delta = Math.round(translation.y / HEIGHT)

    // index
    const index = state.order.indexOf(id);

    // dragOrder
    const dragOrder = state.order.filter(index => index !== id);

    // check whether position for draggable component is valid
    if (!inRange(index + delta, 0, items.length)) {
      // not valid - so return
      return;
    }
    // if valid, update dragOrder array and update state.
    dragOrder.splice(index + delta, 0, id);
    // update dragOrder and set the draggedIndex to id
    setState(state => ({
      ...state,
      draggedIndex: id,
      dragOrder
    }))
  }, [state.order, items.length]);


  // handleDragEnd - commit changes and update the order array.
  const handleDragEnd = useCallback(() => {
    // update 'order' and reset draggedIndex to null
    setState(state => ({
      ...state,
      order: state.dragOrder,
      draggedIndex: null
    }))
  }, []);

  /***** NOTE for isDragging *****
   after we handle onDragEnd (above), we need to remove the CSS
   transition and calculate the top position differently for
   the dragged element.
  */

  return (
    <Container>
      {/* using lodash with a state set on App component, we will wrap each (mapped) row with our Draggable component, and pass id, onDrag and onDragEnd as props */}
      {items.map((index) => {

        // isDragging - see NOTE for why/how/what
        const isDragging = state.draggedIndex === index;

        // calculate the dragged element top position
        const draggedTop = state.order.indexOf(index) * (HEIGHT + 10);

        // top position for all other elements
        const top = state.dragOrder.indexOf(index) * (HEIGHT + 10);

        // calculate the top position - adding padding of 10px
        // const top = state.order.indexOf(index) * (HEIGHT + 10);

        return (
          <Draggable
            key={index}
            id={index}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          >
          {/* pass props to Rect -> isDragging and also calculate the top position differently for dragged elements */}
            <Rect
              // top={top}
              isDragging={isDragging}
              top={isDragging ? draggedTop : top}
            >
              {index}
            </Rect>
          </Draggable>
        );
      })}

      {/* before using lodash, with original Draggable component */}
      {/* <Draggable>
        <Rect />
      </Draggable> */}
    </Container>
  );
}

export default App;

const Container = styled.div`
  width: 100vw;
  min-height: 100vh;
`;

// Rect - using attrs (attributes) from styled components
// using flex to center content
const Rect = styled.div.attrs(props => ({
  style: {
    top: `${props.top}px`,
    transition: props.isDragging ? 'none' : 'all 500ms',
  }
}))`
  width: 300px;
  height: ${HEIGHT}px;
  user-select: none;
  background: #fff;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: calc(50vw - 150px);
  font-size: 20px;
  color: #777;
`;
/*
Each row is positioned absolutely to the container.
Rect's "top" position is calculated, inside the mapping,
according to the order array
*/



// Rect before update - before using state and lodash

// const Rect = styled.div`
//   width: 200px;
//   height: 200px;
//   background: red;
// `;
