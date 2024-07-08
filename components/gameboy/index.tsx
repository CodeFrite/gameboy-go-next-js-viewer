import { useEffect, useState } from "react";
import { Uint16, Uint8 } from "../types";

import Memory, { MemoryWriter } from "../memory";
import CPUStateViewer from "../widgets/cpu-state-viewer";
import FlagRegistersViewer from "../widgets/flag-registers-viewer";
import styles from "./index.module.css";
import InstructionViewer from "../widgets/instruction-viewer";

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

export type Operand = {
  name: string; // operand name: register, n8/n16 (immediate unsigned value), e8 (immediate signed value), a8/a16 (memory location)
  bytes: number; // number of bytes the operand takes (optional)
  immediate: boolean; // is the operand an immediate value or should it be fetched from memory
  increment: boolean; // should the program counter be incremented after fetching the operand
  decrement: boolean;
};

type Flags = {
  Z: string | boolean; // Zero flag: set if the result is zero (all bits are 0)
  N: string | boolean; // Subtract flag: set if the instruction is a subtraction
  H: string | boolean; // Half carry flag: set if there was a carry from bit 3 (result is 0x0F)
  C: string | boolean; // Carry flag: set if there was a carry from bit 7 (result is 0xFF)
};

export type Instruction = {
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
  memory: MemoryWriter[];
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
  memory: [{ name: "", address: 0x0000, data: [] }],
});

// TODO! Move this to server-go and expose through d.ts file
type MessageType = {
  ConnectionMessageType: 0; // initial client http connection even before upgrading to websocket
  CommandMessageType: 10; // sends a command to the server (message.data: 'step', 'reset')
  ErrorMessageType: 60; // notifies the client of an error (message.data: string)
  GameboyStateMessageType: 70; // notifies the client of the current gameboy state (message.data: GameboyState)
  CPUStateMessageType: 71; // notifies the client of the current CPU state (message.data: CpuState)
  MemoryStateMessageType: 72; // notifies the client of a memory write (message.data: MemoryWrite) // TODO! should be an array []MemoryWrite that retrieves only changes and not whole memory state
};

type Message<T> = {
  Type: MessageType; // Message type
  Data: T; // Message data
};

