import includes from "lodash/includes";
import { Story } from "./types";

export const userLikedCurrentStory = (state) => {
  if (!state.story.stories?.length) return false;
  const currentStory = state.story.stories[state.story.current.index];
  return includes(currentStory.likes, state.user.user._id);
};

export const currentStory = (state) => {
  return state.story.stories[state.current.index];
};

export const getUnseenStoryIndex = (state) => {
  const partyId = state.story.partyId;
  if (!state.story.seen.hasOwnProperty(partyId)) return 0;

  if (!state.story.stories.hasOwnProperty(partyId)) {
    return -1;
  }
  const index = state.story.stories[partyId].findIndex((story: Story) => {
    return !state.story.seen[partyId].hasOwnProperty(story._id);
  });
  return index;
};

export const getStories = (state) => {
  return state.story.stories[state.story.partyId] || [];
};
