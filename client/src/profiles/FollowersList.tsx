import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import "./BetHistory.scss";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { AuthUser } from "../user/types";
import axios from "axios";
import LoadingAnimation from "../layout/animations/LoadingAnimation";
import "../game/betList.scss";
import { Link } from "react-router-dom";
import User from "../layout/assets/user.svg";
import { nameOrUsername } from "../helpers/user";

interface FollowersListRouteProps {
  type: string;
}

interface FollowersListProps
  extends RouteComponentProps<FollowersListRouteProps> {
  user: AuthUser;
  token: string;
}

const FollowersList = ({ user, token, match }: FollowersListProps) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFollowersList();
  }, []);

  const getFollowersList = () => {
    axios
      .get(`/api/profile/followerlist/${user._id}/${match.params.type}`, {
        headers: {
          "x-access-token": `${token}`,
        },
      })
      .then((res) => {
        setList(res.data);
        setLoading(false);
      });
  };

  return !loading ? (
    <Layout>
      <div className="GameDetail__container">
        <div className="bettors capitalize">
          <h2>{match.params.type}</h2>
          <div className="followersList">
            {list.map((user, index) => (
              <Link to={`/bettor-profile/${user._id}`} key={index}>
                <div className="singlebet">
                  <img
                    src={user.picture ? user.picture : User}
                    className="Bettor__friends-pic"
                    alt={nameOrUsername(user)}
                  />
                  <h4>{nameOrUsername(user)}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  ) : (
    <LoadingAnimation />
  );
};

const mapStateToProps = (state) => ({
  user: state.user.user,
  token: state.user.token,
});

export default connect(mapStateToProps)(FollowersList);
