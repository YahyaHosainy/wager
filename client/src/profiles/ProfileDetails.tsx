import axios from "axios";
import React from "react";
import { connect } from "react-redux";
import { logger } from "../helpers/winston";
import LoadingAnimation from "../layout/animations/LoadingAnimation";
import Layout from "../layout/Layout";
import { AuthUser } from "../user/types";
import BetHistory from "./BetHistory";
import "./MainProfilePanel.scss";
import ProfileSummary from "./ProfileSummary";
import { RouteComponentProps } from "react-router";
import { OTHER_PROFILE } from "../consts";
import union from "../layout/assets/Union.png";
import { Link, withRouter } from "react-router-dom";

interface ProfileDetailsRouteProps {
  id: string;
}

interface ProfileDetailsProps
  extends RouteComponentProps<ProfileDetailsRouteProps> {
  user: AuthUser;
  token: string;
}

type ProfileDetailsState = {
  user: any;
  betStatusCount: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  loading: boolean;
};

class ProfileDetails extends React.Component<
  ProfileDetailsProps,
  ProfileDetailsState
> {
  state: ProfileDetailsState = {
    betStatusCount: [],
    user: [],
    loading: true,
  };

  componentDidMount() {
    this.getProfile();
  }

  getProfile() {
    axios
      .get(`/api/bettor-profile/${this.props.match.params.id}`, {
        headers: { "x-access-token": `${this.props.token}` },
      })
      .then(
        (res) => {
          this.setState({
            user: res.data.user,
            betStatusCount: res.data.betStatusCount,
            loading: false,
          });
        },
        (error) => {
          logger.log("error", error);
        }
      );
  }

  render() {
    const { betStatusCount, user, loading } = this.state;

    return (
      <Layout>
        {!loading ? (
          <div className="MainProfilePanel">
            <div className="MainProfilePanel__container">
              <Link to="#" onClick={() => this.props.history.goBack()}>
                <img src={union} className="Back__button" alt="Back" />
              </Link>
              <ProfileSummary
                betStatusCount={betStatusCount}
                user={user}
                isPersonalProfile={false}
              />
              <BetHistory bets={user.bets} from={OTHER_PROFILE} />
            </div>
          </div>
        ) : (
          <LoadingAnimation />
        )}
      </Layout>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user.user,
  token: state.user.token,
});
export default withRouter(connect(mapStateToProps)(ProfileDetails));
