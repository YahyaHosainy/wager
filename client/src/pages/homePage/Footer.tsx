import React from "react";
import Coins from "./assets/coins.png";
import "./Footer.scss";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <img src={Coins} alt="coin" className="footer__coins" />
      <div className="footer__row">
        <ul className="footer__row-container">
          <li>
            <a
              href="https://www.instagram.com/wager_games/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              FAQ
            </a>
          </li>
          <li>
            <a
              href="/privacy_policy"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              Privacy Policy
            </a>
          </li>
        </ul>

        <div className="footer__copyright" aria-label="Copyright disclaimer">
          &#169; {currentYear} Wager
        </div>
      </div>
    </footer>
  );
};

export default Footer;
