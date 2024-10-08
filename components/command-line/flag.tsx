import { Label } from "./label";

export type FlagProps = {
  children: boolean;
  label: string;
  trueColor?: string;
  falseColor?: string;
};
const Flag = (props: FlagProps) => {
  const offValue = "◌";
  const onValue = "◉";

  return props.children ? (
    <>
      <Label>{props.label}</Label>
      <Label color={"green"}>{onValue}</Label>
    </>
  ) : (
    <>
      <Label>{props.label}</Label>
      <Label color={"red"}>{offValue}</Label>
    </>
  );
};
export default Flag;
