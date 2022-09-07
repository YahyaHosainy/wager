import React, { useEffect } from "react";
import {
  getStory,
  pauseStory,
  playStory,
  toggleStory,
  markStorySeen,
} from "./actions";
import { connect } from "react-redux";
import { Party } from "../party/types";
import { CurrentStoryState, Story } from "./types";
import { AuthUser } from "../user/types";
import StoryImage from "./StoryImage";
import StoryVideo from "./StoryVideo";
import StoryWrapper from "./StoryWrapper";
import "./Stories.scss";
import { getStories, getUnseenStoryIndex } from "./selectors";

interface StoriesProps {
  party: Party;
  stories: Story[];
  current: CurrentStoryState;
  user: AuthUser;
  storiesOpen: boolean;
  unseenStoryIndex: number;
  token: string;
  getStory: typeof getStory;
  pauseStory: typeof pauseStory;
  playStory: typeof playStory;
  toggleStory: typeof toggleStory;
  markStorySeen: typeof markStorySeen;
}

const Stories: React.FC<StoriesProps> = ({ ...props }) => {
  useEffect(() => {
    props.getStory({ partyID: props.party._id, token: props.token });

    props.unseenStoryIndex !== -1 &&
      props.toggleStory({
        override: true,
        startingIndex: props.unseenStoryIndex,
      });
    document.body.style.overflow = "hidden";

    return () => {
      props.toggleStory({ override: false });
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("overflow");
    };
  }, []);

  useEffect(() => {
    if (props.storiesOpen && props.stories.length > 0) {
      document.body.style.position = "fixed";
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("overflow");
    }
  }, [props.storiesOpen, props.stories.length]);

  useEffect(() => {
    props.stories?.length &&
      props.unseenStoryIndex === props.current.index &&
      props.markStorySeen({
        storyId: props.stories[props.current.index]._id,
        partyId: props.party._id,
      });
  }, [props.current.index]);

  const storyCards = props.stories.map((story: Story) => {
    if (story.media_type === "image") return <StoryImage story={story} />;
    if (story.media_type === "video") return <StoryVideo story={story} />;
  });

  return (
    <div className="Stories">
      {props.storiesOpen && props.stories.length > 0 && (
        <div className="StoriesModal">
          <StoryWrapper>{storyCards[props.current.index]}</StoryWrapper>
        </div>
      )}
    </div>
  );
};

const mapDispatchToProps = {
  getStory,
  pauseStory,
  playStory,
  toggleStory,
  markStorySeen,
};

const mapStateToProps = (state) => {
  return {
    user: state.user.user,
    token: state.user.token,
    party: state.party.party,
    stories: getStories(state),
    storiesOpen: state.story.modalOpen,
    current: state.story.current,
    unseenStoryIndex: getUnseenStoryIndex(state),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Stories);
