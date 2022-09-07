import { Action } from "redux";
import { Bet } from "../game/types";
import { RequestStatus } from "../_redux/types";

export interface PartialUser {
  _id: string;
  name: string;
  username?: string;
  picture: string;
  bio?: string;
  followers: UserFollow[];
  bets?: Bet[];
  displayName?: string;
}
export interface BetUser extends PartialUser {
  isFirstEdit?: boolean;
}

export interface UserFollow {
  _id: string;
}

export interface UserSocial {
  _id: string;
  following: UserFollow[];
  followers: UserFollow[];
}

export interface AuthUser extends BetUser {
  bio?: string;
  email?: string;
  emailVerify: boolean;
  bets?: Bet[];
  currentAmount?: number;
  winnings?: number;
  token?: string;
  source: string;
  isFirstEdit: boolean;
  following: UserFollow[];
  followers: UserFollow[];
  createdAt: string;
}

export interface UserState {
  user?: AuthUser;
  status: RequestStatus;
  active?: Bet;
  token?: string;
  isAuthenticated: boolean;
}

export enum UserActionTypes {
  LOAD = "USER/LOAD",
  UPDATE_BETS = "USER/UPDATE_BETS",
  UPDATE_PROFILE = "USER/UPDATE_PROFILE",
  UPDATE_BALANCE = "USER/UPDATE_BALANCE",
  REMOVE_BET = "USER/REMOVE_BET",
  LOAD_SUCCESS = "USER/LOAD_SUCCESS",
  LOAD_ERROR = "USER/LOAD_ERROR",
  LOGIN = "USER/LOGIN",
  LOGIN_SUCCESS = "USER/LOGIN_SUCCESS",
  LOGOUT = "USER/LOGOUT",
}

export interface UserAction extends Action {
  type: UserActionTypes.LOAD;
}

export interface UpdateBalanceUserAction extends Action {
  type: UserActionTypes.UPDATE_BALANCE;
  payload: { amount: number };
}

export interface UserSuccessAction extends Action {
  type: UserActionTypes.LOAD_SUCCESS;
  payload: { user: AuthUser };
}

export interface UserErrorAction extends Action {
  type: UserActionTypes.LOAD_ERROR;
}

export interface LoginAuthAction extends Action {
  type: UserActionTypes.LOGIN;
  payload: { token: string; isAuthenticated: boolean };
}
export interface LoginSuccessAuthAction extends Action {
  type: UserActionTypes.LOGIN_SUCCESS;
  payload: { token: string };
}

export interface LogoutAuthAction extends Action {
  type: UserActionTypes.LOGOUT;
}
