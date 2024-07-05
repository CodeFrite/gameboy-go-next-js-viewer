// New Line: A line break
export const NewLine = () => {
  return <br />;
};

// Separator: Separates the left and right part of a line in an entry with character '/'
export const Separator = () => {
  return " / ";
};

export const Spaces = (props: { length: number }) => {
  return `-`.repeat(props.length);
};
