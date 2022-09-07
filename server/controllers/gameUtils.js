import moment from "moment-timezone";
import mongoose from "mongoose";
import find from "lodash/find.js";
import Games from "../models/games.js";
import Bets from "../models/bet.js";
import User from "../models/user.js";
import { STATUS_MAP, SPORTS } from "../consts.js";
import { NCAA_TEAMS } from "../fixtures/ncaa_basketball_teams.js";
import { logger } from "../config/winston.js";
import { updateBetsGamePostponed } from "./gameController.js";

const NCAA_TEAM_IDS = NCAA_TEAMS.map((team) => team.team_id);

const validateTeamName = (team) => {
  const teamFound = find(NCAA_TEAMS, { team_id: team.team_id });
  if (teamFound) {
    return teamFound.fullName;
  }

  return `${team.name} ${team.mascot}`;
};

const mapRawDataToDB = (resp) => {
  const { line, favorite_normalized, underdog_normalized } = resp;

  return {
    ...resp,
    favorite: validateTeamName(favorite_normalized),
    favoriteAbrv: favorite_normalized.abbreviation,
    favoriteRecord: favorite_normalized.record,
    favoriteHomeOrAway: favorite_normalized.is_away ? "away" : "home",
    underdog: validateTeamName(underdog_normalized),
    underdogAbrv: underdog_normalized.abbreviation,
    underdogRecord: underdog_normalized.record,
    underdogHomeOrAway: underdog_normalized.is_away ? "away" : "home",
    line: Math.abs(line.toFixed(1)) || 0,
    favoriteArray: [],
    underdogArray: [],
  };
};

export const transformGameData = (game) => {
  const line =
    game.lines["1"]?.spread.point_spread_home || game.lines["2"]?.spread.point_spread_home;
  const gameData = {};
  // Default is team[0] is the favorite
  // Default is team[1] is the underdog

  if (line < 0) {
    gameData.favorite_normalized = game.teams_normalized[1];
    gameData.underdog_normalized = game.teams_normalized[0];
  } else {
    gameData.favorite_normalized = game.teams_normalized[0];
    gameData.underdog_normalized = game.teams_normalized[1];
  }

  const resp = {
    ...gameData,
    line,
    title: game.schedule.event_name,
    attendance: game.schedule.attendance,
    eventDateUTC: game.event_date,
    eventDate: moment(game.event_date).tz("America/Los_Angeles").format("YYYY-MM-DD"),
    eventID: game.event_id,
    sportID: game.sport_id,
  };

  return mapRawDataToDB(resp);
};

const validateGame = (gameResponse) => {
  if (gameResponse.sport_id === SPORTS.ncaa) {
    const teamId1 = gameResponse.teams_normalized[0].team_id;
    const teamId2 = gameResponse.teams_normalized[1].team_id;

    return NCAA_TEAM_IDS.includes(teamId1) && NCAA_TEAM_IDS.includes(teamId2);
  }
  return true;
};

export const createNewGame = async (gameResponse) => {
  try {
    if (gameResponse.score.event_status === "STATUS_CANCELED")
      return `Game Canceled ${gameResponse.schedule.event_name}`;

    if (gameResponse.score.event_status === "STATUS_POSTPONED") {
      const msg = await updateBetsGamePostponed({ data: gameResponse });

      return msg;
    }

    const isValidGame = validateGame(gameResponse);

    if (!isValidGame) return `Not a D1 game ${gameResponse.schedule.event_name}`;

    let messageResponse;
    const gameLine =
      gameResponse.lines["1"]?.spread.point_spread_home ||
      gameResponse.lines["2"]?.spread.point_spread_home;

    // if the line is 0, don't save it
    if (Math.round(gameLine) === 0) {
      return `Not Saved: Game ${gameResponse.schedule.event_name} has a line of 0`;
    }
    const numberOfGamesAdded = await Games.countDocuments({
      eventID: gameResponse.event_id,
    });

    if (numberOfGamesAdded == 0) {
      return new Promise((resolve) => {
        const data = transformGameData(gameResponse);
        const newGame = new Games(data);
        newGame.save().then((g) => {
          messageResponse = resolve(`${g.title} saved to game collection.`);
        });
      });
    } else if (numberOfGamesAdded > 0) {
      messageResponse = `You have ${numberOfGamesAdded} duplicates of this game ${gameResponse.schedule.event_name}`;
    }

    return messageResponse;
  } catch (err) {
    logger.log("error", err);
  }
};

