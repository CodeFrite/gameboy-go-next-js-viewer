import { BrandColor } from "./types";
import styles from "./index.module.css";
// Label: Display a non-editable text with a color
type LabelProps = {
  text: string;
  color?: BrandColor;
};
export const Label = (props: LabelProps) => {
  return <span className={styles.label}>{props.text}</span>;
};
