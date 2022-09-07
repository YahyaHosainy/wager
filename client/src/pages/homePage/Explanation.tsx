import React from "react";
import "./Explanation.scss";

type Props = {
  stepImg: string;
  header: string;
  subheader: string;
};

const Explanation = ({ stepImg, header, subheader }: Props) => {
  return (
    <div className="explanation__container">
      <div>
        <img src={stepImg} alt="" />
      </div>
      <div className="explanation__step-text">
        <div className="explanation__step-header">{header}</div>
        <div className="explanation__step-subheader">{subheader}</div>
      </div>
    </div>
  );
};

export default Explanation;
