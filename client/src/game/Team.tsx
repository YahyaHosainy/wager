import React from "react";
import { NCAA_TEAMS } from "../fixtures/ncaa";
import { getLogoName, getTeams } from "../helpers/strings";
import "./gameDetail.scss";
import { find } from "lodash";
import { Game } from "./types";

type TeamProps = {
  homeOrAway: string;
  game: Game;
};

const Team = ({ homeOrAway, game }: TeamProps) => {
  const getCity = (city) => {
    const foundTeamCity = find(NCAA_TEAMS, { fullName: city });

    if (foundTeamCity) {
      return foundTeamCity.name;
    }

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
  };

  return (
    <div className="GameDetail__teams-team">
      <div
        className="DashboardCard__bg"
        style={{
          backgroundImage: `url(${(
            game[homeOrAway+'Image']
          )})`,
        }}
      ></div>
      <h1 className="GameDetail__teams-name">{getTeams(game[homeOrAway])}</h1>
      <h1 className="GameDetail__teams-city">
        {getCity(game[homeOrAway])} ({game[`${homeOrAway}Abrv`]})
      </h1>
    </div>
  );
};

export default Team;
