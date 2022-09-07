import React from "react";
import { Link } from "react-router-dom";
import BackButtonImage from "../assets/graybackbutton.png";
import "./BackButton.scss";

interface BackButtonProps {
  to: string;
  styles?: Record<string, any>;
}

const BackButton: React.FC<BackButtonProps> = ({ ...props }) => {
  return (
    <div className="BackButton" style={props.styles || {}}>
      <Link to={props.to}>
        <img src={BackButtonImage} alt="Go to previous page" />
      </Link>
    </div>
  );
};

export default BackButton;
