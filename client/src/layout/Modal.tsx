import React, { useRef } from "react";
import useOnOutsideClick from "../helpers/useOnOutsideClick";
import "./Modal.scss";

const Modal = ({ isOpen, toggle, children }) => {
  const ref = useRef();
  useOnOutsideClick(ref, () => toggle(false));

  return (
    <div className={isOpen ? "Modal__container Modal__open" : "Modal__closed"}>
      <div className="Modal__content" ref={ref}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
