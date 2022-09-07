import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import Progress from "./Progress";
import "./ProgressArray.scss";
import { CurrentStoryState, Story } from "./types";
import { defaultInterval } from "./constants";
import { nextStory, pauseStory } from "./actions";
import { getStories } from "./selectors";

interface ProgressArrayProps {
  stories: Story[];
  current: CurrentStoryState;
  nextStory: typeof nextStory;
  pauseStory: typeof pauseStory;
  onStoryStart?: () => void;
  onStoryEnd?: () => void;
  allStoriesEndCallback?: () => void;
}

const ProgressArray: React.FC<ProgressArrayProps> = ({ ...props }) => {
  const { stories, current } = props;
  const [count, setCount] = useState<number>(0);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    setCount(0);
  }, [current.index, stories.length]);

  useEffect(() => {
    if (!current.isPaused) {
      animationFrameId.current = requestAnimationFrame(incrementCount);
    }
    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [current.index, current.isPaused]);

  const getCurrentInterval = () => {
    const story = stories[current.index];
    if (typeof story.duration === "number") return story.duration;
    if (story.media_type == "video") return 19868;
    return defaultInterval;
  };

  let countCopy = count;
  const incrementCount = () => {
    const interval = getCurrentInterval();
    if (countCopy === 0) storyStartCallback();
    setCount((count: number) => {
      countCopy = count + 100 / ((interval / 1000) * 60);
      return count + 100 / ((interval / 1000) * 60);
    });
    if (countCopy < 100) {
      animationFrameId.current = requestAnimationFrame(incrementCount);
    } else {
      storyEndCallback();
      if (current.index === stories.length - 1) {
        allStoriesEndCallback();
      }
      cancelAnimationFrame(animationFrameId.current);
      props.nextStory();
    }
  };

  const storyStartCallback = () => {
    props.onStoryStart && props.onStoryStart();
  };

  const storyEndCallback = () => {
    props.onStoryEnd && props.onStoryEnd();
  };

  const allStoriesEndCallback = () => {
    props.allStoriesEndCallback && props.allStoriesEndCallback();
  };

  return (
    <div className="ProgressArray">
      {stories.map((_, i) => (
        <Progress
          key={_._id}
          count={count}
          width={1 / stories.length}
          active={i === current.index ? 1 : i < current.index ? 2 : 0}
        />
      ))}
    </div>
  );
};

const mapDispatchToProps = { nextStory, pauseStory };

const mapStateToProps = (state) => {
  return {
    stories: getStories(state),
    current: state.story.current,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ProgressArray);