const Gameboy = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [prevCPUState, setPrevCPUState] = useState<CPUState>(defaultCPUState());
  const [currCPUState, setCurrCPUState] = useState<CPUState>(defaultCPUState());
  const [instruction, setInstruction] = useState<Instruction>(defaultInstruction());
  const [memory, setMemory] = useState<MemoryWriter[]>([
    {
      name: "",
      address: 0,
      data: [] as string[],
    },
  ]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/gameboy");

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      //TODO! switch case on message.Type
      setPrevCPUState({
        PC:
          message.data.prevState && message.data.prevState.PC
            ? new Uint16(message.data.prevState.PC)
            : new Uint16(0),
        SP:
          message.data.prevState && message.data.prevState.SP
            ? new Uint16(message.data.prevState.SP)
            : new Uint16(0),
        A:
          message.data.prevState && message.data.prevState.A
            ? new Uint8(message.data.prevState.A)
            : new Uint8(0),
        F:
          message.data.prevState && message.data.prevState.F
            ? new Uint8(message.data.prevState.F)
            : new Uint8(0),
        Z: message.data.prevState && message.data.prevState.Z,
        N: message.data.prevState && message.data.prevState.N,
        H: message.data.prevState && message.data.prevState.H,
        C: message.data.prevState && message.data.prevState.C,
        BC:
          message.data.prevState && message.data.prevState.BC
            ? new Uint16(message.data.prevState.BC)
            : new Uint16(0),
        DE:
          message.data.prevState && message.data.prevState.DE
            ? new Uint16(message.data.prevState.DE)
            : new Uint16(0),
        HL:
          message.data.prevState && message.data.prevState.HL
            ? new Uint16(message.data.prevState.HL)
            : new Uint16(0),
        IR:
          message.data.prevState && message.data.prevState.IR
            ? new Uint8(message.data.prevState.IR)
            : new Uint8(0),
        prefixed: message.data.prevState && message.data.prevState.prefixed,
        operandValue:
          message.data.prevState && message.data.prevState.operandValue
            ? new Uint16(message.data.prevState.operandValue)
            : new Uint16(0),
        IE:
          message.data.prevState && message.data.prevState.IE
            ? new Uint16(message.data.prevState.IE)
            : new Uint16(0),
        IME: message.data.prevState && message.data.prevState.IME,
        Halted: message.data.prevState && message.data.prevState.Halted,
      } as CPUState);

      setCurrCPUState({
        PC:
          message.data.currState && message.data.currState.PC
            ? new Uint16(message.data.currState.PC)
            : new Uint16(0),
        SP:
          message.data.currState && message.data.currState.SP
            ? new Uint16(message.data.currState.SP)
            : new Uint16(0),
        A:
          message.data.currState && message.data.currState.A
            ? new Uint8(message.data.currState.A)
            : new Uint8(0),
        F:
          message.data.currState && message.data.currState.F
            ? new Uint8(message.data.currState.F)
            : new Uint8(0),
        Z: message.data.currState && message.data.currState.Z,
        N: message.data.currState && message.data.currState.N,
        H: message.data.currState && message.data.currState.H,
        C: message.data.currState && message.data.currState.C,
        BC:
          message.data.currState && message.data.currState.BC
            ? new Uint16(message.data.currState.BC)
            : new Uint16(0),
        DE:
          message.data.currState && message.data.currState.DE
            ? new Uint16(message.data.currState.DE)
            : new Uint16(0),
        HL:
          message.data.currState && message.data.currState.HL
            ? new Uint16(message.data.currState.HL)
            : new Uint16(0),
        IR:
          message.data.currState && message.data.currState.IR
            ? new Uint8(message.data.currState.IR)
            : new Uint8(0),
        prefixed: message.data.currState && message.data.currState.prefixed,
        operandValue:
          message.data.currState && message.data.currState.operandValue
            ? new Uint16(message.data.currState.operandValue)
            : new Uint16(0),
        IE:
          message.data.currState && message.data.currState.IE
            ? new Uint16(message.data.currState.IE)
            : new Uint16(0),
        IME: message.data.currState && message.data.currState.IME,
        Halted: message.data.currState && message.data.currState.Halted,
      } as CPUState);

      if (message.data && message.data.instruction) {
        setInstruction({
          Mnemonic: message.data.instruction.mnemonic ? message.data.instruction.mnemonic : "?",
          Bytes: message.data.instruction.bytes ? message.data.instruction.bytes : "? ",
          Cycles: message.data.instruction.cycles ? message.data.instruction.cycles : "?",
          Operands: message.data.instruction.operands ? message.data.instruction.operands : [],
          Immediate: message.data.instruction.immediate,
          Flags: message.data.instruction.flags ? { ...message.data.instruction.flags } : {},
        } as Instruction);
      }

      if (message.data && message.data.memoryWrites) {
        setMemory([...message.data.memoryWrites]);
      }
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

  const renderMemoryWrites = () =>
    memory.map((mw, index) => {
      return (
        <Memory
          name={mw.name}
          key={index}
          address={mw.address}
          data={mw.data}
          pc={currCPUState.PC.get()}
          bytes={instruction.Bytes}
        />
      );
    });

  return (
    /* App */
    <div className={styles.app_container}>
      {/* Left Column */}
      <div className={styles.column}>
        <br />
        {/* LOGO */}
        <div className={styles.logo_container}>
          <div className={styles.app_name}>gameboy-go</div>
          <div className={styles.codefrite}>.codefrite</div>
          <div className={styles.dev}>.dev</div>
        </div>
        {/* Memory Container 1 */}
        <div className={styles.memory_container}>
          <div>{renderMemoryWrites()[0]}</div>
          <div>{renderMemoryWrites()[3]}</div>
        </div>
      </div>
      {/* Middle Column */}
      <div className={styles.column}>
        <br />
        {/* CPU State Viewer */}
        <div className={styles.cpu_state_viewer}>
          <CPUStateViewer
            prevState={prevCPUState}
            currState={currCPUState}
            instruction={instruction}
            memory={memory}
          />
        </div>
        {/* Memory Container 2 */}
        <div className={styles.memory_container}>
          <div>{renderMemoryWrites()[4]}</div>
          <div>{renderMemoryWrites()[1]}</div>
          <div>{renderMemoryWrites()[2]}</div>
        </div>
      </div>
      {/* Right Column */}
      <div className={styles.column}>
        <br />
        {/* Instruction Viewer */}
        <div className={styles.cpu_flag_registers_viewer}>
          <FlagRegistersViewer cpuState={currCPUState} />
        </div>
        <br />
        <br />
        <InstructionViewer instruction={instruction} />
        <div>
          <button onClick={handleStep}>Step</button>
          <button onClick={handleRun}>Run</button>
        </div>
      </div>
    </div>
  );
};

export default Gameboy;
