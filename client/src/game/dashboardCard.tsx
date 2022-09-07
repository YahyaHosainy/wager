import moment from "moment";
import React from "react";
import { STATUS_MAP } from "../consts";
import { getFilterDate } from "../helpers/dashboardHelpers";
import { getLogoName, timeZone } from "../helpers/strings";
import "./dashboardCard.scss";
import { Game } from "./types";

type MyProps = {
  game: Game;
  sportID: number;
  curNextDate: number;
  from: string;
  onSelectGame: (game: []) => void;
};

type MyState = {
  city: string;
  totalBettors: number;
  totalAmount: number;
  currentDate: string;
  nextDate: string;
};

class DashboardCard extends React.Component<MyProps, MyState> {
  state: MyState = {
    city: "",
    totalBettors: 0,
    totalAmount: 0,
    currentDate: getFilterDate(),
    nextDate: moment().add(1, "days").format("YYYY-MM-DD"),
  };

  componentDidMount() {
    this.getTeam(this.props.game.favorite);
    this.getBettors();
    this.getBettorsAmount();
  }

  setTeams(teamName) {
    if (teamName === "Portland Trail Blazers") {
      teamName = "Trail Blazers";
    } else {
      teamName = teamName.split(" ");
      teamName = teamName[teamName.length - 1];
    }
    return teamName;
  }

  getTeam(teamName) {
    this.setState({
      city: this.setTeams(teamName),
    });
  }

  getBettors() {
    let favCount = this.props.game.favoriteBetCount;
    let underdogCount = this.props.game.underdogBetCount;

    if (this.props.game.favoriteBetCount === undefined) favCount = 0;

    if (this.props.game.underdogBetCount === undefined) underdogCount = 0;

    this.setState({
      totalBettors: favCount + underdogCount,
    });
  }

  getBettorsAmount() {
    if (this.props.game.bets.length > 0) {
      this.props.game.bets.forEach((betObj) => {
        if (betObj.status !== STATUS_MAP.CANCEL && !betObj.party) {
          // if the betOjb is anything but cancelled then add the amount
          if (betObj.amount === null || betObj.amount === undefined)
            betObj.amount = 0; // i don't think will be necessary todo: remove
          this.setState((prevState: MyState) => ({
            totalAmount: prevState.totalAmount + betObj.amount,
          }));
        }
      });
    }
  }

  lessThanMinute(date, id) {
    const diff = moment.utc(date).diff(moment.utc(Date.now()), "minutes");
    if (diff >= 0 && diff <= 2880) window.location.href = "/game/" + id;
    else if (diff < 0) window.location.href = "/game/" + id;
    else alert("You can only bet 48 hours before game starts");
  }

  capitalizeWord(homeOrAway) {
    return homeOrAway.charAt(0).toUpperCase() + homeOrAway.slice(1);
  }

  checkDate() {
    let date = "";

    if (this.props.curNextDate === 1) date = this.state.currentDate;
    else if (this.props.curNextDate === 2) date = this.state.nextDate;
    else date = this.props.game.eventDate

    return date;
  }

  selectGame(game) {
    this.props.onSelectGame(game);
  }

  render() {
    if (this.props.curNextDate !== 3) {
      var dateTime = new Date(this.props.game.eventDateUTC);
      var localDateTime = dateTime.toLocaleTimeString();
      var localTime = localDateTime.slice(0, 5).trim();
      var amOrPm = localDateTime.slice(-2);
      var full_timeZone = dateTime.toTimeString().slice(18);

      if (localTime[localTime.length - 1] === ":") {
        localTime = localTime.slice(0, 4);
      }  
    } else {
      let d = new Date(this.props.game.eventDateUTC)
      var localTime = d.toDateString()
      var amOrPm = ''
    }
    
    return (
      this.props.game.sportID === this.props.sportID &&
      this.checkDate() === this.props.game.eventDate && (
        <div className="DashboardCard__container">
          <div className="DashboardCard__content-container">
            <div className="DashboardCard__info-container">
              <div className="team1_div">
                <div
                  className="DashboardCard__bg"
                  style={{
                    backgroundImage:
                      "url(" +
                      (
                        this.props.game.favoriteHomeOrAway === "home"
                          ? this.props.game.underdogImage
                          : this.props.game.favoriteImage
                      ) +
                      ")",
                  }}
                ></div>
                <h1 className="DashboardCard__team1-container">
                  {this.props.game.favoriteHomeOrAway === "home"
                    ? this.props.game.underdog
                    : this.props.game.favorite}
                  <br />
                </h1>
                <h3 className="away__home">
                  (
                  {this.capitalizeWord(
                    this.props.game.favoriteHomeOrAway === "home"
                      ? this.props.game.underdogHomeOrAway
                      : this.props.game.favoriteHomeOrAway
                  )}
                  )
                </h3>
              </div>
              <div className="time_div">
                <h1 className="time_line">THE LINE</h1>
                <div className="DashboardCard__box-container">
                  <h1 className="DashboardCard__text-box">{this.state.city}</h1>
                  <h4 className="DashboardCard__line-box">
                    -{this.props.game.line.toFixed(1)}
                  </h4>
                </div>
                <h1 className="DashboardCard__time-container">
                  {localTime} {amOrPm}
                  <br />
                  {timeZone[full_timeZone]}
                </h1>
              </div>
              <div className="team2_div">
                <div
                  className="DashboardCard__bg"
                  style={{
                    backgroundImage:
                      "url(" +
                      (
                        this.props.game.underdogHomeOrAway === "home"
                          ? this.props.game.underdogImage
                          : this.props.game.favoriteImage
                      ) +
                      ")",
                  }}
                ></div>
                <h1 className="DashboardCard__team2-container">
                  {this.props.game.underdogHomeOrAway === "home"
                    ? this.props.game.underdog
                    : this.props.game.favorite}
                  <br />
                </h1>
                <h3 className="away__home">
                  (
                  {this.capitalizeWord(
                    this.props.game.underdogHomeOrAway === "home"
                      ? this.props.game.underdogHomeOrAway
                      : this.props.game.favoriteHomeOrAway
                  )}
                  )
                </h3>
              </div>
            </div>
            <div className="DashboardCard__line-container">
              <div className="DashboardCard__friends-div">
                <p>Total Bet</p>
                <h3>${this.state.totalAmount}</h3>
              </div>
              <div className="DashboardCard__line-friends">
                <p>Wagers</p>
                <h3>{this.state.totalBettors}</h3>
              </div>
              <div className="DashboardCard__wrapper">
                {this.props.from === "party" ? (
                  <button
                    className="DashboardCard__button"
                    onClick={() => this.selectGame(this.props.game)}
                  >
                    SELECT
                  </button>
                ) : (
                  <button
                    className="DashboardCard__button"
                    onClick={() =>
                      this.lessThanMinute(
                        this.props.game.eventDateUTC,
                        this.props.game._id
                      )
                    }
                  >
                    WAGER
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    );
  }
}

export default DashboardCard;
