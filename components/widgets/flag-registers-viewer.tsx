import Entry from "../command-line/entry";
import Flag from "../command-line/flag";
import { CPUState } from "../gameboy";

type FlagRegistersViewerProps = {
  cpuState: CPUState;
};

const FlagRegistersViewer = (props: FlagRegistersViewerProps) => {
  return (
    <Entry>
      <Flag label="Z">{props.cpuState.Z}</Flag>
      <Flag label="N">{props.cpuState.N}</Flag>
      <Flag label="H">{props.cpuState.H}</Flag>
      <Flag label="C">{props.cpuState.C}</Flag>
    </Entry>
  );
};

export default FlagRegistersViewer;
