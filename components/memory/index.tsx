import { Uint16 } from "../types";
import styles from "./index.module.css";

export type MemoryWriter = {
  address: Uint16;
  data: string[];
};

export type MemoryProps = MemoryWriter & {
  pc: number;
  bytes: number;
};

const Memory = (props: MemoryProps) => {
  const formatMemoryCell = (value: string, index: number): string => {
    let style = "style.hex_cell";
    // pc is black/yellow
    if (index === props.pc) {
      style += " " + styles.pc;
    }
    // operands are black/light-blue
    else if (index > props.pc && index < props.pc + props.bytes) {
      style += " " + styles.operand;
    }
    // other memory cells are light-blue/black
    return style;
  };

  const printMemory = () => {
    console.log(props.data.length);

    return props.data.map((value, index) => {
      let result = [];
      // Highlight the PC

      if (index % 16 === 0) {
        result.push(<br />);
      }
      result.push(
        <span key={index} className={formatMemoryCell(value.substring(2), index)}>
          {value.substring(2)}
        </span>
      );
      return <>{result}</>;
    });
  };

  return (
    <div>
      <div className={styles.memory_table}>{printMemory()}</div>
    </div>
  );
};

export default Memory;
