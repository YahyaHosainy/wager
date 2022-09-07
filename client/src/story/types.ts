import { Action } from "redux";
import { RequestStatus } from "../_redux/types";

export interface Story {
  _id: string;
  party: string;
  media_type: string;
  media_url: string;
  likes: string[];
  duration?: number;
  caption?: string;
  createdAt: string;
}

export interface StoryState {
  stories?: Record<string, Story[]>;
  current: CurrentStoryState;
  requestStatus: RequestStatus;
  partyId: string;
  modalOpen: boolean;
  seen: Record<string, StorySeen>;
}
type StorySeen = Record<string, boolean>;

export interface CurrentStoryState {
  index: number;
  isPaused: boolean;
}

export enum StoryActionTypes {
  GET = "STORY/GET",
  GET_SUCCESS = "STORY/GET_SUCCESS",
  CLEAR = "STORY/CLEAR",
  NEXT = "STORY/NEXT",
  PAUSE = "STORY/PAUSE",
  PLAY = "STORY/PLAY",
  PREVIOUS = "STORY/PREVIOUS",
  UPDATE_DURATION = "STORY/UPDATE_DURATION",
  TOGGLE = "STORY/TOGGLE",
  LIKE = "STORY/LIKE",
  LIKE_SUCCESS = "STORY/LIKE_SUCCESS",
  SEEN = "STORY/SEEN",
  CONFIGURE = "STORY/CONFIGURE",
  RESET = "STORY/RESET",
  DELETE = "STORY/DELETE",
  DELETE_SUCCESS = "STORY/DELETE_SUCCESS",
  UPDATE_SUCCESS = "STORY/UPDATE_SUCCESS",
}

export interface GetStoryAction extends Action {
  type: StoryActionTypes.GET;
  payload: { partyID };
}

export interface LikeStoryAction extends Action {
  type: StoryActionTypes.LIKE;
  payload: { userID; storyID };
}

export interface DeleteStoryAction extends Action {
  type: StoryActionTypes.DELETE;
  payload: { userID; storyID };
}

export interface DeleteSuccessStoryAction extends Action {
  type: StoryActionTypes.DELETE_SUCCESS;
}

export interface LikeSuccessStoryAction extends Action {
  type: StoryActionTypes.LIKE_SUCCESS;
  payload: { story };
}

export interface PreviousStoryAction extends Action {
  type: StoryActionTypes.PREVIOUS;
}

export interface NextStoryAction extends Action {
  type: StoryActionTypes.NEXT;
}

export interface PauseStoryAction extends Action {
  type: StoryActionTypes.PAUSE;
}

export interface PlayStoryAction extends Action {
  type: StoryActionTypes.PLAY;
}

export interface ToggleStoryAction extends Action {
  payload: { override?: boolean; startingIndex?: number };
  type: StoryActionTypes.TOGGLE;
}

export interface UpdateDurationStoryAction extends Action {
  type: StoryActionTypes.UPDATE_DURATION;
  payload: { duration: number };
}

export interface GetStorySuccessAction extends Action {
  type: StoryActionTypes.GET_SUCCESS;
  payload: { stories: Story[]; party: string; status: string };
}

export interface UpdateStorySuccessAction extends Action {
  type: StoryActionTypes.UPDATE_SUCCESS;
  payload: { stories: Story[]; party: string; status: string };
}

export interface SeenStoryAction extends Action {
  type: StoryActionTypes.SEEN;
  payload: { storyId: string; partyId: string };
}

export interface ResetStoryAction extends Action {
  type: StoryActionTypes.RESET;
}

export interface ConfigureStoryAction extends Action {
  type: StoryActionTypes.CONFIGURE;
  payload: { partyId: string };
}
