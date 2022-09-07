import React from "react";
import noop from "lodash/noop";
import "./ButtonWithLoader.scss";
import { useHistory } from "react-router";

interface ButtonWithLoaderProps {
  isLoading?: boolean;
  withAnimation?: boolean;
  onClick?: () => void;
  disableOverride?: boolean;
  to?: string;
}

const ButtonWithLoader: React.FC<ButtonWithLoaderProps> = ({ ...props }) => {
  const history = useHistory();
  const handleOnClick = () => {
    props.to ? history.push(props.to) : noop();
    props.onClick ? props.onClick() : noop();
  };
  return (
    <button
      disabled={props.isLoading || props.disableOverride}
      className="YellowButtonAnimated"
      onClick={handleOnClick}
    >
      {props.withAnimation && props.isLoading && (
        <div className="loader-ellipsis">
          <div />
          <div />
          <div />
          <div />
        </div>
      )}
      {((props.withAnimation && !props.isLoading) || !props.withAnimation) &&
        props.children}
    </button>
  );
};

export default ButtonWithLoader;
