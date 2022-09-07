import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { AuthUser } from "../user/types";
import publicImg from "../layout/assets/public.png";
import User from "../layout/assets/user.svg";
import { Link } from "react-router-dom";
import { nameOrUsername } from "../helpers/user";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import axios from "axios";
import { logger } from "../helpers/winston";
import classNames from "classnames";

type CommentProps = {
  user: AuthUser;
  token: string;
  gameID: string;
  partyID: string;
};

const Comment = ({ user, token, gameID, partyID }: CommentProps) => {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    getComment();
  }, []);

  const getComment = () => {
    const url = partyID
      ? `/api/comments/party/${partyID}`
      : `/api/comments/game/${gameID}`;

    axios
      .get(url, {
        headers: { "x-access-token": `${token}` },
      })
      .then(
        (response) => {
          setComments(response.data.comments);
        },
        (error) => {
          logger.log("error", error);
        }
      );
  };

  const renderComment = () => {
    return comments.map((chat, idx) => (
      <div key={idx} className="GameDetail__LiveComment-CommentContainer">
        <Link to={`/bettor-profile/${chat.user._id}`}>
          <img
            className="GameDetail__LiveComment-Avatar"
            src={chat.user.picture ? chat.user.picture : User}
            alt="game detail comment"
          />
          <div className="GameDetail__LiveComment-CommentWrapper">
            <p className="GameDetail__LiveComment-Comment">{chat.message}</p>
            <p className="GameDetail__LiveComment-UserName">
              {nameOrUsername(chat.user)}
            </p>
          </div>
        </Link>
      </div>
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const content = {
      comment: message,
      userID: user._id,
      gameID: gameID,
      partyID: partyID,
    };

    axios
      .post("/api/comments", content, {
        headers: { "x-access-token": `${token}` },
      })
      .then((response) => {
        setComments([response.data[0], ...comments]);
        setMessage("");
      })
      .catch((error) => {
        logger.log("error", error);
      });
  };

  const emojiClasses = classNames({
    GameDetail__LiveComment_emoji: true,
    "GameDetail__LiveComment-emojiactive": showEmoji,
    "GameDetail__LiveComment-emojinactive": !showEmoji,
  });

  return (
    <div className="GameDetail__LiveCommentContainer">
      <div className="GameDetail__CommentHead">
        <h1 className="GameDetail__LiveCommentHeader">Live Comments</h1>
        <p>
          <img src={publicImg} alt="Public" width="15" /> Public
        </p>
      </div>
      <div className="GameDetail__LiveCommentsContainer">
        {comments && renderComment()}
      </div>
      <div>
        <form className="GameDetail__LiveComment-Form">
          <label htmlFor="comment" />
          <img
            className="GameDetail__LiveComment-User_avatar"
            src={user.picture ? user.picture : User}
            alt=""
          />
          <input
            className="GameDetail__LiveComment-Input"
            name="comment"
            type="text"
            placeholder="Type your message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className={emojiClasses}>
            <Picker onSelect={(emoji) => setMessage(message + emoji.native)} />
          </div>
          <div
            className="emoji__picker"
            onClick={() => setShowEmoji(!showEmoji)}
          >
            {String.fromCodePoint(0x1f60a)}
          </div>
          <button
            type="submit"
            className="GameDetail__LiveComment-Submit"
            onClick={(e) => handleSubmit(e)}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="15" cy="15" r="15" fill="#FDD063" />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16.3137 7.41418L16.3136 7.41421L23.3847 14.4853L21.9705 15.8995L16 9.92896L16 23H14L14 9.72789L7.8284 15.8995L6.41418 14.4853L14.8995 5.99997L16.3137 7.41418Z"
                fill="black"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  user: state.user.user,
  token: state.user.token,
});

export default connect(mapStateToProps)(Comment);
