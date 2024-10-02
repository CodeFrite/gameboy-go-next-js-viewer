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
  // special registers
  CPU_CYCLES: 0,
  PC: new uint16(0),
  SP: new uint16(0),
  A: new uint8(0),
  F: new uint8(0),
  Z: false,
  N: false,
  H: false,
  C: false,
  // 16-bits general purpose registers
  BC: new uint16(0),
  DE: new uint16(0),
  HL: new uint16(0),
  // instruction
  INSTRUCTION: defaultInstruction(),
  PREFIXED: false,
  IR: new uint8(0),
  OPERAND_VALUE: new uint16(0),
  // interrupts
  IE: new uint8(0),
  IME: false,
  HALTED: false,
});

const defaultInstruction = (): Instruction => ({
  mnemonic: "",
  bytes: 0,
  cycles: [0],
  operands: [],
  immediate: false,
  flags: { Z: "0", N: "0", H: "0", C: "0" },
});

export type MemoryBreakPoint = {
  memoryName: string;
  addresses: uint16[];
};

const Gameboy = () => {
  const ws = useRef<WebSocket | null>(null);
  const [prevCPUState, setPrevCPUState] = useState<CpuState>(defaultCPUState());
  const [currCPUState, setCurrCPUState] = useState<CpuState>(defaultCPUState());

  const [memory, setMemory] = useState<MemoryWrite[]>([]);
  const [breakPoints, setBreakPoints, breakPointsRef] = useCallBackState<MemoryBreakPoint[]>([]);

  const keyReleased = useRef<boolean>(true); // avoid rebouncing key presses effect by ignoring further keydown events before this flag is reset on keyup
  const lastIndirectOperandAddress = useRef<number>(0);

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
  const shiftCPUState = (newState: CpuState) => {
    setPrevCPUState(currCPUState);
  };

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
          console.log("Initial Memory Maps Channel> received initial memory maps: ", message.data);
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

          // Update the memory content if there are any memory writes
          if (message.data && message.data.memoryWrites && message.data.memoryWrites.length > 0) {
          }
          break;

        case MessageType.CPUStateMessageType:
          console.log("CPU State Channel> received new state: ", message.data);
          shiftCPUState(message.data);
          setCurrCPUState({
            // Special registers
            CPU_CYCLES: message.data.CPU_CYCLES,
            PC: new uint16(message.data.PC),
            SP: new uint16(message.data.SP),
            A: new uint8(message.data.A),
            F: new uint8(message.data.F),
            Z: message.data.Z,
            N: message.data.N,
            H: message.data.H,
            C: message.data.C,
            // 16-bits general purpose registers
            BC: new uint16(message.data.BC),
            DE: new uint16(message.data.DE),
            HL: new uint16(message.data.HL),
            // instruction
            INSTRUCTION: message.data.INSTRUCTION,
            PREFIXED: message.data.PREFIXED,
            IR: new uint8(message.data.IR),
            OPERAND_VALUE: new uint16(message.data.OPERAND_VALUE),
            // interrupts
            IE: new uint8(message.data.IE),
            IME: message.data.IME,
            HALTED: message.data.HALTED,
          });
          break;

        case MessageType.PPUStateMessageType:
          console.log("PPU State Channel> received new state: ", message.data);
          break;

        case MessageType.MemoryStateMessageType:
          // helper function to update the memory with memory writes
          console.log("Memory State Channel> received new state: ", message.data);
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

          message.data.map((memoryWrite: MemoryWrite & { data: number[] }) => {
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
      console.log("step request sent:", JSON.stringify(payload));
    }
  };

  const handleRun = () => {
    if (ws && ws.current) {
      const payload = {
        type: 11,
        data: {},
      };
      ws.current.send(JSON.stringify(payload));
      console.log("run request sent:", JSON.stringify(payload));
    }
  };

  /**
   * Get the address of the first operand that has an indirect addressing mode
   * If none, return the last address that was fetched by this function
   */
  const getOperandAddress = (): number => {
    // check if the first operand is an indirect addressing mode
    const operand0 = currCPUState.INSTRUCTION.operands[0];
    const operand1 = currCPUState.INSTRUCTION.operands[1];
    let address = -1;
    if (currCPUState.INSTRUCTION.operands.length > 0 && !operand0.immediate) {
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
    } else if (currCPUState.INSTRUCTION.operands.length > 1 && !operand1.immediate) {
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
                bytes={currCPUState.INSTRUCTION.bytes}
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
                bytes={currCPUState.INSTRUCTION.bytes}
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
            INSTR={currCPUState.INSTRUCTION}
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
              bytes={currCPUState.INSTRUCTION.bytes}
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
              bytes={currCPUState.INSTRUCTION.bytes}
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
              bytes={currCPUState.INSTRUCTION.bytes}
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
            instruction={currCPUState.INSTRUCTION}
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
