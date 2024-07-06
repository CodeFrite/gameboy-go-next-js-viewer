import { Uint16 } from "../types";
import styles from "./index.module.css";

export type MemoryProps = {
  address: Uint16;
  data: string[];
};

const Memory = (props: MemoryProps) => {
  const printMemory = () =>
    props.data.map((b, index) => <span className={styles.hex_cell}>{b[index]}</span>);

  if (props.data.length === 0) return null;
  return (
    <div>
      <div className={styles.memory_table}>{printMemory()}</div>
    </div>
  );
};

export default Memory;
