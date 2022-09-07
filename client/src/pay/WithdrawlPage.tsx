import axios from "axios";
import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import BackButton from "../layout/assets/backbutton.png";
import Layout from "../layout/Layout";
import { AuthUser, UserActionTypes } from "../user/types";
import "./WithdrawlPage.scss";

type MyProps = {
  updateAmount: any;
  user: AuthUser;
};

type MyState = {
  email: string;
  amount: string;
  amountErr: string;
  emailErr: string;
  msgStatus: number;
  loading: boolean;
};

class WithdrawlPage extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      amount: "",
      amountErr: "",
      emailErr: "",
      msgStatus: 0,
      loading: false,
    };
  }

  handleAmount(event) {
    const reg = /^[0-9\b]+$/;

    this.setState({ amount: event.target.value, amountErr: "" });

    if (reg.test(event.target.value)) this.setState({ amountErr: "" });
    else if (event.target.value && !reg.test(event.target.value))
      this.setState({ amountErr: "Please enter a valid amount" });
  }

  submitForm(event) {
    event.preventDefault();

    const email = this.state.email;
    const amount = this.state.amount;
    const reg = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g;
    const regAmount = /^[0-9\b]+$/;

    if (!reg.test(email)) {
      this.setState({ emailErr: "Enter valid email" });
      return false;
    } else this.setState({ emailErr: "" });

    if (regAmount.test(amount)) this.setState({ amountErr: "" });
    else if (amount && !regAmount.test(amount)) {
      this.setState({ amountErr: "Please enter a valid amount" });
      return false;
    }

    if (parseInt(amount) > this.props.user.currentAmount) {
      alert("Entered amount is more than what you have");
      return false;
    } else if (this.props.user.currentAmount === 0) {
      alert("You don't have enough credit to withdraw");
      return false;
    }

    this.setState({ loading: true });

    axios
      .post("/api/withdraw", {
        user: this.props.user._id,
        email: email,
        amount: amount,
      })
      .then((response) => {
        if (response.data.message === "success") {
          this.setState({
            email: "",
            amount: "",
            msgStatus: 1,
            loading: false,
          });

          if (
            response.data.currentAmount &&
            response.data.currentAmount !== this.props.user.currentAmount
          ) {
            this.props.updateAmount(response.data.currentAmount);
          }
        } else this.setState({ msgStatus: 2, loading: false });
      })
      .catch(() => {
        this.setState({ msgStatus: 2, loading: false });
      });
  }
  render() {
    return (
      <Layout>
        <div className="WithdrawlPage__container">
          <div className="Back__btn">
            <Link to="/games">
              <div>
                <img src={BackButton} alt="Back" />
              </div>
              <span>Back to Feed</span>
            </Link>
          </div>

          <div className="WithdrawlPage">
            <form
              action="#"
              className="form"
              onSubmit={(e) => this.submitForm(e)}
            >
              <div className="u-margin-bottom-medium">
                <h2 className="heading-secondary">Transfer Balance</h2>
                <p className="">
                  Enter your Paypal E-mail and Amount to transfer
                </p>
              </div>
              <div className="form__all">
                <p className="total__win">
                  ${this.props.user.currentAmount} in Winnings
                </p>
                {this.state.msgStatus === 1 && (
                  <div className="alert alert-success">
                    Amount will be credited to your account in 1-2 business days
                  </div>
                )}
                {this.state.msgStatus === 2 && (
                  <div className="alert alert-danger">
                    Something went wrong. Try again later.
                  </div>
                )}
                <div
                  className={
                    this.state.emailErr ? "form__group active" : "form__group"
                  }
                >
                  <input
                    type="text"
                    className="form__input"
                    placeholder="Paypal Email"
                    id="email"
                    value={this.state.email}
                    onChange={(e) => this.setState({ email: e.target.value })}
                    required
                  />
                  {this.state.emailErr && (
                    <p className="email__error">{this.state.emailErr}</p>
                  )}
                </div>

                <div
                  className={
                    this.state.amountErr
                      ? "form__group form__email active"
                      : "form__group form__email"
                  }
                >
                  <p className={this.state.amount ? "active" : ""}>$</p>
                  <input
                    type="text"
                    className="form__input"
                    placeholder="0"
                    id="amount"
                    required
                    value={this.state.amount}
                    onChange={(e) => this.handleAmount(e)}
                  />
                  {this.state.amountErr && (
                    <p className="email__error">{this.state.amountErr}</p>
                  )}
                </div>
              </div>

              <div className="form__group u-margin-bottom-small">
                <button className="btn btn--green">Transfer</button>
              </div>
            </form>
          </div>
        </div>
        {this.state.loading && (
          <div className="loading">
            <p>Your request is processing. Please wait.</p>
          </div>
        )}
      </Layout>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  updateAmount: (amount) => {
    dispatch({
      type: UserActionTypes.UPDATE_BALANCE,
      payload: { amount },
    });
  },
});

const mapStateToProps = (state) => ({ user: state.user.user });

export default connect(mapStateToProps, mapDispatchToProps)(WithdrawlPage);
