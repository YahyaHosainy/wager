import React from "react";
import Step1 from "./assets/step1.svg";
import Step2 from "./assets/step2.svg";
import Step3 from "./assets/step3.svg";
import Step4 from "./assets/step4.svg";
import Explanation from "./Explanation";
import "./ExplanationSection.scss";

const ExplanationSection = () => {
  const steps = [
    {
      stepImg: Step1,
      header: "Make a wager",
      subheader: "Bet on a game you're interested in",
    },
    {
      stepImg: Step2,
      header: "Watch an ad",
      subheader: "Ads allow you to make bets without a cut from the house",
    },
    {
      stepImg: Step3,
      header: "Get matched",
      subheader: "We match you with someone who made a bet opposite to yours",
    },
    {
      stepImg: Step4,
      header: "Get even return",
      subheader:
        "There is no house! We make money off ads so you can make an even profits",
    },
  ];

  return (
    <div className="ExplanationSection">
      <div className="ExplanationSection__Header">
        How is even
        <br />
        betting possible?
      </div>
      {steps.map((step, index) => (
        <Explanation
          key={index}
          stepImg={step.stepImg}
          header={step.header}
          subheader={step.subheader}
        />
      ))}
    </div>
  );
};

export default ExplanationSection;
