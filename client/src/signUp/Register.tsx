import React from "react";
import "./SignUp.scss";
import Logo from "../layout/assets/logo-signup.png";
import { Link, Redirect } from "react-router-dom";
import axios from "axios";
import { connect } from "react-redux";
import { Formik, ErrorMessage, Form, Field } from "formik";
import * as Yup from "yup";
import OAuth from "./OAuth";
import { AuthUser } from "../user/types";
import isMobilePhone from "validator/lib/isMobilePhone";

interface MyProps {
  isAuthenticated: boolean;
  user: AuthUser;
}

type MyState = {
  msgStatus: number;
  loading: boolean;
  message: string;
};

class Register extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props);
    this.state = {
      msgStatus: 0,
      loading: false,
      message: "",
    };
  }

  submitForm = (fname, lname, username, email, phone, age, password) => {
    this.setState({ loading: true });

    axios
      .post("/api/register", {
        name: `${fname} ${lname}`,
        username: username,
        email: email,
        phone: phone,
        age: age,
        password: password,
      })
      .then((response) => {
        if (response.data.status === "success") {
          this.setState({
            msgStatus: 1,
            loading: false,
            message: response.data.message,
          });
        } else
          this.setState({
            msgStatus: 2,
            loading: false,
            message: response.data.message,
          });
      })
      .catch(() => {
        this.setState({
          msgStatus: 2,
          loading: false,
          message: "Email already exists.",
        });
      });
  };

  render() {
    const { isAuthenticated } = this.props;

    const SignUpSchema = Yup.object().shape({
      fname: Yup.string()
        .matches(/\S/g, "No spaces allowed")
        .required("Required"),
      lname: Yup.string()
        .matches(/\S/g, "No spaces allowed")
        .min(2, "Last name should be at least 2 character")
        .required("Required"),
      username: Yup.string()
        .required("Required")
        .matches(/^\S*$/, "No spaces allowed")
        .matches(/^[a-zA-Z0-9_\-]*$/, "No special characters allowed")
        .matches(/^[a-z0-9_\-]+$/, "Only lowercase allowed"),
      email: Yup.string().email().required("Required"),
      phone: Yup.string().test(
        "phone_validation",
        "Phone number is not valid",
        function (value) {
          if (value) {
            return isMobilePhone(value);
          }
          return true;
        }
      ),
      age: Yup.number()
        .integer()
        .moreThan(17)
        .typeError("Age number must be number")
        .required("Required"),
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
            <OAuth buttonText={`Sign up with Facebook`} buttonOnly={true} />
            <div className="divider">
              <div className="line"></div>
              <p>OR</p>
              <div className="line"></div>
            </div>
            {this.state.msgStatus === 1 && (
              <div className="alert alert-success alert-lg">
                {this.state.message}
              </div>
            )}
            {this.state.msgStatus === 2 && (
              <div className="alert alert-danger">{this.state.message}</div>
            )}
            <Formik
              initialValues={{
                fname: "",
                lname: "",
                username: "",
                email: "",
                phone: "",
                age: "",
                password: "",
              }}
              validationSchema={SignUpSchema}
              onSubmit={(values, actions) => {
                this.submitForm(
                  values.fname,
                  values.lname,
                  values.username,
                  values.email,
                  values.phone,
                  values.age,
                  values.password
                );
                actions.resetForm({
                  values: {
                    fname: "",
                    lname: "",
                    username: "",
                    email: "",
                    phone: "",
                    age: "",
                    password: "",
                  },
                });
              }}
              render={({}) => (
                <Form className="form1">
                  <div className="single-row">
                    <div className="form-group">
                      <Field
                        name="fname"
                        placeholder="First Name"
                        type="text"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="fname"
                        component="div"
                        className="error"
                      />
                    </div>
                    <div className="form-group">
                      <Field
                        name="lname"
                        placeholder="Last Name"
                        type="text"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="lname"
                        component="div"
                        className="error"
                      />
                    </div>
                  </div>
                  <div className="single-row">
                    <div className="form-group">
                      <Field
                        name="username"
                        placeholder="Username"
                        type="text"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="username"
                        component="div"
                        className="error"
                      />
                    </div>
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
                  </div>
                  <div className="single-row">
                    <div className="form-group">
                      <Field
                        name="phone"
                        placeholder="Phone number (optional)"
                        type="text"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="error"
                      />
                    </div>
                    <div className="form-group">
                      <Field
                        name="age"
                        placeholder="Age"
                        type="text"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="age"
                        component="div"
                        className="error"
                      />
                    </div>
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
                    Sign Up
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
            <p>Your account is creating. Please wait.</p>
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

export default connect(mapStateToProps)(Register);
