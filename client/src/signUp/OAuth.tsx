import React from "react";
import FacebookLogin from "react-facebook-login";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import { Link } from "react-router-dom";
import config from "../config.json";
import Logo from "../layout/assets/logo-signup.png";
import { AuthUser, UserActionTypes } from "../user/types";
import "./OAuth.scss";

interface OAuthProps {
  logIn: (isAuthenticated: boolean, user: AuthUser, token: string) => void;
  logOut: (isAuthenticated: boolean, user: {}, token: string) => void;
  isAuthenticated: boolean;
  user: AuthUser;
  buttonText: string;
  buttonOnly: boolean;
}

interface OAuthState {
  isAuthenticated: boolean;
  token: string;
}

class OAuth extends React.Component<OAuthProps> {
  state: OAuthState = {
    isAuthenticated: false,
    token: "",
  };

  logout = () => {
    this.props.logOut(false, {}, "");
    window.location.href = window.location.href;
  };

  onFailure = (error) => {
    alert(error);
  };

  facebookResponse = async (response) => {
    const tokenBlob = new Blob(
      [JSON.stringify({ access_token: response.accessToken }, null, 2)],
      {
        type: "application/json",
      }
    );
    const options: any = {
      method: "POST",
      body: tokenBlob,
      mode: "cors",
      cache: "default",
    };
    const result = await fetch("/api/auth/facebook", options);
    const data = await result.json();
    if (data?.token) {
      this.props.logIn(data.auth, data.user, data.token);
    }
  };

  render() {
    const { isAuthenticated } = this.props;
    const content = isAuthenticated ? (
      <Redirect to="/games" />
    ) : (
      <div>
        <div className="OAuth__container">
          {!this.props.buttonOnly && <img src={Logo} alt="Wager" />}
          <div className="OAuth__form-container">
            <FacebookLogin
              appId={config.FACEBOOK_APP_ID}
              autoLoad={false}
              fields="name,email,picture"
              callback={(resp) => this.facebookResponse(resp)}
              textButton={this.props.buttonText}
              cssClass={
                this.props.buttonOnly
                  ? "OAuth__facebookButton OAuth__fbBtnBig"
                  : "OAuth__facebookButton"
              }
              icon="fa-facebook"
              disableMobileRedirect={true}
            />
          </div>
          {!this.props.buttonOnly && (
            <div className="loginSignin__btn">
              <Link to="/signin" className="loginSignin__link">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    );
    return <div className="App">{content}</div>;
  }
}

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
});

const mapStateToProps = (state) => ({
  isAuthenticated: state.user.isAuthenticated,
  user: state.user.user,
  token: state.user.token,
});

export default connect(mapStateToProps, mapDispatchToProps)(OAuth);
