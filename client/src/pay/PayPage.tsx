import React from "react";
import { Link } from "react-router-dom";
import BackButton from "../layout/assets/backbutton.png";
import Layout from "../layout/Layout";
import PaypalButtons from "../layout/PaypalButtons";
import "./PayPage.scss";

class PayPage extends React.Component {
  render() {
    return (
      <Layout>
        <div className="PayPage__container">
          <div className="Back__btn">
            <Link to="/games">
              <div>
                <img src={BackButton} alt="Back" />
              </div>

              <span>Back to Feed</span>
            </Link>
          </div>
          <div className="PayPage__content">
            <div className="PayPage__pay">
              <PaypalButtons />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

export default PayPage;
