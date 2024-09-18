import { MutableRefObject, useRef, useState } from "react";

/** Solves the issue of using a callback in a hook and getting at the same time:
 * - the current value of the state through a ref
 * - the setter function of the state
 * - the state itself with its property of rerendering and hence triggering the return statement of the hook
 * For an example of use, see the useInputPortHub hook
 */
const useCallBackState = <T>(initialValue: T): [T, (value: T) => void, MutableRefObject<T>] => {
  const [state, setState] = useState(initialValue);
  const stateRef = useRef(state);

  // set the stateRef when the state changes
  const setterState = (value: T) => {
    setState(value);
    stateRef.current = value;
  };

  return [state, setterState, stateRef];
};

export default useCallBackState;
