import { Uint16, Uint8 } from "../types";
import { Label } from "./label";
import { BrandColor } from "./types";
import ValueWatcher from "./value-watcher";

// Field: Combination of a Label and a ValueWatcher
type FieldProps = {
  label: string;
  labelColor?: BrandColor;
  labelBgColor?: BrandColor;
  value: Uint8 | Uint16 | boolean | string | number | null | undefined;
};
export const Field = (props: FieldProps) => {
  return (
    <>
      <Label color={props.labelColor} bgColor={props.labelBgColor}>
        {props.label}
      </Label>
      <ValueWatcher id="" value={props.value}></ValueWatcher>
    </>
  );
};
export default Field;
