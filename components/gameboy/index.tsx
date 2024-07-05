import { useEffect, useState } from "react";
import { Uint16, Uint8 } from "../types";

import CPUStateViewer from "../widgets/cpu-state-viewer";
import styles from "./index.module.css";
import Memory from "../memory";

export type CPUState = {
  PC: Uint16;
  SP: Uint16;
  A: Uint8;
  F: Uint8;
  Z: boolean;
  N: boolean;
  H: boolean;
  C: boolean;
  BC: Uint16;
  DE: Uint16;
  HL: Uint16;
  IR: Uint8;
  prefixed: boolean;
  operandValue: Uint16;
  IE: Uint16;
  IME: boolean;
  Halted: boolean;
};

type Operand = {
  Name: string; // operand name: register, n8/n16 (immediate unsigned value), e8 (immediate signed value), a8/a16 (memory location)
  Bytes: number; // number of bytes the operand takes (optional)
  Immediate: boolean; // is the operand an immediate value or should it be fetched from memory
  Increment: boolean; // should the program counter be incremented after fetching the operand
  Decrement: boolean;
};

type Flags = {
  Z: boolean; // Zero flag: set if the result is zero (all bits are 0)
  N: boolean; // Subtract flag: set if the instruction is a subtraction
  H: boolean; // Half carry flag: set if there was a carry from bit 3 (result is 0x0F)
  C: boolean; // Carry flag: set if there was a carry from bit 7 (result is 0xFF)
};

type Instruction = {
  Mnemonic: string; // instruction mnemonic
  Bytes: number; // number of bytes the instruction takes
  Cycles: number; // number of cycles the instruction takes to execute. The first element is the number of cycles the instruction takes when the condition is met, the second element is the number of cycles the instruction takes when the condition is not met (see RETZ for example)
  Operands: Operand[]; // instruction operands used as function arguments
  Immediate: boolean; // is the operand an immediate value or should it be fetched from memory
  Flags: Flags;
};

export type GameboyState = {
  prevState: CPUState;
  currState: CPUState;
  instruction: Instruction;
};

const defaultCPUState = (): CPUState => ({
  PC: new Uint16(0),
  SP: new Uint16(0),
  A: new Uint8(0),
  F: new Uint8(0),
  Z: false,
  N: false,
  H: false,
  C: false,
  BC: new Uint16(0),
  DE: new Uint16(0),
  HL: new Uint16(0),
  IR: new Uint8(0),
  prefixed: false,
  operandValue: new Uint16(0),
  IE: new Uint16(0),
  IME: false,
  Halted: false,
});

const defaultInstruction = (): Instruction => ({
  Mnemonic: "",
  Bytes: 0,
  Cycles: 0,
  Operands: [],
  Immediate: false,
  Flags: { Z: false, N: false, H: false, C: false },
});

const defaultGameboyState = (): GameboyState => ({
  prevState: defaultCPUState(),
  currState: defaultCPUState(),
  instruction: defaultInstruction(),
});

