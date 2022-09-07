import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import Modal from "./Modal";
import "./ExpandedMenu.scss";
import config from "../config.json";
import { logger } from "../helpers/winston";
import { AuthUser } from "../user/types";

type MyProps = {
  open: boolean;
  logOut: any;
  user: AuthUser;
};

const ExpandedMenu = ({ open, logOut, user }: MyProps) => {
  const isOpen = open;
  const [isModalOpen, toggleModal] = useState(false);
  const [userReferral, setReferral] = useState(null);

  useEffect(() => {
    if (isModalOpen && config.NODE_ENV !== "development") {
      getUserReferral();
    }
  }, [isModalOpen]);

  const openReferralModal = () => {
    toggleModal(!isModalOpen);
  };

  const getUserReferral = () => {
    axios
      .get(
        `https://api.kickofflabs.com/v1/137530/subscribe?api_key=${config.KICKOFF_ID}&email=${user.email}`
      )
      .then(
        (response) => {
          setReferral(response?.data);
        },
        (error) => {
          logger.log("error", error);
        }
      );
  };

  return (
    <div
      aria-expanded={isOpen ? "true" : "false"}
      style={{
        transform: isOpen ? "translateX(0%)" : "translateX(-100%)",
      }}
      className="ExpandedMenu__Container"
    >
      <div className="ExpandedMenu__top-menu-items">
        <a href="/" className="ExpandedMenu__top-menu-item">
          <div className="ExpandedMenu__top-menu-item-text">Home</div>
        </a>

        <a href="/profile" className="ExpandedMenu__top-menu-item">
          <div className="ExpandedMenu__top-menu-item-text">My Bets</div>
        </a>

        <a href="/withdraw" className="ExpandedMenu__top-menu-item">
          <div className="ExpandedMenu__top-menu-item-text">Withdraw</div>
        </a>

        <a href="/payment" className="ExpandedMenu__top-menu-item">
          <div className="ExpandedMenu__top-menu-item-text">Deposit</div>
        </a>

        <button className="ExpandedMenu__top-menu-item" onClick={logOut}>
          Log Out
        </button>
      </div>

      <div className="ExpandedMenu__bottom-menu-items">
        <p className="ExpandedMenu__text">
          Invite friends,
          <br />
          Get Rewarded <br />
        </p>
        <div className="ExpandedMenu__button-container">
          <button
            className="ExpandedMenu__button"
            onClick={() => openReferralModal()}
          >
            Get Link
          </button>
        </div>
        <Modal isOpen={isModalOpen} toggle={toggleModal}>
          <div className="ExpandedMenu__referral-container">
            <h1 className="ExpandedMenu__Referral-title">Your Referral Link</h1>
            <h2 className="ExpandedMenu__Referral-title">
              Current Score {userReferral ? userReferral.referrals : ""}
            </h2>
            <p className="ExpandedMenu__Referral-text">
              This is your personal link. Invite your friends they will skip the
              waitlist and you will get premium perks!
            </p>
            <p className="ExpandedMenu__Referral-subtext">
              Copy the link below to share
            </p>
            <form className="ExpandedMenu__referral-form">
              <textarea
                readOnly={true}
                value={userReferral ? userReferral.social_url : ""}
                className="ExpandedMenu__referral-textarea"
              />
            </form>
            <button
              className="ExpandedMenu__button ExpandedMenu__button-referral"
              onClick={() => toggleModal(false)}
            >
              Close
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({ user: state.user.user });

export default connect(mapStateToProps)(ExpandedMenu);
