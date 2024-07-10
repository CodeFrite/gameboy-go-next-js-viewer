import { useRef } from "react";
import gStyles from "../../styles/globals.module.css";
import styles from "./index.module.css";

export type MemoryWriter = {
  name: string;
  address: number;
  data: string[];
};

export type MemoryProps = MemoryWriter & {
  pc: number;
  bytes: number;
  viewPort?: "start" | "end" | "pc" | "prev-pc";
};

const Memory = (props: MemoryProps) => {
  /**
   *
   * @param index relative to the memory table (0 = first byte of memory, ...)
   * @returns
   */
  const printMemoryCell = (value: string, index: number): JSX.Element => {
    return (
      <span key={"hex-cell-" + index + "-" + value} className={styles.hex_cell}>
        {value.substring(2)}
      </span>
    );
  };

  /**
   *
   * @param index relative to the memory table (0 = first byte of memory, ...)
   * @returns
   */
  const printPC = (value: string, index: number): JSX.Element => {
    return (
      <span key={"pc-cell-" + index + "-" + value} className={styles.hex_cell + " " + styles.pc}>
        {value.substring(2)}
      </span>
    );
  };

  /**
   *
   * @param index relative to the memory table (0 = first byte of memory, ...)
   * @returns
   */
  const printOperand = (value: string, index: number): JSX.Element => {
    return (
      <span
        key={"operand-cell-" + index + "-" + value}
        className={styles.hex_cell + " " + styles.operand}>
        {value.substring(2)}
      </span>
    );
  };

  /**
   *
   * @param line relatively to the memory table (0 = first 16 bytes of memory, ...)
   * @returns
   */
  const printMemoryLine = (line: number): JSX.Element[] => {
    let result: JSX.Element[] = [];
    // print line break
    result.push(<br key={"line-break-" + props.name + "-" + line} />);
    // print line memory address
    const address = props.address + line * 16;
    result.push(
      <span
        key={"line-address-" + props.name + "-" + line}
        className={styles.hex_cell + " " + gStyles.color_yellow}>
        {address.toString(16).padStart(4, "0").substring(0, 3) + "X"}
      </span>
    );
    // print the 16 memory cells of the current line
    result.push(
      ...props.data.slice(line * 16, (line + 1) * 16).map((value, memoryIndex) => {
        // highlight the program counter
        if (props.pc === address + memoryIndex) {
          return printPC(value, address + memoryIndex);
          // highlight the operands
        } else if (
          address + memoryIndex > props.pc &&
          address + memoryIndex < props.pc + props.bytes
        ) {
          return printOperand(value, address + memoryIndex);
        }
        return printMemoryCell(value, address + memoryIndex);
      })
    );
    return result;
  };

  /**
   *
   * @param line relatively to the memory table (0 = first 16 bytes of memory, ...)
   * @returns
   */
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

  /**
   *
   * @returns the line from which to start rendering the memory table relatively to the memory table (0 = first 16 bytes of memory, ...)
   */
  const getStartLine = (): number => {
    const memoryStartLine = Math.floor((props.pc - props.address) / 16);
    const memoryLineCount = Math.ceil(props.data.length / 16);

    const pcLine = Math.floor((props.pc - props.address) / 16);

    switch (props.viewPort) {
      case "start":
        return 0;
        break;
      case "end":
        if (memoryLineCount <= 16) {
          return 0;
        } else {
          return memoryLineCount - 16;
        }
        break;
      case "pc":
        if (pcLine < 8) {
          return 0;
        } else if (pcLine <= memoryLineCount - 8) {
          return pcLine - 8;
        } else {
          return memoryLineCount - 16;
        }
        break;
      case "prev-pc":
        return 0;
      default:
        return 0;
    }
  };

  const printMemory = (): JSX.Element[] => {
    let result: JSX.Element[] = [];
    // depending on the mode, the first line from which to render will be different
    const startLine = getStartLine();
    console.log("startLine", startLine);
    // for each line up to line 16 or the last line of memory
    for (let line = startLine; line < startLine + 16 && line < props.data.length / 16; line++) {
      // add memory table header before rendering the first memory line
      if (line === startLine) {
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
