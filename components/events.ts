import { uint16 } from "./types";

export enum DebuggerEvents {
  ToggleBreakPoint = "toggle-breakpoint",
}

// add a breakpoint
export type ToggleBreakPointEventDetail = {
  memoryName: string;
  address: uint16;
};
export const AddBreakPointEvent = (detail: ToggleBreakPointEventDetail) =>
  new CustomEvent<ToggleBreakPointEventDetail>(DebuggerEvents.ToggleBreakPoint, { detail });