export const returnMoneyBack = (gameId, status = STATUS_MAP.TIE) => {
  // change status to tie
  Bets.updateMany(
    {
      $and: [
        { game: mongoose.Types.ObjectId(gameId) },
        { $or: [{ isMatched: true }, { isPartialMatched: true }] },
      ],
    },
    { $set: { status } },
    (err, bets) => {
      if (err) logger.log("error", err);
      logger.log("info", "return money back");
      logger.log("info", bets);
    }
  );
  // update user with their money
  Bets.find(
    {
      $and: [
        { game: mongoose.Types.ObjectId(gameId) },
        { $or: [{ isMatched: true }, { isPartialMatched: true }] },
      ],
    },
    (err, bets) => {
      if (err) logger.log("error", err);

      let betAmount = 0;
      bets.forEach((bet) => {
        if (bet.isPartialMatched) betAmount = bet.partialAmount;
        else betAmount = bet.amount;

        User.findByIdAndUpdate(
          bet.user,
          {
            $inc: { currentAmount: betAmount },
          },
          { returnOriginal: false },
          (err) => {
            if (err) logger.log("error", err);
            logger.log("info", "Return Money Back");
          }
        );
      });
    }
  );
};

export const returnMoneyBackPartialUnfulfilled = (gameId, status = "") => {
  Bets.find(
    {
      $and: [
        { game: mongoose.Types.ObjectId(gameId) },
        { isPartialMatched: true },
        { isMatched: false },
        { status: STATUS_MAP.PENDING },
      ],
    },
    (err, bets) => {
      if (err) logger.log("error", err);

      let betAmount = 0;
      bets.forEach((bet) => {
        if (bet.isPartialMatched) betAmount = bet.amount - bet.partialAmount;
        logger.log("info", "Unfulfilled partial amount " + `${betAmount} dollars`);
        User.findByIdAndUpdate(
          bet.user,
          { $inc: { currentAmount: betAmount } },
          { returnOriginal: false },
          (err) => {
            logger.log("info", "Return Money Back partial unfulfilled to user");
            if (err) logger.log("error", err);
          }
        );
      });
    }
  );

  if (status) {
    Bets.updateMany(
      {
        $and: [
          { game: mongoose.Types.ObjectId(gameId) },
          { status: STATUS_MAP.PENDING },
          { isMatched: false },
          { isPartialMatched: true },
        ],
      },
      { $set: { status } },
      (err) => {
        if (err) logger.log("error", err);

        const msgLineChange =
          "Updating partial matched bets status that are canceled due to line change PENDING_PARTIAL_MATCHED_LINE_CHANGE";

        const msgCancel = "updating partial matched bets status to cancel";
        logger.log("info", status === STATUS_MAP.CANCEL ? msgCancel : msgLineChange);
      }
    );
  }
};

export const returnMoneyBackUnfulfilled = (gameId, status = STATUS_MAP.CANCEL) => {
  // update user with their money
  Bets.find(
    {
      $and: [
        { game: mongoose.Types.ObjectId(gameId) },
        { isMatched: false },
        { isPartialMatched: false },
        { status: STATUS_MAP.PENDING },
      ],
    },
    (err, bets) => {
      if (err) logger.log("error", err);
      logger.log("info", "Return Money Back its an umatched bet");
      bets.forEach((bet) => {
        logger.log("info", "Unfulfilled amount" + `${bet.amount} dollars`);
        User.findByIdAndUpdate(
          bet.user,
          {
            $inc: { currentAmount: bet.amount },
          },
          { returnOriginal: false },
          (err) => {
            if (err) logger.log("error", err);
          }
        );
      });
    }
  );
  // change status to canceled
  Bets.updateMany(
    {
      $and: [
        { game: mongoose.Types.ObjectId(gameId) },
        { status: STATUS_MAP.PENDING },
        { isMatched: false },
        { isPartialMatched: false },
      ],
    },
    { $set: { status } },
    (err, bets) => {
      if (err) logger.log("error", err);
      logger.log("info", "Updating unmatched bets to canceled");
      logger.log("info", bets);
    }
  );
};

export default {
  returnMoneyBackUnfulfilled,
  returnMoneyBackPartialUnfulfilled,
  returnMoneyBack,
  createNewGame,
};
