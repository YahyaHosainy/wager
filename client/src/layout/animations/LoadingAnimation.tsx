import React from "react";
import fromGCP from "../../helpers/fromGCP";

class LoadingAnimation extends React.Component {
  render() {
    return (
      <img
        src={fromGCP({ bucket: "static", filename: "coin_bounce.gif" })}
        alt="loading..."
        className="Coin__Bounce"
      />
    );
  }
}

export default LoadingAnimation;
