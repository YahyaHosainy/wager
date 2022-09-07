import axios from "axios";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import DashboardDateDisplay from "../components/DashboardDateDisplay";
import DashboardContext from "../context/DashboardContext";
import { logger } from "../helpers/winston";
import { AuthUser } from "../user/types";
import PartyCard from "./PartyCard";
import "./PartySection.scss";
import NotAvailable from "../components/NotAvailable";
import StartPartyCTA from "./StartPartyCTA";
import classNames from "classnames";

type PartySectionProps = {
  user: AuthUser;
  tabNumber?: number;
  token: string;
};

const PartySection = ({ user, tabNumber, token }: PartySectionProps) => {
  const { activeTab } = useContext(DashboardContext);
  const [discover, setDiscover] = useState(null);
  const [followParties, setFollowParties] = useState(null);

  useEffect(() => {
    getParty();
  }, []);

  const getParty = () => {
    axios
      .get(`/api/party/all`, {
        headers: { "x-access-token": `${token}` },
      })
      .then(
        (res) => {
          setDiscover(res.data.all);
          setFollowParties(res.data.following);
        },
        (error) => {
          logger.log("error", error);
        }
      );
  };

  const renderParties = ({ content }) => {
    const listItems = content.map((party) => (
      <div className="party-col" key={party._id}>
        <Link to={`/party/${party._id}`} key={party._id}>
          <PartyCard party={party} />
        </Link>
      </div>
    ));
    return <div className="partycard-container">{listItems}</div>;
  };

  return (
    <>
      <div
        className={classNames(
          "party-section",
          activeTab === tabNumber ? "" : "no-display"
        )}
      >
        <DashboardDateDisplay dateType="current" />
        <StartPartyCTA />
        {/* <section className="party-section__following">
          <h2>Following</h2>
          {followParties && followParties.length > 0 ? (
            renderParties({ content: followParties })
          ) : (
            <NotAvailable text="Parties" />
          )}
        </section> */}
        <section className="party-section__discover">
          <h2>Discover</h2>
          {discover && discover.length > 0 ? (
            renderParties({ content: discover })
          ) : (
            <NotAvailable text="Parties" />
          )}
        </section>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.user.user,
  token: state.user.token,
});

export default connect(mapStateToProps)(PartySection);
