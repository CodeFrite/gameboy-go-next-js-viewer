import { useEffect, useRef, useState } from "react";

import useCallBackState from "../../hooks/useCallBackState";
import { NewLine } from "../command-line/helper";
import { DebuggerEvents, ToggleBreakPointEventDetail } from "../events";
import Memory from "../memory";
import MemorySelector from "../memory-selector";
import CPUStateViewer from "../widgets/cpu-state-viewer";
import FlagRegistersViewer from "../widgets/flag-registers-viewer";
import InstructionViewer from "../widgets/instruction-viewer";
import UpdatesViewer from "../widgets/updates-viewer";
import { CpuState, Instruction, MemoryWrite, MessageType, uint16, uint8 } from "./../types";
import styles from "./index.module.css";

const defaultCPUState = (): CpuState => ({
  PC: new uint16(0),
  SP: new uint16(0),
  A: new uint8(0),
  F: new uint8(0),
  Z: false,
  N: false,
  H: false,
  C: false,
  BC: new uint16(0),
  DE: new uint16(0),
  HL: new uint16(0),
  IR: new uint8(0),
  PREFIXED: false,
  OPERAND_VALUE: new uint16(0),
  IE: new uint8(0),
  IME: false,
  HALTED: false,
});

const defaultInstruction = (): Instruction => ({
  Mnemonic: "",
  Bytes: 0,
  Cycles: [0],
  Operands: [],
  Immediate: false,
  Flags: { Z: "0", N: "0", H: "0", C: "0" },
});

export type MemoryBreakPoint = {
  memoryName: string;
  addresses: uint16[];
};

