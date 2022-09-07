import React, { useState, useEffect, useContext } from "react";
import { connect } from "react-redux";
import axios from "axios";
import {
  getFilterDate,
  getTeams,
  showMatchedIcons,
  showMatchedText,
} from "../helpers/dashboardHelpers";
import "./BetHistory.scss";
import User from "../layout/assets/user.svg";
import CancelBet from "../layout/CancelBet";
import NotAvailable from "../components/NotAvailable";
import { STATUS_MAP } from "../consts";
import DashboardContext from "../context/DashboardContext";
import { AuthUser, UserActionTypes } from "../user/types";
import { logger } from "../helpers/winston";
import { Link } from "react-router-dom";

type MyProps = {
  user: AuthUser;
  token: string;
  updateAmount: any;
};

const ActiveWagers = ({ user, token, updateAmount }: MyProps) => {
  const { cancelId, bets, setBets } = useContext(DashboardContext);

  useEffect(() => {
    getProfile({ user });
  }, [cancelId]);

  const getProfile = ({ user }) => {
    const today = getFilterDate();
    axios
      .get(`/api/profilefilter/${user._id}/${today}`, {
        headers: { "x-access-token": `${token}` },
      })
      .then(
        (res) => {
          setBets(res.data.todaysBets);
        },
        (error) => {
          logger.log("error", error);
        }
      );
  };

  const renderMatchedUsers = (bet) => {
    return bet.matchedUser.slice(0, 3).map((user: any, index) => (
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

  const showAmount = (bet) => {
    if (bet.partialAmount > 0 && bet.isPartialMatched) {
      return (
        <span>
          ${bet.partialAmount}/{bet.amount}
        </span>
      );
    }
    return <span>${bet.amount}</span>;
  };

  return (
    <div className="BetHistory__container">
      <div>
        {bets.length > 0 ? (
          bets.map(
            (bet) =>
              bet.game !== null && (
                <div className="Dashboard__pending-main" key={bet._id}>
                  <div className="Dashboard__pending-container">
                    <div className="BetHistory__title">
                      <div className="BetHistory__teamAvatar">
                        {showMatchedIcons(bet)}
                      </div>
                      <div className="BetHistory__teams">
                        <div className="BetHistory__wagerAmount">
                          {showAmount(bet)} <br />
                        </div>
                        <div className="BetHistory__teams-home">
                          {getTeams(bet.side)}{" "}
                          {bet.side === bet.game[0].favorite ? "-" : "+"}
                          {bet.line}
                        </div>
                      </div>
                    </div>
                    <div className="BetHistory__bet">
                      <div>{showMatchedText(bet)}</div>
                    </div>
                    <div className="BetHistory__competitors">
                      {renderMatchedUsers(bet)}
                      {bet.matchedUser.length > 3 && (
                        <div className="BetHistory_competitor">
                          {bet.matchedUser.length - 3}+
                        </div>
                      )}
                    </div>
                  </div>
                  {/* {!bet.isMatched &&
                    bet.status === STATUS_MAP.PENDING &&
                    !bet.isPartialMatched && (
                      <CancelBet
                        bet={bet}
                        user={user}
                        updateAmount={updateAmount}
                      />
                    )} */}
                </div>
              )
          )
        ) : (
          <NotAvailable text="Wagers" />
        )}
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => ({
  updateAmount: (amount) => {
    dispatch({
      type: UserActionTypes.UPDATE_BALANCE,
      payload: { amount },
    });
  },
});

const mapStateToProps = (state) => ({
  user: state.user.user,
  token: state.user.token,
});

export default connect(mapStateToProps, mapDispatchToProps)(ActiveWagers);
