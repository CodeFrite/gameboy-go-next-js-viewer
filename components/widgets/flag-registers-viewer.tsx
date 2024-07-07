import Entry from "../command-line/entry";
import Flag from "../command-line/flag";
import { CPUState } from "../gameboy";

type FlagRegistersViewerProps = {
  cpuState: CPUState;
};

const FlagRegistersViewer = (props: FlagRegistersViewerProps) => {
  return (
    <Entry>
      <Flag label="Z" children={props.cpuState.Z} />
      <Flag label="N" children={props.cpuState.N} />
      <Flag label="H" children={props.cpuState.H} />
      <Flag label="C" children={props.cpuState.C} />
    </Entry>
  );
};

export default FlagRegistersViewer;
