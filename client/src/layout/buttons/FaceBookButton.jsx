import React, { Component } from "react";
import { logger } from "../../helpers/winston";

export default class FacebookLogin extends Component {
  state = {
    user: null,
  };

  componentDidMount() {
    window.fbAsyncInit = function () {
      FB.init({
        appId: "1018533071855382",
        cookie: true,
        xfbml: true,
        version: "v9.0",
      });

      FB.AppEvents.logPageView();
    };

    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }

  login = () => {
    window.FB.login(
      (response) => {
        this.statusChangeCallback(response);
      },
      { scope: "public_profile,email" }
    );
  };

  statusChangeCallback(response) {
    // Called with the results from FB.getLoginStatus().
    logger.log("info", "statusChangeCallback");
    logger.log("info", response); // The current login status of the person.
    if (response.status === "connected") {
      // Logged into your webpage and Facebook.
      this.apiCall();
    } else if ((response.status = "not_authorized")) {
      logger.log("info", "logged into Facebook, but not the app");
    } else {
      logger.log("info", "not logged into Facebook");
    }
  }

  apiCall() {
    window.FB.api(
      "/me",
      "GET",
      { fields: "id,name,picture{url,cache_key,height,width,is_silhouette}" },
      function (response) {
        logger.log("info", JSON.stringify(response));
        logger.log("info", "Logged in as: " + response.name);

        this.setState({
          user: response.name,
        });
      }.bind(this)
    );
  }

  render() {
    return (
      <div>
        this.state.user
        <a
          onClick={this.login}
          className="fb-login-button"
          data-width="200"
          data-size="large"
          data-button-type="continue_with"
          data-auto-logout-link="false"
          data-use-continue-as="false"
        ></a>
      </div>
    );
  }
}
