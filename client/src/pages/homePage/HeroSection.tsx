import React from "react";
import WhiteSignup from "../../layout/buttons/WhiteSignup";
import Phone from "./assets/phone.svg";
import "./HeroSection.scss";

const HeroSection = () => {
  return (
    <div className="herosection">
      <div className="herosection__header">
        {"Don't let the house"}
        <br />
        take your money
      </div>

      <div className="herosection__subheader">
        Avoid the bookmaker charges with all even bets. $100 bet to win $100.
        Easy.
      </div>

      <div className="herosection__container">
        <WhiteSignup />
      </div>

      <div className="herosection__container">
        <img src={Phone} alt="phone" />
      </div>
    </div>
  );
};

export default HeroSection;
