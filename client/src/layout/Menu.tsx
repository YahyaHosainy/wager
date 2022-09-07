import React from "react";
import "./Menu.scss";

type MyProps = {
  toggleMenu(): any;
  open: boolean;
};

class Menu extends React.Component<MyProps, {}> {
  render() {
    const isOpen = this.props.open;

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return (
      <div className="Menu">
        <button
          className="Menu__Container"
          role="navigation"
          aria-label="hamburger menu"
          onClick={this.props.toggleMenu}
        >
          <div
            className="Menu__Line"
            style={{
              transform: isOpen ? "rotate(41deg)" : "rotate(0)",
            }}
          />
          <div
            className="Menu__Line"
            style={{
              transform: isOpen ? "translateX(-20px)" : "translateX(0)",
              opacity: isOpen ? "0" : "1",
            }}
          />
          <div
            className="Menu__Line"
            style={{
              transform: isOpen ? "rotate(-41deg)" : "rotate(0)",
              width: isOpen ? "2rem" : "1rem",
            }}
          />
        </button>
      </div>
    );
  }
}

export default Menu;
