// Text Line: A line of text that can contain labels, value watchers, and fields
type EntryProps = {
  children: JSX.Element | JSX.Element[];
};
const Entry = (props: EntryProps) => {
  return props.children;
};

export default Entry;
