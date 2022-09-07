import { put, call, takeLatest } from "redux-saga/effects";
import { NotificationActionTypes } from "./notifications/types";
import axios from "axios";
import {
  getNotificationsSuccess,
  markNotificationsSeenSuccess,
} from "./notifications/actions";
import { logger } from "./helpers/winston";
import { getPartySuccess } from "./party/actions";
import {
  deleteStorySuccess,
  getStorySuccess,
  likeStorySuccess,
} from "./story/actions";
import { PartyActionTypes } from "./party/types";
import { StoryActionTypes } from "./story/types";

function apiGetNotifications(userId, token) {
  return axios.get(`/api/notifications/${userId}`, {
    headers: { "x-access-token": `${token}` },
  });
}

function* getNotifications(action) {
  try {
    const resp = yield call(
      apiGetNotifications,
      action.payload.userId,
      action.payload.token
    );
    yield put(getNotificationsSuccess(resp.data));
  } catch (e) {
    logger.log("error", e);
  }
}

function apiMarkNotificationsSeen(notificationIds, userId, token) {
  return axios.post(
    `/api/notifications/${userId}/markSeen`,
    { notifications: notificationIds },
    {
      headers: { "x-access-token": `${token}` },
    }
  );
}

function* markNotificationsSeen(action) {
  try {
    const resp = yield call(
      apiMarkNotificationsSeen,
      action.payload.notificationIds,
      action.payload.userId,
      action.payload.token
    );
    yield put(markNotificationsSeenSuccess(resp.data));
  } catch (e) {
    logger.log("error", e);
  }
}

function apiGetParty(partyID, token) {
  return axios.get(`/api/party/${partyID}`, {
    headers: { "x-access-token": `${token}` },
  });
}

function* getParty(action) {
  try {
    const resp = yield call(
      apiGetParty,
      action.payload.partyID,
      action.payload.token
    );
    yield put(getPartySuccess(resp.data));
  } catch (e) {
    logger.log("error", e);
  }
}

function apiGetStory(partyID, token) {
  return axios.get(`/api/story/${partyID}/`, {
    headers: { "x-access-token": `${token}` },
  });
}

function* getStory(action) {
  try {
    const resp = yield call(
      apiGetStory,
      action.payload.partyID,
      action.payload.token
    );

    yield put(getStorySuccess(resp.data));
  } catch (e) {
    logger.log("error", e);
  }
}

function apiLikeStory(storyID, userID, token) {
  return axios.post(
    `/api/story/like/${storyID}/`,
    { userID },
    { headers: { "x-access-token": `${token}` } }
  );
}

function* likeStory(action) {
  try {
    const resp = yield call(
      apiLikeStory,
      action.payload.storyID,
      action.payload.userID,
      action.payload.token
    );

    yield put(likeStorySuccess(resp.data));
  } catch (e) {
    logger.log("error", e);
  }
}

function apiDeleteStory(storyID, userID, token) {
  return axios.post(
    `/api/story/delete/${storyID}/`,
    { userID },
    { headers: { "x-access-token": `${token}` } }
  );
}

function* deleteStory(action) {
  try {
    const resp = yield call(
      apiDeleteStory,
      action.payload.storyID,
      action.payload.userID,
      action.payload.token
    );

    yield put(deleteStorySuccess(resp.data));
  } catch (e) {
    logger.log("error", e);
  }
}

// Get the response of the latest request(s)
export default function* rootSaga() {
  yield takeLatest(NotificationActionTypes.GET, getNotifications);
  yield takeLatest(NotificationActionTypes.MARK_SEEN, markNotificationsSeen);
  yield takeLatest(PartyActionTypes.GET, getParty);
  yield takeLatest(StoryActionTypes.GET, getStory);
  yield takeLatest(StoryActionTypes.LIKE, likeStory);
  yield takeLatest(StoryActionTypes.DELETE, deleteStory);
}
