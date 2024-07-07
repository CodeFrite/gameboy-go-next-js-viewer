import { useEffect, useState } from "react";
import { Uint16, Uint8 } from "../types";
import styles from "./index.module.css";

// Value Watcher: Display the value of a register or memory address and change its color based on the changes
export type ValueWatcherProps = {
  id: string;
  value: Uint8 | Uint16 | boolean | string | number | null | undefined;
};

const ValueWatcher = (props: ValueWatcherProps) => {
  const [state, setState] = useState(props.value);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    setState(props.value);
    setChanged(true);
    const timeout = setTimeout(() => {
      setChanged(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [props.value]);

  return (
    <span className={!changed ? styles.value_watcher : styles.value_watcher_changed}>
      {props.value?.toString()}
    </span>
  );
};

export default ValueWatcher;
