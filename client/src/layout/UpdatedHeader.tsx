import axios from "axios";
import get from "lodash/get";
import React, { useState, useEffect, useContext } from "react";
import { connect } from "react-redux";
import Logo from "./assets/logo-wager-b.png";
import ExpandedMenu from "./ExpandedMenu";
import Menu from "./Menu";
import "./UpdatedHeader.scss";
import User from "./assets/user.svg";
import DashboardContext from "../context/DashboardContext";
// import Notifications from "../notifications/Notifications";
import { AuthUser, UserActionTypes } from "../user/types";
import { logger } from "../helpers/winston";
import Notifications from "../notifications/Notifications";

interface MyProps {
  logOut: (isAuthenticated: boolean, user: {}, token: string) => void;
  user: AuthUser;
  updateAmount: any;
  token: string;
}

const UpdatedHeader = ({ logOut, user, updateAmount, token }: MyProps) => {
  const { cancelId } = useContext(DashboardContext);
  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState<number | undefined>(0);

  useEffect(() => {
    getBudget();
  }, [cancelId]);

  const getBudget = async () => {
    const response = await axios.get(`/api/budget/${user._id}`, {
      headers: { "x-access-token": `${token}` },
    });
    try {
      setBudget(response.data.profile.currentAmount || 0);
      if (
        get(user, "currentAmount") !==
        get(response.data, "profile.currentAmount")
      )
        updateAmount(response.data.profile.currentAmount);
    } catch (error) {
      logger.log("error", error);
    }
  };

  const toggleMenu = () => {
    setOpen(!open);
  };

  const logout = () => {
    logOut(false, {}, "");
    window.location.href = "localhost:3000/signup";
  };

  return (
    <div className="Header">
      <div className="Header__content">
        <div className="Header__menu-container">
          <Menu toggleMenu={toggleMenu} open={open} />
          <ExpandedMenu open={open} logOut={logout} />
        </div>

        <div className="Header__logo-container">
          <a href="/games">
            <img className="Header__logo" src={Logo} alt="logo" />
          </a>
        </div>
        <div className="Header__avatar-container">
          <Notifications />
          <div className="Header__balance-container">
            <div className="Header__balance-header">Balance</div>
            <div className="Header__balance-text">${budget}</div>
          </div>

          <a href="/profile">
            <img
              className="Header__avatar"
              src={user.picture ? user.picture : User}
              alt="avatar"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => ({
  logIn: (isAuthenticated, user, token) => {
    dispatch({
      type: UserActionTypes.LOGIN_SUCCESS,
      payload: {
        isAuthenticated,
        user,
        token,
      },
    });
  },
  logOut: (isAuthenticated, user, token) => {
    dispatch({
      type: UserActionTypes.LOGOUT,
      payload: {
        isAuthenticated,
        user,
        token,
      },
    });
  },
  updateAmount: (amount) => {
    dispatch({
      type: UserActionTypes.UPDATE_BALANCE,
      payload: { amount },
    });
  },
});

const mapStateToProps = (state) => ({
  isAuthenticated: state.user.isAuthenticated,
  user: state.user.user,
  token: state.user.token,
});

export default connect(mapStateToProps, mapDispatchToProps)(UpdatedHeader);
