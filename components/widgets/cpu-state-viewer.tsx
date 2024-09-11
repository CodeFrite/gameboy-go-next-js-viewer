import { GameboyState } from "../types";
import CMD_Line from "../command-line";
import Entry from "../command-line/entry";
import Field from "../command-line/field";
import { NewLine, Separator, Spaces } from "../command-line/helper";

const CPUStateViewer = (props: GameboyState) => {
  return (
    <CMD_Line>
      <Entry>
        <Field label="PC" value={props.CURR_CPU_STATE.PC.toHex()} />
        <Separator />
        <Field label="SP" value={props.CURR_CPU_STATE.SP.toHex()} />
        <Separator />
        <Field label="IR" value={props.CURR_CPU_STATE.IR.toHex()} />
        <Spaces length={2} />
        <Separator />
        <Field label="OP" value={props.CURR_CPU_STATE.OPERAND_VALUE.toHex()} />

        <NewLine />

        <Field label="AF" value={props.CURR_CPU_STATE.A.toHex() + props.CURR_CPU_STATE.F.toHex()} />
        <Separator />
        <Field label="BC" value={props.CURR_CPU_STATE.BC.toHex()} />
        <Separator />
        <Field label="DE" value={props.CURR_CPU_STATE.DE.toHex()} />
        <Separator />
        <Field label="HL" value={props.CURR_CPU_STATE.HL.toHex()} />
      </Entry>
    </CMD_Line>
  );
};

export default CPUStateViewer;
