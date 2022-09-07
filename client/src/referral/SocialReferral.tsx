import React, { useRef } from "react";
import "./SocialReferral.scss";
import fbMessenger from "../layout/assets/fb-messenger.png";
import whatsapp from "../layout/assets/whatsapp.png";
import twitter from "../layout/assets/twitter.png";
import sms from "../layout/assets/sms.png";

interface SocialReferralProps {
  referralLink: string;
  referralText: string;
}

const SocialReferral: React.FunctionComponent<SocialReferralProps> = ({
  ...props
}) => {
  const inputRef = useRef(null);

  const copyToClipboard = () => {
    inputRef.current.select();
    document.execCommand("copy");
  };

  const referralModes = [
    {
      name: "sms",
      icon: sms,
      link: `sms:&body=${encodeURI(props.referralText)}`,
    },
    {
      name: "facebook messenger",
      icon: fbMessenger,
      link: `fb-messenger://share?app_id=${process.env.REACT_APP_FACEBOOK_APP_ID}&link=`,
    },
    {
      name: "whatsapp",
      icon: whatsapp,
      link: `https://api.whatsapp.com/send?text=${encodeURI(
        props.referralText
      )}`,
    },
    {
      name: "twitter",
      icon: twitter,
      link: `https://twitter.com/intent/tweet?text=${encodeURI(
        props.referralText
      )}&url=`,
    },
  ];

  const modes = referralModes.map((mode: any) => {
    return (
      <div className="SocialReferral__mode" key={mode.name}>
        <a href={mode.link + " " + encodeURI(`${props.referralLink}`)}>
          <img className="SocialReferral__icon" src={mode.icon} />
        </a>
      </div>
    );
  });

  return (
    <div>
      <div className="SocialReferral__action-container">
        <input
          className="SocialReferral__link"
          ref={inputRef}
          value={props.referralLink}
          readOnly={true}
        />
        <button className="SocialReferral__button" onClick={copyToClipboard}>
          Copy
        </button>
      </div>
      <div className="SocialReferral__modes">{modes}</div>
    </div>
  );
};

export default SocialReferral;
