import axios from "axios";
import uniqBy from "lodash/uniqBy";
import React, { useContext, useEffect } from "react";
import { connect } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingAnimation from "../layout/animations/LoadingAnimation";
import Layout from "../layout/Layout";
import "./dashboard.scss";
import NotAvailable from "../components/NotAvailable";
import DashboardSection from "../layout/DashboardSection";
import PartySection from "../party/PartySection";
import NavBarTab from "../components/NavBarTab";
import { getFilterDate, Tabs } from "../helpers/dashboardHelpers";
import { DashboardContext } from "../context/DashboardContext";

import config from "../config.json";
import Leaderboard from "../layout/Leaderboard";
import { find } from "lodash";
import NewsFeed from "../layout/NewsFeed";
import { logger } from "../helpers/winston";
import { AuthUser } from "../user/types";

type MyProps = {
  user: AuthUser;
  token: string;
};

declare global {
  interface Window {
    analytics: any;
  }
}

const Dashboard = ({ user, token }: MyProps) => {
  const {
    activeTab,
    loading,
    loadingLeader,
    sportsIDArray,
    todaysGames,
    leaderboard,
    setSportsIDArray,
    setTodaysGames,
    setLeaderboard,
    setLoading,
    setBets,
    setLoadingProfile,
    setLoadingLeader,
  } = useContext(DashboardContext);

  useEffect(() => {
    if (config.NODE_ENV !== "development") {
      window.analytics.page();
    }
    if (user) {
      window.analytics.identify(user._id, {
        username: user.name,
      });
      getProfile({ user });
      getCurrentGames();
      getLeaderboard();
    }
  }, []);

  const getCurrentGames = () => {
    const today = getFilterDate();
    axios.get(`/api/until10games/from/${today}`).then(
      (response) => {
        const { foundGames, uniqueSportsId } = response.data;
        const uniqueGames = uniqBy(foundGames, "eventID");
        const filterGamesWithLines = uniqueGames.filter(
          (game) => game["line"] !== 0 && game["gameOverUpdated"] === false
        );

        setSportsIDArray(uniqueSportsId);
        setTodaysGames(filterGamesWithLines);
        setLoading(false);
      },
      (error) => {
        logger.log("error", error);
      }
    );
  };

  const getLeaderboard = () => {
    axios
      .get(`/api/leaderboard`, {
        headers: { "x-access-token": `${token}` },
      })
      .then(
        (res) => {
          setLeaderboard(res.data.resp);
          setLoadingLeader(false);
        },
        (error) => {
          logger.log("error", error);
        }
      );
  };

  const getProfile = async ({ user }) => {
    const today = getFilterDate();
    let response;
    try {
      response = await axios.get(`/api/profilefilter/${user._id}/${today}`, {
        headers: { "x-access-token": `${token}` },
      });
    } catch (error) {
      logger.log("error", error);
    }
    if (response) {
      setBets(response.data.todaysBets);
      setLoadingProfile(false);
    }
  };

  const renderState = (loading, state) => {
    if (loading === true) {
      return <LoadingAnimation />;
    }

    return state;
  };

  const hasActiveGames = {
    2: Boolean(find(todaysGames, { sportID: 2 })),
    4: Boolean(find(todaysGames, { sportID: 4 })),
    5: Boolean(find(todaysGames, { sportID: 5 })),
  };

  return loading ? (
    <LoadingAnimation />
  ) : (
    <Layout>
      <div className="Dashboard">
        <div className="Dashboard__tab-container">
          <NavBarTab text="Parties" tabNumber={Tabs.PARTY} />
          <NavBarTab text="Player Props" tabNumber={Tabs.PLAYERPROPS} />
          <NavBarTab
            text="NBA"
            tabNumber={Tabs.NBA}
            styles={`${
              hasActiveGames[4] && activeTab !== Tabs.NBA
                ? "Dashboard__tab--game-active"
                : ""
            }`}
          />
          <NavBarTab
            text="NFL"
            tabNumber={Tabs.NFL}
            styles={`${
              hasActiveGames[2] && activeTab !== Tabs.NFL
                ? "Dashboard__tab--game-active"
                : ""
            }`}
          />
          <NavBarTab
            text="College Basketball"
            tabNumber={Tabs.NCAA}
            styles={`${
              hasActiveGames[5] && activeTab !== Tabs.NCAA
                ? "Dashboard__tab--game-active"
                : ""
            }`}
          />
          <NavBarTab text="Leaderboard" tabNumber={Tabs.LEADERBOARD} />
          {/* <NavBarTab text="NewsFeed" tabNumber={Tabs.NEWSFEED} /> */}
        </div>
        <div className="Dashboard__info-container">
          {/* // Parties */}
          <PartySection tabNumber={Tabs.PARTY} />
          {/* // Player Props */}
          {activeTab == Tabs.PLAYERPROPS && 
          <div>
            <NotAvailable text="Player Props" />
          </div>
          }
          {/* //nba */}
          <DashboardSection
            tabNumber={Tabs.NBA}
            content={
              todaysGames.length > 0 &&
              activeTab === 2 &&
              sportsIDArray.includes(4) ? (
                renderState(loading, todaysGames)
              ) : (
                <NotAvailable text="NBA Games" />
              )
            }
            sportID={4}
          />
          {/* // nfl */}
          <DashboardSection
            tabNumber={Tabs.NFL}
            content={
              todaysGames.length > 0 &&
              activeTab === 3 &&
              sportsIDArray.includes(2) ? (
                renderState(loading, todaysGames)
              ) : (
                <NotAvailable text="NFL Games" />
              )
            }
            sportID={2}
          />
          {/* // ncaa */}
          <DashboardSection
            tabNumber={Tabs.NCAA}
            content={
              todaysGames.length > 0 &&
              activeTab === 6 &&
              sportsIDArray.includes(5) ? (
                renderState(loading, todaysGames)
              ) : (
                <NotAvailable text="NCAA Games" />
              )
            }
            sportID={5}
          />
          {/* // leaderboard */}
          <Leaderboard
            tabNumber={Tabs.LEADERBOARD}
            content={
              leaderboard.length > 0 && activeTab === 4 ? (
                renderState(loadingLeader, leaderboard)
              ) : (
                <NotAvailable text="Leaderboard" />
              )
            }
          />
          {/* // newsfeed */}
          {/* <NewsFeed tabNumber={Tabs.NEWSFEED} /> */}
        </div>
        <ToastContainer />
      </div>
    </Layout>
  );
};

const mapStateToProps = (state) => ({
  user: state.user.user,
  token: state.user.token,
});

export default connect(mapStateToProps)(Dashboard);
