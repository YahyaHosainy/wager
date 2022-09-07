import mongoose from "mongoose";
import Bet from "../models/bet.js";
import User from "../models/user.js";
import Game from "../models/games.js";
import Party from "../models/party.js";
import * as queueCtlr from "./queueController.js";
import { RETURN_STATUS, STATUS_MAP } from "../consts.js";
import { logger } from "../config/winston.js";

export const makeABet = async (req, res) => {
  const { game, side, amount, party } = req.body;
  const user = req.userId;

  const foundUser = await User.findById(user);
  const foundGame = await Game.findById(game);
  const foundParty = await Party.findById(party).select("game").lean();

  // create bet
  let createdBet;
  try {
    createdBet = await Bet.create({
      user,
      game,
      side,
      amount,
      line: foundGame.line,
      lastDeltaAmount: amount,
      ...(party && game === foundParty.game.toString() && { party }),
    });
  } catch (err) {
    return res.status(400).json(err.message);
  }

  if (party && game == foundParty.game.toString()) {
    await Party.findByIdAndUpdate(party, { $push: { bets: createdBet._id } });
  }

  foundUser.currentAmount -= parseFloat(amount);
  foundUser.markModified("currentAmount");
  foundUser.save();

  // queue the bet based on side not in parties
  const isFavorite = foundGame.favorite === side;

  if (!createdBet?.party) {
    isFavorite ? foundGame.favoriteBetCount++ : foundGame.underdogBetCount++;
  }

  const [updatedFoundGame, updatedBet] = await queueCtlr.queueBet({
    bet: createdBet,
    foundGame,
    pickedSide: isFavorite ? "favorite" : "underdog",
    oppositeSide: isFavorite ? "underdog" : "favorite",
  });

  return res.status(201).json({ game: updatedFoundGame, bet: updatedBet });
};

const updateQueueAndRemoveBet = async ({ fav_under, bet_id, gameId }) => {
  // update queue and remove canceled bet
  const [betCount, betArray] =
    fav_under === "favorite"
      ? ["favoriteBetCount", "favoriteArray"]
      : ["underdogBetCount", "underdogArray"];

  await Game.findByIdAndUpdate(
    gameId,
    {
      $pull: { [betArray]: { _id: mongoose.Types.ObjectId(bet_id) } },
    },
    { returnOriginal: false },
    (err, foundGame) => {
      if (err) return err;
      // TODO: fix the doubling of money using findbyidandupdate bc inc doesn't work
      if (foundGame[betCount] > 0) {
        foundGame[betCount] -= 1;
        foundGame.markModified(betCount);
      } else {
        foundGame[betCount] = 0;
        foundGame.markModified(betCount);
      }

      foundGame.save();
    }
  );
};

export const cancelABet = async (req, res) => {
  try {
    const { bet_id, fav_under } = req.body;
    const user_id = req.userId;

    // Change status to canceled
    const betToCancel = await Bet.findByIdAndUpdate(
      bet_id,
      {
        status: STATUS_MAP.CANCEL,
      },
      { returnOriginal: false }
    );

    const { game, amount } = await betToCancel;

    // Return money back to user
    // TODO: fix the doubling of money using findbyidandupdate
    await User.findById(user_id, (err, resp) => {
      if (err)
        return res.status(422).json({
          status: RETURN_STATUS.FAIL,
          message: "Unknown error",
        });

      resp.currentAmount += amount;
      resp.markModified("currentAmount");
      resp.save();
    });

    // remove bet from queue
    await updateQueueAndRemoveBet({
      fav_under,
      bet_id,
      gameId: game,
    });

    return res.status(200).json({
      message: "Your bet was successfully canceled",
      amount,
    });
  } catch (err) {
    return res.status(422).json(err);
  }
};

export const setIsMatched = (req, res) => {
  const { betID } = req.body;
  Bet.findByIdAndUpdate(
    betID,
    {
      isMatched: true,
    },
    { returnOriginal: false },
    (err, result) => {
      if (err) {
        return res.status(422).send({
          errors: err.errors,
        });
      }

      return res.json(result);
    }
  );
};

export const setHasWon = (req, res) => {
  const { betID } = req.body;
  Bet.findByIdAndUpdate(
    betID,
    {
      status: STATUS_MAP.WON,
    },
    { returnOriginal: false },
    (err, result) => {
      if (err) {
        return res.status(422).send({
          errors: err.errors,
        });
      }

      return res.json(result);
    }
  );
};

export const getTicket = (req, res) => {
  Bet.findById(req.params.id)
    .populate("game", "eventDateUtc favoriteAbrv favorite underdogAbrv underdog")
    .populate("user", "displayName picture")
    .select("amount line side")
    .exec((err, result) => {
      if (err) {
        return res.status(500).json({
          status: RETURN_STATUS.FAIL,
          message: "Unknown error",
        });
      }
      res.status(200).json(result);
    });
};

export const create = async (req, game) => {
  let bet;
  try {
    bet = await Bet.create({
      user: req.body.userID,
      game: game._id,
      line: game.line,
      amount: req.body.amount,
      side: game[req.body.pick],
      lastDeltaAmount: req.body.amount,
    });

    await User.findByIdAndUpdate(req.body.userID, {
      $inc: {
        currentAmount: -parseInt(req.body.amount),
      },
    }).exec();
  } catch (error) {
    logger.log("error", error);
  }
  return bet;
};
