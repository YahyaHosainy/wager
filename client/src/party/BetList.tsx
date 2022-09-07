import React from "react";
import { nameOrUsername } from "../helpers/user";
import { PartyBet } from "./types";
import "./Party.scss";
import { Link } from "react-router-dom";
import userImg from "../layout/assets/user.png";

interface BetListProps {
  bet: PartyBet;
}

const BetList: React.FunctionComponent<BetListProps> = ({ ...props }) => {
  return (
    <Link to={`/bettor-profile/${props.bet.user._id}`}>
      <img
        src={props.bet.user.picture || userImg}
        alt={props.bet.user.displayName}
      />
    </Link>
  );
};

export default BetList;
