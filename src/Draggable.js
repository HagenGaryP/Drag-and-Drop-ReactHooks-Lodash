import React, { useEffect, useState, useMemo, useCallback } from "react";

/*
after we have our draggable component, can use it to create a sortable list
add props to draggable component - onDrag, onDragEnd, and id,
then add those to the Callback dependencies arrays.
Using those props, we can use the element's translation and ID for sorting our list with onDrag inside of "handleMouseMove".
*/
const POSITION = { x: 0, y: 0 };

const Draggable = ({ children, onDrag, onDragEnd, id }) => {
  // adding a state to our functional component
  const [state, setState] = useState({
    isDragging: false, // flag to know if dragging the element
    origin: POSITION, // used for cursor position on mousedown
    translation: POSITION, // element's position relative to origin's
  });

  // adding inline styles to our component with the useMemo hook
  const styles = useMemo(
    () => ({
      // define the cursor, using the isDragging flag
      cursor: state.isDragging ? "-webkit-grabbing" : "-webkit-grab",
      // define transform, using the translation from the state
      transform: `translate(${state.translation.x}px, ${state.translation.y}px)`,
      // define transition - if we are in dragging mode we don't want any transition
      transition: state.isDragging ? "none" : "transform 500ms",
      // while dragging, we want our zIndex to be higher
      zIndex: state.isDragging ? 2 : 1,
      position: state.isDragging ? "absolute" : "relative",
    }),
    [state.isDragging, state.translation]
  );

  // handleMouseDown with the useCallback hook, getting client x, y
  const handleMouseDown = useCallback(({ clientX, clientY }) => {
    /* include everything from previous state, but also set the isDragging flag to true, and  save cursor position under state
     */
    setState((state) => ({
      ...state,
      isDragging: true,
      origin: { x: clientX, y: clientY },
    }));
  }, []);

  // adding event handlers with useCallback hook to handle mouseMove
  const handleMouseMove = useCallback(
    ({ clientX, clientY }) => {
      // calculate the element translation relative to origin position
      const translation = {
        x: clientX - state.origin.x,
        y: clientY - state.origin.y,
      };
      // store this in state
      setState((state) => ({
        ...state,
        translation,
      }));

      onDrag({ translation, id });
    },
    [state.origin, onDrag, id]
  );

  // event handler for mouseUp - dependency of onDragEnd
  const handleMouseUp = useCallback(() => {
    // reset the isDragging flag to false
    setState((state) => ({
      ...state,
      isDragging: false,
    }));

    onDragEnd();
  }, [onDragEnd]);

  useEffect(() => {
    if (state.isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      // if not dragging - remove event listeners
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      // set the state, and reset the translation
      setState((state) => ({ ...state, translation: POSITION }));
    }
  }, [state.isDragging, handleMouseMove, handleMouseUp]); // add the dependencies array, to know what to listen for

  // add a mouseDown event to the div - invoking the handle CB
  return (
    <div style={styles} onMouseDown={handleMouseDown}>
      {children}
    </div>
  );
};

export default Draggable;

// original draggable component - before using it to create a sortable list.

// const Draggable = ({ children }) => {
//   const POSITION = { x: 0, y: 0 };
//   // adding a state to our functional component
//   const [state, setState] = useState({
//     isDragging: false, // flag to know if dragging the element
//     origin: POSITION, // used for cursor position on mousedown
//     translation: POSITION, // element's position relative to origin's
//   });

//   // adding inline styles to our component with the useMemo hook
//   const styles = useMemo(
//     () => ({
//       // define the cursor, using the isDragging flag
//       cursor: state.isDragging ? "-webkit-grabbing" : "-webkit-grab",
//       // define transform, using the translation from the state
//       transform: `translate(${state.translation.x}px, ${state.translation.y}px)`,
//       // define transition - if we are in dragging mode we don't want any transition
//       transition: state.isDragging ? "none" : "transform 500ms",
//       // while dragging, we want our zIndex to be higher
//       zIndex: state.isDragging ? 2 : 1,
//       position: state.isDragging ? "absolute" : "relative",
//     }),
//     [state.isDragging, state.translation]
//   );

//   /**

//    useMemo will only recompute the memoized value when one of the deps has changed.

//     Usage note: if calling useMemo with a referentially stable function, also give it as the input in the second argument.

//     function expensive () { ... }

//     function Component () {
//       const expensiveResult = useMemo(expensive, [expensive])
//       return ...
//     }
//     @version — 16.8.0
//     @see — https://reactjs.org/docs/hooks-reference.html#u
//    */

//   // handleMouseDown with the useCallback hook, getting client x, y
//   const handleMouseDown = useCallback(({ clientX, clientY }) => {
//     /* include everything from previous state, but also set the isDragging flag to true, and  save cursor position under state
//      */
//     setState((state) => ({
//       ...state,
//       isDragging: true,
//       origin: { x: clientX, y: clientY },
//     }));
//   }, []);

//   // adding event handlers with useCallback hook to handle mouseMove
//   const handleMouseMove = useCallback(
//     ({ clientX, clientY }) => {
//       // calculate the element translation relative to origin position
//       const translation = {
//         x: clientX - state.origin.x,
//         y: clientY - state.origin.x,
//       };
//       // store this in state
//       setState((state) => ({
//         ...state,
//         translation,
//       }));
//     },
//     [state.origin]
//   );

//   // event handler for mouseUp
//   const handleMouseUp = useCallback(() => {
//     // reset the isDragging flag to false
//     setState((state) => ({
//       ...state,
//       isDragging: false,
//     }));
//   }, []);

//   /**
//     * useCallback(callback: (...args: any[]) => any, deps: React.DependencyList): (...args: any[]) => any
//     useCallback will return a memoized version of the callback that only changes if one of the inputs has changed.
//     @version — 16.8.0
//     @see — https://reactjs.org/docs/hooks-reference.html#usecallback
//     */

//   /* The useEffect hook - where we are subscribing to changes
//      we add the event listeners for when we're dragging.

//      When the user releases the mouse, we remove those event listeners and reset the CSS translation
//     */
//   useEffect(() => {
//     if (state.isDragging) {
//       window.addEventListener("mousemove", handleMouseMove);
//       window.addEventListener("mouseup", handleMouseUp);
//     } else {
//       // if not dragging - remove event listeners
//       window.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("mouseup", handleMouseUp);

//       // set the state, and reset the translation
//       setState((state) => ({ ...state, translation: POSITION }));
//     }
//   }, [state.isDragging, handleMouseMove, handleMouseUp]); // add the dependencies array, to know what to listen for

//   // add a mouseDown event to the div - invoking the handle CB
//   return (
//     <div style={styles} onMouseDown={handleMouseDown}>
//       {children}
//     </div>
//   );
// };

// export default Draggable;
