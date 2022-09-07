import classnames from "classnames";
import React, { forwardRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  tag?: React.ElementType;
};

const Container = forwardRef<any, Props>(
  ({ children, className, tag: Tag = "div", ...attributes }: Props, ref) => {
    return (
      <Tag
        ref={ref}
        className={classnames("container", className)}
        {...attributes}
      >
        {children}
      </Tag>
    );
  }
);

Container.displayName = "Container";

export default Container;
