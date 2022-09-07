import React from "react";
import { connect } from "react-redux";
import { CurrentStoryState, Story } from "./types";
import "./Progress.scss";
import { getStories } from "./selectors";

interface ProgressProps {
  stories: Story[];
  current: CurrentStoryState;
  width: number;
  active: number;
  count: number;
}
const Progress: React.FC<ProgressProps> = ({ ...props }) => {
  const { active } = props;
  const getProgressBarStyle = () => {
    switch (active) {
      case 2:
        return { width: "100%" };
      case 1:
        return { transform: `scaleX(${props.count / 100})` };
      case 0:
        return { width: 0 };
      default:
        return { width: 0 };
    }
  };

  const getProgressWrapperStyle = () => ({
    width: `${props.width * 100}%`,
    opacity: 1,
  });

  return (
    <div
      className="Progress"
      style={{
        ...getProgressWrapperStyle(),
      }}
    >
      <div className="Progress__bar" style={{ ...getProgressBarStyle() }} />
    </div>
  );
};

const mapDispatchToProps = {};

const mapStateToProps = (state) => {
  return {
    stories: getStories(state),
    current: state.story.current,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Progress);
