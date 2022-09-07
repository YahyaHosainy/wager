import React from "react";
import Iphone from "../pages/homePage/assets/iphone.png";
import "./BlogBanner.scss";

const BlogBanner = () => {
  return (
    <div className="BlogBanner">
      <div className="BlogBanner__left__section">
        <h1 className="BlogBanner__title">Wager Games</h1>
        <h1>Sports Blog</h1>
        <p className="BlogBanner__subheading__2">The latest around sports</p>
        <p className="BlogBanner__subheading__2">Join our platform today!</p>
        <div className="BlogBanner__signup-container">
          <a href="/register" className="BlogBanner__signup">
            Sign Up
          </a>
        </div>
      </div>
      <div className="BlogBanner__right__section">
        <div className="BlogBanner__screenshot">
          <img src={Iphone} alt="Screenshoot" />
        </div>
      </div>
    </div>
  );
};

export default BlogBanner;
