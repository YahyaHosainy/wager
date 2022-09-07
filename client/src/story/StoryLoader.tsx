import React from "react";
import "./StoryLoader.scss";

interface StoryLoaderProps {
  loaded: boolean;
}

const StoryLoader: React.FC<StoryLoaderProps> = ({ ...props }) => {
  return (
    <div
      style={{
        transition: "opacity 0.5s",
        opacity: `${!props.loaded ? "1" : "0"}`,
      }}
      className="StoryLoadingPlaceholder"
    >
      <div className={"StoryLoadingSpinner"} />
    </div>
  );
};

export default StoryLoader;
