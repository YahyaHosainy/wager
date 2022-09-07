import axios from "axios";
import React, { ComponentState } from "react";
import { connect } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import BetCalculator from "../betModal/BetCalculator";
import MatchDetail from "../game/matchDetail";
import { getFirstWord, getLastWord, getLogoName } from "../helpers/strings";
import LoadingAnimation from "../layout/animations/LoadingAnimation";
import EmptyCheck from "./assets/empty-check.png";
import ticketLogo from "./assets/ticketLogo.png";
import shareIcon from "./assets/shareIcon.png";
import BackButton from "./assets/graybackbutton.png";
import SelectedCheck from "./assets/green-check.png";
import Close from "./assets/close.png";
import "./BetModal.scss";
import { AuthUser, UserActionTypes } from "../user/types";
import { logger } from "../helpers/winston";
import moment from "moment";
import DefaultUserImage from "./assets/defaultImg.png";
import confettiLeft from "../layout/assets/celebration-left.png";
import confettiRight from "../layout/assets/celebration-right.png";
import { Link } from "react-router-dom";
import closeIcon from "./assets/closeIcon.png";
import SocialReferral from "../referral/SocialReferral";
import { nameOrUsername } from "../helpers/user";
import { Party } from "../party/types";

interface BetModalProps {
  updateBets: any;
  updateAmount: any;
  gameData: any;
  side: string;
  toggle: any;
  user: AuthUser;
  token: string;
  selected: string;
  party?: Party;
}

interface BetModalState {
  step: string;
  confirmation: React.ReactNode;
  gameId: string;
  matchup: string;
  side: string;
  betAgainst: string;
  amount: string;
  selectedOption: string;
  budget: number;
  favorite: string;
  underdog: string;
  gameData: any;
  sideLast: string;
  amountLast: number;
  loading: boolean;
  bet: object | null;
  shareModal: boolean;
}

class BetModal extends React.Component<BetModalProps, BetModalState> {
  state: BetModalState = {
    bet: null,
    step: "INTRO",
    confirmation: {},
    gameId: this.props.gameData._id,
    matchup: this.props.gameData.title,
    side: this.props.side,
    gameData: this.props.gameData,
    betAgainst: "Community",
    amount: "",
    selectedOption: "",
    budget: 0,
    favorite: "",
    underdog: "",
    sideLast: "",
    amountLast: 0,
    loading: false,
    shareModal: false,
  };

