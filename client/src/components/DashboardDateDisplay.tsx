import moment from "moment";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import "./DashboardDateDisplay.scss";

interface DashboardDateDisplayProps {
  dateType: string;
  className?: string;
}

const DashboardDateDisplay: React.FunctionComponent<DashboardDateDisplayProps> =
  ({ ...props }) => {
    const [date, setDate] = useState(null);

    useEffect(() => {
      const formatDate = () => {
        const tz = moment.tz.guess();

        if (props.dateType === "next")
          return moment().tz(tz).add(1, "days").format("dddd, MMMM Do");

        return moment().tz(tz).format("dddd, MMMM Do");
      };
      setDate(formatDate);
    }, []);

    return (
      <div className={classNames("date-container", props.className)}>
        <div className="date-text">{date}</div>
      </div>
    );
  };

export default DashboardDateDisplay;
