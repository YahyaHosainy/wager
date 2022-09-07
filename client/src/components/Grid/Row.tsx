import classnames from "classnames";
import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  tag?: React.ElementType;
};

const Row = ({
  children,
  className,
  tag: Tag = "div",
  ...attributes
}: Props) => {
  return (
    <Tag className={classnames("row", className)} {...attributes}>
      {children}
    </Tag>
  );
};

export default Row;
