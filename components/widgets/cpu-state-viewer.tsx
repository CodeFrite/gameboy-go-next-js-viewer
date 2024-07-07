import CMD_Line from "../command-line";
import Entry from "../command-line/entry";
import Field from "../command-line/field";
import { NewLine, Separator, Spaces } from "../command-line/helper";
import InstructionViewer from "../command-line/instruction-viewer";
import { Label } from "../command-line/label";
import { GameboyState, Operand } from "../gameboy";

const CPUStateViewer = (props: GameboyState) => {
  return (
    <CMD_Line>
      <Entry>
        <Field label="PC" value={props.currState.PC.toHex()} />
        <Separator />
        <Field label="SP" value={props.prevState.SP.toHex()} />
        <Separator />
        <Field label="IR" value={props.currState.IR.toHex()} />
        <Spaces length={2} />
        <Separator />
        <Field label="OP" value={props.currState.operandValue.toHex()} />

        <NewLine />

        <Field label="AF" value={props.prevState.A.toHex() + props.prevState.F.toHex()} />
        <Separator />
        <Field label="BC" value={props.prevState.BC.toHex()} />
        <Separator />
        <Field label="DE" value={props.prevState.DE.toHex()} />
        <Separator />
        <Field label="HL" value={props.prevState.HL.toHex()} />

        <NewLine />

        <Field label="Z" value={props.prevState.Z ? 1 : 0} />
        <Separator />
        <Field label="N" value={props.prevState.N ? 1 : 0} />
        <Separator />
        <Field label="H" value={props.prevState.H ? 1 : 0} />
        <Separator />
        <Field label="C" value={props.prevState.C ? 1 : 0} />

        <NewLine />
        <NewLine />

        <InstructionViewer instruction={props.instruction} />
      </Entry>
    </CMD_Line>
  );
};

export default CPUStateViewer;
