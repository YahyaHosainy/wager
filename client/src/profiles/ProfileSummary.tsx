import React from "react";
import moment from "moment";
import find from "lodash/find";
import DefaultUserImage from "../layout/assets/user.svg";
import "./ProfileSummary.scss";
import { STATUS_MAP } from "../consts";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import axios from "axios";
import { logger } from "../helpers/winston";
import { nameOrUsername } from "../helpers/user";
import { AuthUser, UserSocial } from "../user/types";

interface ProfileSummaryProps {
  betStatusCount: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  user: AuthUser;
  isPersonalProfile: boolean;
  loggedUser: AuthUser;
  token: string;
}

interface ProfileSummaryState {
  followResult: UserSocial;
  isFollow: boolean;
}

class ProfileSummary extends React.Component<ProfileSummaryProps> {
  state: ProfileSummaryState = {
    followResult: null,
    isFollow: false,
  };

  async componentDidMount() {
    await this.getFollowUnfollow();
  }

  followUnfollow({ user }) {
    const type = this.state.isFollow ? "unfollow" : "follow";

    axios
      .post(
        `/api/profile/${this.props.loggedUser._id}/${type}/${user._id}`,
        {},
        {
          headers: {
            "x-access-token": `${this.props.token}`,
          },
        }
      )
      .then((res) => {
        res.data.following
          ? this.setState({ isFollow: true })
          : this.setState({ isFollow: false });

        setTimeout(() => this.getFollowUnfollow(), 1000);
      });
  }

  getFollowUnfollow() {
    const userId = this.props.isPersonalProfile
      ? this.props.loggedUser._id
      : this.props.user._id;
    axios
      .get(`/api/profile/${userId}/getfollow`, {
        headers: { "x-access-token": `${this.props.token}` },
      })
      .then(
        (res) => {
          this.setState({ followResult: res.data });

          const check = find(res.data.followers, {
            _id: this.props.loggedUser._id,
          });

          if (check) this.setState({ isFollow: true });
        },
        (error) => {
          logger.log("error", error);
        }
      );
  }

  returnWonLostCount() {
    const wonCount = find(this.props.betStatusCount, { _id: STATUS_MAP.WON });
    const lostCount = find(this.props.betStatusCount, { _id: STATUS_MAP.LOSE });

    return { wonCount, lostCount };
  }

  returnTotalRecord() {
    const { wonCount, lostCount } = this.returnWonLostCount();
    return `${wonCount?.count || 0} - ${lostCount?.count || 0}`;
  }

  returnTotalWinnings() {
    const { wonCount, lostCount } = this.returnWonLostCount();
    return (wonCount?.totalAmount || 0) - (lostCount?.totalAmount || 0);
  }

  returnTotalSavings() {
    const { wonCount, lostCount } = this.returnWonLostCount();
    const totalAmount =
      (wonCount?.totalAmount || 0) + (lostCount?.totalAmount || 0);

    if (totalAmount) return ((10 / 100) * totalAmount).toFixed(2);
    else return (10 / 100) * totalAmount;
  }

  render() {
    const { user, isPersonalProfile } = this.props;
    const { followResult, isFollow } = this.state;
    if (!user) return null;
    return (
      <div className="ProfileSummary__profile">
        <div className="ProfileSummary__profile-top">
          <div>
            <div className="ProfileSummary__profile-image">
              <img
                src={user.picture ? user.picture : DefaultUserImage}
                alt="user profile picture"
              />
            </div>
          </div>

          <div className="ProfileSummary__profile-user-details">
            <div className="ProfileSummary__profile-user-container">
              <div className="ProfileSummary__profile-user-text">
                <div className="ProfileSummary__profile-user-settings">
                  <h1 className="ProfileSummary__profile-user-name">
                    @{nameOrUsername(user)}
                  </h1>
                </div>

                <div className="ProfileSummary__profile-timeline">
                  <p>
                    member since {moment(user.createdAt).format("MMMM YYYY")}
                  </p>
                </div>
              </div>
              {isPersonalProfile &&
                this.props.loggedUser._id == this.props.user._id && (
                  <a href="/profile-edit">
                    <div className="ProfileSummary__profile-edit-btn">
                      <div>Edit</div>
                    </div>
                  </a>
                )}

              {!isPersonalProfile &&
                this.props.loggedUser._id !== this.props.user._id && (
                  <Link to="#" onClick={() => this.followUnfollow({ user })}>
                    <div className="ProfileSummary__profile-edit-btn">
                      <div>{isFollow ? "Unfollow" : "Follow"}</div>
                    </div>
                  </Link>
                )}
            </div>

            <div className="ProfileSummary__profile-bio">
              <p>{user.bio}</p>
            </div>
          </div>
        </div>

        <div className="ProfileSummary__profile-stats">
          <div className="ProfileSummary__profile-stat">
            <div>Following</div>
            <div className="ProfileSummary__profile-stat-count">
              {isPersonalProfile && followResult?.following?.length > 0 ? (
                <Link to="/followers/following">
                  {followResult.following?.length || 0}
                </Link>
              ) : (
                followResult?.following?.length || 0
              )}
            </div>
          </div>

          <div className="ProfileSummary__profile-stat">
            <div>Followers</div>
            <div className="ProfileSummary__profile-stat-count">
              {isPersonalProfile && followResult?.followers?.length > 0 ? (
                <Link to="/followers/followers">
                  {followResult.followers?.length || 0}
                </Link>
              ) : (
                followResult?.followers?.length || 0
              )}
            </div>
          </div>
        </div>

        <div className="ProfileSummary__profile-stats ProfileSummary__profile-last">
          <div className="ProfileSummary__profile-stat">
            <div>Total Prize Winnings</div>
            <div className="ProfileSummary__profile-stat-count">
              ${this.returnTotalWinnings()}
            </div>
          </div>

          <div className="ProfileSummary__profile-stat">
            <div>Lifetime Record</div>
            <div className="ProfileSummary__profile-stat-count">
              {this.returnTotalRecord()}
            </div>
          </div>

          <div className="ProfileSummary__profile-stat">
            <div>Lifetime Savings</div>
            <div className="ProfileSummary__profile-stat-count">
              ${this.returnTotalSavings()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  loggedUser: state.user.user,
  token: state.user.token,
});

export default connect(mapStateToProps)(ProfileSummary);
