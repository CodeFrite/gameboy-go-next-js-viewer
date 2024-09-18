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
  const memoryIndex = useRef(0);

  const findMemoryIndexAtPC = (): number => {
    return props.memories.findIndex((value, index) => {
      if (props.pc >= value.address && props.pc < value.address + value.data.length) {
        return true;
      }
    });
  };

  const saveMemoryIndexAtPC = () => {
    memoryIndex.current = findMemoryIndexAtPC();
  };

  saveMemoryIndexAtPC();

  return (
    <Memory
      key={"memory-selector-" + props.memories[memoryIndex.current].name}
      memory={props.memories[memoryIndex.current]}
      breakPoints={
        props.breakPoints?.find(
          (mbp) => mbp.memoryName === props.memories[memoryIndex.current].name
        )?.addresses ?? []
      }
      pc={props.pc}
      bytes={props.bytes}
      viewPort={props.viewPort}
      highlightOperand={props.highlightOperand}
    />
  );
};

export default MemorySelector;
