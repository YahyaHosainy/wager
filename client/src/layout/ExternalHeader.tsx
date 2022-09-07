import * as React from "react";
import "./ExternalHeader.scss";
import Logo from "./assets/logo-wager-b.png";
import YellowSignup from "./buttons/YellowSignup";
import { Link } from "react-router-dom";
import Instagram from "./assets/instagram.png";
import Linkedin from "./assets/linkedin.png";

class ExternalHeader extends React.Component {
  render() {
    return (
      <div className="ExternalHeader">
        <div className="ExternalHeader__content">
          <Link to="/blog" className="ExternalHeader__logo-container">
            <img src={Logo} alt="Wager Logo" />
          </Link>

          <div className="ExternalHeader__nav-box">
            <div className="social">
              <a href="https://www.instagram.com/wager_games/?hl=en">
                <img className="social__instagram" src={Instagram} />
              </a>
              <a href="https://www.linkedin.com/company/wager-games">
                <img className="social__instagram" src={Linkedin} />
              </a>
            </div>
            <Link to="/blog" className="ExternalHeader__blog-link">
              Blog
            </Link>
            <div className="ExternalHeader__signUp-container">
              <YellowSignup />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ExternalHeader;
