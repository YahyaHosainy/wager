import React from "react";
import Chat from "./assets/chat.png";
import Crowd from "./assets/crowd.png";
import "./FriendSection.scss";

const FriendsSection = () => {
  return (
    <div className="friendsection">
      <img src={Crowd} alt="Crowd" className="friendsection__background" />
      <div className="friendsection__header">
        Peer to peer access to a community
        <br />
        of sports fans and betting your friends-all
        <br />
        in the palm of your hands
      </div>
      <img src={Chat} alt="" className="friendsection__chat" />
    </div>
  );
};

export default FriendsSection;
