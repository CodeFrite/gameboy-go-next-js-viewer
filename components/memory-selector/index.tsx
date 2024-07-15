import { useRef } from "react";
import Memory, { MemoryWriter } from "../memory";

export type MemorySelectorProps = {
  memories: MemoryWriter[];
  pc: number;
  bytes: number;
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
      pc={props.pc}
      bytes={props.bytes}
      viewPort={props.viewPort}
      highlightOperand={props.highlightOperand}
    />
  );
};

export default MemorySelector;
