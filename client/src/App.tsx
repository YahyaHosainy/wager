import React from "react";
import { connect } from "react-redux";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.scss";
import { DashboardProvider } from "./context/DashboardContext";
import Dashboard from "./game/dashboard";
import Game from "./game/gameDetail";
import MatchDetail from "./game/matchDetail";
import Match from "./game/match";
import ExternalLayout from "./layout/ExternalLayout";
import Layout from "./layout/Layout";
import HomePage from "./pages/homePage/HomePage";
import PrivacyPolicy from "./pages/homePage/PrivacyPolicy";
import Terms from "./pages/homePage/Terms";
import PayPage from "./pay/PayPage";
import WithdrawlPage from "./pay/WithdrawlPage";
import PrivateRoute from "./privateRoute";
import MainProfilepanel from "./profiles/MainProfilePanel";
import ProfileEdit from "./profiles/ProfileEdit";
import Forgot from "./signUp/Forgot";
import Register from "./signUp/Register";
import Reset from "./signUp/Reset";
import SignIn from "./signUp/SignIn";
import BetList from "./game/betList";
import ProfileDetails from "./profiles/ProfileDetails";
import Confirm from "./signUp/Confirm";
import Ticket from "./game/Ticket";
import ReferPage from "./referral/ReferPage";
import Articles from "./blog/Articles";
import Article from "./blog/Article";
import Party from "./party/Party";
import StartParty from "./party/StartParty";
import FollowersList from "./profiles/FollowersList";
import EditParty from "./party/EditParty";
import HomePageNew from "./pages/homePage/HomePageNew";

interface AppProps {
  isAuthenticated: boolean;
}

class App extends React.Component<AppProps> {
  render() {
    const { isAuthenticated } = this.props;
    return (
      <Router>
        <div className="App">
          <ToastContainer />
          <Switch>
            <ExternalLayout path="/blog">
              <Articles />
            </ExternalLayout>
            <ExternalLayout path="/blogItem/:slug" component={Article} />
            <Route exact path="/signup">
              <Redirect to="/register" />
            </Route>
            <ExternalLayout path="/signin">
              <SignIn />
            </ExternalLayout>

            <ExternalLayout path="/register">
              <Register />
            </ExternalLayout>

            <ExternalLayout path="/forgot">
              <Forgot />
            </ExternalLayout>
            <ExternalLayout
              path="/confirm/:email/:tokens"
              component={Confirm}
            />
            <ExternalLayout path="/reset/:tokens" component={Reset} />
            <ExternalLayout path="/ticket/:id/:type?" component={Ticket} />
            <ExternalLayout path="/privacy_policy" component={PrivacyPolicy} />
            <ExternalLayout path="/terms" component={Terms} />
            <DashboardProvider>
              <ExternalLayout
                exact
                path="/"
                component={isAuthenticated ? Dashboard : HomePageNew}
              >
                <HomePage />
              </ExternalLayout>
              <PrivateRoute path="/games" component={Dashboard} />

              <PrivateRoute
                path="/match-detail/:id/:side"
                component={MatchDetail}
              />

              <PrivateRoute path="/match/:betid" component={Match} />

              <PrivateRoute
                path="/bettor-profile/:id"
                component={(props) => (
                  <ProfileDetails {...props} key={window.location.pathname} />
                )}
              />

              <PrivateRoute path="/profile" component={MainProfilepanel} />

              <PrivateRoute path="/profile-edit" component={ProfileEdit} />

              <PrivateRoute path="/payment" component={PayPage} />

              <PrivateRoute path="/withdraw" component={WithdrawlPage} />

              <PrivateRoute path="/refer" component={ReferPage} />

              <PrivateRoute path="/party/:id" component={Party} />
              <PrivateRoute path="/start-party" component={StartParty} />
              <PrivateRoute path="/edit-party/:id?" component={EditParty} />

              <PrivateRoute path="/followers/:type" component={FollowersList} />

              <Route
                path="/game/:id"
                render={(info) =>
                  isAuthenticated ? (
                    <Layout>
                      <Game routeInfo={info} />
                    </Layout>
                  ) : (
                    <Redirect to="/" />
                  )
                }
              />
              <PrivateRoute path="/betlist/:id/:side" component={BetList} />
            </DashboardProvider>
          </Switch>
        </div>
      </Router>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.user.isAuthenticated,
});

export default connect(mapStateToProps)(App);
