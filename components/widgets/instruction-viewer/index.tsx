import { useRef } from "react";
import Field from "../../command-line/field";
import { NewLine, Separator } from "../../command-line/helper";
import { Label } from "../../command-line/label";
import { BrandColor } from "../../command-line/types";
import { Instruction, Operand } from "../../gameboy";

type InstructionProps = {
  instruction: Instruction;
  operandValue: string;
};
const InstructionViewer = (props: InstructionProps) => {
  const formatOperand = (operand: Operand) => {
    const formatIncrement = (str: string) => str + "+";
    const formatDecrement = (str: string) => str + "-";
    const formatNotImmediate = (str: string) => "[" + str + "]";
    let result = operand.name;
    if (operand.increment) result = formatIncrement(result);
    if (operand.decrement) result = formatDecrement(result);
    if (!operand.immediate) result = formatNotImmediate(result);
    return result;
  };

  const renderFlag = (key: string, label: string, color: BrandColor) => (
    <Label key={useRef().current} color={color} bgColor="black">
      {label}
    </Label>
  );

  /**
   * renders the Z, N, H & C flags affected in color
   */
  const renderFlags = (): JSX.Element => {
    let result = [];

    let index = 0;
    for (const [name, value] of Object.entries(props.instruction.Flags)) {
      let color: BrandColor = "gray";

      // green if set (1)
      if (value === "1") {
        color = "green";
      }
      // red if reset (0)
      else if (value === "0") {
        color = "red";
      }
      // grey if not affected
      else if (value === "-") {
        color = "gray";
      }
      // blue if depends on the result (Z, N, H, C respectively)
      else {
        color = "blue";
      }
      index++;
      result.push(renderFlag(name, value, color));
    }
    return <>{result}</>;
  };

  return (
    <div>
      <br />
      <br />
      <br />
      {/* Label */}
      <Label color="blue" bgColor="black">
        {"> INSTR "}
      </Label>
      {/* Instruction Mnemonic and Operands (ASM) */}
      <Label>
        {props.instruction.Mnemonic +
          " " +
          props.instruction.Operands.map((op, _) => formatOperand(op)).join(", ")}
      </Label>
      {/* Operand Value */}
      {props.instruction.Bytes > 1 && <Label>{"(" + props.operandValue + ")"}</Label>}
      <NewLine />
      <NewLine />
      {/* Description */}
      <Label color="yellow">* DESCR</Label>
      <NewLine />
      <NewLine />
      {/* Bytes and Cycles */}
      <Label color="green">* BYTES</Label>
      <Label>{"" + props.instruction.Bytes}</Label>
      <Label color="gray"> / </Label>
      <Label color="green"> CYCLES</Label>
      <Label>{"" + props.instruction.Cycles}</Label>
      <NewLine />
      <NewLine />
      {/* Flags */}
      <div>
        <Label color="orange">* Flags </Label>
        {renderFlags()}
      </div>
    </div>
  );
};

export default InstructionViewer;
