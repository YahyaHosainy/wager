import React from "react";
import { connect } from "react-redux";
import Layout from "../layout/Layout";
import "./ReferPage.scss";
import SocialReferral from "./SocialReferral";
import axios from "axios";
import { logger } from "../helpers/winston";
import config from "../config.json";
import { AuthUser } from "../user/types";

interface ReferPageProps {
  user: AuthUser;
}

interface ReferPageState {
  referralLink: string;
}

class ReferPage extends React.Component<ReferPageProps, ReferPageState> {
  state: ReferPageState = {
    referralLink: "",
  };

  componentDidMount() {
    this.getReferralLink();
  }

  getReferralLink = async () => {
    try {
      const response = await axios.get(
        `https://api.kickofflabs.com/v1/137530/subscribe?api_key=${config.KICKOFF_ID}&email=${this.props.user.email}`
      );

      this.setState({ referralLink: response.data.social_url });
    } catch (error) {
      logger.log("error", error);
    }
  };

  render() {
    return (
      <Layout>
        <div className="ReferPage">
          <div className="SocialReferral">
            <div className="SocialReferral__cta">
              We never take money from bets, but we need players like you to
              keep the vig-free dream alive. <br />
              If you invite 12 friends it ensures that we can continue to
              operate.
            </div>
            <div className="SocialReferral__cta-subtitle">
              {`Use the link below to refer your friends`}
            </div>
            <SocialReferral
              referralLink={this.state.referralLink}
              referralText={`Bet with me or against me on Wager — the social, p2p sportsbook with juice free bets`}
            />
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state) => ({ user: state.user.user });

export default connect(mapStateToProps)(ReferPage);
