import CMD_Line from "../command-line";
import Entry from "../command-line/entry";
import Field from "../command-line/field";
import Flag from "../command-line/flag";
import { NewLine, Separator, Spaces } from "../command-line/helper";
import { GameboyState } from "../gameboy";

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

        <Flag label="Z">{props.prevState.Z ? true : false}</Flag>
        <Flag label="N">{props.prevState.N ? true : false}</Flag>
        <Flag label="H">{props.prevState.H ? true : false}</Flag>
        <Flag label="C">{props.prevState.C ? true : false}</Flag>

        <NewLine />
        <NewLine />
      </Entry>
    </CMD_Line>
  );
};

export default CPUStateViewer;
