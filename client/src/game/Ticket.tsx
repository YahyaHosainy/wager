import React, { useEffect, useState } from "react";
import LoadingAnimation from "../layout/animations/LoadingAnimation";
import axios from "axios";
import { logger } from "../helpers/winston";
import ticketLogo from "../layout/assets/ticketLogo.png";
import { getLastWord } from "../helpers/strings";
import moment from "moment";
import DefaultUserImage from "../layout/assets/defaultImg.png";
import confettiLeft from "../layout/assets/celebration-left.png";
import confettiRight from "../layout/assets/celebration-right.png";
import "../layout/BetModal.scss";
import { RouteComponentProps } from "react-router";
import { nameOrUsername } from "../helpers/user";

interface TicketRouteProps {
  id: string;
}

const Ticket = ({ match }: RouteComponentProps<TicketRouteProps>) => {
  const [loading, setLoading] = useState(true);
  const [bet, setBet] = useState(null);

  useEffect(() => {
    getTicket();
  }, []);

  const getTicket = () => {
    axios.get(`/api/bet/ticket/${match.params.id}`).then(
      (res) => {
        if (!res) window.location.href = "/";
        setBet(res.data);
        setLoading(false);
      },
      (error) => {
        logger.log("error", error);
      }
    );
  };

  return loading ? (
    <LoadingAnimation />
  ) : (
    <div className="ticketContainer">
      <section className="modal-main modal-main-noscroll">
        <a href="/">
          <div className="headerLogoOnly">
            <img src={ticketLogo} alt="Wager Logo" className="ticketLogo" />
          </div>
        </a>
        <h4 className="teamName teamSpacing">
          {`${bet.game.favoriteAbrv} ${getLastWord(bet.game.favorite)} @ ${
            bet.game.underdogAbrv
          } ${getLastWord(bet.game.underdog)}`}
        </h4>
        <h4 className="teamSpacing">
          {moment(bet.game.eventDateUTC).format("MMMM Do, YYYY, h:mm a")}
        </h4>
        <div className="imageLine lineNew">
          <div className="userImageTkt">
            <img
              src={bet.user.picture ? bet.user.picture : DefaultUserImage}
              alt="user profile picture"
            />
            <h2>{nameOrUsername(bet.user)}</h2>
          </div>
          <div className="line lineBig">
            <h1>
              {bet.side === bet.game.favorite ? "-" : "+"}
              {bet.line.toFixed(1)}
            </h1>
            <div>{bet.side}</div>
          </div>
        </div>
        <div className="amountSection mt-50">
          <div>
            <h1>${bet.amount}</h1>
            <h2>Wager</h2>
          </div>
          <div>
            <h1>${bet.amount * 2}</h1>
            <h2>To Win</h2>
          </div>
        </div>
        <div className="celebration celeNew">
          <img src={confettiLeft} alt="confetti" className="celeImg" />
          <p>
            {nameOrUsername(bet.user)} saved ${(bet.amount / 10).toFixed(2)} on
            this bet
          </p>
          <img src={confettiRight} alt="confetti" className="celeImg" />
        </div>
        <p className="celeFooter mt-50">
          {`This bet was made on the people’s sportsbook on www.wager.games`}
        </p>
      </section>
    </div>
  );
};

export default Ticket;