const Gameboy = () => {
  const ws = useRef<WebSocket | null>(null);
  const [prevCPUState, setPrevCPUState] = useState<CpuState>(defaultCPUState());
  const [currCPUState, setCurrCPUState] = useState<CpuState>(defaultCPUState());
  const [instruction, setInstruction] = useState<Instruction>(defaultInstruction());
  const [memory, setMemory] = useState<MemoryWrite[]>([]);
  const keyReleased = useRef<boolean>(true); // avoid rebouncing key presses effect by ignoring further keydown events before this flag is reset on keyup
  const lastIndirectOperandAddress = useRef<number>(0);

  /**
   * link a memory name to its breakpoints
   */
  const [breakPoints, setBreakPoints, breakPointsRef] = useCallBackState<MemoryBreakPoint[]>([]);

  /**
   * Intercepts Memory events: AddBreakPoint & DeleteBreakPoints
   */
  const handleToggleBreakPointEvent = (event: CustomEvent<ToggleBreakPointEventDetail>) => {
    console.log("gameboy> received custom event:", event);
    // toggle the breakpoint
    const memoryName = event.detail.memoryName;

    // check if there is an entry for that memory
    const memoryBreakPointIdx = breakPointsRef.current.findIndex(
      (mbp) => mbp.memoryName === event.detail.memoryName
    );
    if (memoryBreakPointIdx !== -1) {
      console.log("entries for", event.detail.memoryName, "found");
      // look for the breakpoint
      const breakPointIdx = breakPointsRef.current[memoryBreakPointIdx].addresses.findIndex(
        (value) => value.get() === event.detail.address.get()
      );
      // if it has been found, remove it from the breakpoints array and notify the server
      if (breakPointIdx !== -1) {
        setBreakPoints(
          breakPointsRef.current.map((mbp: MemoryBreakPoint) =>
            mbp.memoryName === event.detail.memoryName
              ? {
                  memoryName: mbp.memoryName,
                  addresses: mbp.addresses.filter(
                    (addr) => addr.get() !== event.detail.address.get()
                  ),
                }
              : mbp
          )
        );
        // construct the request payload, stringify it and send it to the server
        const payload = {
          type: 21,
          data: event.detail.address.get(),
        };
        ws.current!.send(JSON.stringify(payload));
        console.log("sending remove breakpoint request:", JSON.stringify(payload));

        // ... if the breakpoint hasn't been found, add it to the breakpoints array and notify the server
      } else {
        setBreakPoints(
          breakPointsRef.current.map((mbp: MemoryBreakPoint) =>
            mbp.memoryName === event.detail.memoryName
              ? {
                  memoryName: mbp.memoryName,
                  addresses: [...mbp.addresses, event.detail.address],
                }
              : mbp
          )
        );
        // construct the request payload, stringify it and send it to the server
        const payload = {
          type: 20,
          data: event.detail.address.get(),
        };
        ws.current!.send(JSON.stringify(payload));
        console.log("sending add breakpoint request:", JSON.stringify(payload));
      }
    } else {
      setBreakPoints([
        ...breakPointsRef.current,
        { memoryName: event.detail.memoryName, addresses: [event.detail.address] },
      ]);
    }
  };
  useEffect(() => {
    const gameboy = document.getElementById("gameboy");
    if (gameboy)
      gameboy.addEventListener(
        DebuggerEvents.ToggleBreakPoint,
        handleToggleBreakPointEvent as EventListener
      );
    return () => {
      if (gameboy) {
        gameboy.removeEventListener(
          DebuggerEvents.ToggleBreakPoint,
          handleToggleBreakPointEvent as EventListener
        );
      }
    };
  }, []);

  /**
   * WebSocket connection to the gameboy-go server
   */
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/gameboy");

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    socket.onmessage = (event: MessageEvent) => {
      let message = JSON.parse(event.data);

      switch (message.type) {
        // Initialize memory maps on first connection
        case MessageType.InitialMemoryMapsMessageType:
          // memoryWrite.data is received as a string and needs to be converted to uint8 array
          if (message.data) {
            setMemory(
              message.data.map(
                (memoryWrite: { name: string; address: string; data: number[] }) => ({
                  name: memoryWrite.name,
                  address: memoryWrite.address,
                  data: memoryWrite.data.map((value) => new uint8(value)),
                })
              )
            );
          }
          break;

        // Update the gameboystate on each step or run
        case MessageType.GameboyStateMessageType:
          setPrevCPUState({
            PC:
              message.data.prevState && message.data.prevState.PC
                ? new uint16(message.data.prevState.PC)
                : new uint16(0),
            SP:
              message.data.prevState && message.data.prevState.SP
                ? new uint16(message.data.prevState.SP)
                : new uint16(0),
            A:
              message.data.prevState && message.data.prevState.A
                ? new uint8(message.data.prevState.A)
                : new uint8(0),
            F:
              message.data.prevState && message.data.prevState.F
                ? new uint8(message.data.prevState.F)
                : new uint8(0),
            Z: message.data.prevState && message.data.prevState.Z,
            N: message.data.prevState && message.data.prevState.N,
            H: message.data.prevState && message.data.prevState.H,
            C: message.data.prevState && message.data.prevState.C,
            BC:
              message.data.prevState && message.data.prevState.BC
                ? new uint16(message.data.prevState.BC)
                : new uint16(0),
            DE:
              message.data.prevState && message.data.prevState.DE
                ? new uint16(message.data.prevState.DE)
                : new uint16(0),
            HL:
              message.data.prevState && message.data.prevState.HL
                ? new uint16(message.data.prevState.HL)
                : new uint16(0),
            IR:
              message.data.prevState && message.data.prevState.IR
                ? new uint8(message.data.prevState.IR)
                : new uint8(0),
            PREFIXED: message.data.prevState && message.data.prevState.prefixed,
            OPERAND_VALUE:
              message.data.prevState && message.data.prevState.operandValue
                ? new uint16(message.data.prevState.operandValue)
                : new uint16(0),
            IE:
              message.data.prevState && message.data.prevState.IE
                ? new uint8(message.data.prevState.IE)
                : new uint8(0),
            IME: message.data.prevState && message.data.prevState.IME,
            HALTED: message.data.prevState && message.data.prevState.Halted,
          });

          setCurrCPUState({
            PC:
              message.data.currState && message.data.currState.PC
                ? new uint16(message.data.currState.PC)
                : new uint16(0),
            SP:
              message.data.currState && message.data.currState.SP
                ? new uint16(message.data.currState.SP)
                : new uint16(0),
            A:
              message.data.currState && message.data.currState.A
                ? new uint8(message.data.currState.A)
                : new uint8(0),
            F:
              message.data.currState && message.data.currState.F
                ? new uint8(message.data.currState.F)
                : new uint8(0),
            Z: message.data.currState && message.data.currState.Z,
            N: message.data.currState && message.data.currState.N,
            H: message.data.currState && message.data.currState.H,
            C: message.data.currState && message.data.currState.C,
            BC:
              message.data.currState && message.data.currState.BC
                ? new uint16(message.data.currState.BC)
                : new uint16(0),
            DE:
              message.data.currState && message.data.currState.DE
                ? new uint16(message.data.currState.DE)
                : new uint16(0),
            HL:
              message.data.currState && message.data.currState.HL
                ? new uint16(message.data.currState.HL)
                : new uint16(0),
            IR:
              message.data.currState && message.data.currState.IR
                ? new uint8(message.data.currState.IR)
                : new uint8(0),
            PREFIXED: message.data.currState && message.data.currState.prefixed,
            OPERAND_VALUE:
              message.data.currState && message.data.currState.operandValue
                ? new uint16(message.data.currState.operandValue)
                : new uint16(0),
            IE:
              message.data.currState && message.data.currState.IE
                ? new uint8(message.data.currState.IE)
                : new uint8(0),
            IME: message.data.currState && message.data.currState.IME,
            HALTED: message.data.currState && message.data.currState.Halted,
          });

          // Update the instruction
          if (message.data && message.data.instruction) {
            console.log("Instruction: ", message.data.instruction);
            setInstruction({
              Mnemonic: message.data.instruction.mnemonic ? message.data.instruction.mnemonic : "?",
              Bytes: message.data.instruction.bytes ? message.data.instruction.bytes : "? ",
              Cycles: message.data.instruction.cycles ? message.data.instruction.cycles : "?",
              Operands: message.data.instruction.operands ? message.data.instruction.operands : [],
              Immediate: message.data.instruction.immediate,
              Flags: message.data.instruction.flags ? { ...message.data.instruction.flags } : {},
            } as Instruction);
          }

          // Update the memory content if there are any memory writes
          if (message.data && message.data.memoryWrites && message.data.memoryWrites.length > 0) {
            // helper function to update the memory with memory writes
            const updateMemory = (
              memory: MemoryWrite,
              updates: MemoryWrite & { data: number[] }
            ): uint8[] => {
              const data: uint8[] = [];
              let updateIdx = 0;
              memory.data.map((value, idx) => {
                if (idx >= updates.address && idx < updates.address + updates.data.length) {
                  data.push(new uint8(updates.data[updateIdx]));
                  updateIdx++;
                } else data.push(value);
              });
              return data;
            };

            message.data.memoryWrites.map((memoryWrite: MemoryWrite & { data: number[] }) => {
              setMemory((prev) =>
                prev.map((mem) =>
                  mem.name === memoryWrite.name
                    ? {
                        name: mem.name,
                        address: mem.address,
                        data: updateMemory(mem, memoryWrite),
                      }
                    : mem
                )
              );
            });
          }
          break;
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current = socket;

    // Clean up WebSocket connection on component unmount
    return () => {
      socket.close();
    };
  }, []);

  /**
   * Redirect keypress events to the gameboy component
   */
  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent): void => {
      switch (ev.code) {
        case "Space":
          if (!ev.ctrlKey && keyReleased.current) {
            (() => {
              handleStep();
              keyReleased.current = false;
            })();
          } else if (ev.ctrlKey && keyReleased.current) {
            (() => {
              handleRun();
              keyReleased.current = false;
            })();
          }
          ev.preventDefault();
          break;
        default:
          console.log("No action for keypress: ", ev.code);
          return;
      }
    };

    const handleKeyUp = (ev: KeyboardEvent): void => {
      ev.preventDefault();
      switch (ev.code) {
        case "Space":
          if (!keyReleased.current) {
            keyReleased.current = true;
          }
          break;
        default:
          console.log("No action for keypress: ", ev.code);
      }
    };
    window.addEventListener("keydown", (ev: KeyboardEvent) => {
      handleKeyDown(ev);
    });
    window.addEventListener("keyup", (ev: KeyboardEvent) => {
      handleKeyUp(ev);
    });

    return () => {
      window.removeEventListener("keyup", (ev: KeyboardEvent) => {
        handleKeyUp(ev);
      });
    };
  }, []);

  const handleStep = () => {
    if (ws && ws.current) {
      const payload = {
        type: 10,
        data: {},
      };
      ws.current.send(JSON.stringify(payload));
    }
  };

  const handleRun = () => {
    if (ws && ws.current) {
      const payload = {
        type: 11,
        data: {},
      };
      ws.current.send(JSON.stringify(payload));
    }
  };

  /**
   * Get the address of the first operand that has an indirect addressing mode
   * If none, return the last address that was fetched by this function
   */
  const getOperandAddress = (): number => {
    // check if the first operand is an indirect addressing mode
    const operand0 = instruction.Operands[0];
    const operand1 = instruction.Operands[1];
    let address = -1;
    if (instruction.Operands.length > 0 && !operand0.immediate) {
      if (operand0.name === "HL") {
        if (operand0.increment) {
          address = currCPUState.HL.get() - 1;
        } else if (operand0.decrement) {
          address = currCPUState.HL.get() + 1;
        } else {
          address = currCPUState.HL.get();
        }
      } else if (operand0.name === "BC") {
        address = currCPUState.BC.get();
      } else if (operand0.name === "DE") {
        address = currCPUState.DE.get();
      } else if (operand0.name === "C") {
        address = 0xff00 + (currCPUState.BC.get() % 2 ** 8);
      } else if (operand0.name === "a8") {
        //address = 0xff00 + (currCPUState.operandValue.get() % 2 ** 8); // doesn't work if a8 in first operand because gameboy-go always returns the last operand value
      }
    } else if (instruction.Operands.length > 1 && !operand1.immediate) {
      if (operand1.name === "HL") {
        if (operand1.increment) {
          address = currCPUState.HL.get() - 1;
        } else if (operand1.decrement) {
          address = currCPUState.HL.get() + 1;
        } else {
          address = currCPUState.HL.get();
        }
      } else if (operand1.name === "BC") {
        address = currCPUState.BC.get();
      } else if (operand1.name === "DE") {
        address = currCPUState.DE.get();
      } else if (operand1.name === "C") {
        address = 0xff00 + (currCPUState.BC.get() % 2 ** 8);
      } else if (operand1.name === "a8") {
        //address = 0xff00 + (currCPUState.operandValue.get() % 2 ** 8); // doesn't work if a8 in first operand because gameboy-go always returns the last operand value
      }
    }
    if (address === -1) {
      address = lastIndirectOperandAddress.current;
    } else {
      lastIndirectOperandAddress.current = address;
    }
    return address;
  };

  return (
    /* App */
    <div id="gameboy" className={styles.app_container}>
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
          {/* show memory where program counter is currently in */}
          <div>
            {memory.length > 0 && (
              <MemorySelector
                memories={memory}
                breakPoints={breakPoints}
                pc={currCPUState.PC.get()}
                bytes={instruction.Bytes}
                viewPort="pc"
              />
            )}
          </div>

          <div>
            {memory.length > 0 && (
              <MemorySelector
                memories={memory}
                breakPoints={breakPoints}
                pc={getOperandAddress()}
                bytes={instruction.Bytes}
                viewPort="pc"
                highlightOperand={false}
              />
            )}
          </div>
        </div>
      </div>

      {/* Middle Column */}
      <div className={styles.column}>
        <br />
        {/* CPU State Viewer */}
        <div className={styles.cpu_state_viewer}>
          <CPUStateViewer
            PREV_CPU_STATE={prevCPUState}
            CURR_CPU_STATE={currCPUState}
            INSTR={instruction}
            MEMORY_WRITES={memory}
          />
        </div>
        {/* Memory Container 2 */}
        <div>
          {memory.length > 0 && (
            <Memory
              key={memory[4].name}
              memory={memory[4]}
              breakPoints={
                breakPoints.find((mbp) => mbp.memoryName === memory[4].name)?.addresses ?? []
              }
              pc={currCPUState.PC.get()}
              bytes={instruction.Bytes}
              viewPort="start"
            />
          )}
        </div>
        <div>
          {memory.length > 0 && (
            <Memory
              key={memory[6].name}
              memory={memory[6]}
              breakPoints={
                breakPoints.find((mbp) => mbp.memoryName === memory[6].name)?.addresses ?? []
              }
              pc={currCPUState.PC.get()}
              bytes={instruction.Bytes}
              viewPort="end"
            />
          )}
        </div>
        <div>
          {memory.length > 0 && (
            <Memory
              key={memory[1].name}
              memory={memory[1]}
              breakPoints={
                breakPoints.find((mbp) => mbp.memoryName === memory[1].name)?.addresses ?? []
              }
              pc={currCPUState.PC.get()}
              bytes={instruction.Bytes}
              viewPort="end"
            />
          )}
        </div>
      </div>
      {/* Right Column */}
      <div className={styles.column}>
        <br />
        {/* Instruction Viewer */}
        <div className={styles.cpu_flag_registers_viewer}>
          <FlagRegistersViewer cpuState={currCPUState} />
        </div>
        <div className={styles.instruction_viewer}>
          <InstructionViewer
            instruction={instruction}
            operandValue={currCPUState.OPERAND_VALUE.toHex()}
          />
        </div>
        <NewLine />
        <NewLine />
        <div className={styles.updates_viewer}>
          <UpdatesViewer prevCpuState={prevCPUState} currCpuState={currCPUState} />
        </div>
      </div>
    </div>
  );
};

export default Gameboy;
