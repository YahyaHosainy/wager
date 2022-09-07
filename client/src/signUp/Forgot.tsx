import React from "react";
import "./SignUp.scss";
import Logo from "../layout/assets/logo-signup.png";
import { Link } from "react-router-dom";
import axios from "axios";
import { connect } from "react-redux";
import { Formik, ErrorMessage, Form, Field } from "formik";
import * as Yup from "yup";
import { AuthUser } from "../user/types";

type MyProps = {
  user: AuthUser;
};

type MyState = {
  status: string;
  loading: boolean;
  error: string;
};

class Forgot extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props);
    this.state = {
      status: "",
      loading: false,
      error: "",
    };
  }

  submitForm = (email) => {
    this.setState({ loading: true });

    axios
      .post("/api/forgot", {
        email: email,
      })
      .then((response) => {
        this.setState({
          status: response.data.status,
          loading: false,
          error: response.data.message,
        });
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
    const ForgotSchema = Yup.object().shape({
      email: Yup.string().email().required("Required"),
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
                email: "",
              }}
              validationSchema={ForgotSchema}
              onSubmit={(values) => {
                this.submitForm(values.email);
              }}
              render={({}) => (
                <Form className="form1">
                  <div className="form-group">
                    <Field
                      name="email"
                      placeholder="Email"
                      type="text"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="error"
                    />
                  </div>
                  <button type="submit" className="form-button">
                    Recover
                  </button>
                </Form>
              )}
            />
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

const mapStateToProps = (state) => ({
  isAuthenticated: state.user.isAuthenticated,
  user: state.user.user,
  token: state.user.token,
});

export default connect(mapStateToProps)(Forgot);
