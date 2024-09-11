import { CpuState } from "../../types";
import { Label } from "../../command-line/label";
import styles from "./index.module.css";

type UpdateProps = {
  prevCpuState: CpuState;
  currCpuState: CpuState;
};

const UpdatesViewer = (props: UpdateProps) => {
  const renderUpdate = (label: string, prev: string, curr: string) => (
    <div className="styles.update">
      <Label color="white" bgColor="purple">
        {label}
      </Label>
      <Label color="purple" bgColor="white">
        {prev + ">" + curr}
      </Label>
    </div>
  );

  return (
    <div className={styles.updates_viewer}>
      <Label color="purple">{"> Updates"}</Label>
      <br />
      <div className={styles.updates_container}>
        <br /> {/* PC */}
        {props.prevCpuState.PC.get() !== props.currCpuState.PC.get() &&
          renderUpdate("PC", props.prevCpuState.PC.toHex(), props.currCpuState.PC.toHex())}
        {/* SP */}
        {props.prevCpuState.SP.get() !== props.currCpuState.SP.get() &&
          renderUpdate("SP", props.prevCpuState.SP.toHex(), props.currCpuState.SP.toHex())}
        {/* IR */}
        {props.prevCpuState.IR.get() !== props.currCpuState.IR.get() &&
          renderUpdate("IR", props.prevCpuState.IR.toHex(), props.currCpuState.IR.toHex())}
        {/* OP */}
        {props.prevCpuState.OPERAND_VALUE.get() !== props.currCpuState.OPERAND_VALUE.get() &&
          renderUpdate(
            "OP",
            props.prevCpuState.OPERAND_VALUE.toHex(),
            props.currCpuState.OPERAND_VALUE.toHex()
          )}
        {/* AF */}
        {props.prevCpuState.A.get() !== props.currCpuState.A.get() &&
          renderUpdate("A", props.prevCpuState.A.toHex(), props.currCpuState.A.toHex())}
        {/* F */}
        {props.prevCpuState.F.get() !== props.currCpuState.F.get() &&
          renderUpdate("F", props.prevCpuState.F.toHex(), props.currCpuState.F.toHex())}
        {/* BC */}
        {props.prevCpuState.BC.get() !== props.currCpuState.BC.get() &&
          renderUpdate("BC", props.prevCpuState.BC.toHex(), props.currCpuState.BC.toHex())}
        {/* DE */}
        {props.prevCpuState.DE.get() !== props.currCpuState.DE.get() &&
          renderUpdate("DE", props.prevCpuState.DE.toHex(), props.currCpuState.DE.toHex())}
        {/* HL */}
        {props.prevCpuState.HL.get() !== props.currCpuState.HL.get() &&
          renderUpdate("HL", props.prevCpuState.HL.toHex(), props.currCpuState.HL.toHex())}
      </div>
    </div>
  );
};

export default UpdatesViewer;
