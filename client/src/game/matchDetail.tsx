import axios from "axios";
import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import LoadingAnimation from "../layout/animations/LoadingAnimation";
import union from "../layout/assets/Union.png";
import "./matchDetail.scss";
import User from "../layout/assets/user.svg";
import { logger } from "../helpers/winston";
import { getLogoName } from "../helpers/strings";
import { nameOrUsername } from "../helpers/user";
import { AuthUser, BetUser } from "../user/types";
import { Bet } from "./types";

type MyProps = {
  user: AuthUser;
  gameId: string;
  side: string;
  bet: Bet;
  favorite: string;
  underdog: string;
  backButton?: (event: React.MouseEvent<HTMLImageElement>) => void;
};

type MyState = {
  betID: React.ReactNode;
  game: object | null;
  isLoaded: boolean;
  favTeam: string;
  underdogTeam: string;
  matchedUserImages: string;
  themCount: number;
  amountMatched: number;
  underdogBetAmount: number;
  side: string;
  oppositeSide: string;
};

class matchDetail extends React.Component<MyProps, MyState> {
  state: MyState = {
    betID: "",
    game: null,
    isLoaded: false,
    favTeam: "",
    underdogTeam: "",
    matchedUserImages: "",
    themCount: 0,
    amountMatched: 0,
    underdogBetAmount: 0,
    side: "",
    oppositeSide: "",
  };

  componentDidMount() {
    this.setState({
      betID: this.props.user.bets[this.props.user.bets.length - 1],
      side: this.props.side,
      oppositeSide:
        this.props.bet.side === this.props.favorite
          ? this.props.underdog
          : this.props.favorite,
    });

    this.getGame(this.props.gameId);
  }

  getGame(id: string) {
    axios.get(`/api/game/${id}`).then(
      (response) => {
        this.setState({
          game: response.data[0],
          isLoaded: true,
          favTeam: this.getTeams(response.data[0]?.favorite),
          underdogTeam: this.getTeams(response.data[0]?.underdog),
          matchedUserImages: this.renderMatchedUsers(this.props.bet),
          amountMatched: this.getBetAmount(this.props.bet),
        });
      },
      (error) => {
        logger.log("error", error);
      }
    );
  }

  getBetAmount(bet) {
    return bet.isMatched ? bet.amount : `${bet.partialAmount}/${bet.amount}`;
  }

  getSideTeamAndLine(bet, side, favorite, underdog) {
    if (side === favorite) {
      return `${this.state.favTeam}
      -(${bet.line.toFixed(1)})`;
    } else if (side === underdog) {
      return `${this.state.underdogTeam}
      +(${bet.line.toFixed(1)})`;
    }
  }

  getCity(bets, type) {
    let city;
    if (type === "fav") city = this.state.side;
    else city = this.state.oppositeSide;
    let city1;

    const count1 = city.split(" ").length - 1;
    if (count1 < 2) {
      city1 = city.split(" ", 1);
      city = city1[0];
    } else if (city === "Portland Trail Blazers") {
      city = "Portland";
    } else {
      city1 = city.split(" ", 2);
      city = `${city1[0]} ${city1[1]}`;
    }
    return city;
  }

  getTeams(side) {
    let teamName;

    if (side === "Portland Trail Blazers") {
      teamName = "Trail Blazers";
    } else {
      teamName = side.split(" ");
      teamName = teamName[teamName.length - 1];
    }

    return teamName;
  }

  renderMatchedUsers = (bet) => {
    return bet.matchedUser.slice(0, 3).map((user: BetUser) => (
      <div key={user._id} className="competitors">
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

  handleBackButton = (event: React.MouseEvent<HTMLImageElement>) => {
    this.props.backButton
      ? this.props.backButton(event)
      : (window.location.href = `/game/${this.props.gameId}`);
  };

  render() {
    const { game } = this.state;
    return (
      <>
        {this.state.isLoaded ? (
          <>
            <div className="GameDetail__header MatchDetail__header">
              <img
                src={union}
                className="GameDetail__union"
                alt="Back Icon"
                onClick={this.handleBackButton}
              />
              <h1 className="GameDetail__header-teams">
                {game["favoriteAbrv"]} vs {game["underdogAbrv"]}
              </h1>
            </div>
            <div className="MatchDetail__teamInfo">
              <div className="Info__first">
                <img
                  src={this.props.user.picture ? this.props.user.picture : User}
                  alt={this.props.user.name}
                />
                <h1>You</h1>
                <div className="Team__details">
                  <img
                    src={getLogoName(this.props.bet.side, game["sportID"])}
                    alt={this.props.bet.side}
                  />
                  <div className="Details__info">
                    <p>${this.state.amountMatched}</p>
                    <p>
                      {this.getSideTeamAndLine(
                        this.props.bet,
                        this.props.bet.side,
                        this.props.favorite,
                        this.props.underdog
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="Info__second">
                <div className="GameDetail__vs MatchDetail__vs">
                  <div className="DashboardCard__box-container">
                    <h1 className="DashboardCard__text-box">
                      {this.state.favTeam}
                    </h1>
                    <h4 className="DashboardCard__line-box">
                      -{game["line"].toFixed(1)}
                    </h4>
                  </div>
                  <h1 className="DashboardCard__time-container">
                    matched against
                  </h1>
                </div>
              </div>
              <div className="Info__last">
                <div className="Images__multiple">
                  {this.state.matchedUserImages}
                  {this.props.bet.matchedUser.length > 3 && (
                    <div className="competitors">
                      {this.props.bet.matchedUser.length - 3}+
                    </div>
                  )}
                </div>
                <h1>
                  {this.props.bet.matchedUser.length > 1
                    ? "Them"
                    : nameOrUsername(this.props.bet.matchedUser[0])}
                </h1>
                <div className="Team__details">
                  <img
                    src={getLogoName(this.state.oppositeSide, game["sportID"])}
                    alt={this.state.oppositeSide}
                  />
                  <div className="Details__info">
                    <p>
                      $
                      {this.props.bet.isMatched
                        ? this.props.bet.amount
                        : this.props.bet.partialAmount}
                    </p>
                    <p>
                      {this.getSideTeamAndLine(
                        this.props.bet,
                        this.state.oppositeSide,
                        this.props.favorite,
                        this.props.underdog
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="Potential__winning">
              <p>Your Potential Winnings</p>
              <h1>${this.props.bet.amount * 2}</h1>
            </div>
          </>
        ) : (
          <LoadingAnimation />
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => ({ user: state.user.user });
export default connect(mapStateToProps)(matchDetail);
