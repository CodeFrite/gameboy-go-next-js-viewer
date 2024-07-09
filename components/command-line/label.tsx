import { BrandColor } from "./types";
import styles from "./index.module.css";
import gstyles from "../../styles/globals.module.css";
// Label: Display a non-editable text with a color
type LabelProps = {
  children: string;
  color?: BrandColor;
  bgColor?: BrandColor;
};
export const Label = (props: LabelProps) => {
  const getClassNames = (): string => {
    let classNames = [styles.label];
    if (props.color !== undefined) {
      classNames.push(gstyles["color_" + props.color]);
    }
    if (props.bgColor !== undefined) {
      classNames.push(gstyles["bg_color_" + props.bgColor]);
    }
    return classNames.join(" ");
  };

  return <span className={getClassNames()}>{props.children}</span>;
};
