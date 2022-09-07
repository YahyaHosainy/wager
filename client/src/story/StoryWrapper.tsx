import React, { useEffect } from "react";
import {
  likeStory,
  nextStory,
  pauseStory,
  playStory,
  previousStory,
  toggleStory,
} from "./actions";
import { connect } from "react-redux";
import debounce from "lodash/debounce";
import { Party } from "../party/types";
import { CurrentStoryState, Story } from "./types";
import { AuthUser } from "../user/types";
import "./StoryWrapper.scss";
import ProgressArray from "./ProgressArray";
import fromGCP from "../helpers/fromGCP";
import moment from "moment";
import { nameOrUsername } from "../helpers/user";
import { getStories, userLikedCurrentStory } from "./selectors";
import DefaultUser from "../layout/assets/user.svg";

interface StoryWrapperProps {
  party: Party;
  stories: Story[];
  current: CurrentStoryState;
  user: AuthUser;
  token: string;
  userLikedStory: boolean;
  nextStory: typeof nextStory;
  previousStory: typeof previousStory;
  pauseStory: typeof pauseStory;
  playStory: typeof playStory;
  toggleStory: typeof toggleStory;
  likeStory: typeof likeStory;
}

const StoryWrapper: React.FC<StoryWrapperProps> = ({ ...props }) => {
  useEffect(() => {
    const isClient = typeof window !== "undefined" && window.document;
    if (isClient) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, []);

  const debouncePause = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    props.pauseStory();
  };

  const handleMouseUp = (
    e: React.MouseEvent | React.TouchEvent,
    type: string
  ) => {
    e.preventDefault();
    if (props.current.isPaused) {
      props.playStory();
    } else {
      type === "next" ? props.nextStory() : props.previousStory();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      props.previousStory();
    } else if (e.key === "ArrowRight") {
      props.nextStory();
    }
  };
  const handleLike = debounce(() => {
    props.likeStory({
      userID: props.user._id,
      storyID: props.stories[props.current.index]._id,
      token: props.token,
    });
  }, 50);

  const handleCTAClick = () => {
    props.toggleStory();
  };

  return (
    <div className="StoriesWrapper">
      <div
        className="StoriesModal--close-button"
        onClick={props.toggleStory.bind(null, null)}
      />
      <ProgressArray />
      {props.children}
      <div className="StoriesWrapper--overlay">
        <div
          style={{
            width: "50%",
            zIndex: 601,
          }}
          onTouchStart={debouncePause}
          onTouchEnd={(e) => handleMouseUp(e, "previous")}
          onClick={(e) => handleMouseUp(e, "previous")}
        />
        <div
          style={{
            width: "50%",
            zIndex: 601,
          }}
          onTouchStart={debouncePause}
          onTouchEnd={(e) => handleMouseUp(e, "next")}
          onClick={(e) => handleMouseUp(e, "next")}
        />
      </div>
      <div className="StoriesModal--top">
        <img
          className="StoriesModal--host-avatar"
          src={
            props.party.host.picture ? props.party.host.picture : DefaultUser
          }
        />

        <span className="StoriesModal--host-name">
          {nameOrUsername(props.party.host)}
        </span>
        <span className="StoriesModal--timestamp">
          {moment(props.stories[props.current.index].createdAt).fromNow(true)}
        </span>
      </div>
      <div className="StoriesModal--bottom">
        <div className="StoriesModal--caption-container">
          {props.stories[props.current.index].caption}
          <div className="StoriesModal--like" onClick={handleLike}>
            <img
              className={`${
                props.userLikedStory ? "StoriesModal--like-filled" : ""
              }`}
              src={fromGCP({ bucket: "static", filename: "heart.svg" })}
            />
            <span className="like-text">Like</span>
          </div>
        </div>
        <button className="StoriesModal--cta" onClick={handleCTAClick}>
          Enter the party
        </button>
      </div>
    </div>
  );
};

const mapDispatchToProps = {
  nextStory,
  previousStory,
  pauseStory,
  playStory,
  toggleStory,
  likeStory,
};

const mapStateToProps = (state) => {
  return {
    user: state.user.user,
    token: state.user.token,
    party: state.party.party,
    stories: getStories(state),
    current: state.story.current,
    userLikedStory: userLikedCurrentStory(state),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(StoryWrapper);
