import { useEffect, useState } from "react";
import { uint8ToHex } from "../utilities";
import styles from "./index.module.css";

type MemoryProps = {
  id: string;
};

const Memory = (props: MemoryProps) => {
  const [memory, setMemory] = useState<Uint8Array>(new Uint8Array());

  useEffect(() => {
    // Instantiate the WebAssembly module

    // Pass the setMemory function to Go
    (window as any).setMemorySetter(setMemory);

    // Fetch the binary file and pass it to Go
    fetch("/dmg_boot.bin")
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const uint8Array = new Uint8Array(buffer);
        (window as any).setMemory(uint8Array);
      });
  }, []);

  const printMemory = (lineLength: number = 16) => {
    let hex = uint8ToHex(memory);
    let result = [];

    for (let i = 0; i < hex.length; i++) {
      if (i % lineLength === 0) {
        result.push(<br />);
      }
      result.push(<span className={styles.hex_cell}>{hex[i]}</span>);
    }
    return result;
  };

  return (
    <div>
      <div id={props.id} className={styles.memory_table}>
        {printMemory()}
      </div>
    </div>
  );
};

export default Memory;
