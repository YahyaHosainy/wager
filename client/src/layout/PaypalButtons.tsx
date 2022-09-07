import axios from "axios";
import React, { createRef, useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import "./App.css";
import "./PaypalButtons.scss";
import gif from "./giphy.gif";
import * as Sentry from "@sentry/react";
import CurrencyInput from "./CurrencyInput";
import { logger } from "../helpers/winston";
import { AuthUser } from "../user/types";

interface MyProps {
  user: AuthUser;
}

declare global {
  interface Window {
    paypal: any;
    paypalBtn: any;
  }
}

const PaypalButtons: React.FunctionComponent<MyProps> = ({ ...props }) => {
  const [paidFor, setPaidFor] = useState(false);
  const [amount, setAmount] = useState(0);
  const amountRef = useRef(0);
  const [validationError, setValidationError] = useState(false);
  const paypalRef = createRef<HTMLInputElement>();

  const createOrder = (data, actions) => {
    return actions.order.create({
      payer: {
        name: {
          given_name: props.user.name,
        },
        email_address: props.user.email,
      },
      purchase_units: [
        {
          description: "deposit",
          amount: {
            currency_code: "USD",
            value: amountRef.current,
          },
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
      },
    });
  };

  const onApprove = async (data, actions) => {
    const details = await actions.order.capture();
    if (details?.status === "COMPLETED") {
      const requestData = {
        userID: props.user._id,
        paypal: {
          orderID: details.id,
          payerID: details.payer.payer_id,
          status: details.status,
          amount: details.purchase_units[0].amount.value,
          currency_code: details.purchase_units[0].amount.currency_code,
        },
      };
      axios.post("api/paypal/payment/complete", requestData).then((r) => {
        if (r.status !== 500) {
          setPaidFor(true);
        }
      });
    } else {
      logger.log("warn", "Paypal details is null");
    }
  };

  const validate = () => {
    return amountRef.current > 0;
  };

  const onError = (err) => {
    setValidationError(true);
    Sentry.captureException(err);
  };

  const handleOnBlur = () => {
    amountRef.current > 0
      ? setValidationError(false)
      : setValidationError(true);
  };

  const handleSetAmount = (value) => {
    amountRef.current = value;
    setAmount(amountRef.current);
  };

  useEffect(() => {
    window.paypalBtn = window.paypal
      .Buttons({
        createOrder,
        onApprove,
        onError,
        validate,
      })
      .render(paypalRef.current);
  }, []);

  if (paidFor) {
    return (
      <div className="PaypalButton__success">
        <h1 className="PaypalButton__success-header">
          Your payment was successful, thanks for joining us and ushering a new
          era of sports gambling!
        </h1>
        <img className="PaypalButton__success-gif" src={gif} />
      </div>
    );
  }
  const amountToDisplay = amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  return (
    <div className="PayPalButtons__container">
      <div className="PayPalButtons__deposit">
        <form action="#" className="form">
          <div className="u-margin-bottom-medium">
            <h2 className="heading-secondary">Deposit Funds</h2>
          </div>
          {amountRef.current === 0 && validationError && (
            <div className="alert alert-danger">Enter amount to continue</div>
          )}
          <div className="form__all">
            <div className="PaypalButtons__amount">
              <div className="PaypalButtons__subtitle">Enter Amount</div>
              <div className="PaypalButtons__input-container">
                <CurrencyInput
                  value={amountRef.current}
                  onValueChange={(val) => handleSetAmount(val)}
                  onBlurCallBack={handleOnBlur}
                />
              </div>
            </div>

            <div className="PaypalButtons__fees">
              <p className="PaypalButtons__subtitle">Fees</p>
              <p className="PaypalButtons__subtitle-amount">
                {/* use this when we start charging fees */}
                {/* ${(amount * 1.0275 - amount).toFixed(2)} */}${0.0}
              </p>
            </div>

            <div className="PaypalButtons__fees">
              <p className="PaypalButtons__subtitle">Total Charged</p>
              <p className="PaypalButtons__subtitle-amount">
                {/* use this when we start charging fees */}
                {/* ${(amount * 1.0275).toFixed(2)} */}
                {amountToDisplay}
              </p>
            </div>
          </div>
        </form>
        <div className="PayPage__paypal-container" ref={paypalRef} />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.user.isAuthenticated,
  user: state.user.user,
  token: state.user.token,
});

export default connect(mapStateToProps)(PaypalButtons);
