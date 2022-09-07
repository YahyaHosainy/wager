import axios from "axios";
import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { STATUS_MAP } from "../consts";
import LoadingAnimation from "../layout/animations/LoadingAnimation";
import union from "../layout/assets/Union.png";
import FavoriteBetButton from "../layout/buttons/FavoriteBetButton";
import User from "../layout/assets/user.svg";
import { getTime } from "../helpers/dashboardHelpers";
import { AuthUser, BetUser, PartialUser } from "../user/types";
import { logger } from "../helpers/winston";
import "./gameDetail.scss";
import uniqBy from "lodash/uniqBy";
import Comment from "./Comment";
import Team from "./Team";
import Breakdown from "./Breakdown";
import { getTeams } from "../helpers/strings";
import { Bet, Game } from "./types";

type MyProps = {
  routeInfo: {
    match: {
      params: {
        id: number;
      };
    };
  };
  user: AuthUser;
  token: string;
};

type MyState = {
  game: Game;
  gameID: number;
  totalBetCount: number;
  isLoaded: boolean;
  totalBetAmount: number;
  eventTime: string;
  totalUserProfileImg: React.ReactNode;
  totalUserProfileImgCount: number;
  favoriteTotalUserProfileImgCount: number;
  underdogTotalUserProfileImgCount: number;
  home: string;
  away: string;
};

class GameDetail extends React.Component<MyProps, MyState> {
  state: MyState = {
    game: null,
    gameID: this.props.routeInfo.match.params.id,
    totalBetCount: 0,
    isLoaded: false,
    totalBetAmount: 0,
    eventTime: "",
    totalUserProfileImg: "",
    totalUserProfileImgCount: 0,
    favoriteTotalUserProfileImgCount: 0,
    underdogTotalUserProfileImgCount: 0,
    home: "",
    away: "",
  };

  getGame(id: number) {
    axios.get(`/api/game/${id}`).then(
      (response) => {
        this.setState({
          game: response.data[0],
          totalBetCount:
            response.data[0].favoriteBetCount +
            response.data[0].underdogBetCount,
          totalBetAmount: this.getTotalBetAmount(response.data[0].bets),
          eventTime: getTime(response.data[0].eventDateUTC),
          totalUserProfileImg: this.renderImg(response.data[0].bets),
          isLoaded: true,
          home:
            response.data[0]["favoriteHomeOrAway"] === "home"
              ? "favorite"
              : "underdog",
          away:
            response.data[0]["favoriteHomeOrAway"] === "away"
              ? "favorite"
              : "underdog",
        });
      },
      (error) => {
        logger.log("error", error);
      }
    );
  }

  getTotalBetAmount(bets) {
    let total = 0;

    if (bets.length > 0) {
      bets.forEach((element) => {
        if (element.status !== STATUS_MAP.CANCEL && !element.party) {
          let amount = element.amount;
          if (amount === null || amount === undefined) amount = 0;
          total += amount;
        }
      });
    }

    return total;
  }

  componentDidMount() {
    this.getGame(this.state.gameID);
  }

  renderImg(bets: Bet[]) {
    const betUsers = bets.reduce((users: PartialUser[], bet: Bet) => {
      if (!bet.party) return users.concat(bet.bettor);
      return users;
    }, [] as PartialUser[]);
    const users = uniqBy(betUsers, "_id");

    return users.slice(0, 5).map((user: PartialUser, idx: number) => (
      <Link to={`/bettor-profile/${user._id}`} key={idx}>
        <img
          src={user?.picture || User}
          className="DashboardCard__friends-pic"
          alt="dashboard card"
        />
      </Link>
    ));
  }

  render() {
    const { game, home, away } = this.state;
    return (
      <div className="GameDetail__container">
        {this.state.isLoaded ? (
          <>
            <div className="GameDetail__header">
              <Link to="/games">
                <img src={union} className="GameDetail__union" alt="" />
              </Link>
              <h1 className="GameDetail__header-teams">
                {game[`${away}Abrv`]} vs {game[`${home}Abrv`]}
              </h1>
            </div>
            <div className="GameDetail__teams-info">
              <Team homeOrAway={away} game={game} />
              <div className="GameDetail__vs">
                <h1 className="time_line">THE LINE</h1>
                <div className="DashboardCard__box-container">
                  <h1 className="DashboardCard__text-box">
                    {getTeams(game["favorite"])}
                  </h1>
                  <h4 className="DashboardCard__line-box">
                    -{game["line"].toFixed(1)}
                  </h4>
                </div>
                <h1 className="DashboardCard__time-container">
                  {this.state.eventTime}
                </h1>
              </div>
              <Team homeOrAway={home} game={game} />
            </div>
            <div className="GameDetail__details-wager">
              <div className="first">
                <h1 className="GameDetail__details-totalBet">Total Bet</h1>
                <h1 className="GameDetail__details-amount">
                  ${this.state.totalBetAmount}
                </h1>
              </div>
              <div className="second">
                <h1 className="GameDetail__details-wag">Wagers</h1>
                <h1 className="GameDetail__details-num">
                  {this.state.totalBetCount}
                </h1>
              </div>
              <div className="third">
                <div className="GameDetail__details-div">
                  {this.state.totalUserProfileImg}
                  {this.state.totalUserProfileImgCount > 5 && (
                    <h1 className="GameDetail__details-friends">
                      {this.state.totalUserProfileImgCount - 5}+
                    </h1>
                  )}
                </div>
              </div>
            </div>
            <FavoriteBetButton GameData={game} side={game["favorite"]} />

            <h1 className="GameDetail__BeatingBreakdown">Game Breakdown</h1>
            <div className="GameDetail__BeatingBreakdown-div">
              {[away, home].map((breakdown, index) => {
                return (
                  <Breakdown
                    gameID={this.state.gameID}
                    homeOrAway={breakdown}
                    game={game}
                    key={index}
                  />
                );
              })}
            </div>
            <Comment partyID="" gameID={String(this.state.gameID)} />
          </>
        ) : (
          <LoadingAnimation />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user.user,
  token: state.user.token,
});
export default connect(mapStateToProps)(GameDetail);