const Gameboy = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [prevCPUState, setPrevCPUState] = useState<CPUState>(defaultCPUState());
  const [currCPUState, setCurrCPUState] = useState<CPUState>(defaultCPUState());
  const [instruction, setInstruction] = useState<Instruction>(defaultInstruction());

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/gameboy");

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      setPrevCPUState({
        PC:
          message.prevState && message.prevState.PC
            ? new Uint16(message.prevState.PC)
            : new Uint16(0),
        SP:
          message.prevState && message.prevState.SP
            ? new Uint16(message.prevState.SP)
            : new Uint16(0),
        A: message.prevState && message.prevState.A ? new Uint8(message.prevState.A) : new Uint8(0),
        F: message.prevState && message.prevState.F ? new Uint8(message.prevState.F) : new Uint8(0),
        Z: message.prevState && message.prevState.Z,
        N: message.prevState && message.prevState.N,
        H: message.prevState && message.prevState.H,
        C: message.prevState && message.prevState.C,
        BC:
          message.prevState && message.prevState.BC
            ? new Uint16(message.prevState.BC)
            : new Uint16(0),
        DE:
          message.prevState && message.prevState.DE
            ? new Uint16(message.prevState.DE)
            : new Uint16(0),
        HL:
          message.prevState && message.prevState.HL
            ? new Uint16(message.prevState.HL)
            : new Uint16(0),
        IR:
          message.prevState && message.prevState.IR
            ? new Uint8(message.prevState.IR)
            : new Uint8(0),
        prefixed: message.prevState && message.prevState.prefixed,
        operandValue:
          message.prevState && message.prevState.operandValue
            ? new Uint16(message.prevState.operandValue)
            : new Uint16(0),
        IE:
          message.prevState && message.prevState.IE
            ? new Uint16(message.prevState.IE)
            : new Uint16(0),
        IME: message.prevState && message.prevState.IME,
        Halted: message.prevState && message.prevState.Halted,
      } as CPUState);

      setCurrCPUState({
        PC:
          message.currState && message.currState.PC
            ? new Uint16(message.currState.PC)
            : new Uint16(0),
        SP:
          message.currState && message.currState.SP
            ? new Uint16(message.currState.SP)
            : new Uint16(0),
        A: message.currState && message.currState.A ? new Uint8(message.currState.A) : new Uint8(0),
        F: message.currState && message.currState.F ? new Uint8(message.currState.F) : new Uint8(0),
        Z: message.currState && message.currState.Z,
        N: message.currState && message.currState.N,
        H: message.currState && message.currState.H,
        C: message.currState && message.currState.C,
        BC:
          message.currState && message.currState.BC
            ? new Uint16(message.currState.BC)
            : new Uint16(0),
        DE:
          message.currState && message.currState.DE
            ? new Uint16(message.currState.DE)
            : new Uint16(0),
        HL:
          message.currState && message.currState.HL
            ? new Uint16(message.currState.HL)
            : new Uint16(0),
        IR:
          message.currState && message.currState.IR
            ? new Uint8(message.currState.IR)
            : new Uint8(0),
        prefixed: message.currState && message.currState.prefixed,
        operandValue:
          message.currState && message.currState.operandValue
            ? new Uint16(message.currState.operandValue)
            : new Uint16(0),
        IE:
          message.currState && message.currState.IE
            ? new Uint16(message.currState.IE)
            : new Uint16(0),
        IME: message.currState && message.currState.IME,
        Halted: message.currState && message.currState.Halted,
      } as CPUState);

      setInstruction({
        Mnemonic:
          message.instruction && message.instruction.Mnemonic ? message.instruction.Mnemonic : "?",
        Bytes: message.instruction && message.instruction.Bytes ? message.instruction.Bytes : "? ",
        Cycles:
          message.instruction && message.instruction.Cycles ? message.instruction.Cycles : "?",
        Operands:
          message.instruction && message.instruction.Operands ? message.instruction.Operands : [],
        Immediate: message.instruction && message.instruction.Immediate,
        Flags:
          message.instruction && message.instruction.Flags ? { ...message.instruction.Flags } : {},
      } as Instruction);

      console.log("Received gameboy state:", message);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setWs(socket);

    // Clean up WebSocket connection on component unmount
    return () => {
      socket.close();
    };
  }, []);

  const handleStep = () => {
    if (ws) {
      ws.send("step");
    }
  };

  const handleRun = () => {
    if (ws) {
      ws.send("run");
    }
  };

  const handleKeypress = (key: string) => {
    if (ws) {
      ws.send(JSON.stringify({ type: "keypress", key }));
    }
  };

  return (
    <div className={styles.app}>
      <h1>GameBoy Emulator</h1>
      <div>
        <CPUStateViewer state={currCPUState as CPUState} />
        <button onClick={handleStep}>Step</button>
        <button onClick={handleRun}>Run</button>
      </div>
    </div>
  );
};

export default Gameboy;
