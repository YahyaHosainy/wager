import { Reducer } from "redux";
import * as Sentry from "@sentry/react";
import { UserState, UserActionTypes } from "./types";
import { RequestStatus } from "../_redux/types";

export const initialState: UserState = {
  user: null,
  status: RequestStatus.NOT_LOADED,
  token: null,
  isAuthenticated: false,
};

const reducer: Reducer<UserState> = (
  state: UserState = initialState,
  action
) => {
  switch (action.type) {
    case UserActionTypes.LOGIN_SUCCESS: {
      const { isAuthenticated, user, token } = action.payload;
      Sentry.configureScope(function (scope) {
        scope.setUser({ id: user._id, username: user.username });
      });

      return {
        ...state,
        isAuthenticated,
        user,
        token,
      };
    }
    case UserActionTypes.LOGOUT: {
      Sentry.configureScope((scope) => scope.setUser(null));
      return {
        ...state,
        isAuthenticated: false,
        token: undefined,
      };
    }
    case UserActionTypes.LOAD_SUCCESS: {
      return {
        ...state,
        ...action.payload,
        status: RequestStatus.LOADED,
      };
    }

    case UserActionTypes.UPDATE_PROFILE: {
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };
    }

    case UserActionTypes.UPDATE_BETS: {
      return {
        ...state,
        user: {
          ...state.user,
          bets: [...(state.user.bets || []), action.id],
        },
      };
    }

    case UserActionTypes.UPDATE_BALANCE: {
      return {
        ...state,
        user: {
          ...state.user,
          currentAmount: action.payload.amount,
        },
      };
    }

    case UserActionTypes.REMOVE_BET: {
      const betIndex = state.user.bets.indexOf(action._id.toString());
      const prevBets = state.user.bets || [];
      const bets =
        betIndex !== -1
          ? [...prevBets.slice(0, betIndex), ...prevBets.slice(betIndex + 1)]
          : [...prevBets];
      return {
        ...state,
        user: {
          ...state.user,
          bets,
        },
      };
    }

    default:
      return state;
  }
};

export default reducer;
