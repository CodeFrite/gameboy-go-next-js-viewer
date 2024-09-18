import { MouseEvent } from "react";
import gStyles from "../../styles/globals.module.css";
import { MemoryWrite, uint16, uint8 } from "./../types";
import styles from "./index.module.css";
import { AddBreakPointEvent } from "../events";

export type MemoryProps = {
  memory: MemoryWrite;
  pc: number;
  bytes: number;
  breakPoints?: uint16[];
  viewPort?: "start" | "end" | "pc" | "prev-pc";
  highlightOperand?: boolean;
};

const Memory = (props: MemoryProps) => {
  /**
   * send a custom AddBreakPoint event to the gameboy component which keeps track of the breakpoints being saved
   * @ev the mouse double click event
   * @index the relative address of the memory cell being double clicked
   */
  const handleToggleBreakpoint = (ev: MouseEvent<HTMLSpanElement>, index: number) => {
    ev.preventDefault();
    const customEvent = AddBreakPointEvent({
      memoryName: props.memory.name,
      address: new uint16(index),
    });
    const gameboy = document.getElementById("gameboy");
    if (gameboy) {
      gameboy.dispatchEvent(customEvent);
    }
  };

  /**
   * prints a formatted memory cell
   * @param value the memory cell value to be printed
   * @param index relative to the memory table (0 = first byte of memory, ...)
   * @param style the style to apply to the memory cell (undefined for default style, style.pc for program counter, styles.operand for operand)
   * @returns
   */
  const printMemoryCell = (value: uint8, index: number, style?: string): JSX.Element => {
    const className = style ? styles.hex_cell + " " + style : styles.hex_cell;
    return (
      <span
        key={"hex-cell-" + index + "-" + value}
        className={className}
        onDoubleClick={(ev) => handleToggleBreakpoint(ev, index)}>
        {value.toHex()}
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
    result.push(<br key={"line-break-" + props.memory.name + "-" + line} />);
    // print line memory address
    const address = props.memory.address + line * 16;
    result.push(
      <span
        key={"line-address-" + props.memory.name + "-" + line}
        className={styles.hex_cell + " " + gStyles.color_yellow}>
        {address.toString(16).padStart(4, "0").substring(0, 3).toUpperCase() + "X"}
      </span>
    );
    // print the 16 memory cells of the current line
    result.push(
      ...props.memory.data.slice(line * 16, (line + 1) * 16).map((value, memoryIndex) => {
        const idx = address + memoryIndex;
        // highlight the program counter
        if (props.pc === idx) {
          return printMemoryCell(value, idx, styles.pc);
          // highlight the operands
        } else if (idx > props.pc && idx < props.pc + props.bytes) {
          if (props.highlightOperand === undefined || props.highlightOperand === true) {
            return printMemoryCell(value, idx, styles.operand);
          } else {
            return printMemoryCell(value, idx);
          }
          // highlight the breakpoints
        } else if (props.breakPoints && props.breakPoints.find((bp) => bp.get() === idx)) {
          return printMemoryCell(value, idx, styles.break_point);
        }
        // ... otherwise, print the default memory cell
        else return printMemoryCell(value, idx);
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
        key={"table-label-" + props.memory.name + "-" + line}
        className={`${styles.hex_cell} ${styles.header}`}>
        ADDR
      </span>
    );
    result.push(
      ...Array.from({ length: 16 }, (_, index) => (
        <span
          key={"table-header-" + props.memory.name + "-" + index}
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
    const memoryStartLine = Math.floor((props.pc - props.memory.address) / 16);
    const memoryLineCount = Math.ceil(props.memory.data.length / 16);

    const pcLine = Math.floor((props.pc - props.memory.address) / 16);

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
    // for each line up to line 16 or the last line of memory
    for (
      let line = startLine;
      line < startLine + 16 && line < props.memory.data.length / 16;
      line++
    ) {
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
      <h2 className={styles.memory_name}>{props.memory.name + " >"}</h2>
      <div className={styles.memory_table}>{printMemory()}</div>
    </div>
  );
};

export default Memory;
