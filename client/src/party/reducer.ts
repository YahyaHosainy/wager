import { RequestStatus } from "../_redux/types";
import { PartyActionTypes, PartyState } from "./types";

export const initState = {
  party: undefined,
  stories: undefined,
  partyStatus: RequestStatus.NOT_LOADED,
};

const reducer = (state: PartyState = initState, action): PartyState => {
  switch (action.type) {
    case PartyActionTypes.GET: {
      return {
        ...state,
        partyStatus: RequestStatus.LOADING,
      };
    }
    case PartyActionTypes.GET_SUCCESS: {
      return {
        ...state,
        party: action.payload,
        partyStatus: RequestStatus.LOADED,
      };
    }
    case PartyActionTypes.GET_STORY_SUCCESS: {
      return {
        ...state,
        stories: action.payload,
      };
    }
    case PartyActionTypes.CLEAR: {
      return {
        ...state,
        ...initState,
      };
    }
    default:
      return state;
  }
};

export default reducer;
