import { BrandColor } from "./types";
import styles from "./index.module.css";
// Label: Display a non-editable text with a color
type LabelProps = {
  children: string;
  color?: BrandColor;
  bgColor?: BrandColor;
};
export const Label = (props: LabelProps) => {
  let color = " ";

  if (props.color === "black") color += styles.color_black;
  else if (props.color === "white") color += styles.color_white;
  else if (props.color === "blue") color += styles.color_blue;
  else if (props.color === "green") color += styles.color_green;
  else if (props.color === "yellow") color += styles.color_yellow;
  else if (props.color === "orange") color += styles.color_orange;
  else if (props.color === "red") color += styles.color_red;

  if (props.bgColor === "black") color += " " + styles.bg_color_black;
  else if (props.bgColor === "white") color += " " + styles.bg_color_white;
  else if (props.bgColor === "blue") color += " " + styles.bg_color_blue;
  else if (props.bgColor === "green") color += " " + styles.bg_color_green;
  else if (props.bgColor === "yellow") color += " " + styles.bg_color_yellow;
  else if (props.bgColor === "orange") color += " " + styles.bg_color_orange;
  else if (props.bgColor === "red") color += " " + styles.bg_color_red;

  return <span className={styles.label + color}>{props.children}</span>;
};
