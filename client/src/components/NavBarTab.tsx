import React, { useContext, useEffect, useState } from "react";
import DashboardContext from "../context/DashboardContext";

type Props = {
  tabNumber: number;
  text: string;
  styles?: string;
};

const NavBarTab = ({ text, tabNumber, styles }: Props) => {
  const [style, setStyle] = useState({
    words: "Dashboard__tab-words Dashboard__tab-nowords",
    line: "Dashboard__tab-line-invisible",
  });
  const { activeTab, setActiveTab } = useContext(DashboardContext);

  useEffect(() => {
    if (activeTab === tabNumber) {
      setStyle({
        words: "Dashboard__tab-words",
        line: "Dashboard__tab-line",
      });
    } else {
      setStyle({
        words: "Dashboard__tab-words Dashboard__tab-nowords",
        line: "Dashboard__tab-line-invisible",
      });
    }
  }, [activeTab, tabNumber]);

  return (
    <div
      className={`Dashboard__tab ${styles ? styles : ""}`}
      onClick={() => {
        setActiveTab(tabNumber);
      }}
    >
      <div className={style.words}>{text}</div>
      <div className={style.line} />
    </div>
  );
};

export default NavBarTab;
