import React from "react";
import classnames from "classnames";
import { nameOrUsername } from "../helpers/user";
import "./Party.scss";
import DefaultUser from "../layout/assets/user.svg";
import { getLogoName, getTeams, getCity } from "../helpers/strings";
import { Party } from "./types";

interface TeamProps {
  party: Party;
  side: string;
  className?: string;
}

const Team: React.FunctionComponent<TeamProps> = ({ ...props }) => {
  const userStyle = classnames({
    game__userImg: props.className === "picked" ? true : false,
    hideImg: props.className === "picked" ? false : true,
  });

  return (
    <div className={classnames("game__section1", props.className)}>
      <img
        src={props.party.host.picture || DefaultUser}
        alt={nameOrUsername(props.party.host)}
        className={userStyle}
      />
      <img
        src={getLogoName(
          props.party.game[props.side],
          props.party.game.sportID
        )}
        alt="Team Logo"
      />
      <h2>{getTeams(props.party.game[props.side])}</h2>
      <p>
        {getCity(props.party.game[props.side])} (
        {props.party.game[`${props.side}Abrv`]})
      </p>
    </div>
  );
};

export default Team;
