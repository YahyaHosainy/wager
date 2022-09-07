import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { AuthUser } from "../user/types";
import { getParty, clearParty } from "./actions";
import { Party, PartyBet } from "./types";
import { Story } from "../story/types";
import { getTime } from "../helpers/dashboardHelpers";
import { getTeams } from "../helpers/strings";
import Layout from "../layout/Layout";
import Comment from "../game/Comment";
import BetList from "./BetList";
import Stories from "../story/Stories";
import Team from "./Team";
import BetModal from "../layout/BetModal";
import { logger } from "../helpers/winston";
import {
  getStory,
  toggleStory,
  configureStory,
  resetStory,
} from "../story/actions";
import { nameOrUsername } from "../helpers/user";
import LoadingAnimation from "../layout/animations/LoadingAnimation";
import DefaultUser from "../layout/assets/user.svg";
import partyTick from "../layout/assets/partyTick.png";
import "./Party.scss";
import { RequestStatus } from "../_redux/types";

interface PartyRouteProps {
  id: string;
}

interface PartyProps extends RouteComponentProps<PartyRouteProps> {
  user: AuthUser;
  token: string;
  party: Party;
  stories: Story[];
  storiesOpen: boolean;
  partyStatus: RequestStatus;
  getParty: typeof getParty;
  getStory: typeof getStory;
  clearParty: typeof clearParty;
  toggleStory: typeof toggleStory;
  configureStory: typeof configureStory;
  resetStory: typeof resetStory;
}

