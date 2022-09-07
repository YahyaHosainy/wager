import React, { useState, useEffect } from "react";
import moment from "moment-timezone";
import { Row, Col } from "../components/Grid";
import { Party } from "./types";
import "./PartyCard.scss";
import { idToLeagueMap } from "../consts";
import DefaultUser from "../layout/assets/user.svg";

type PartyCardProps = {
  party: Party;
};

const PartyCard = ({ party, ...props }: PartyCardProps) => {
  const showCoverImage = ({ coverImageURL }) => {
    // TODO: replace with an actual default cover
    const orgName = idToLeagueMap[party.game.sportID];
    const url = `https://storage.googleapis.com/wager-static-assets/organization-images/${orgName}.png`;
    const image = coverImageURL || url;
    return `url(${image})`;
  };

  const [home, setHome] = useState("");
  const [away, setAway] = useState("");

  useEffect(() => {
    const homeTeam =
      party.game.favoriteHomeOrAway === "home"
        ? party.game.favorite
        : party.game.underdog;

    const awayTeam =
      party.game.underdogHomeOrAway === "away"
        ? party.game.underdog
        : party.game.favorite;

    setHome(homeTeam);
    setAway(awayTeam);
  }, []);

  return (
    <div className="partycard">
      <div
        className="party-img"
        style={{
          backgroundImage: showCoverImage({
            coverImageURL: party.coverImageURL,
          }),
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPositionX: "center",
          opacity: ".75",
        }}
      ></div>
      <div className="party-title">
        <h2 className="game-title">
          {away} <span>vs</span> {home}
        </h2>
      </div>
      <div className="party-host">
        <Row className="row--full-width">
          <Col className="party-host__photo" size={{ default: 3 }}>
            <img src={party.host.picture ? party.host.picture : DefaultUser} />
          </Col>
          <Col className="party-host__info" size={{ default: 9 }}>
            <p className="party-host__info--name">
              {party.host.displayName}{" "}
              <span>{moment(party.createdAt).startOf("minute").fromNow()}</span>
            </p>
            <p className="party-host__info--tagline">{party.tagline}</p>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PartyCard;
