import React, { useState, useEffect } from "react";
import "./BetHistory.scss";
import WinIcon from "../layout/assets/won.png";
import LoseIcon from "../layout/assets/lost.png";
import PendingIcon from "../layout/assets/pendingMatch.png";
import TieIcon from "../layout/assets/tie.png";
import User from "../layout/assets/user.svg";
import moment from "moment-timezone";
import CancelIcon from "../layout/assets/cancelled.png";
import { OTHER_PROFILE, STATUS_MAP } from "../consts";
import NotAvailable from "../components/NotAvailable";
import { Link } from "react-router-dom";
import { Bet } from "../game/types";
import { BetUser } from "../user/types";

type Props = {
  bets: Bet[];
  from: string;
};

const BetHistory = ({ bets, from }: Props) => {
  const [pageInc, setPageInc] = useState(1);
  const [allList, setAllList] = useState([]);
  const totalPages = Math.round(bets.length / 10);
  const activeBets = bets.filter((bet) => bet.status != "PENDING");

  useEffect(() => {
    if (activeBets.length > 0) {
      const allBets =
        totalPages >= pageInc
          ? activeBets.slice(0, pageInc * 10)
          : activeBets.slice(0, 10);
      setAllList(allBets);
    }
  }, [pageInc, bets, totalPages]);

  const renderMatchedUsers = (bet: Bet) => {
    return bet.matchedUser.slice(0, 3).map((user: BetUser, index) => (
      <div key={index} className="BetHistory_competitor">
        <Link to={`/bettor-profile/${user._id}`}>
          <img
            src={user.picture ? user.picture : User}
            alt="profile"
            style={{
              height: 40,
              width: 40,
              borderRadius: "50%",
              border: "1.5px solid white",
            }}
          />
        </Link>
      </div>
    ));
  };

  const checkDate = (date) => {
    // current date is eventDate, not eventDateUTC
    // works find because we're using moment
    const today = moment.utc().format();
    return moment(today).isAfter(date);
  };

  const showIcons = (bet) => {
    switch (bet.status) {
      case STATUS_MAP.WON:
        return <img src={WinIcon} alt="Won" width="40" />;
      case STATUS_MAP.LOSE:
        return <img src={LoseIcon} alt="Lose" width="40" />;
      case STATUS_MAP.TIE:
        return (
          <div className="BetHistory__icon-container">
            <img src={TieIcon} alt="Tie" width="40" />
            <p>Push</p>
          </div>
        );
      case STATUS_MAP.CANCEL:
        return <img src={CancelIcon} alt="Cancel" width="40" />;
      case STATUS_MAP.CANCEL_MOVE_LINE:
        return <img src={CancelIcon} alt="Cancel" width="40" />;

      default:
        return (
          <div className="BetHistory__icon-container">
            <img src={PendingIcon} alt="Pending" width="40" />
            <p>No Match</p>
          </div>
        );
    }
  };

  const showAmount = (bet) => {
    switch (bet.status) {
      case STATUS_MAP.WON:
        if (bet.partialAmount > 0 && bet.isPartialMatched) {
          return (
            <span className="bet__won">
              +${bet.partialAmount}/{bet.amount}
            </span>
          );
        }
        return <span className="bet__won">+${bet.amount}</span>;
      case STATUS_MAP.LOSE:
        if (bet.partialAmount > 0 && bet.isPartialMatched)
          return (
            <span className="bet__lose">
              -${bet.partialAmount}/{bet.amount}
            </span>
          );
        return <span className="bet__lose">-${bet.amount}</span>;
      default:
        if (bet.partialAmount > 0 && bet.isPartialMatched) {
          return (
            <span>
              ${bet.partialAmount}/{bet.amount}
            </span>
          );
        }
        return <span>${bet.amount}</span>;
    }
  };

  const showText = (bet) => {
    if (bet.status === STATUS_MAP.CANCEL) return "No Match, Money Returned";
    if (bet.status === STATUS_MAP.CANCEL_MOVE_LINE)
      return "Canceled by line change, Money Returned";
    else return "Matched Against";
  };

  return (
    <div className="BetHistory__container">
      <div className="BetHistory__cards">
        {allList.length === 0 && <NotAvailable text="Settled" />}
        {allList.length > 0 &&
          allList.map(
            (bet) =>
              checkDate(bet.game[0].eventDate) && (
                <div key={bet._id} className="BetHistory__card">
                  <div className="BetHistory__title">
                    <div className="BetHistory__teamAvatar">
                      {showIcons(bet)}
                    </div>
                    <div className="BetHistory__teams">
                      <div className="BetHistory__wagerAmount">
                        {showAmount(bet)} <br />
                      </div>
                      <div className="BetHistory__teams-home">
                        {bet.side}{" "}
                        {bet.side === bet.game[0].favorite ? "-" : "+"}
                        {bet.line}
                      </div>
                    </div>
                  </div>
                  <div className="BetHistory__bet">
                    <div>{showText(bet)}</div>
                  </div>
                  {bet.status !== STATUS_MAP.CANCEL && (
                    <div className="BetHistory__competitors">
                      {renderMatchedUsers(bet)}
                      {bet.matchedUser.length > 3 && (
                        <div className="BetHistory_competitor">
                          {bet.matchedUser.length - 3}+
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
          )}
      </div>
      {allList.length > 0 && totalPages > 1 && (
        <div
          className="MainProfilePanel_load-more-btn"
          onClick={() => {
            setPageInc(pageInc === totalPages ? 1 : pageInc + 1);
          }}
        >
          <div className="MainProfilePanel_load-more-btn-text">
            {pageInc === totalPages ? "Show Less" : "Load More"}
          </div>
        </div>
      )}
    </div>
  );
};

export default BetHistory;
