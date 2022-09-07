import { ActionCreator } from "redux";
import {
  GetStoryAction,
  GetStorySuccessAction,
  StoryActionTypes,
  NextStoryAction,
  PlayStoryAction,
  PauseStoryAction,
  PreviousStoryAction,
  UpdateDurationStoryAction,
  ToggleStoryAction,
  LikeStoryAction,
  LikeSuccessStoryAction,
  SeenStoryAction,
  ResetStoryAction,
  ConfigureStoryAction,
  DeleteStoryAction,
  DeleteSuccessStoryAction,
  UpdateStorySuccessAction,
} from "./types";

export const getStory: ActionCreator<GetStoryAction> = (payload) => ({
  type: StoryActionTypes.GET,
  payload,
});

export const getStorySuccess: ActionCreator<GetStorySuccessAction> = (
  payload
) => ({
  type: StoryActionTypes.GET_SUCCESS,
  payload,
});

export const nextStory: ActionCreator<NextStoryAction> = () => ({
  type: StoryActionTypes.NEXT,
});

export const pauseStory: ActionCreator<PauseStoryAction> = () => ({
  type: StoryActionTypes.PAUSE,
});

export const playStory: ActionCreator<PlayStoryAction> = () => ({
  type: StoryActionTypes.PLAY,
});

export const previousStory: ActionCreator<PreviousStoryAction> = () => ({
  type: StoryActionTypes.PREVIOUS,
});

export const toggleStory: ActionCreator<ToggleStoryAction> = (payload) => ({
  payload,
  type: StoryActionTypes.TOGGLE,
});

export const likeStory: ActionCreator<LikeStoryAction> = (payload) => ({
  type: StoryActionTypes.LIKE,
  payload,
});

export const likeStorySuccess: ActionCreator<LikeSuccessStoryAction> = (
  payload
) => ({
  type: StoryActionTypes.LIKE_SUCCESS,
  payload,
});

export const updateDuration: ActionCreator<UpdateDurationStoryAction> = (
  payload
) => ({
  type: StoryActionTypes.UPDATE_DURATION,
  payload,
});

export const markStorySeen: ActionCreator<SeenStoryAction> = (payload) => ({
  type: StoryActionTypes.SEEN,
  payload,
});

export const resetStory: ActionCreator<ResetStoryAction> = () => ({
  type: StoryActionTypes.RESET,
});

export const configureStory: ActionCreator<ConfigureStoryAction> = (
  payload
) => ({
  type: StoryActionTypes.CONFIGURE,
  payload,
});

export const deleteStory: ActionCreator<DeleteStoryAction> = (payload) => ({
  type: StoryActionTypes.DELETE,
  payload,
});

export const deleteStorySuccess: ActionCreator<DeleteSuccessStoryAction> = (
  payload
) => ({
  type: StoryActionTypes.DELETE_SUCCESS,
  payload,
});

export const updateStorySuccess: ActionCreator<UpdateStorySuccessAction> = (
  payload
) => ({
  type: StoryActionTypes.UPDATE_SUCCESS,
  payload,
});
