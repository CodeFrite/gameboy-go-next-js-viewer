import styles from "./index.module.css";
import gStyles from "../../styles/globals.module.css";
import { BrandColor } from "../command-line/types";

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
  const printMemoryCell = (index: number): JSX.Element => {
    const value: string = props.data[index].toString();

    return (
      <span key={"cell-" + props.name + "-" + index} className={styles.hex_cell}>
        {value.substring(2)}
      </span>
    );
  };

  const printPC = (index: number): JSX.Element => {
    return (
      <span key={"cell-" + props.name + "-" + index} className={styles.hex_cell + " " + styles.pc}>
        {props.data[index].substring(2)}
      </span>
    );
  };

  const printOperand = (index: number): JSX.Element => {
    return (
      <span
        key={"cell-" + props.name + "-" + index}
        className={styles.hex_cell + " " + styles.operand}>
        {props.data[index].substring(2)}
      </span>
    );
  };
  const printMemoryLine = (line: number): JSX.Element[] => {
    let result: JSX.Element[] = [];
    // print line break
    result.push(<br key={"line-break-" + props.name + "-" + line} />);
    // print line memory address
    result.push(
      <span
        key={"line-address-" + props.name + "-" + line}
        className={styles.hex_cell + " " + gStyles.color_yellow}>
        {(props.address + line * 16).toString(16).padStart(4, "0").substring(0, 3) + "X"}
      </span>
    );
    // print the 16 memory cells of the current line
    result.push(
      ...props.data.slice(line * 16, (line + 1) * 16).map((value, memoryIndex) => {
        // highlight the program counter
        if (props.pc === line * 16 + memoryIndex) {
          return printPC(line * 16 + memoryIndex);
          // highlight the operands
        } else if (props.pc >= props.address + line * 16 + memoryIndex) {
          return printOperand(line * 16 + memoryIndex);
        }
        return printMemoryCell(line * 16 + memoryIndex);
      })
    );
    return result;
  };

  const printMemoryTableHeader = (line: number): JSX.Element[] => {
    // display 'ADDR' and 'X0' to 'XF' as memory table header
    let result: JSX.Element[] = [];
    result.push(
      <span
        key={"table-label-" + props.name + "-" + line}
        className={`${styles.hex_cell} ${styles.header}`}>
        ADDR
      </span>
    );
    result.push(
      ...Array.from({ length: 16 }, (_, index) => (
        <span
          key={"table-header-" + props.name + "-" + index}
          className={`${styles.hex_cell} ${styles.header}`}>
          X{index.toString(16).toUpperCase().substring(0, 3)}
        </span>
      ))
    );
    return result;
  };

  const printMemory = (): JSX.Element[] => {
    let result: JSX.Element[] = [];
    // for each line up to line 16
    for (let line = 0; line < 16; line++) {
      // add memory table header before rendering the first memory line
      if (line === 0) {
        result.push(...printMemoryTableHeader(line));
      }
      // print the memory line
      result.push(...printMemoryLine(line));
    }
    return result;
  };

  return (
    <div>
      <h2 className={styles.memory_name}>{props.name + " >"}</h2>
      <div className={styles.memory_table}>{printMemory()}</div>
    </div>
  );
};

export default Memory;