const PartyComponent: React.FunctionComponent<PartyProps> = ({ ...props }) => {
  const [isFollow, setIsFollow] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [side, setSide] = useState("");
  const [selected, setSelected] = useState("");
  const [host, setHost] = useState(null);

  useEffect(() => {
    props.getParty({ partyID: props.match.params.id, token: props.token });
    props.configureStory({ partyId: props.match.params.id });
    () => {
      props.clearParty();
      props.resetStory();
    };
  }, []);

  useEffect(() => {
    if (props.party) {
      setFollowersCount(props.party.host.followers.length);

      const userFollowers = props.party.host.followers.some((followers) => {
        return followers._id === props.user._id;
      });

      setIsFollow(userFollowers);
      getProfile({ host: props.party.host });
    }
  }, [props.party?._id]);

  if (!props.party || !props.party.host) return <LoadingAnimation />;
  const pick = props.party.game[props.party.pick];

  const followers = props.party.bets.filter(
    (bet: PartyBet) => bet.side === pick
  );
  const faders = props.party.bets.filter((bet: PartyBet) => bet.side != pick);

  const getProfile = async ({ host }) => {
    let response;
    try {
      response = await axios.get(`/api/profilefilter/${host._id}`, {
        headers: { "x-access-token": `${props.token}` },
      });
    } catch (error) {
      logger.log("error", error);
    }
    if (response) {
      setHost(response.data);
    }
  };

  const getBetAmount = (bets: PartyBet[], side: "followers" | "faders") => {
    let amount = 0;

    bets.forEach((bet) => {
      amount += bet.amount;
    });
    if (side === "followers") {
      amount += props.party.hostBet.amount;
    }

    return amount;
  };

  const getMatchedUser = () => {
    const matchedArray = props.party.hostBet.matchedUser || [];

    return (
      <div className="Party__matched">
        <div>
          <p>Matches</p>
          <h2>{matchedArray.length}</h2>
        </div>
        <div>
          <div className="Party__matchImg">
            {matchedArray?.slice(0, 3).map((user, idx) => (
              <Link to={`/bettor-profile/${user._id}`} key={idx}>
                <img src={user.picture || DefaultUser} alt="User" />
              </Link>
            ))}
            {matchedArray?.length > 3 && <p>{matchedArray.length - 3}+</p>}
          </div>
        </div>
      </div>
    );
  };

  const betsFilled = () => {
    const { partialAmount, amount, matchedUser } = props.party.hostBet;

    if (partialAmount === 0 && matchedUser.length > 0) return 100;
    else return (partialAmount / amount) * 100;
  };

  const followUnfollow = (user) => {
    const type = isFollow ? "unfollow" : "follow";

    axios
      .post(
        `/api/profile/${props.user._id}/${type}/${user._id}`,
        {},
        {
          headers: {
            "x-access-token": `${props.token}`,
          },
        }
      )
      .then((res) => {
        if (res.data.following) {
          setIsFollow(true);
          setFollowersCount(followersCount + 1);
        }

        if (res.data.unfollowing) {
          setIsFollow(false);
          setFollowersCount(followersCount - 1);
        }
      });
  };

  const toggleModal = (type = "") => {
    if (type === "with") {
      setSide(props.party.game[props.party.pick]);
      setSelected(props.party.pick);
    } else {
      setSide(
        props.party.pick === "favorite"
          ? props.party.game.underdog
          : props.party.game.favorite
      );
      setSelected(props.party.pick === "favorite" ? "underdog" : "favorite");
    }

    const diff = moment
      .utc(props.party.game.eventDateUTC)
      .diff(moment.utc(Date.now()), "minutes");

    if (diff >= 0 && diff <= 2880) setShowModal(!showModal);
    else if (diff < 0) alert("You cannot bet now. Time passed.");
    else alert("You can only bet 48 hours before game starts");
  };

  const onBetComplete = () => {
    toggleModal();
    props.getParty({ partyID: props.match.params.id, token: props.token });
  };

  const showPicked = ({ away = false, home = false }) => {
    let team;
    if (away) {
      team =
        props.party.game.underdogHomeOrAway === "away"
          ? "underdog"
          : "favorite";
    }

    if (home) {
      team =
        props.party.game.favoriteHomeOrAway === "home"
          ? "favorite"
          : "underdog";
    }

    return props.party.pick === team ? "picked" : "";
  };

  const showTotal = (side) => {
    const picked = showPicked({ [side]: true });

    return picked
      ? getBetAmount(followers, "followers")
      : getBetAmount(faders, "faders");
  };

  const setOrder = () => {
    let result = [];
    const followerSide = {
      text: "with",
      side: followers,
      key: "followers",
    };
    const faderSide = {
      text: "against",
      side: faders,
      key: "faders",
    };

    if (props.party.game[`${props.party.pick}HomeOrAway`] === "home") {
      result = [faderSide, followerSide];
    } else {
      result = [followerSide, faderSide];
    }

    return result;
  };

  const setButtons = () => {
    const result = setOrder();

    return result.map((total) => (
      <button
        key={total.key}
        className="Party__cta"
        onClick={() => {
          toggleModal(total.text);
        }}
      >
        BET {total.text}
        <br />
        {nameOrUsername(props.party.host)}
      </button>
    ));
  };

  const sideBreakdown = () => {
    const result = setOrder();

    return result.map((total) => (
      <div className="people_section" key={total.key}>
        <p className="people_grey">
          People that bet {total.text} {nameOrUsername(props.party.host)}
        </p>
        <div className="Party__pick">
          <div className="people_all">
            {total.side?.length > 0 &&
              total.side
                .slice(0, 3)
                .map((bet: PartyBet) => <BetList key={bet._id} bet={bet} />)}
            {total.side?.length >= 4 && (
              <div className="people_last">{total.side.length - 3}+</div>
            )}
          </div>
        </div>
      </div>
    ));
  };

  if (!props.party || props.partyStatus !== RequestStatus.LOADED) {
    return null;
  }
  const editParty = (partyId) => {
    window.location.href = `/edit-party/${partyId}`;
  };

  return (
    <Layout>
      <Stories />
      <div className="Party">
        <div className="Party__content">
          <div className="Party__profile">
            <div
              className="Party__imgcont"
              onClick={() => {
                props.toggleStory({ override: true });
              }}
            >
              <img
                src={props.party.host.picture || DefaultUser}
                className="Party__userimg"
                alt={nameOrUsername(props.party.host)}
              />
            </div>
            <div className="Party__host-header">
              <div>
                <h2>{nameOrUsername(props.party.host)}</h2>
                <img src={partyTick} alt="Tick" />
              </div>
              <div className="Party__host-info">
                <div className="Party__host-bio">{props.party.host.bio}</div>
                <Link
                  to="#"
                  onClick={() =>
                    props.party.host._id === props.user._id
                      ? editParty(props.party._id)
                      : followUnfollow(props.party.host)
                  }
                  className="Party__followBtn"
                >
                  {props.party.host._id === props.user._id
                    ? "Edit"
                    : isFollow
                    ? "Following"
                    : "Follow"}
                </Link>
              </div>
            </div>
          </div>
          <div className="Party__statistics">
            <div className="Stat">
              <div className="Party__stat">
                <div>
                  <span className="Party__hostname">
                    {`${nameOrUsername(props.party.host)} `}
                  </span>
                  {` bet `}
                  <span className="Party__wager-amount">
                    {`$${props.party.hostBet?.amount || 0} `}
                  </span>
                  {`on the `}
                  <span>{props.party.game[props.party.pick]}</span>
                </div>
              </div>
            </div>
            <div className="Stat">
              <div className="Party__gauge">
                <div className="Party__background">
                  <div
                    className="Party__percentage"
                    style={{
                      transform: `rotate(${(betsFilled() * 3.6) / 2}deg)`,
                    }}
                  ></div>
                  <div className="Party__mask"></div>
                  <span className="Party__value">
                    {Math.round(betsFilled())}%
                  </span>
                  <p>bet filled</p>
                </div>
              </div>
              {getMatchedUser()}
            </div>
          </div>
          <div className="Party__bet-section">
            <div className="Party__games">
              {/* away team */}
              <div className="Party__side">
                <Team
                  party={props.party}
                  side={
                    props.party.game.underdogHomeOrAway === "away"
                      ? "underdog"
                      : "favorite"
                  }
                  className={showPicked({ away: true })}
                />
                <div className="Party__totalbets">
                  <p>Total bets</p>
                  <h3>${showTotal("away")}</h3>
                </div>
              </div>
              <div className="game__section2">
                <p>THE LINE</p>
                <div>
                  <p>{getTeams(props.party.game["favorite"])}</p>
                  <h1>-{props.party.game.line}</h1>
                </div>
                <p>{getTime(props.party.game.eventDateUTC)}</p>
              </div>
              {/* home team */}
              <div className="Party__side">
                <Team
                  party={props.party}
                  side={
                    props.party.game.favoriteHomeOrAway === "home"
                      ? "favorite"
                      : "underdog"
                  }
                  className={showPicked({ home: true })}
                />
                <div className="Party__totalbets">
                  <p>Total bets</p>
                  <h3>${showTotal("home")}</h3>
                </div>
              </div>
            </div>
            <div className="Party__people">{sideBreakdown()}</div>
          </div>
          <div className="Party__last">
            <div className="Party__button">{setButtons()}</div>
          </div>
          <p className="people_grey Party__disclaimer">{`Note: Your bet won't be placed until you choose amount.`}</p>
        </div>
        <div className="Party__comment">
          <Comment gameID="" partyID={props.match.params.id} />
        </div>
      </div>
      {showModal && (
        <BetModal
          gameData={props.party.game}
          side={side}
          selected={selected}
          toggle={onBetComplete}
        />
      )}
    </Layout>
  );
};

const mapDispatchToProps = {
  getParty,
  getStory,
  toggleStory,
  configureStory,
  resetStory,
};

const mapStateToProps = (state) => {
  return {
    user: state.user.user,
    token: state.user.token,
    party: state.party.party,
    partyStatus: state.party.partyStatus,
    storiesOpen: state.story.modalOpen,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PartyComponent);
