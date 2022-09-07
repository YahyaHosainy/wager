import axios from "axios";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import LoadingAnimation from "../layout/animations/LoadingAnimation";
import { logger } from "../helpers/winston";
import { AuthUser } from "../user/types";
import Layout from "../layout/Layout";
import MatchDetail from "./matchDetail";

interface MatchRouteProps {
  betid: string;
}

interface MatchProps extends RouteComponentProps<MatchRouteProps> {
  user: AuthUser;
}

const Match = ({ match, user }: MatchProps) => {
  const [loading, setLoading] = useState(true);
  const [bet, setBet] = useState(null);

  useEffect(() => {
    getBet();
  }, []);

  const getBet = () => {
    axios.get(`/api/match/bets/${match.params.betid}`).then(
      (response) => {
        setBet(response.data);
        setLoading(false);
      },
      (error) => {
        logger.log("error", error);
      }
    );
  };

  return !loading ? (
    <Layout>
      <div className="GameDetail__container">
        <MatchDetail
          bet={bet}
          gameId={bet.game._id}
          side={bet.side}
          favorite={bet.game.favorite}
          underdog={bet.game.underdog}
        />
      </div>
    </Layout>
  ) : (
    <LoadingAnimation />
  );
};

const mapStateToProps = (state) => ({ user: state.user.user });
export default connect(mapStateToProps)(Match);
