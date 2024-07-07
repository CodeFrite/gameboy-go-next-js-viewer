import CMD_Line from "../command-line";
import Entry from "../command-line/entry";
import Field from "../command-line/field";
import { NewLine, Separator, Spaces } from "../command-line/helper";
import { GameboyState } from "../gameboy";

const CPUStateViewer = (props: GameboyState) => {
  return (
    <CMD_Line>
      <Entry>
        <Field label="PC" value={props.currState.PC.toHex()} />
        <Separator />
        <Field label="SP" value={props.currState.SP.toHex()} />
        <Separator />
        <Field label="IR" value={props.currState.IR.toHex()} />
        <Spaces length={2} />
        <Separator />
        <Field label="OP" value={props.currState.operandValue.toHex()} />

        <NewLine />

        <Field label="AF" value={props.currState.A.toHex() + props.currState.F.toHex()} />
        <Separator />
        <Field label="BC" value={props.currState.BC.toHex()} />
        <Separator />
        <Field label="DE" value={props.currState.DE.toHex()} />
        <Separator />
        <Field label="HL" value={props.currState.HL.toHex()} />
      </Entry>
    </CMD_Line>
  );
};

export default CPUStateViewer;
