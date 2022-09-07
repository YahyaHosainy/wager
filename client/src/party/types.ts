import { Game } from "../game/types";
import { BetUser, PartialUser } from "../user/types";
import { Action } from "redux";
import { Story } from "../story/types";
import { RequestStatus } from "../_redux/types";

export interface PartyBet {
  _id: string;
  side: string;
  user: BetUser;
  amount: number;
  partialAmount: number;
  matchedUser: PartialUser[];
}
export interface Party {
  _id: string;
  game: Game;
  host: PartialUser;
  bets: PartyBet[];
  hostBet: PartyBet;
  pick: "favorite" | "underdog";
  createdAt?: Date;
  tagline?: string;
  coverImageURL: string;
}
export interface PartyState {
  party?: Party;
  stories?: Story[];
  partyStatus: RequestStatus;
}

export enum PartyActionTypes {
  GET = "PARTY/GET",
  GET_STORY = "PARTY/GET_STORY",
  CLEAR = "PARTY/CLEAR",
  GET_SUCCESS = "PARTY/GET_SUCCESS",
  GET_STORY_SUCCESS = "PARTY/GET_STORY_SUCCESS",
}

export interface GetPartyAction extends Action {
  type: PartyActionTypes.GET;
  payload: { partyID };
}

export interface GetStoryPartyAction extends Action {
  type: PartyActionTypes.GET_STORY;
  payload: { partyID };
}
export interface GetSuccessPartyAction extends Action {
  type: PartyActionTypes.GET_SUCCESS;
  payload: { party: Party };
}

export interface GetStorySuccessPartyAction extends Action {
  type: PartyActionTypes.GET_STORY_SUCCESS;
  payload: { stories: Story[] };
}

export interface ClearPartyAction extends Action {
  type: PartyActionTypes.CLEAR;
}
