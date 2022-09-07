import React from "react";
import backSpace from "../layout/assets/backspace.png";
import "./BetCalculator.scss";

type BetCalculatorProps = {
  onAmountChange: (amount: number) => void;
  amount: number;
  budget: number;
};

type BetCalculatorState = {
  amount: number;
  budget: number;
  formattedNum: string;
  return: string;
};

class BetCalculator extends React.Component<
  BetCalculatorProps,
  BetCalculatorState
> {
  state: BetCalculatorState = {
    amount: this.props.amount,
    budget: this.props.budget,
    formattedNum: "0",
    return: "0",
  };

  backspace = async () => {
    await this.setState({
      amount: this.checkAmount(this.state.amount),
      formattedNum: this.checkForComma(this.state.formattedNum),
      return: this.updateResult(this.state.amount),
    });

    this.props.onAmountChange(this.state.amount);
  };

  onClick = (value) => {
    if (parseFloat(this.state.amount + value) > 99999999) {
      alert("Sorry! The bet limit is $99,000,000.");
    } else {
      this.setState({
        amount: parseFloat(this.state.amount + value),
        formattedNum: this.formatNum(this.state.amount * 1 + value),
        return: this.formatNum((this.state.amount + value) * 2),
      });
    }
    this.props.onAmountChange(parseFloat(this.state.amount + value));
  };

  checkAmount = (num) => {
    if (isNaN(num) || num === 1 || num === 0) {
      return 0;
    }

    const resp = parseFloat(num.toString().slice(0, -1));
    if (isNaN(resp)) {
      return 0;
    }
    return resp;
  };

  formatNum = (num) => {
    if (parseInt(num) < 10 && num.length === 2) {
      num = num.charAt(num.length - 1);
    }

    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  };

  checkForComma = (num) => {
    if (!num.charAt(num.length - 2)) {
      return "0";
    }
    num = num.slice(0, -1);
    num = parseFloat(num.replace(/,/g, ""));
    return this.formatNum(num);
  };

  updateResult = (num) => {
    if (isNaN(num)) {
      return 0;
    }

    if (num === 1 || num.toString().length === 1 || num === 0) {
      return 0;
    }
    num = num.toString().slice(0, -1);
    num = parseFloat(num) * 2;
    return this.formatNum(num);
  };

  render() {
    const calculatorDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    return (
      <div className="BetCalculator">
        <div className="BetCalculator__Amounts">
          <div className="BetCalculator__Bet">
            <div className="BetCalculator__Input-container">
              <div className="BetCalculator__Bet-input">
                <div className="BetCalculator__Bet-dollarsign" />
                {this.state.formattedNum}
              </div>
            </div>
            <div className="BetCalculator__Account-balance">
              ${this.state.budget} available to wager
            </div>
          </div>
          <div className="BetCalculator__Winning">
            <div className="BetCalculator__Winning-container">
              <div className="BetCalculator__projectedReturn">
                Projected Total Return
              </div>
              <div className="BetCalculator__Bet-input">
                <div className="BetCalculator__Bet-dollarsign" />
                {this.state.return}
              </div>
            </div>
          </div>
        </div>

        <div className="BetCalculator__buttons">
          {calculatorDigits.map((digit: number) => {
            return (
              <button
                className="BetCalculator__button"
                value={`${digit}`}
                onClick={(e) => this.onClick(e.currentTarget.value)}
                key={digit}
              >
                {digit}
              </button>
            );
          })}

          <button
            className="BetCalculator__button"
            value="="
            onClick={() => this.backspace()}
          >
            <img
              src={backSpace}
              className="BetCalculator_backspace"
              alt="backspace button"
            />
          </button>

          <br />
        </div>
      </div>
    );
  }
}

export default BetCalculator;
