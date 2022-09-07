import React from "react";
import "./SelectTeam.scss";

class SelectTeam extends React.Component {
  render() {
    return (
      <div className="SelectTeam">
        <div className="SelectTeam__Menu">
          <div className="SelectTeam__Back" />
          <div className="SelectTeam__Title">
            <h3>Pick Team</h3>
          </div>
        </div>

        <div className="SelectTeam__Teams">
          <div className="SelectTeam__Favorite">
            <div className="SelectTeam__Team-logo" />
            <div className="SelectTeam__Team-title" />
            <div className="SelectTeam__Team-subtitle" />
            <div className="SelectTeam__Team-explanation" />
            <div className="SelectTeam__Team-checkmark" />
          </div>
          <div className="SelectTeam__Away" />
        </div>

        <div className="SelectTeam__Explanation" />

        <div className="SelectTeam__Next" />
      </div>
    );
  }
}

export default SelectTeam;
