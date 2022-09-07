import React, { useContext } from "react";
import classNames from "classnames";
import NotAvailable from "./NotAvailable";
import { DashboardContext } from "../context/DashboardContext";
import LoadingAnimation from "../layout/animations/LoadingAnimation";
import "../layout/NewsFeed.scss";

interface NotAvailableProps {
  children: Array<React.ReactNode>;
  styleName?: string;
  loading: boolean;
  tabNumber: number;
  text: string;
}

const NotAvailableWrapper = ({ ...props }: NotAvailableProps) => {
  const { activeTab } = useContext(DashboardContext);

  return (
    <div
      className="DashboardSection"
      style={{ display: activeTab === props.tabNumber ? "block" : "none" }}
    >
      <div className={classNames(props.styleName)}>
        {props.loading && <LoadingAnimation />}
        {!props.loading && props.children.length > 0 ? (
          props.children
        ) : (
          <NotAvailable text={props.text} />
        )}
      </div>
    </div>
  );
};

export default NotAvailableWrapper;
