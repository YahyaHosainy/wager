import React from "react";
import "./SignUp.scss";
import Logo from "../layout/assets/logo-signup.png";
import { Link, Redirect } from "react-router-dom";
import axios from "axios";
import { connect } from "react-redux";
import { Formik, ErrorMessage, Form, Field } from "formik";
import * as Yup from "yup";
import { AuthUser, UserActionTypes } from "../user/types";
import "./OAuth.scss";
import OAuth from "./OAuth";

type MyProps = {
  logIn: (isAuthenticated: boolean, user: AuthUser, token: string) => void;
  isAuthenticated: boolean;
  user: AuthUser;
};

type MyState = {
  msgStatus: number;
  loading: boolean;
  error: string;
};

class SignIn extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props);
    this.state = {
      msgStatus: 0,
      loading: false,
      error: "",
    };
  }

  submitForm = (usernameOrEmailOrPhone, password) => {
    this.setState({ loading: true });

    axios
      .post("/api/login", {
        usernameOrEmailOrPhone: usernameOrEmailOrPhone,
        password: password,
      })
      .then((response) => {
        if (response.data.status === "failed")
          this.setState({
            msgStatus: 2,
            loading: false,
            error: response.data.message,
          });
        else {
          this.setState({
            msgStatus: 1,
            loading: false,
          });
          this.props.logIn(
            response.data.auth,
            response.data.foundUser,
            response.data.token
          );
        }
      })
      .catch(() => {
        this.setState({
          msgStatus: 2,
          loading: false,
          error: "Something went wrong. Try again.",
        });
      });
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
    const SignUpSchema = Yup.object().shape({
      usernameOrEmailOrPhone: Yup.string().required("Required"),
      password: Yup.string()
        .min(8, "Password should be at least 8 character")
        .required("Required"),
    });

    return isAuthenticated ? (
      <Redirect to="/games" />
    ) : (
      <div className="SignIn">
        <div className="SignIn__container">
          <div className="OAuth__container">
            <img src={Logo} alt="Wager" />
            {this.state.msgStatus === 1 && (
              <div className="alert alert-success">
                Login success. Please wait.
              </div>
            )}
            {this.state.msgStatus === 2 && (
              <div className="alert alert-danger">{this.state.error}</div>
            )}
            <OAuth buttonText={`Sign in with Facebook`} buttonOnly={true} />
            <Formik
              initialValues={{
                usernameOrEmailOrPhone: "",
                password: "",
              }}
              validationSchema={SignUpSchema}
              onSubmit={(values) => {
                this.submitForm(values.usernameOrEmailOrPhone, values.password);
              }}
              render={({}) => (
                <Form className="form1">
                  <div className="form-group">
                    <Field
                      name="usernameOrEmailOrPhone"
                      placeholder="Email / Username / Phone"
                      type="text"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="usernameOrEmailOrPhone"
                      component="div"
                      className="error"
                    />
                  </div>
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
                  <button type="submit" className="form-button">
                    Sign In
                  </button>
                </Form>
              )}
            />
            <Link to="/forgot" className="register__here">
              Forgot Password?
            </Link>
            <Link to="/register" className="register__here">
              {"Don't have an account? Register Here"}
            </Link>
          </div>
        </div>
        {this.state.loading && (
          <div className="loading">
            <p>Checking your account. Please wait.</p>
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

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);
