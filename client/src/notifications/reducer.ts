import { NotificationActionTypes, NotificationState } from "./types";
import find from "lodash/find";

export const initState = {
  notifications: [],
};

const reducer = (
  state: NotificationState = initState,
  action
): NotificationState => {
  switch (action.type) {
    case NotificationActionTypes.GET_SUCCESS: {
      const { notifications } = action.payload;
      return {
        ...state,
        notifications,
      };
    }
    case NotificationActionTypes.MARK_SEEN_SUCCESS: {
      const newNotifications = state.notifications.slice();
      action.payload.forEach((id: string) => {
        const foundNotification = find(newNotifications, { _id: id });
        if (foundNotification) {
          foundNotification.seen = true;
        }
      });

      return {
        ...state,
        notifications: newNotifications,
      };
    }
    default:
      return state;
  }
};

export default reducer;
