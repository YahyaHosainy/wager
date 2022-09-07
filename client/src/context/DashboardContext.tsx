import React, { createContext, useState } from "react";
import { AuthUser, BetUser } from "../user/types";

type DashboardContextType = {
  activeTab: number;
  setActiveTab: (value: number) => void;
  user: AuthUser;
  setUser: (value: []) => void;
  sportsIDArray: Array<number>;
  setSportsIDArray: (value: []) => void;
  todaysGames: Array<React.ReactNode>;
  setTodaysGames: (value: Array<React.ReactNode>) => void;
  leaderboard: Array<React.ReactNode>;
  setLeaderboard: (value: Array<React.ReactNode>) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  bets: Array<any>;
  setBets: (value: []) => void;
  betUsers: BetUser[];
  setBetUsers: (value: []) => void;
  loadingProfile: boolean;
  setLoadingProfile: (value: boolean) => void;
  loadingLeader: boolean;
  setLoadingLeader: (value: boolean) => void;
  cancelId: string | null;
  setCancelId: (value: string) => void;
  cancelConfirm: boolean | null;
  setCancelConfirm: (value: boolean) => void;
};

export const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

type Props = {
  children: React.ReactNode;
};

export const DashboardProvider = ({ children }: Props) => {
  const [activeTab, setActiveTab] = useState(7);
  const [user, setUser] = useState(null);
  const [sportsIDArray, setSportsIDArray] = useState([]);
  const [todaysGames, setTodaysGames] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bets, setBets] = useState([]);
  const [betUsers, setBetUsers] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingLeader, setLoadingLeader] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  return (
    <DashboardContext.Provider
      value={{
        activeTab,
        setActiveTab,
        user,
        setUser,
        sportsIDArray,
        setSportsIDArray,
        todaysGames,
        setTodaysGames,
        leaderboard,
        setLeaderboard,
        loading,
        setLoading,
        bets,
        setBets,
        betUsers,
        setBetUsers,
        loadingProfile,
        setLoadingProfile,
        loadingLeader,
        setLoadingLeader,
        cancelId,
        setCancelId,
        cancelConfirm,
        setCancelConfirm,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardContext;
