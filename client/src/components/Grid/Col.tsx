import classNames from "classnames";
import { isEmpty } from "lodash";
import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
  size?: any;
  // offset?: any;
  // order?: any;
};

const Col = ({
  children,
  className,
  size = {},
  // offset = {},
  // order = {},
  tag: Tag = "div",
  ...attributes
}: Props) => {
  const sizeClasses = {
    col: isEmpty(size),
    "col-sm": size.sm === "auto",
    "col-md": size.md === "auto",
    "col-lg": size.lg === "auto",
    [`col-sm-${size.sm}`]: size.sm,
    [`col-md-${size.md}`]: size.md,
    [`col-lg-${size.lg}`]: size.lg,
    [`col-${size.default}`]: size.default,
  };

  // <Col size={{ md: 9 }}></Col>

  // const offsetClasses = {
  // 	[`offset-sm-${offset.sm}`]: offset.sm,
  // 	[`offset-md-${offset.md}`]: offset.md,
  // 	[`offset-lg-${offset.lg}`]: offset.lg,
  // 	[`offset-${offset.default}`]: offset.default,
  // };

  // const orderClasses = {
  // 	[`order-sm-${order.sm}`]: order.sm,
  // 	[`order-md-${order.md}`]: order.md,
  // 	[`order-lg-${order.lg}`]: order.lg,
  // 	[`order-${order.default}`]: order.default,
  // };
  return (
    <Tag
      className={classNames(
        className,
        sizeClasses
        // offsetClasses,
        // orderClasses,
      )}
      {...attributes}
    >
      {children}
    </Tag>
  );
};

export default Col;
