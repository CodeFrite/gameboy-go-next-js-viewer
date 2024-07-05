import CMD_Line from "../command-line";
import Entry from "../command-line/entry";
import Field from "../command-line/field";
import { NewLine, Separator, Spaces } from "../command-line/helper";
import { CPUState } from "../gameboy";
import { Uint16 } from "../types";

type CPUStateViewerProps = {
  state: CPUState;
};
const CPUStateViewer = (props: CPUStateViewerProps) => {
  return (
    <CMD_Line>
      <Entry>
        <Field label="PC" value={props.state.PC.toHex()} />
        <Separator />
        <Field label="SP" value={props.state.SP.toHex()} />
        <Separator />
        <Field label="IR" value={props.state.IR.toHex()} />
        <Spaces length={2} />
        <Separator />
        <Field label="OP" value={props.state.operandValue.toHex()} />

        <NewLine />

        <Field label="AF" value={props.state.A.toHex() + props.state.F.toHex()} />
        <Separator />
        <Field label="BC" value={props.state.BC.toHex()} />
        <Separator />
        <Field label="DE" value={props.state.DE.toHex()} />
        <Separator />
        <Field label="HL" value={props.state.HL.toHex()} />

        <NewLine />
        <NewLine />

        <Field label="Z" value={props.state.Z ? 1 : 0} />
        <Separator />
        <Field label="N" value={props.state.N ? 1 : 0} />
        <Separator />
        <Field label="H" value={props.state.H ? 1 : 0} />
        <Separator />
        <Field label="C" value={props.state.C ? 1 : 0} />
      </Entry>
    </CMD_Line>
  );
};

export default CPUStateViewer;
