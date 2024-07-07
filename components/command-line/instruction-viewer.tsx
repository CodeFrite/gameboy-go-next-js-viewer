import { Instruction, Operand } from "../gameboy";
import Entry from "./entry";
import Field from "./field";
import { NewLine, Separator } from "./helper";
import { Label } from "./label";

type InstructionProps = {
  instruction: Instruction;
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

  return (
    <Entry>
      <Label color="white" bgColor="blue">
        INSTR
      </Label>
      <Label>
        {props.instruction.Mnemonic +
          " " +
          props.instruction.Operands.map((op, _) => formatOperand(op)).join(", ")}
      </Label>
      <NewLine />
      <Field label="Bytes" value={props.instruction.Bytes}></Field>
      <Separator />
      <Field label="Cycles" value={props.instruction.Cycles}></Field>
    </Entry>
  );
};

export default InstructionViewer;
