import React from "react";
import "./NotAvailable.scss";

type Props = {
  text: string;
};

const NotAvailable = ({ text }: Props) => {
  return <div className="notAvailable">No {text} Available</div>;
};

export default NotAvailable;
