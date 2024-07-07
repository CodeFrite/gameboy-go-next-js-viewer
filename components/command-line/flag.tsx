import { Label } from "./label";

type FlagProps = {
  children: boolean;
  label: string;
  trueColor?: string;
  falseColor?: string;
};
const Flag = (props: FlagProps) => {
  const offValue = "◌";
  const onValue = "◉";

  return props.children ? (
    <Label color={"green"}>{onValue}</Label>
  ) : (
    <Label color={"red"}>{offValue}</Label>
  );
};
export default Flag;
