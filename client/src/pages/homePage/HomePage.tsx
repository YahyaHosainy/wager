import React from "react";
import ExternalHeader from "../../layout/ExternalHeader";
import Footer from "./Footer";
import "./HomePage.scss";
import MainSection from "./MainSection";
import VideoSection from "./VideoSection";

const HomePage = () => {
  document.body.style.overflow = "visible";

  return (
    <div className="homepage">
      <ExternalHeader />
      <div className="container">
        <div className="main full-width">
          <MainSection />
        </div>
        <div className="video full-width">
          <VideoSection />
        </div>
        <div className="footer-new full-width">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
