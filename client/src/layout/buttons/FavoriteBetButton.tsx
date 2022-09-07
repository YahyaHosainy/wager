import React, { MouseEvent } from "react";
import moment from "moment";
import BetModal from "../BetModal";

type MyProps = {
  GameData: any;
  side: string;
};

type MyState = {
  showModal: boolean;
};

class BetButton extends React.Component<MyProps, MyState> {
  state: MyState = {
    showModal: false,
  };

  constructor(props: Readonly<MyProps>) {
    super(props);
    this.toggleModal = this.toggleModal.bind(this);
  }

  componentWillUnmount() {
    document.body.style.overflow = "visible";
  }

  toggleModal(event: MouseEvent) {
    event.preventDefault();

    const diff = moment
      .utc(this.props.GameData.eventDateUTC)
      .diff(moment.utc(Date.now()), "minutes");

    if (diff >= 0 && diff <= 2880) {
      this.setState({
        showModal: !this.state.showModal,
      });
    } else if (diff < 0) alert("You cannot bet now. Time passed.");
    else alert("You can only bet 48 hours before game starts");

    if (!this.state.showModal) {
      document.documentElement.style.overflowY = "hidden";
    } else {
      document.documentElement.style.overflowY = "scroll";
    }
  }

  render() {
    return (
      <React.Fragment>
        <div className="BetButton__container">
          <button
            className="GameDetail__details-button"
            onClick={this.toggleModal}
          >
            WAGER
          </button>
        </div>
        <div className="BetButton__Modal-container">
          {this.state.showModal && (
            <BetModal
              selected=""
              gameData={this.props.GameData}
              side={this.props.side}
              toggle={this.toggleModal}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default BetButton;
