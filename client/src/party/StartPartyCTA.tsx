import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import popcorn from "../layout/assets/popcorn.png";
import { AuthUser } from "../user/types";

interface StartPartyCTAProps {
  user: AuthUser;
}

const StartPartyCTA: React.FC<StartPartyCTAProps> = ({ ...props }) => {
  // TODO(tomarak): temp solution to gate party only to select user IDs, we'll want to handle this on the server in the future
  if (process.env.NODE_ENV === "production") {
    const partyHostIds = [
      "5e7558641fd610b3cf4eae98", // Kelson
      "5fa89bf4ed9fab7271a0dd55", // Anuj
      "5e6aafe58776e668dd8bfe1c", // Viv
      "5fdb9f3b7fcbbb62e6257c33", // Daily Fantasy Grind
      "60da37c73c47f35e487c5d8c", // Kyle Kirms
      "608230c8ead224767eb295d0", // ZG Covers
      "60f1e72673d4afe1873f8edf", // King Rack Bar
    ];
    if (!partyHostIds.includes(props.user._id)) return null;
  }
  return (
    <div className="startParty">
      <img src={popcorn} alt="Popcorn" />
      <div>
        <Link to="/start-party">START A PARTY!</Link>
      </div>
      <img src={popcorn} alt="Popcorn" />
    </div>
  );
};
const mapStateToProps = (state) => ({
  user: state.user.user,
});

export default connect(mapStateToProps, null)(StartPartyCTA);
