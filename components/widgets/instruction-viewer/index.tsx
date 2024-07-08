import Field from "../../command-line/field";
import { Separator } from "../../command-line/helper";
import { Label } from "../../command-line/label";
import { Instruction, Operand } from "../../gameboy";

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
    <div>
      <h2>Instruction Viewer</h2>
      <Label color="white" bgColor="blue">
        INSTR
      </Label>
      <Label>
        {props.instruction.Mnemonic +
          " " +
          props.instruction.Operands.map((op, _) => formatOperand(op)).join(", ")}
      </Label>
      <div>
        <Field label="Bytes" value={props.instruction.Bytes}></Field>
        <Separator />
        <Field label="Cycles" value={props.instruction.Cycles}></Field>
      </div>
    </div>
  );
};

export default InstructionViewer;
