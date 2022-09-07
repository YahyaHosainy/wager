import React from "react";
import Iphone from "./assets/iphone.png";
import "./MainSection.scss";

const MainSection = () => {
  return (
    <div className="mainsection">
      <div className="left__section">
        <h1 className="MainSection__title">The People&apos;s</h1>
        <h1>Sportsbook</h1>
        <p className="subheading__1">Welcome to Peer to Peer sports betting</p>
        <p className="subheading__2">
          Place online juice-free bets against other members
        </p>
        <p className="subheading__2">all for free, just watch an ad</p>
        <div className="MainSection__signup-container">
          <a href="/register" className="MainSection__signup">
            Sign Up
          </a>
          <a href="/signin" className="MainSection__signup">
            Sign In
          </a>
        </div>
        <p className="how__win">
          <a href="https://www.betmorewinmore.com/faqs">How Does It Work?</a>
        </p>
      </div>
      <div className="right__section">
        <div className="screenshot">
          <img src={Iphone} alt="Screenshoot" />
        </div>
      </div>
    </div>
  );
};

export default MainSection;
