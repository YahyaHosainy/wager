import { findIndex } from "lodash";
import { RequestStatus } from "../_redux/types";
import { StoryActionTypes, StoryState } from "./types";

export const initState = {
  stories: {},
  current: {
    index: 0,
    isPaused: false,
  },
  partyId: null,
  requestStatus: RequestStatus.NOT_LOADED,
  modalOpen: false,
  seen: {},
};

const reducer = (state: StoryState = initState, action): StoryState => {
  switch (action.type) {
    case StoryActionTypes.GET: {
      return {
        ...state,
        requestStatus: RequestStatus.LOADING,
      };
    }
    case StoryActionTypes.CONFIGURE: {
      return {
        ...state,
        partyId: action.payload.partyId,
      };
    }
    case StoryActionTypes.RESET: {
      return {
        ...state,
        current: {
          index: 0,
          isPaused: false,
        },
        partyId: null,
        requestStatus: RequestStatus.NOT_LOADED,
        modalOpen: false,
      };
    }
    case StoryActionTypes.GET_SUCCESS: {
      const partyId = action.payload.party;
      return {
        ...state,
        partyId,
        stories: {
          ...state.stories,
          [partyId]: action.payload.stories,
        },
        requestStatus: RequestStatus.LOADED,
      };
    }
    case StoryActionTypes.UPDATE_SUCCESS: {
      const partyId = action.payload.party;
      return {
        ...state,
        partyId,
        stories: {
          ...state.stories,
          [partyId]: state.stories[partyId]
            .slice()
            .concat(action.payload.stories),
        },
        requestStatus: RequestStatus.LOADED,
      };
    }
    case StoryActionTypes.NEXT: {
      let nextIdx = state.current.index + 1;
      nextIdx = nextIdx >= state.stories[state.partyId].length ? 0 : nextIdx;

      return {
        ...state,
        current: {
          ...state.current,
          index: nextIdx,
        },
      };
    }
    case StoryActionTypes.UPDATE_DURATION: {
      const storyCopy = state.stories[state.partyId].slice();
      storyCopy[state.current.index].duration = action.payload;
      return {
        ...state,
        stories: {
          ...state.stories,
          ...{ [state.partyId]: storyCopy },
        },
      };
    }
    case StoryActionTypes.PREVIOUS: {
      let previousIdx = state.current.index - 1;
      previousIdx = previousIdx < 0 ? 0 : previousIdx;
      return {
        ...state,
        current: {
          ...state.current,
          index: previousIdx,
        },
      };
    }
    case StoryActionTypes.CLEAR: {
      return {
        ...state,
        ...initState,
      };
    }
    case StoryActionTypes.TOGGLE: {
      const modalOpen =
        action.payload?.override === undefined
          ? !state.modalOpen
          : action.payload.override;
      const index = action.payload?.startingIndex
        ? action.payload.startingIndex
        : 0;
      return {
        ...state,
        modalOpen,
        current: {
          ...state.current,
          index,
        },
      };
    }

    case StoryActionTypes.SEEN: {
      const partyId = action.payload.partyId;
      const seenStories = Object.assign({}, state.seen);
      if (!(partyId in seenStories)) {
        seenStories[partyId] = {};
      }
      seenStories[partyId][action.payload.storyId] = true;
      return {
        ...state,
        seen: seenStories,
      };
    }

    case StoryActionTypes.LIKE_SUCCESS: {
      const foundIdx = findIndex(state.stories[state.partyId], {
        _id: action.payload.id,
      });
      if (foundIdx === -1) return state;
      const newStories = state.stories[state.partyId].slice();
      newStories[foundIdx].likes = action.payload.likes;
      return {
        ...state,
        stories: { [state.partyId]: newStories },
      };
    }

    case StoryActionTypes.DELETE_SUCCESS: {
      const foundIdx = findIndex(state.stories[state.partyId], {
        _id: action.payload,
      });
      if (foundIdx === -1) return state;
      const newStories = state.stories[state.partyId].slice();
      newStories.splice(foundIdx, 1);
      return {
        ...state,
        stories: {
          ...state.stories,
          [state.partyId]: newStories,
        },
      };
    }
    default:
      return state;
  }
};

export default reducer;
