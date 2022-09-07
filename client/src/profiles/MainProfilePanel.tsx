import axios from "axios";
import React from "react";
import { connect } from "react-redux";
import { OWN_PROFILE } from "../consts";
import { Bet } from "../game/types";
import { logger } from "../helpers/winston";
import Layout from "../layout/Layout";
import { AuthUser, BetUser } from "../user/types";
import ActiveWagers from "./ActiveWagers";
import BetHistory from "./BetHistory";
import Ledger from "./Ledger";
import "./MainProfilePanel.scss";
import ProfileSummary from "./ProfileSummary";

type MyProps = {
  user: AuthUser;
  token: string;
};

type MyState = {
  betStatusCount: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  user: BetUser;
  bets: Bet[];
  activeTab: number;
};

class MainProfilePanel extends React.Component<MyProps, MyState> {
  state: MyState = {
    betStatusCount: [],
    user: null,
    activeTab: 2,
    bets: [],
  };

  componentDidMount() {
    this.getProfile();
  }

  async getProfile() {
    try {
      const response = await axios.get(`/api/profile/${this.props.user._id}`, {
        headers: { "x-access-token": `${this.props.token}` },
      });
      this.setState({
        betStatusCount: response.data.betStatusCount,
        user: response.data.user,
        bets: response.data.user.bets,
      });
    } catch (error) {
      logger.log("error", error);
    }
  }

  render() {
    const { betStatusCount, user, bets } = this.state;
    return (
      <Layout>
        <div className="MainProfilePanel">
          <div className="MainProfilePanel__container">
            {/* <ProfileSummary
              betStatusCount={betStatusCount}
              user={user}
              isPersonalProfile={true}
            /> */}
            <div className="wagersTab__container">
              <div
                className={
                  this.state.activeTab === 1
                    ? "wagersTab__heading wagersTab__active"
                    : "wagersTab__heading"
                }
                onClick={() => this.setState({ activeTab: 1 })}
              >
                Active
              </div>
              <div
                className={
                  this.state.activeTab === 2
                    ? "wagersTab__heading wagersTab__active"
                    : "wagersTab__heading"
                }
                onClick={() => this.setState({ activeTab: 2 })}
              >
                Settled
              </div>
              <div
                className={
                  this.state.activeTab === 3
                    ? "wagersTab__heading wagersTab__active"
                    : "wagersTab__heading"
                }
                onClick={() => this.setState({ activeTab: 3 })}
              >
                Ledger
              </div>
            </div>
            <div
              style={{ display: this.state.activeTab === 1 ? "block" : "none" }}
            >
              <ActiveWagers />
            </div>
            <div
              style={{ display: this.state.activeTab === 2 ? "block" : "none" }}
            >
              <BetHistory bets={bets} from={OWN_PROFILE} />
            </div>
            <div
              style={{ display: this.state.activeTab === 3 ? "block" : "none" }}
            >
              <Ledger bets={bets} />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}
const mapStateToProps = (state) => ({
  user: state.user.user,
  token: state.user.token,
});
export default connect(mapStateToProps)(MainProfilePanel);
