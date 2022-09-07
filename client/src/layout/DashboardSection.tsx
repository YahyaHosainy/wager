import React, { useContext } from "react";
import moment from "moment";
import DashboardDateDisplay from "../components/DashboardDateDisplay";
import { DashboardContext } from "../context/DashboardContext";
import DashboardCard from "../game/dashboardCard";
import { getFilterDate, Tabs } from "../helpers/dashboardHelpers";
import NotAvailable from "../components/NotAvailable";
import { Game } from "../game/types";

type Props = {
  content: any;
  tabNumber: Tabs;
  sportID: number;
};

const DashboardSection = ({ content, tabNumber, sportID }: Props) => {
  const { activeTab } = useContext(DashboardContext);

  const checkGameEmptyState = (curNextDate) => {
    let date = "";
    let count = 0;

    if (curNextDate === 1) date = getFilterDate();
    else if (curNextDate === 2) date = moment(getFilterDate()).add(1, "days").format("YYYY-MM-DD");
    else date = ''

    content.length &&
      content.forEach((game) => {
        if (sportID === game.sportID && date === game.eventDate) {
          count++;
        } else if (date === '') {
          count++;
        }
      });

    return count;
  };

  const loadCard = (dateType) => {
    return content.length ? (
      content.map((game: Game) => (
        <DashboardCard
          key={game._id}
          game={game}
          sportID={sportID}
          curNextDate={dateType}
          from="dashboard"
          onSelectGame={null}
        />
      ))
    ) : (
      <div className="Dashboard__Game-container">{content}</div>
    );
  };

  return (
    <div
      className="DashboardSection"
      style={{ display: activeTab === tabNumber ? "flex" : "none" }}
    >
      <DashboardDateDisplay dateType="current" />
      {checkGameEmptyState(1) ? (
        <div className="Dashboard__Game-container">{loadCard(1)}</div>
      ) : (
        <NotAvailable
          text={
            sportID === 4
              ? "NBA Games"
              : sportID === 2
              ? "NFL Games"
              : "NCAA Games"
          }
        />
      )}
      <DashboardDateDisplay dateType="next" />
      {checkGameEmptyState(2) ? (
        <div className="Dashboard__Game-container">{loadCard(2)}</div>
      ) : (
        <NotAvailable
          text={
            sportID === 4
              ? "NBA Games"
              : sportID === 2
              ? "NFL Games"
              : "NCAA Games"
          }
        />
      )}
      <div className="date-container">
        <div className="date-text">Upcoming games</div>
      </div>
      {checkGameEmptyState(3) ? (
        <div className="Dashboard__Game-container">{loadCard(3)}</div>
      ) : (
        <NotAvailable
          text={
            sportID === 4
              ? "NBA Games"
              : sportID === 2
              ? "NFL Games"
              : "NCAA Games"
          }
        />
      )}
    </div>
  );
};

export default DashboardSection;
