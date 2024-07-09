import Field from "../../command-line/field";
import { Separator } from "../../command-line/helper";
import { Label } from "../../command-line/label";
import { CPUState } from "../../gameboy";

type UpdateProps = {
  prevCpuState: CPUState;
  currCpuState: CPUState;
};

const UpdatesViewer = (props: UpdateProps) => {
  return (
    <div>
      <Label>{"> Updates"}</Label>
      <br />*{" "}
      {props.prevCpuState.PC.get() !== props.currCpuState.PC.get() && (
        <>
          <Field
            label="PC"
            value={props.prevCpuState.PC.toHex() + ">" + props.currCpuState.PC.toHex()}
          />
          <Separator />
        </>
      )}
      {props.prevCpuState.SP.get() !== props.currCpuState.SP.get() && (
        <>
          <Field
            label="SP"
            value={props.prevCpuState.SP.toHex() + ">" + props.currCpuState.SP.toHex()}
          />
          <Separator />
        </>
      )}
      {props.prevCpuState.IR.get() !== props.currCpuState.IR.get() && (
        <>
          <Field
            label="IR"
            value={props.prevCpuState.IR.toHex() + ">" + props.currCpuState.IR.toHex()}
          />
          <Separator />
        </>
      )}
      {props.prevCpuState.operandValue.get() !== props.currCpuState.operandValue.get() && (
        <Field
          label="OP"
          value={
            props.prevCpuState.operandValue.toHex() + ">" + props.currCpuState.operandValue.toHex()
          }
        />
      )}
      <br />*{" "}
      {props.prevCpuState.A.get() !== props.currCpuState.A.get() && (
        <>
          <Field
            label="A"
            value={props.prevCpuState.A.toHex() + ">" + props.currCpuState.A.toHex()}
          />
          <Separator />
        </>
      )}
      {props.prevCpuState.F.get() !== props.currCpuState.F.get() && (
        <>
          <Field
            label="F"
            value={props.prevCpuState.F.toHex() + ">" + props.currCpuState.F.toHex()}
          />
          <Separator />
        </>
      )}
      {props.prevCpuState.BC.get() !== props.currCpuState.BC.get() && (
        <>
          <Field
            label="BC"
            value={props.prevCpuState.BC.toHex() + ">" + props.currCpuState.BC.toHex()}
          />
          <Separator />
        </>
      )}
      {props.prevCpuState.DE.get() !== props.currCpuState.DE.get() && (
        <>
          <Field
            label="DE"
            value={props.prevCpuState.DE.toHex() + ">" + props.currCpuState.DE.toHex()}
          />
          <Separator />
        </>
      )}
      {props.prevCpuState.HL.get() !== props.currCpuState.HL.get() && (
        <Field
          label="HL"
          value={props.prevCpuState.HL.toHex() + ">" + props.currCpuState.HL.toHex()}
        />
      )}
    </div>
  );
};

export default UpdatesViewer;
