import styles from "./index.module.css";

export type MemoryWriter = {
  name: string;
  address: number;
  data: string[];
};

export type MemoryProps = MemoryWriter & {
  pc: number;
  bytes: number;
};

const Memory = (props: MemoryProps) => {
  const pc = props.pc - props.address;
  const formatMemoryCell = (value: string, index: number): string => {
    let style = styles.hex_cell;
    // pc is black/yellow
    if (index === pc) {
      style += " " + styles.pc;
    }
    // operands are black/light-blue
    else if (index > pc && index < pc + props.bytes) {
      style += " " + styles.operand;
    }
    // other memory cells are light-blue/black
    return style;
  };

  const printMemory = () => {
    return props.data.map((value, memoryIndex) => {
      if (memoryIndex >= 16 * 16) return;
      let result = [];
      // Highlight the PC

      if (memoryIndex % 16 === 0) {
        // add memory table header
        if (memoryIndex == 0) {
          result.push(
            <span
              key={"table-label-" + props.name + "-" + memoryIndex}
              className={`${styles.hex_cell} ${styles.header}`}>
              ADDR{" "}
            </span>
          );
          result.push(
            ...Array.from({ length: 16 }, (_, index) => (
              <span
                key={"table-header-" + props.name + "-" + index}
                className={`${styles.hex_cell} ${styles.header}`}>
                X{index.toString(16).toUpperCase()}
              </span>
            ))
          );
        }
        // Add a line break every 16 cells and add the line address
        result.push(<br key={props.name + "-" + memoryIndex} />);
        result.push(
          <span key={"line-header-" + props.name + "-" + memoryIndex} className={styles.address}>
            {(props.address + memoryIndex)
              .toString(16)
              .padStart(4, "0")
              .toUpperCase()
              .substring(0, 3) + "X "}
          </span>
        );
      }
      // add the value of the memory cell
      result.push(
        <span
          key={"cell-" + props.name + "-" + memoryIndex}
          className={formatMemoryCell(value.substring(2), memoryIndex)}>
          {value.substring(2)}
        </span>
      );
      return result;
    });
  };

  return (
    <div>
      <h2 className={styles.memory_name}>{props.name + " >"}</h2>
      <div className={styles.memory_table}>{printMemory()}</div>
    </div>
  );
};

export default Memory;
