import React, { useContext } from "react";
import { DashboardContext } from "../context/DashboardContext";
import moment from "moment";
import star1 from "../layout/assets/star1.png";
import star2 from "../layout/assets/star2.png";
import star3 from "../layout/assets/star3.png";
import User from "../layout/assets/user.svg";
import orderBy from "lodash/orderBy";
import "./Leaderboard.scss";
import { nameOrUsername } from "../helpers/user";
import { Link } from "react-router-dom";

type Props = {
  content: React.ReactNode; // react element or an array.
  tabNumber: number;
};

const Leaderboard = ({ content, tabNumber }: Props) => {
  const { activeTab } = useContext(DashboardContext);

  const stars = {
    star1: star1,
    star2: star2,
    star3: star3,
  };
  const loadStar = (position) => {
    if ([1, 2, 3].includes(position)) {
      return (
        <div className="leaderboard__stars">
          <img src={stars[`star${position}`]} alt={`Star ${position}`} />
          <p>{position}</p>
        </div>
      );
    } else {
      return <p className="win__lose">{position}</p>;
    }
  };

  const loadLeaderBoard = () => {
    return getSortedLeaderBoardUsers({ content }).length
      ? getSortedLeaderBoardUsers({ content }).map((user: any, idx: number) => {
          return (
            <div className="leaderboard__single" key={idx}>
              <div>{loadStar(idx + 1)}</div>
              <div className="ledger__imgname">
                <p className="ledger__userimg">
                  <Link to={`/bettor-profile/${user.userId}`}>
                    <img
                      src={user.userPhoto || User}
                      alt={nameOrUsername(user)}
                    />
                  </Link>
                </p>
                <p className="ledger__username">
                  <Link to={`/bettor-profile/${user.userId}`}>
                    {nameOrUsername(user)}
                  </Link>
                </p>
              </div>
              <div>
                <p className="win__lose">
                  {user.won} - {user.lose}
                </p>
              </div>
              <div>
                <p className="win__lose">{user.delta}</p>
              </div>
            </div>
          );
        })
      : content; //Not available content
  };

  const getSortedLeaderBoardUsers = ({ content }) => {
    if (React.isValidElement(content) || content.length === 0) return [];
    const userSet = [];
    content.forEach((usersWhoMadeBets) => {
      const data = {
        userId: usersWhoMadeBets._id,
        username: nameOrUsername(usersWhoMadeBets),
        userPhoto: usersWhoMadeBets.picture,
        won: usersWhoMadeBets.won,
        lose: usersWhoMadeBets.lose,
        delta: usersWhoMadeBets.delta,
      };

      userSet.push(data);
    });

    return orderBy(userSet, ["delta", "won"], ["desc", "desc"]);
  };

  const getWeek = () => {
    const from = moment
      .tz("America/Los_Angeles")
      .subtract(30, "days")
      .startOf("day")
      .format("MMMM D");
    const to = moment.tz("America/Los_Angeles").format("MMMM D");
    return `${from} - ${to}`;
  };

  return (
    <div
      className="DashboardSection Leaderboard__container"
      style={{ display: activeTab === tabNumber ? "flex" : "none" }}
    >
      <div>
        <p className="DateWeek">{getWeek()}</p>
        <div className="LeaderboardContainer">
          <div className="leaderboard__header">
            <p>Ranking</p>
            <p>Record</p>
            <p>Delta</p>
          </div>
          {loadLeaderBoard()}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
