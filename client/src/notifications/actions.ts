import { ActionCreator } from "redux";
import {
  GetNotificationAction,
  GetSuccessNotificationAction,
  MarkSeenNotificationAction,
  MarkSeenSuccessNotificationAction,
  NotificationActionTypes,
} from "./types";

export const getNotifications: ActionCreator<GetNotificationAction> = (
  payload
) => ({
  type: NotificationActionTypes.GET,
  payload,
});

export const getNotificationsSuccess: ActionCreator<GetSuccessNotificationAction> =
  (payload) => ({
    type: NotificationActionTypes.GET_SUCCESS,
    payload,
  });

export const markNotificationsSeen: ActionCreator<MarkSeenNotificationAction> =
  (payload) => ({
    type: NotificationActionTypes.MARK_SEEN,
    payload,
  });

export const markNotificationsSeenSuccess: ActionCreator<MarkSeenSuccessNotificationAction> =
  (payload) => ({
    payload,
    type: NotificationActionTypes.MARK_SEEN_SUCCESS,
  });
