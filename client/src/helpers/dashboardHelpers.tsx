import React from "react";
import moment from "moment";
import { STATUS_MAP } from "../consts";

import matchedIcon from "../layout/assets/matched.png";
import partialIcon from "../layout/assets/partial.png";
import pendingMatchIcon from "../layout/assets/pendingMatch.png";
import cancelMatchIcon from "../layout/assets/cancelled.png";

export const getFilterDate = () => {
  const tz = moment.tz.guess();
  return moment().tz(tz).format("YYYY-MM-DD");
};

export const getTime = (date) => {
  const tz = moment.tz.guess();
  return moment(date).tz(tz).format("h:mm A");
};

export const showMatchedIcons = (bet) => {
  if (
    bet.status === STATUS_MAP.CANCEL ||
    bet.status === STATUS_MAP.CANCEL_MOVE_LINE
  ) {
    return (
      <div className="BetHistory__icon-container">
        <img
          src={cancelMatchIcon}
          alt="Matched"
          className="BetHistory__teamAvatar-picture"
        />
        <p>Canceled</p>
      </div>
    );
  } else if (bet.isMatched) {
    return (
      <div className="BetHistory__icon-container">
        <img
          src={matchedIcon}
          alt="Matched"
          className="BetHistory__teamAvatar-picture"
        />
        <p>Matched</p>
      </div>
    );
  } else if (
    bet.isPartialMatched ||
    bet.status === STATUS_MAP.PENDING_PARTIAL_LINE_CHANGE
  ) {
    return (
      <div className="BetHistory__icon-container">
        <img
          src={partialIcon}
          alt="Partial"
          className="BetHistory__teamAvatar-picture"
        />
        <p>Partial match</p>
      </div>
    );
  } else {
    return (
      <div className="BetHistory__icon-container">
        <img
          src={pendingMatchIcon}
          alt="Pending"
          className="BetHistory__teamAvatar-picture"
        />
        <p>Searching</p>
      </div>
    );
  }
};

export const showMatchedText = (bet) => {
  if (bet.status === STATUS_MAP.CANCEL) return "No Match, Money Returned";
  else if (bet.status === STATUS_MAP.CANCEL_MOVE_LINE)
    return "Canceled by line change";
  else if (bet.isMatched) return "Matched Against";
  else if (bet.isPartialMatched) return "Partially Matched";
  else return "Searching for a match";
};

export const getTeams = (teamName) => {
  if (teamName === "Portland Trail Blazers") {
    teamName = "Trail Blazers";
  } else {
    teamName = teamName.split(" ");
    teamName = teamName[teamName.length - 1];
  }
  return teamName;
};

export enum Tabs {
  YOUR_WAGERS = 1,
  NBA = 2,
  NFL = 3,
  LEADERBOARD = 4,
  NEWSFEED = 5,
  NCAA = 6,
  PARTY = 7,
  PLAYERPROPS = 8,
}
