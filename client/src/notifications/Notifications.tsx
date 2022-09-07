import { connect } from "react-redux";
import React, { useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import { getNotifications, markNotificationsSeen } from "./actions";
import { Notification } from "./types";
import notificationBell from "../layout/assets/notification-bell.svg";
import NotificationItem from "./NotificationItem";
import "./Notifications.scss";

interface NotificationsProps {
  notifications: Notification[];
  token: string;
  userId: string;
  getNotifications: typeof getNotifications;
  markNotificationsSeen: typeof markNotificationsSeen;
}

const Notifications: React.FunctionComponent<NotificationsProps> = ({
  ...props
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOnClick = () => {
    if (drawerOpen) {
      const unSeenNotificationIds = props.notifications
        ?.filter((notification: Notification) => {
          return !notification.seen;
        })
        .map((notification: Notification) => notification._id);

      unSeenNotificationIds?.length > 0 &&
        props.markNotificationsSeen({
          userId: props.userId,
          token: props.token,
          notificationIds: unSeenNotificationIds,
        });
    }
    setDrawerOpen(!drawerOpen);
  };

  useEffect(() => {
    props.getNotifications({ token: props.token, userId: props.userId });
  }, []);

  const uniqNotifications = useMemo(() => {
    const timesSet = new Set();
    return props.notifications.filter((notification: Notification) => {
      const momentTime = moment(notification.createdAt).startOf("minute");
      const timeBetTypeHash = momentTime.toISOString() + notification.type;
      if (timesSet.has(timeBetTypeHash)) {
        return false;
      }
      timesSet.add(timeBetTypeHash);
      return true;
    });
  }, [props.notifications.length]);

  const notificationItems = uniqNotifications?.map(
    (notification: Notification) => {
      return (
        <NotificationItem key={notification._id} notification={notification} />
      );
    }
  );

  const numUnseen = uniqNotifications?.reduce(
    (counter, { seen }) => (!seen ? (counter += 1) : counter),
    0
  );

  return (
    <div className="Notifications" onClick={handleOnClick}>
      <img className="Notification__bell" src={notificationBell} />
      {numUnseen > 0 && (
        <div className="Notifications__count-container">
          <span className="Notifications__count">{numUnseen || 0}</span>
        </div>
      )}
      {drawerOpen && (
        <div className="Notifications__drawer">
          {notificationItems?.length
            ? notificationItems
            : "You're all caught up!"}
        </div>
      )}
    </div>
  );
};

const mapDispatchToProps = {
  getNotifications,
  markNotificationsSeen,
};

const mapStateToProps = (state) => {
  const notifications = state.notification.notifications;

  return {
    notifications,
    userId: state.user.user._id,
    token: state.user.token,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
