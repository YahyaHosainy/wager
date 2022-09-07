import React from "react";
import "./SignUp.scss";
import Logo from "../layout/assets/logo-signup.png";
import axios from "axios";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { AuthUser, UserActionTypes } from "../user/types";
import { RouteComponentProps } from "react-router";

interface ConfirmRouteProps {
  email: string;
  tokens: string;
}

interface ConfirmProps extends RouteComponentProps<ConfirmRouteProps> {
  logIn: (isAuthenticated: boolean, user: AuthUser, token: string) => void;
  isAuthenticated: boolean;
  user: AuthUser;
}

type ConfirmState = {
  status: string;
  loading: boolean;
  error: string;
  email: string;
  token: string;
};

class Confirm extends React.Component<ConfirmProps, ConfirmState> {
  constructor(props) {
    super(props);
    this.state = {
      status: "",
      loading: false,
      error: "",
      email: this.props.match.params.email,
      token: this.props.match.params.tokens,
    };
  }

  componentDidMount() {
    this.confirmEmail();
  }

  confirmEmail = () => {
    this.setState({ loading: true });

    axios
      .post("/api/confirm", {
        email: this.state.email,
        token: this.state.token,
      })
      .then((response) => {
        this.setState({
          status: response.data.status,
          loading: false,
          error: response.data.message,
        });

        if (response.data.status === "success") {
          this.props.logIn(
            response.data.auth,
            response.data.user,
            response.data.token
          );

          window.location.href = "/games";
        }
      })
      .catch((error) => {
        this.setState({
          status: "failed",
          loading: false,
          error: error,
        });
      });
  };

  render() {
    return (
      <div className="SignIn">
        <div className="SignIn__container">
          <div className="OAuth__container">
            <img src={Logo} alt="Wager" />
            {this.state.error && (
              <div
                className={
                  this.state.status === "failed"
                    ? "alert alert-danger"
                    : "alert alert-success"
                }
              >
                {this.state.error}
              </div>
            )}
            <Link to="/signin" className="register__here">
              Already have an account? Sign In Here
            </Link>
          </div>
        </div>
        {this.state.loading && (
          <div className="loading">
            <p>Verfying your account. Please wait.</p>
          </div>
        )}
      </div>
    );
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
});

const mapStateToProps = (state) => ({
  isAuthenticated: state.user.isAuthenticated,
  user: state.user.user,
  token: state.user.token,
});

export default connect(mapStateToProps, mapDispatchToProps)(Confirm);
