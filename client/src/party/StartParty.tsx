import React, { useEffect, useState } from "react";
import "./PartySection.scss";
import popcorn from "../layout/assets/popcorn.png";
import SelectGame from "../layout/assets/gameSelect.png";
import Camera from "../layout/assets/Camera.png";
import DownArrow from "../layout/assets/down.png";
import { Link } from "react-router-dom";
import Layout from "../layout/Layout";
import moment from "moment";
import Modal from "../layout/Modal";
import { getFilterDate, getTime } from "../helpers/dashboardHelpers";
import axios from "axios";
import uniqBy from "lodash/uniqBy";
import { Game } from "../game/types";
import DashboardCard from "../game/dashboardCard";
import DashboardDateDisplay from "../components/DashboardDateDisplay";
import NotAvailable from "../components/NotAvailable";
import { getLastWord, getLogoName, getTeams } from "../helpers/strings";
import SelectedCheck from "../layout/assets/green-check.png";
import EmptyCheck from "../layout/assets/empty-check.png";
import { UPLOAD_MAX_SIZE_IMAGE, UPLOAD_MAX_SIZE_VIDEO } from "../consts";
import { createToastNotification } from "../helpers/toast";
import { connect } from "react-redux";
import { AuthUser } from "../user/types";
import { logger } from "../helpers/winston";
import ButtonWithLoader from "../layout/buttons/ButtonWithLoader";
import BackButton from "../layout/buttons/BackButton";

interface StartPartyProps {
  user: AuthUser;
  token: string;
}

