import axios from "axios";
import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { STATUS_MAP } from "../consts";
import LoadingAnimation from "../layout/animations/LoadingAnimation";
import union from "../layout/assets/Union.png";
import User from "../layout/assets/user.svg";
import Layout from "../layout/Layout";
import { logger } from "../helpers/winston";
import "./betList.scss";
import { getLogoName } from "../helpers/strings";
import { Bet, Game } from "./types";
import { AuthUser } from "../user/types";
import { RouteComponentProps } from "react-router";

interface BetListRouteProps {
  id: string;
  side: string;
}

interface BetListProps extends RouteComponentProps<BetListRouteProps> {
  user: AuthUser;
  partyID?: string;
}

type BetListState = {
  isLoaded: boolean;
  gameID: string;
  selectedSide: string;
  game: Game;
  bets: Bet[];
};
class BetList extends React.Component<BetListProps, BetListState> {
  state: BetListState = {
    isLoaded: false,
    gameID: this.props.match.params.id,
    selectedSide: this.props.match.params.side,
    game: null,
    bets: [],
  };

  componentDidMount() {
    this.getBettors();
  }

  getBettors() {
    axios
      .get(
        `/api/game/bettors/${this.state.gameID}/${this.state.selectedSide}${
          this.props.partyID ? "?party=" + this.props.partyID : ""
        }`
      )
      .then(
        (response) => {
          this.setState({
            game: response.data.game,
            bets: response.data.bets,
            isLoaded: true,
          });
        },
        (error) => {
          logger.log("error", error);
        }
      );
  }

  getCity(city) {
    const count1 = city.split(" ").length - 1;
    if (count1 < 2) {
      city = city.split(" ", 1);
      city = city[0];
    } else if (city === "Portland Trail Blazers") {
      city = "Portland";
    } else {
      city = city.split(" ", 2);
      city = `${city[0]} ${city[1]}`;
    }
    return city;
  }

  getTeams(teamName) {
    if (teamName === "Portland Trail Blazers") {
      teamName = "Trail Blazers";
    } else {
      teamName = teamName.split(" ");
      teamName = teamName[teamName.length - 1];
    }
    return teamName;
  }

  getTotalBet() {
    let total = 0;

    if (this.state.bets.length > 0) {
      this.state.bets.forEach((element) => {
        if (element.status !== STATUS_MAP.CANCEL) {
          let amount = element.amount;
          if (amount === null || amount === undefined) amount = 0;
          total += amount;
        }
      });
    }

    return total;
  }

  render() {
    const { game } = this.state;
    return (
      <Layout>
        <div className="GameDetail__container">
          {this.state.isLoaded ? (
            <>
              <div className="GameDetail__header">
                <Link to={"/game/" + this.state.gameID}>
                  <img src={union} className="GameDetail__union" alt="" />
                </Link>
                <h1 className="GameDetail__header-teams">
                  {game.favoriteAbrv} vs {game.underdogAbrv}
                </h1>
              </div>
              <div className="GameDetail__teams-info">
                <div className="GameDetail__teams-details">
                  <div className="GameDetail__teams-details1">
                    <div
                      className="DashboardCard__bg"
                      style={{
                        backgroundImage: `url(${getLogoName(
                          `${this.getCity(
                            this.state.selectedSide
                          )} ${this.getTeams(this.state.selectedSide)}`,
                          game.sportID
                        )})`,
                      }}
                    ></div>
                    <h4>{this.state.selectedSide}</h4>
                  </div>
                  <div className="GameDetail__teams-details3">
                    <h6>Total {this.getCity(this.state.selectedSide)} Bets</h6>
                    <h2>${this.getTotalBet()}</h2>
                  </div>
                </div>
              </div>
              <div className="bettors">
                <h2>Bettors</h2>
                <div className="betList">
                  {this.state.bets.map(
                    (bet: Bet) =>
                      bet.status !== STATUS_MAP.CANCEL && (
                        <Link to={`/bettor-profile/${bet.user._id}`}>
                          <div className="singlebet">
                            <img
                              src={bet.user.picture ? bet.user.picture : User}
                              className="Bettor__friends-pic"
                              alt={bet.user.displayName}
                            />
                            <h4>{bet.user.displayName}</h4>
                          </div>
                        </Link>
                      )
                  )}
                </div>
              </div>
            </>
          ) : (
            <LoadingAnimation />
          )}
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state) => ({ user: state.user.user });
export default connect(mapStateToProps)(BetList);
