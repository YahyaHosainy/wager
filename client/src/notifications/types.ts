import { Action } from "redux";

export interface NotificationState {
  notifications: Notification[];
}

export interface Notification {
  _id: string;
  message: string;
  userID: string;
  seen: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
  details?: NotificationDetail;
}

export interface NotificationDetail {
  associatedID: string;
  associatedType: "bet" | "game";
}

export enum NotificationActionTypes {
  GET = "NOTIFICATION/GET",
  GET_SUCCESS = "NOTIFICATION/GET_SUCCESS",
  MARK_SEEN = "NOTIFICATION/MARK_SEEN",
  MARK_SEEN_SUCCESS = "NOTIFICATION/MARK_SEEN_SUCCESS",
}

export interface GetNotificationAction extends Action {
  type: NotificationActionTypes.GET;
  payload: { user };
}
export interface GetSuccessNotificationAction extends Action {
  type: NotificationActionTypes.GET_SUCCESS;
  payload: { notifications: Notification[] };
}

export interface MarkSeenNotificationAction extends Action {
  type: NotificationActionTypes.MARK_SEEN;
  payload: { notificationIds: string[] };
}

export interface MarkSeenSuccessNotificationAction extends Action {
  type: NotificationActionTypes.MARK_SEEN_SUCCESS;
}
