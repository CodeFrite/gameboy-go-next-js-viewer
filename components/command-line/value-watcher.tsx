import { useEffect, useState } from "react";
import { Uint16, Uint8 } from "../types";

// Value Watcher: Display the value of a register or memory address and change its color based on the changes
export type ValueWatcherProps = {
  id: string;
  value: Uint8 | Uint16 | boolean | string | number | null | undefined;
};

const ValueWatcher = (props: ValueWatcherProps) => {
  const [state, setState] = useState(props.value);

  useEffect(() => {
    setState(props.value);
    // play css animation$
    const watcher = document.querySelector(".value-watcher");
    watcher?.classList.add("changed");
  }, [props.value]);

  return <span className="value-watcher">{props.value?.toString()}</span>;
};

export default ValueWatcher;
