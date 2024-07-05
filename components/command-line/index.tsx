import styles from "./index.module.css";

const CMD_Line = (props: { children: JSX.Element | JSX.Element[] }) => {
  return <div className={styles.cmd_line}>{props.children}</div>;
};
export default CMD_Line;
