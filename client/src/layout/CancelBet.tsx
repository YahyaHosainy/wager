import axios from "axios";
import { connect } from "react-redux";
import React, { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import DashboardContext from "../context/DashboardContext";
import { logger } from "../helpers/winston";

interface Game {
  favorite: string;
}

type Props = {
  bet: {
    _id: string;
    side: string;
    game: { [key: string]: Game };
  };
  user: {
    // todo make user a context so you don't have to pass as prop
    _id: string;
    currentAmount: number;
  };
  updateAmount: (value: any) => void; //todo remove this as a prop
  token: string;
};

const CancelBet = ({ bet, user, updateAmount, token }: Props) => {
  const { cancelId, setCancelId, cancelConfirm, setCancelConfirm } = useContext(
    DashboardContext
  );

  useEffect(() => {
    if (cancelId !== null && cancelConfirm) {
      const teamSidePicked = (bet) => {
        return bet.side === bet.game.favorite ? "favorite" : "underdog";
      };
      axios
        .post(
          "/api/bet/cancel",
          {
            bet_id: bet._id,
            user_id: user._id,
            fav_under: teamSidePicked(bet),
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-access-token": token,
            },
          }
        )
        .then(
          (response) => {
            if (response.status !== 422) {
              const balance =
                user.currentAmount + parseFloat(response.data.amount);
              updateAmount(balance);

              toast.success(`Your bet was successfully canceled`, {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                progress: undefined,
              });
              setCancelConfirm(false);
              setCancelId(null);
            } else logger.log("info", response);
          },
          (error) => {
            logger.log("error", error);
          }
        );
    }
  }, [cancelId, cancelConfirm]);

  return (
    <div className="cancelState">
      <p className="cancelBet" onClick={() => setCancelId(bet._id)}>
        Cancel bet
      </p>
      {cancelId === bet._id && (
        <div className="cancelConfirm">
          Are you sure?
          <button
            type="button"
            className="yesConfirm"
            onClick={() => setCancelConfirm(true)}
          >
            Yes
          </button>
          <button
            type="button"
            className="noConfirm"
            onClick={() => setCancelId(null)}
          >
            No
          </button>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  token: state.user.token,
});

export default connect(mapStateToProps, null)(CancelBet);