const StartParty = ({ user, token }: StartPartyProps) => {
  const [isModalOpen, toggleModal] = useState(false);
  const [games, setGames] = useState([]);
  const [isGameSelect, setGameSelect] = useState(false);
  const [selectGame, setSelectGame] = useState(null);
  const [bettingOptions, setBettingOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedSide, setSelectedSide] = useState("");
  const [image, setImage] = useState("");
  const [coverImage, setcoverImage] = useState("");
  const [caption, setCaption] = useState("");
  const [amount, setAmount] = useState("");
  const [captionErr, setCaptionErr] = useState("");
  const [amountErr, setAmountErr] = useState("");
  const [gameErr, setGameErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentGames();
  }, []);

  const getCurrentGames = () => {
    const today = getFilterDate();
    axios.get(`/api/gamesfilter/${today}`).then(
      (response) => {
        const { foundGames } = response.data;
        const uniqueGames = uniqBy(foundGames, "eventID");
        const filterGamesWithLines = uniqueGames.filter(
          (game) => game["line"] !== 0 && game["gameOverUpdated"] === false
        );

        setGames(filterGamesWithLines);
      },
      (error) => {
        logger.log("error", error);
      }
    );
  };

  const checkGameEmptyState = (curNextDate) => {
    let date = "";
    let count = 0;

    if (curNextDate === 1) date = getFilterDate();
    else date = moment(getFilterDate()).add(1, "days").format("YYYY-MM-DD");

    games.length &&
      games.forEach((game) => {
        if (date === game.eventDate) {
          count++;
        }
      });

    return count;
  };

  const loadCard = (dateType) => {
    return games.length ? (
      games.map((game: Game) => (
        <DashboardCard
          key={game._id}
          game={game}
          sportID={game.sportID}
          curNextDate={dateType}
          from="party"
          onSelectGame={selectedGame}
        />
      ))
    ) : (
      <div className="Dashboard__Game-container">No Games Available</div>
    );
  };

  const selectedGame = (game) => {
    setGameSelect(true);
    toggleModal(false);
    setSelectGame(game);
    setSelectedOption("");
    setBettingOptions(
      game.favoriteHomeOrAway === "home"
        ? ["underdog", "favorite"]
        : ["favorite", "underdog"]
    );
  };

  const selectImageVideo = (e, type) => {
    if (e.target.files.length > 0) {
      const fileSize = e.target.files[0].size;
      const extension = e.target.files[0].type;
      let message = "";

      const format =
        type === "image"
          ? ["image/jpeg", "image/jpg", "image/png"]
          : ["video/mp4", "video/quicktime"];

      if (!format.includes(extension)) {
        if (type === "image") {
          message = `The selected ${type} can be a jpeg, jpg, or png.`;
        } else {
          message = `The selected ${type} can be a mp4 or mov.`;
        }
      } else if (
        (type === "image" && fileSize > UPLOAD_MAX_SIZE_IMAGE) ||
        (type === "video" && fileSize > UPLOAD_MAX_SIZE_VIDEO)
      ) {
        message = `The selected ${type} needs to be less than 5mb. Resize or compress it.`;
      } else {
        setcoverImage(e.target.files[0]);
        setImage(URL.createObjectURL(e.target.files[0]));
      }

      if (message) {
        createToastNotification(message, "error");
      }
    }
  };

  const handleAmount = (amount) => {
    const reg = /^[0-9\b]+$/;

    setAmount(amount);
    setAmountErr("");

    if (!amount) {
      setAmountErr("Bet amount is required");
      return false;
    } else if (amount && !reg.test(amount)) {
      setAmountErr("Please enter a valid amount");
      return false;
    } else if (parseInt(amount) > user.currentAmount) {
      setAmountErr("Entered amount is more than what you have");
      return false;
    } else if (reg.test(amount)) {
      setAmountErr("");
      return true;
    }
  };

  const saveParty = () => {
    if (!selectedSide) {
      setGameErr("Please select a side");
      return false;
    } else setGameErr("");
    if (!caption) {
      setCaptionErr("Please set a caption");
      return false;
    } else setCaptionErr("");

    if (handleAmount(amount)) {
      setLoading(true);

      const form = new FormData();
      const header = {
        "content-type": "multipart/form-data",
        "x-access-token": `${token}`,
      };

      form.append("gameID", selectGame._id);
      form.append("pick", selectedOption);
      form.append("tagline", caption);
      form.append("userID", user._id);
      form.append("amount", amount);
      form.append("coverImage", coverImage);

      axios
        .post("/api/party/create", form, {
          headers: header,
        })
        .then((response) => {
          if (response.data._id) {
            createToastNotification("Party created", "success");
            window.location.href = `/party/${response.data._id}`;
          } else
            createToastNotification(
              "Somenthing went wrong. Try again.",
              "error"
            );
        })
        .catch((error) => {
          logger.log("error", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <Layout>
      <div className="Party__container">
        <BackButton to={"/games"} />
        <img src={popcorn} alt="Popcorn" />
        <h3>Start a Party With Friends</h3>
        <hr />
        <div className="Party__contents">
          <h5 className="party__date">
            {moment().tz(moment.tz.guess()).format("dddd, MMMM Do")}
          </h5>
          <div className="Party__addSection">
            {!isGameSelect ? (
              <div>
                <h5>Select a Game</h5>
                <p className="Party__addIcon justify-center">
                  <Link to="#" onClick={() => toggleModal(!isModalOpen)}>
                    <img src={SelectGame} alt="Select Game" />
                  </Link>
                </p>
              </div>
            ) : (
              <div>
                <p className="Party__changeGame">
                  <Link
                    to="#"
                    onClick={() => {
                      setGameSelect(false);
                      toggleModal(true);
                      setSelectedSide("");
                    }}
                  >
                    Change Game <img src={DownArrow} alt="Arrow Down" />
                  </Link>
                </p>
                <div className="Party__SelectTeam">
                  {bettingOptions.map((option, index) => (
                    <>
                      <div
                        className="Party__gameSingle"
                        onClick={() => {
                          setSelectedOption(option);
                          setSelectedSide(selectGame[option]);
                          setGameErr("");
                        }}
                      >
                        <img
                          src={getLogoName(
                            selectGame[option],
                            selectGame.sportID
                          )}
                          alt="Game Logo"
                        />
                        <p className="Party__gameName">
                          {getLastWord(selectGame[option])}
                        </p>
                        <p className="Party__homeOrAway">
                          ({getLastWord(selectGame[`${option}HomeOrAway`])})
                        </p>
                        <div>
                          <img
                            className="Party__Team-checkmark"
                            src={
                              selectedOption === option
                                ? SelectedCheck
                                : EmptyCheck
                            }
                            alt="check icon"
                          />
                        </div>
                      </div>
                      {index === 0 && (
                        <div className="Party__gameLineSec">
                          <p>THE LINE</p>
                          <div className="Party__gameLine">
                            <p>{getTeams(selectGame["favorite"])}</p>
                            <h2>-{selectGame.line.toFixed(1)}</h2>
                          </div>
                          <p className="mt5">
                            {getTime(selectGame.eventDateUTC)}
                          </p>
                        </div>
                      )}
                    </>
                  ))}
                </div>
              </div>
            )}
          </div>
          {gameErr && <small>{gameErr}</small>}
          <div className="Party__form">
            <input
              type="text"
              name="caption"
              placeholder="Caption for this party"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            {captionErr && <small>{captionErr}</small>}
            <input
              type="text"
              name="amount"
              placeholder="Wager amount"
              value={amount}
              onChange={(e) => handleAmount(e.target.value)}
            />
            {amountErr && <small>{amountErr}</small>}
          </div>
          <h5 className="Party__uploadTitle">
            Upload Content <span>(Optional)</span>
          </h5>
          <div className="Party__uploadContent">
            <div>
              <label>
                <img
                  src={image ? image : Camera}
                  className={image ? "Party__imageSelected" : ""}
                  alt="Camera"
                />
                <input
                  type="file"
                  accept="image/*"
                  name="coverImage"
                  onChange={(e) => selectImageVideo(e, "image")}
                />
              </label>
              <p>Party cover image</p>
            </div>
          </div>
          <div className="Party__buttons">
            <ButtonWithLoader to="/" disableOverride={loading}>
              CANCEL
            </ButtonWithLoader>
            <ButtonWithLoader
              withAnimation={true}
              isLoading={loading}
              onClick={saveParty}
            >
              SAVE
            </ButtonWithLoader>
          </div>
        </div>
      </div>
      <div className="Party__modal">
        <Modal isOpen={isModalOpen} toggle={toggleModal}>
          <div className="Party__modalScroll">
            <h4>Select a Game</h4>
            <DashboardDateDisplay dateType="current" />
            {checkGameEmptyState(1) ? (
              <div className="Dashboard__Game-container">{loadCard(1)}</div>
            ) : (
              <NotAvailable text={"Games"} />
            )}
            <DashboardDateDisplay dateType="next" />
            {checkGameEmptyState(2) ? (
              <div className="Dashboard__Game-container">{loadCard(2)}</div>
            ) : (
              <NotAvailable text={"Games"} />
            )}
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

const mapStateToProps = (state) => ({
  user: state.user.user,
  token: state.user.token,
});

export default connect(mapStateToProps)(StartParty);
