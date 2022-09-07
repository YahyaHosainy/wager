import axios from "axios";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import * as Sentry from "@sentry/react";

import NotAvailableWrapper from "../components/NotAvailableWrapper";
import moment from "moment-timezone";
import { STATUS_MAP } from "../consts";
import "./NewsFeed.scss";
import { AuthUser } from "../user/types";
import { Bet } from "../game/types";

type NewsFeedProps = {
  tabNumber: number;
  token: string;
  user: AuthUser;
};

const NewsFeed = ({ user, tabNumber, token }: NewsFeedProps) => {
  const [pagination, setPagination] = useState<number>(10);
  const [newsfeed, setNewsfeed] = useState<Bet[]>([]);
  const [loadingNewsfeed, setLoadingNewsfeed] = useState<boolean>(true);

  useEffect(() => {
    const handleScroll = (e) => {
      if (
        e.target.documentElement.scrollTop +
          e.target.documentElement.clientHeight >=
        e.target.documentElement.scrollHeight - 20
      ) {
        setPagination(pagination + 10);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pagination]);

  useEffect(() => {
    axios
      .get(`/api/profile/${user._id}/newsfeed`, {
        headers: { "x-access-token": `${token}` },
      })
      .then(
        (res) => {
          setLoadingNewsfeed(false);
          setNewsfeed(res.data);
        },
        (error) => {
          Sentry.captureException("error in Newsfeed", error);
        }
      );
  }, []);

  const showText = (bet: Bet) => {
    const name = bet.user[0].isFirstEdit
      ? bet.user[0].username
      : bet.user[0].name;

    switch (bet.status) {
      case STATUS_MAP.PENDING:
        if (bet.partialAmount > 0 && bet.isPartialMatched) {
          return (
            name +
            " bet on the " +
            bet.side +
            " is partial matched for $" +
            bet.partialAmount +
            " out of $" +
            bet.amount
          );
        } else if (bet.isMatched)
          return (
            name +
            " bet for " +
            bet.side +
            " for $" +
            bet.amount +
            " is fully matched"
          );

        return (
          name +
          " bet on the " +
          bet.side +
          " for $" +
          bet.amount +
          " is pending, we will find a match for you shortly"
        );
    }
  };

  return (
    <NotAvailableWrapper
      tabNumber={tabNumber}
      text="NewsFeed"
      loading={loadingNewsfeed}
      styleName="NewsfeedSection"
    >
      {newsfeed.slice(0, pagination).map((bets: Bet, idx: number) => (
        <div className="NewsfeedContainer" key={idx}>
          <img
            src={bets.user[0].picture}
            alt={
              bets.user[0].isFirstEdit
                ? bets.user[0].username
                : bets.user[0].name
            }
          />
          <div className="newsfeed__contents">
            <div className="user__name">
              <p>
                @
                {bets.user[0].isFirstEdit
                  ? bets.user[0].username
                  : bets.user[0].name}
              </p>
              <p className="timestamp">
                {moment(bets.createdAt).format("MM/DD/YY h:mm A")}
              </p>
            </div>
            <p>{showText(bets)}</p>
          </div>
        </div>
      ))}
    </NotAvailableWrapper>
  );
};

const mapStateToProps = (state) => ({
  user: state.user.user,
  token: state.user.token,
});

export default connect(mapStateToProps)(NewsFeed);
