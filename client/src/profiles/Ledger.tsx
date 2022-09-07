import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import "./BetHistory.scss";
import moment from "moment-timezone";
import { STATUS_MAP } from "../consts";
import axios from "axios";
import NotAvailable from "../components/NotAvailable";
import { logger } from "../helpers/winston";
import { AuthUser } from "../user/types";

interface LedgerProps {
  bets: React.ReactNode;
  user: AuthUser;
}

const Ledger: React.FunctionComponent<LedgerProps> = ({ bets, user }) => {
  const [allList, setAllList] = useState([]);

  useEffect(() => {
    getLedger();
  }, [bets]);

  const getLedger = () => {
    axios.get(`/api/billing/${user._id}`).then(
      (res) => {
        const betsBilling = res.data.list.concat(bets);

        betsBilling.sort((a, b) => {
          return +new Date(b.createdAt) - +new Date(a.createdAt);
        });

        setAllList(betsBilling);
      },
      (error) => {
        logger.log("error", error);
      }
    );
  };

  const showText = (bet) => {
    switch (bet.status) {
      case STATUS_MAP.WON:
        return "Game over! You won $" + bet.amount;
      case STATUS_MAP.LOSE:
        return "Game over! You lose $" + bet.amount;
      case STATUS_MAP.TIE:
        return "Game over! You tie $" + bet.amount;
      case STATUS_MAP.CANCEL:
        return "No Match, Money Returned";
      default:
        if (bet.partialAmount > 0 && bet.isPartialMatched) {
          return (
            "Your bet on the " +
            bet.side +
            " is partial matched for $" +
            bet.partialAmount +
            " out of $" +
            bet.amount +
            ", we will let you know if you are fully matched"
          );
        } else if (bet.isMatched)
          return (
            "Your bet for " +
            bet.side +
            " for $" +
            bet.amount +
            " is fully matched"
          );

        return (
          "Your bet on the " +
          bet.side +
          " for $" +
          bet.amount +
          " is pending, we will find a match for you shortly"
        );
    }
  };

  return (
    <div className="BetHistory__container LedgerHistory__container">
      <div className="BetHistory__cards">
        {allList.length > 0 ? (
          allList.map((bet) =>
            bet.game ? (
              <div key={bet._id}>
                <p className="Ledger__date">
                  {moment(bet.createdAt).format("MMMM D, hh:mm A")}
                </p>
                <div className="LedgerHistory__card">
                  <div className="LedgerHistory__bet">
                    <div>{showText(bet)}</div>
                  </div>
                </div>
              </div>
            ) : (
              bet.paypal && (
                <div key={bet._id}>
                  <p className="Ledger__date">
                    {moment(bet.createdAt).format("MMMM D, hh:mm A")}
                  </p>
                  <div key={bet._id} className="LedgerHistory__card">
                    <div className="LedgerHistory__bet">
                      <div>
                        You deposited ${bet.paypal.amount} into your account
                      </div>
                    </div>
                  </div>
                </div>
              )
            )
          )
        ) : (
          <NotAvailable text="Ledger" />
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({ user: state.user.user });
export default connect(mapStateToProps)(Ledger);
