import React from "react";
import { getLogoName, getTeams } from "../helpers/strings";
import "./gameDetail.scss";
import { Link } from "react-router-dom";
import { STATUS_MAP } from "../consts";
import User from "../layout/assets/user.svg";
import { Game } from "./types";

type BreakdownProps = {
  gameID: number;
  homeOrAway: string;
  game: Game;
};

const Breakdown = ({ gameID, homeOrAway, game }: BreakdownProps) => {
  const getTeamSideBetAmount = (team, bets) => {
    let total = 0;

    if (bets.length > 0) {
      bets.forEach((bet) => {
        if (
          bet.side === team &&
          bet.status !== STATUS_MAP.CANCEL &&
          !bet.party
        ) {
          let amount = bet.amount;
          if (amount === null || amount === undefined) amount = 0;
          total += amount;
        }
      });
    }

    return total;
  };

  const renderImages = (team, bets) => {
    const picArr = [];

    bets.forEach((bet) => {
      if (
        bet.side === team &&
        bet.user !== null &&
        bet.status !== STATUS_MAP.CANCEL &&
        !bet.party
      ) {
        if (!picArr.includes(bet.bettor[0].picture)) {
          picArr.push(bet.bettor[0].picture);
        }
      }
    });

    return {
      pics: picArr
        .slice(0, 3)
        .map((pic: string, idx: number) => (
          <img
            key={idx}
            src={pic ? pic : User}
            className="DashboardCard__friends-pic"
            alt="dashboard card"
          />
        )),
      picsCount: picArr.length,
    };
  };

  const { pics, picsCount } = renderImages(game[homeOrAway], game.bets);

  return (
    <div className="GameDetail__BeatingBreakdown-team">
      <div className="GameDetail__BeatingBreakdown-team_div">
        <img
          src={getLogoName(game[homeOrAway], game["sportID"])}
          className="GameDetail__BeatingBreakdown-team_logo"
          alt="team logo"
        />
        <h1 className="GameDetail__BeatingBreakdown-team_team">
          {getTeams(game[homeOrAway])}
        </h1>
      </div>
      <div className="GameDetail__BeatingBreakdown-Record_div">
        <h1 className="GameDetail__BeatingBreakdown-Record_text">
          Season Record
        </h1>
        <h1 className="GameDetail__BeatingBreakdown-Record_record">
          {game[`${homeOrAway}Record`]}
        </h1>
      </div>
      <div className="GameDetail__BeatingBreakdown-Bets_Div">
        <h1 className="GameDetail__BeatingBreakdown-Bets_text">Total Bets</h1>
        <h1 className="GameDetail__BeatingBreakdown-Bets_bets">
          ${getTeamSideBetAmount(game[homeOrAway], game.bets)}
        </h1>
      </div>
      <div className="GameDetail__BeatingBreakdown-Wager_div">
        <h1 className="GameDetail__BeatingBreakdown-Wager_text">Wagers</h1>
        <div className="GameDetails__Wagers">
          <h1 className="GameDetail__BeatingBreakdown-Wager_res">
            {game[`${homeOrAway}BetCount`]}
          </h1>
          <Link
            to={"/betlist/" + gameID + "/" + game[homeOrAway]}
            className="GameDetail__BeatingBreakdown_link"
          >
            <div className="GameDetail__BeatingBreakdown-Wager2_pics">
              {pics}
            </div>
            {picsCount > 3 && (
              <h1 className="GameDetail__BeatingBreakdown-Wager2_friends">
                {picsCount - 3}+
              </h1>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Breakdown;
