import React from "react";
import { nameOrUsername } from "../helpers/user";
import { PartyBet } from "./types";
import "./PartyUser.scss";

interface PartyUserProps {
  bet: PartyBet;
}

const PartyUser: React.FunctionComponent<PartyUserProps> = ({ ...props }) => {
  return (
    <div className="PartyUser">
      <div className="PartyUser__name">{nameOrUsername(props.bet.user)}</div>
      <div className="PartyUser__picture-container">
        <img className="PartyUser__picture" src={props.bet.user.picture} />
      </div>
    </div>
  );
};

export default PartyUser;
