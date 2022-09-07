import React from "react";
import classNames from "classnames";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { Notification } from "./types";
import wagerCoin from "../layout/assets/wager-coin.svg";
import "./Notifications.scss";

interface NotificationProps {
  notification: Notification;
}

const NotificationItem: React.FunctionComponent<NotificationProps> = ({
  ...props
}) => {
  const { notification } = props;
  const history = useHistory();
  const isRedirectType =
    props.notification.details?.associatedType &&
    props.notification.details.associatedID;

  const handleOnClick = () => {
    if (isRedirectType) {
      history.push(
        `/${props.notification.details.associatedType}/${props.notification.details.associatedID}`
      );
    }
  };

  const notificationClasses = classNames({
    Notifications__notification: true,
    "Notifications__notification--pointer": isRedirectType,
    "Notifications__notification--unseen": !notification.seen,
  });

  return (
    <div
      onClick={handleOnClick}
      className={notificationClasses}
      key={notification._id}
    >
      <div className="Notifications__icon">
        <img src={wagerCoin} />
      </div>
      <div className="Notifications__notification-message">
        <div className="Notifications__notification-text">
          {notification.message}
        </div>
        <div className="Notifications__notification-date">
          {moment(`${notification.createdAt}`).fromNow()}
        </div>
      </div>
    </div>
  );
};
export default NotificationItem;
