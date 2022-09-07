import { ActionCreator } from "redux";
import {
  PartyActionTypes,
  GetPartyAction,
  GetSuccessPartyAction,
  ClearPartyAction,
} from "./types";

export const getParty: ActionCreator<GetPartyAction> = (payload) => ({
  type: PartyActionTypes.GET,
  payload,
});

export const clearParty: ActionCreator<ClearPartyAction> = (payload) => ({
  type: PartyActionTypes.CLEAR,
  payload,
});

export const getPartySuccess: ActionCreator<GetSuccessPartyAction> = (
  payload
) => ({
  type: PartyActionTypes.GET_SUCCESS,
  payload,
});
