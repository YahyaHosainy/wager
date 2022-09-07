import React from "react";
import "./SignUp.scss";
import Logo from "../layout/assets/logo-signup.png";
import axios from "axios";
import { connect } from "react-redux";
import { Formik, ErrorMessage, Form, Field } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { AuthUser, UserActionTypes } from "../user/types";
import { RouteComponentProps } from "react-router";

interface ResetRouteProps {
  tokens: string;
}

interface ResetProps extends RouteComponentProps<ResetRouteProps> {
  logIn: (isAuthenticated: boolean, user: AuthUser, token: string) => void;
  user: AuthUser;
}

type ResetState = {
  status: string;
  loading: boolean;
  error: string;
  token: string;
};

class Reset extends React.Component<ResetProps, ResetState> {
  constructor(props) {
    super(props);
    this.state = {
      status: "",
      loading: false,
      error: "",
      token: this.props.match.params.tokens,
    };
  }

  submitForm = (password) => {
    this.setState({ loading: true });

    axios
      .post("/api/reset", {
        token: this.state.token,
        password: password,
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
    const ResetSchema = Yup.object().shape({
      password: Yup.string()
        .min(8, "Password should be atleast 8 character")
        .required("Required"),
      confirm: Yup.string()
        .when("password", {
          is: (val) => (val && val.length > 0 ? true : false),
          then: Yup.string().oneOf(
            [Yup.ref("password")],
            "Both password need to be the same"
          ),
        })
        .required("Required"),
    });

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
            <Formik
              initialValues={{
                password: "",
                confirm: "",
              }}
              validationSchema={ResetSchema}
              onSubmit={(values) => {
                this.submitForm(values.password);
              }}
              render={({}) => (
                <Form className="form1">
                  <div className="form-group">
                    <Field
                      name="password"
                      placeholder="Password"
                      type="password"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="error"
                    />
                  </div>
                  <div className="form-group">
                    <Field
                      name="confirm"
                      placeholder="Confirm Password"
                      type="password"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="confirm"
                      component="div"
                      className="error"
                    />
                  </div>
                  <button type="submit" className="form-button">
                    Reset
                  </button>
                </Form>
              )}
            />
            <Link to="/signin" className="register__here">
              Already have an account? Sign In Here
            </Link>
          </div>
        </div>
        {this.state.loading && (
          <div className="loading">
            <p>Updating your account. Please wait.</p>
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

export default connect(mapStateToProps, mapDispatchToProps)(Reset);