  componentDidMount() {
    this.getBudget();

    if (this.props.selected !== "") {
      this.setState({ selectedOption: this.props.selected });
      this.setState({ side: this.props.gameData[this.props.selected] });
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      gameId: props.gameData._id,
      matchup: props.gameData.title,
      side: props.side,
      gameData: props.gameData,
    });
  }

  async getBudget() {
    try {
      const response = await axios.get(`/api/profile/${this.props.user._id}`, {
        headers: { "x-access-token": this.props.token },
      });
      this.setState({
        budget: response.data.user.currentAmount,
      });
    } catch (error) {
      logger.log("error", error);
    }
  }

  // Proceed to next question
  nextStep = (nextStep) => {
    if (this.state.selectedOption === "") {
      alert("You need to pick a team!");
    } else {
      this.setState({
        step: nextStep,
      });
    }
  };

  handleAmountChange = (newAmount) => {
    this.setState({ amount: newAmount });
  };

  stepTwo = (amount) => {
    const party = new URLSearchParams(window.location.search).get("party");

    if (amount && this.state.budget >= amount && amount !== 0) {
      this.setState({
        loading: true,
      });
      setTimeout(() => {
        this.postBet(party && { party });
      }, 500);
    } else if (!amount) {
      alert("You didn't place a bet");
    } else {
      alert("The bet you entered is more than what you have");
    }
  };

  previousStep = (prevStep) => {
    this.setState({
      step: prevStep,
    });
  };

  resetBetModal = (e) => {
    this.props.toggle
      ? this.props.toggle(e)
      : (window.location.href = "/games");
  };

  postBet = (options: { [key: string]: any }) => {
    axios
      .post(
        "/api/bet/create",
        {
          user: this.props.user._id,
          game: this.state.gameId,
          side: this.state.side,
          amount: this.state.amount,
          ...(this.props.party?._id && { party: this.props.party._id }),
          ...options,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-access-token": this.props.token,
          },
        }
      )
      .then(
        (response) => {
          this.props.updateBets(response.data.bet._id);
          const balance =
            this.props.user.currentAmount - parseFloat(this.state.amount);
          this.props.updateAmount(balance);

          this.setState({
            bet: response.data.bet,
            confirmation: response,
            favorite: response.data.game.favorite,
            underdog: response.data.game.underdog,
            sideLast: response.data.bet.side,
            amountLast: response.data.bet.amount,
          });

          const nxtStep =
            this.state.bet["isMatched"] || this.state.bet["isPartialMatched"]
              ? "MATCHED_BET"
              : "CONFIRMATION";
          this.setState({
            step: nxtStep,
            loading: false,
          });
        },
        (error) => {
          logger.log("error", error);
        }
      );
  };

  handleChange = (field: string) => (e: any) => {
    this.setState({ [field]: e.target.value } as ComponentState);
  };

  createExplanation = (option) => {
    if (option === "favorite") {
      return `I think the ${getLastWord(
        this.props.gameData[option]
      )} will win by more than ${parseInt(this.props.gameData.line)} points`;
    }
    if (option === "underdog") {
      return `I think the ${getLastWord(
        this.props.gameData[option]
      )} will win or they will lose by less than ${parseInt(
        this.props.gameData.line
      )} points`;
    }
    return "Make a selection!";
  };

  bettingOptions =
    this.state.gameData.favoriteHomeOrAway === "home"
      ? ["underdog", "favorite"]
      : ["favorite", "underdog"];

  render() {
    const { step } = this.state;
    const { matchup, gameId, side, betAgainst, amount, budget } = this.state;
    const values = {
      matchup,
      gameId,
      side,
      betAgainst,
      amount,
      budget,
    };

    switch (step) {
      // choose bet
      case "INTRO":
        return (
          <div>
            <div className="modal">
              <section className="modal-main">
                <div className="SelectTeam">
                  <div className="SelectTeam__Menu">
                    <div
                      className="SelectTeam__Back"
                      onClick={this.props.toggle}
                    >
                      <img
                        className="SelectTeam__Back-button"
                        src={BackButton}
                        alt="Logo"
                      />
                    </div>
                    <div className="SelectTeam__Title">Pick Team</div>
                  </div>

                  <div className="SelectTeam__Teams">
                    {this.bettingOptions.map((option, index) => (
                      <div
                        className="SelectTeam__Team"
                        key={index}
                        role="button"
                        onClick={() => {
                          this.setState({ selectedOption: option });
                          this.setState({ side: this.props.gameData[option] });
                        }}
                        style={{
                          border:
                            this.state.selectedOption === option
                              ? "1px solid #219653"
                              : null,
                          borderRadius:
                            this.state.selectedOption === option ? "5px" : null,
                        }}
                      >
                        <img
                          className="SelectTeam__Team-logo-image"
                          src={getLogoName(
                            this.props.gameData[option],
                            this.props.gameData.sportID
                          )}
                          alt="Logo"
                        />
                        <div className="SelectTeam__Team-title">
                          {getLastWord(this.props.gameData[option])}
                        </div>
                        <div className="SelectTeam__Team-subtitle">
                          {getFirstWord(this.props.gameData[option])}
                        </div>

                        <div className="SelectTeam__box-container">
                          <h4 className="SelectTeam__line-box">
                            {option === "favorite" ? "-" : "+"}
                            {this.props.gameData.line.toFixed(1)}
                          </h4>
                        </div>

                        <div>
                          <img
                            className="SelectTeam__Team-checkmark"
                            src={
                              this.state.selectedOption === option
                                ? SelectedCheck
                                : EmptyCheck
                            }
                            alt="check icon"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="SelectTeam__Explanation">
                    {this.createExplanation(this.state.selectedOption)}
                  </div>

                  <button
                    className="SelectTeam__Next"
                    onClick={() => {
                      this.nextStep("BET_AMOUNT");
                    }}
                  >
                    Next
                  </button>
                </div>
              </section>
            </div>
          </div>
        );

      // Choose Amount
      case "BET_AMOUNT":
        return this.state.loading ? (
          <div className="modal">
            <section className="modal-main">
              <LoadingAnimation />
            </section>
          </div>
        ) : (
          <div>
            <div className="modal">
              <section className="modal-main">
                <div className="SelectTeam">
                  <div className="SelectTeam__Menu">
                    <div
                      className="SelectTeam__Back"
                      onClick={() => {
                        this.previousStep("INTRO");
                      }}
                    >
                      <img
                        className="SelectTeam__Back-button"
                        src={BackButton}
                        alt="Logo"
                      />
                    </div>
                    <div className="SelectTeam__Title">Choose Amount</div>
                  </div>

                  <div className="SelectTeam__Explanation">
                    <BetCalculator
                      onAmountChange={this.handleAmountChange.bind(this)}
                      amount={Number(this.state.amount)}
                      budget={values.budget}
                    />
                  </div>

                  <button
                    className="SelectTeam__Next"
                    onClick={() => this.stepTwo(values.amount)}
                  >
                    PLACE WAGER
                  </button>
                </div>
              </section>
            </div>
          </div>
        );

      // When we want to show an advertisement
      // case 3:
      //   return (
      //     <div>
      //       <div className="modal">
      //         <section className="modal-main">
      //           <div className="SelectTeam">
      //             {/* <div className="SelectTeam__Explanation">
      //               AD PAGE
      //             </div> */}
      //             <button className="SelectTeam__Close" onClick={this.nextStep}>
      //               <div>
      //                 <img
      //                   src={XClose}
      //                   className="SelectTeam__Close-x"
      //                   alt=""
      //                 />
      //                 close
      //               </div>
      //             </button>
      //           </div>
      //         </section>
      //       </div>
      //     </div>
      //   );

      case "CONFIRMATION":
        return (
          <div className="ticketContainer">
            <div className="modal modal-cele">
              <section className="modal-main">
                <button
                  className="SelectTeam__Close"
                  onClick={this.resetBetModal}
                >
                  <div>
                    <img
                      src={Close}
                      className="SelectTeam__Close-x"
                      alt="close icon"
                    />
                  </div>
                </button>
                <div className="headerCongrats">
                  <p>
                    <img
                      src={ticketLogo}
                      alt="Wager Logo"
                      className="ticketLogo"
                    />
                  </p>
                  <p>
                    <Link
                      to="#"
                      onClick={() => this.setState({ shareModal: true })}
                    >
                      <img src={shareIcon} alt="share" className="shareImg" />
                    </Link>
                  </p>
                </div>
                <h4 className="teamName teamSpacing">
                  {`${this.state.gameData.favoriteAbrv} ${getLastWord(
                    this.state.gameData.favorite
                  )} @ ${this.state.gameData.underdogAbrv} ${getLastWord(
                    this.state.gameData.underdog
                  )}`}
                </h4>
                <h4 className="teamSpacing">
                  {moment(this.state.gameData.eventDateUTC).format(
                    "MMMM Do, YYYY, h:mm a"
                  )}
                </h4>
                <div className="imageLine">
                  <div className="userImageTkt">
                    <img
                      src={
                        this.props.user.picture
                          ? this.props.user.picture
                          : DefaultUserImage
                      }
                      alt="user profile picture"
                    />
                    <h2>{nameOrUsername(this.props.user)}</h2>
                  </div>
                  <div className="line">
                    <h1>
                      {this.state.selectedOption === "favorite" ? "-" : "+"}
                      {this.props.gameData.line.toFixed(1)}
                    </h1>
                    <div>
                      {this.state.selectedOption === "favorite"
                        ? this.props.gameData.favorite
                        : this.props.gameData.underdog}
                    </div>
                  </div>
                </div>
                <div className="amountSection">
                  <div>
                    <h1>${this.state.amountLast}</h1>
                    <h2>Wager</h2>
                  </div>
                  <div>
                    <h1>${this.state.amountLast * 2}</h1>
                    <h2>To Win</h2>
                  </div>
                </div>
                <div className="celebration">
                  <img src={confettiLeft} alt="confetti" className="celeImg" />
                  <p>
                    {nameOrUsername(this.props.user)} saved $
                    {this.state.amountLast / 10} on this bet
                  </p>
                  <img src={confettiRight} alt="confetti" className="celeImg" />
                </div>
                <p className="celeFooter">
                  This bet was made on the people’s sportsbook on
                  www.wager.games
                </p>
              </section>
            </div>
            {this.state.shareModal && (
              <div className="modalPopup">
                <div className="modal-content">
                  <Link
                    to="#"
                    onClick={() => this.setState({ shareModal: false })}
                    className="closeModal"
                  >
                    <img src={closeIcon} alt="close" />
                  </Link>
                  <div className="shareSection">
                    <p>Use the link below to share</p>
                    <SocialReferral
                      referralLink={`https://www.wager.games/ticket/${this.state.bet["_id"]}`}
                      referralText={`Check out my bet on wager.games: `}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "MATCHED_BET":
        return (
          <div className="modal">
            <section className="modal-main">
              {/* <MatchDetail
                bet={this.state.bet}
                gameId={this.state.gameId}
                side={this.state.side}
                favorite={this.state.favorite}
                underdog={this.state.underdog}
                backButton={this.props.toggle}
              /> */}
            </section>
          </div>
        );
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  updateBets: (_id) => {
    dispatch({
      type: UserActionTypes.UPDATE_BETS,
      payload: { id: _id },
    });
  },
  updateAmount: (amount) => {
    dispatch({
      type: UserActionTypes.UPDATE_BALANCE,
      payload: { amount },
    });
  },
});

const mapStateToProps = (state) => ({
  user: state.user.user,
  token: state.user.token,
  party: state.party.party,
});

export default connect(mapStateToProps, mapDispatchToProps)(BetModal);
