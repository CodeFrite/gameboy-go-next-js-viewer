import styles from "./index.module.css";

export type MemoryWriter = {
  name: string;
  address: number;
  data: string[];
};

export type MemoryProps = MemoryWriter & {
  pc: number;
  bytes: number;
};

const Memory = (props: MemoryProps) => {
  const pc = props.pc - props.address;
  const formatMemoryCell = (value: string, index: number): string => {
    let style = styles.hex_cell;
    // pc is black/yellow
    if (index === pc) {
      style += " " + styles.pc;
    }
    // operands are black/light-blue
    else if (index > pc && index < pc + props.bytes) {
      style += " " + styles.operand;
    }
    // other memory cells are light-blue/black
    return style;
  };

  const printMemory = () => {
    return props.data.map((value, index) => {
      let result = [];
      // Highlight the PC

      if (index % 16 === 0) {
        // add memory table header
        if (index == 0) {
          result.push(<span className={styles.hex_cell + " " + styles.header}>ADDR </span>);
          result.push(
            [
              "X0",
              "X1",
              "X2",
              "X3",
              "X4",
              "X5",
              "X6",
              "X7",
              "X8",
              "X9",
              "XA",
              "XB",
              "XC",
              "XD",
              "XE",
              "XF",
            ].map((value) => (
              <span key={index + "-header"} className={styles.hex_cell + " " + styles.header}>
                {value}
              </span>
            ))
          );
        }
        // Add a line break every 16 cells and add the line address
        result.push(<br />);
        result.push(
          <span key={index + "-line-address"} className={styles.address}>
            {(props.address + index).toString(16).padStart(4, "0").toUpperCase().substring(0, 3) +
              "X "}
          </span>
        );
      }
      result.push(
        <span key={index} className={formatMemoryCell(value.substring(2), index)}>
          {value.substring(2)}
        </span>
      );
      return <>{result}</>;
    });
  };

  return (
    <div>
      <h2>{props.name}</h2>
      <div className={styles.memory_table}>{printMemory()}</div>
    </div>
  );
};

export default Memory;
