import { useRef } from "react";
import Memory from "../memory";
import { MemoryWrite } from "../types";
import { MemoryBreakPoint } from "../gameboy";

export type MemorySelectorProps = {
  memories: MemoryWrite[];
  pc: number;
  bytes: number;
  breakPoints?: MemoryBreakPoint[];
  viewPort?: "start" | "end" | "pc" | "prev-pc";
  highlightOperand?: boolean;
};

const MemorySelector = (props: MemorySelectorProps) => {
  const findMemoryIndexAtPC = (): number => {
    return props.memories.findIndex((value, index) => {
      if (props.pc >= value.address && props.pc < value.address + value.data.length) {
        return true;
      }
    });
  };

  const pcIndex = findMemoryIndexAtPC();

  return (
    <Memory
      key={"memory-selector-" + props.memories[pcIndex].name}
      memory={props.memories[pcIndex]}
      breakPoints={
        props.breakPoints?.find((mbp) => mbp.memoryName === props.memories[pcIndex].name)
          ?.addresses ?? []
      }
      pc={props.pc}
      bytes={props.bytes}
      viewPort={props.viewPort}
      highlightOperand={props.highlightOperand}
    />
  );
};

export default MemorySelector;
