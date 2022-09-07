import mongoose from "mongoose";
import moment from "moment";
import { uniqBy } from "lodash-es";
import Bets from "../models/bet.js";
import Games from "../models/games.js";
import gamesDataLatestFetch from '../models/gamesDataLatestFetch.js'
import User from "../models/user.js";
import {
  createNewGame,
  returnMoneyBack,
  returnMoneyBackPartialUnfulfilled,
  returnMoneyBackUnfulfilled,
} from "./gameUtils.js";
import { RETURN_STATUS, STATUS_MAP } from "../consts.js";
import { logger } from "../config/winston.js";
import Bet from "../models/bet.js";
import NFLUpcoming from '../functions/NFLUpcoming.js'

function updateBetsWon(gameId, teamName) {
  Bets.find(
    {
      $and: [
        { game: mongoose.Types.ObjectId(gameId) },
        { side: teamName },
        { $or: [{ isMatched: true }, { isPartialMatched: true }] },
      ],
    },
    (err, bets) => {
      if (err) logger.log("error", err);

      let betAmount = 0;

      bets.forEach((bet) => {
        if (bet.isPartialMatched) betAmount = bet.partialAmount * 2;
        else betAmount = bet.amount * 2;

        User.findByIdAndUpdate(
          bet.user,
          { $inc: { currentAmount: betAmount, winnings: betAmount } },
          { returnOriginal: false },
          (err) => {
            if (err) logger.log("error", err);
          }
        );
      });
    }
  );

  Bets.updateMany(
    {
      $and: [
        { game: mongoose.Types.ObjectId(gameId) },
        { side: teamName },
        { $or: [{ isMatched: true }, { isPartialMatched: true }] },
      ],
    },
    { $set: { status: STATUS_MAP.WON } },
    (err, bets) => {
      if (err) logger.log("error", err);
      logger.log("info", "Updating bets won");
      logger.log("info", bets);
    }
  );
}

function updateBetsLoss(gameId, teamName) {
  Bets.updateMany(
    {
      $and: [
        { game: mongoose.Types.ObjectId(gameId) },
        { side: teamName },
        { $or: [{ isMatched: true }, { isPartialMatched: true }] },
      ],
    },
    { $set: { status: STATUS_MAP.LOSE } },
    (err, bets) => {
      if (err) logger.log("error", err);
      logger.log("info", "Updating bets lose");
      logger.log("info", bets);
    }
  );
}

export const extractGameData = async (events) => {
  const allmsgs = await Promise.all(
    events.map(async (event) => {
      const title = await createNewGame(event);

      return title;
    })
  );

  return allmsgs;
};

export const clearGameAndChangeLine = (req, res) => {
  Games.find(
    {
      eventDate: req.param.date,
    },
    (err, games) => {
      games.forEach((game) => {
        Games.findByIdAndUpdate(
          game._id,
          {
            favoriteArray: [],
            underdogArray: [],
          },
          { returnOriginal: false },
          (err, updatedGame) => {
            if (updatedGame.favoriteBetCount > updatedGame.underdogBetCount) {
              updatedGame.line -= 1;
            } else {
              updatedGame.line += 1;
            }
            updatedGame.favoriteBetCount = 0;
            updatedGame.underdogBetCount = 0;
            updatedGame.markModified("favoriteBetCount");
            updatedGame.markModified("underdogBetCount");
            updatedGame.markModified("line");
            updatedGame.save();
          }
        );
      });
      res.status(200).json(games);
    }
  );
};

export const moveTheGameLine = ({ line, gameId }) => {
  returnMoneyBackUnfulfilled(gameId, STATUS_MAP.CANCEL_MOVE_LINE);
  returnMoneyBackPartialUnfulfilled(gameId, STATUS_MAP.PENDING_PARTIAL_LINE_CHANGE);
  Games.findByIdAndUpdate(
    gameId,
    {
      favoriteArray: [],
      underdogArray: [],
      line,
    },
    { returnOriginal: false },
    (err, updatedGame) => {
      logger.log("info", "Updated Game after moving the line:");
      logger.log("info", updatedGame);
    }
  );
};

export const getGameBets = (req, res) => {
  Bets.aggregate(
    [
      {
        $match: {
          $and: [{ isMatched: true }, { game: mongoose.Types.ObjectId(req.params.id) }],
        },
      },
      { $group: { _id: "$isMatched", totalMatch: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ],
    (err, resp) => {
      let totalWinnings = 0;
      if (err) {
        res.status(500).json({
          status: RETURN_STATUS.FAIL,
          message: "Unknown error",
        });
      }
      if (resp.length > 0) {
        totalWinnings += resp[0].totalMatch;
      }

      Bets.aggregate(
        [
          {
            $match: {
              $and: [{ isPartialMatched: true }, { game: mongoose.Types.ObjectId(req.params.id) }],
            },
          },
          {
            $group: {
              _id: "isPartialMatched",
              totalPartialMatch: { $sum: "$partialAmount" },
            },
          },
          { $sort: { total: -1 } },
        ],
        (err, resp) => {
          if (err) {
            res.status(500).json({
              status: RETURN_STATUS.FAIL,
              message: "Unknown error",
            });
          }
          if (resp.length > 0) {
            totalWinnings += resp[0].totalPartialMatch;
          }
          res.status(200).json(totalWinnings);
        }
      );
    }
  );
};

export const getMatchBets = (req, res) => {
  Bet.findById(req.params.id)
    .populate("game")
    .populate("user", "name picture")
    .exec((err, bet) => {
      if (err) {
        return res.status(500).json({
          status: RETURN_STATUS.FAIL,
          message: "Unknown error",
        });
      }

      res.status(200).json(bet);
    });
};

export const findGames = (todayDate) => {
  const next_date = moment(todayDate).add(1, "days").format("YYYY-MM-DD");

  return new Promise((resolve) => {
    Games.aggregate(
      [
        { $match: { eventDate: { $in: [todayDate, next_date] } } },
        {
          $lookup: {
            from: "bets",
            localField: "_id",
            foreignField: "game",
            as: "bets",
          },
        },
        { $sort: { eventDateUTC: 1 } },
      ],
      (err) => {
        if (err) {
          logger.log("error", err);
        }
      }
    ).then((resp) => resolve(resp));
  });
};

function lengthFormat(number) {
  number = number + '';
  if (number.length < 2) {
    number = '0'+number;
  }
  return number;
}

async function getDataAndPutToDatabase(){
  var datas = await NFLUpcoming();

  var lastUpdated = await gamesDataLatestFetch.findById('612e3310cc0003199c917059')

  if (
    !lastUpdated ||
    lastUpdated === null
  ) {
    let date = new Date()
    date.setFullYear('1916')
    lastUpdated = new gamesDataLatestFetch({
      _id: "612e3310cc0003199c917059",
      dataLatestFetchTime: date,
    })
    await lastUpdated.save()
  }

  lastUpdated = new Date(lastUpdated.dataLatestFetchTime)

  // var lastUpdatedMiliseconds = (24 - lastUpdated.getHours()) * 60 * 60 * 1000

  var thisTimeUpdated = false;

  datas.every(async match => {
    let matchDate = new Date(match.Date);

    lastUpdated.setDate(lastUpdated.getDate()+10)

    if (
      matchDate.getTime() > lastUpdated.getTime()
    ) {
      thisTimeUpdated = true
      matchDate = matchDate.getFullYear()+'-'+lengthFormat(matchDate.getMonth()+1)+'-'+lengthFormat(matchDate.getDate())
      let newGane = new Games({
        eventID: match.GameKey,
        favorite: match.AwayTeam.Name,
        favoriteImage: match.AwayTeam.WikipediaLogoUrl,
        favoriteAbrv:"",
        favoriteRecord:"",
        favoriteHomeOrAway:"away",
        underdog: match.HomeTeam.Name,
        underdogImage: match.HomeTeam.WikipediaLogoUrl,
        underdogAbrv:"",
        underdogRecord:"",
        underdogHomeOrAway:"home",
        line: match.PointSpread,
        title: match.AwayTeam.Name + ' vs ' + match.HomeTeam.Name,
        attendance:"",
        eventDateUTC: match.Date,
        eventDate: matchDate,
        sportID:2,
        favoriteBetCount:0,
        underdogBetCount:0,
        favoriteArray:[],
        underdogArray:[],
        gameOverUpdated:false
      })
      await newGane.save()
    }
  });
  if (thisTimeUpdated) {
    await gamesDataLatestFetch.updateOne({ _id: `612e3310cc0003199c917059` },{ dataLatestFetchTime: (new Date) });
  }
  
}

export const listGamesFilter = async (req, res) => {
  await getDataAndPutToDatabase();
  try {
    const foundGames = await findGames(req.params.date);
    const uniqueGamesFound = uniqBy(foundGames, "sportID");
    const uniqueSportsId = uniqueGamesFound.map((games) => games.sportID);

    return res.status(200).json({ foundGames, uniqueSportsId });
  } catch (err) {
    return res.status(500).json({
      status: RETURN_STATUS.FAIL,
      message: "Unknown error",
    });
  }
};

export const listGamesFilter10 = async (req, res) => {
  await getDataAndPutToDatabase();
  try {
    const foundGames = await until10Games(req.params.date);
    const uniqueGamesFound = uniqBy(foundGames, "sportID");
    const uniqueSportsId = uniqueGamesFound.map((games) => games.sportID);

    return res.status(200).json({ foundGames, uniqueSportsId });
  } catch (err) {
    return res.status(500).json({
      status: RETURN_STATUS.FAIL,
      message: "Unknown error",
    });
  }
};

export const until10Games = (todayDate) => {
  const date_2 = moment(todayDate).add(1, "days").format("YYYY-MM-DD");
  const date_3 = moment(todayDate).add(2, "days").format("YYYY-MM-DD");
  const date_4 = moment(todayDate).add(3, "days").format("YYYY-MM-DD");
  const date_5 = moment(todayDate).add(4, "days").format("YYYY-MM-DD");
  const date_6 = moment(todayDate).add(5, "days").format("YYYY-MM-DD");
  const date_7 = moment(todayDate).add(6, "days").format("YYYY-MM-DD");
  const date_8 = moment(todayDate).add(7, "days").format("YYYY-MM-DD");
  const date_9 = moment(todayDate).add(8, "days").format("YYYY-MM-DD");
  const date_10 = moment(todayDate).add(9, "days").format("YYYY-MM-DD");

  return new Promise((resolve) => {
    Games.aggregate(
      [
        { $match: { eventDate: { $in: [
          todayDate,
          date_2,
          date_3,
          date_4,
          date_5,
          date_6,
          date_7,
          date_8,
          date_9,
          date_10,
        ] } } },
        {
          $lookup: {
            from: "bets",
            localField: "_id",
            foreignField: "game",
            as: "bets",
          },
        },
        { $sort: { eventDateUTC: 1 } },
      ],
      (err) => {
        if (err) {
          logger.log("error", err);
        }
      }
    ).then((resp) => resolve(resp));
  });
};

export const getGame = async (req, res) => {
  const game = await Games.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
    {
      $lookup: {
        from: "bets",
        let: { gameId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$game", "$$gameId"] } } },
          {
            $project: {
              _id: 0,
              isMatched: 1,
              isPartialMatched: 1,
              amount: 1,
              partialAmount: 1,
              status: 1,
              side: 1,
              line: 1,
              user: 1,
              party: 1,
              createdAt: 1,
            },
          },
          { $sort: { createdAt: -1 } },
          {
            $lookup: {
              from: "users",
              let: { bettor: "$user" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$bettor"] } } },
                { $project: { _id: 1, name: 1, username: 1, picture: 1 } },
              ],
              as: "bettor",
            },
          },
        ],
        as: "bets",
      },
    },
    {
      $lookup: {
        from: "comments",
        let: { gameId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$game", "$$gameId"] } } },
          { $project: { _id: 0, message: 1, user: 1, createdAt: 1 } },
          { $sort: { createdAt: -1 } },
          {
            $lookup: {
              from: "users",
              let: { commenterId: "$user" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$commenterId"] } } },
                { $sort: { createdAt: -1 } },
                { $project: { _id: 1, name: 1, username: 1, picture: 1 } },
              ],
              as: "commenter",
            },
          },
        ],
        as: "comments",
      },
    },
  ]);

  if (game) {
    return res.status(200).json(game);
  }

  return res.status(500).send(game);
};

const updateBetsAfterGameOver = async ({ data }) => {
  const finalScoreDiff = Math.abs(data.score.score_away - data.score.score_home);
  let favMsg;
  let underMsg;

  const allGames = await Games.find({ eventID: data.event_id }, { _id: 1 });

  if (allGames.length === 0) {
    return `${data.schedule.event_name}: Game not found in db`;
  }

  const allMsgs = await Promise.all(
    allGames.map(async (game) => {
      const currentGame = await Games.findOneAndUpdate(
        {
          $and: [{ _id: game._id }, { gameOverUpdated: false }],
        },
        { $set: { gameOverUpdated: true } },
        { returnOriginal: false }
      );
      if (!currentGame) {
        favMsg = "No Game found to update bets left";

        return {
          [`${data.schedule.event_name} - ${currentGame._id}`]: [favMsg],
        };
      }
      const { favorite, underdog, favoriteHomeOrAway, underdogHomeOrAway, line } = currentGame;

      returnMoneyBackUnfulfilled(currentGame._id);
      returnMoneyBackPartialUnfulfilled(currentGame._id);

      // favorite wins
      if (
        (data.score.winner_away && favoriteHomeOrAway === "away") ||
        (data.score.winner_home && favoriteHomeOrAway === "home")
      ) {
        // favorite wins more than the line
        if (finalScoreDiff > Math.abs(line)) {
          favMsg = "Favorite won and won by more than the line";
          logger.log("info", favMsg);
          updateBetsWon(currentGame._id, favorite);
        } else if (finalScoreDiff === Math.abs(line)) {
          // favorite wins exactly the same as line - everyone gets money back
          // status tie
          favMsg = "Favorite won and won equal to the line - tie eveyrone return money back";
          logger.log("info", "Favorite won and won equal to the line");
          returnMoneyBack(currentGame._id);

          return {
            [`${data.schedule.event_name} - ${currentGame._id}`]: [favMsg],
          };
        } else {
          // favorite wins but less than the line
          favMsg = "Favorite wins but less than line";
          logger.log("info", favMsg);
          updateBetsLoss(currentGame._id, favorite);
        }
      } else {
        // update favorite lost
        favMsg = "Favorite lost";
        logger.log("info", favMsg);
        updateBetsLoss(currentGame._id, favorite);
      }

      // Underdog wins
      if (
        (data.score.winner_away && underdogHomeOrAway === "away") ||
        (data.score.winner_home && underdogHomeOrAway === "home")
      ) {
        // underdog wins no matter of line
        underMsg = "Underdog won";
        logger.log("info", underMsg);
        updateBetsWon(currentGame._id, underdog);
      } else if (
        // Underdog lose
        (!data.score.winner_away && underdogHomeOrAway === "away") ||
        (!data.score.winner_home && underdogHomeOrAway === "home")
      ) {
        // underdog lose by less than the line
        if (finalScoreDiff <= Math.abs(line)) {
          underMsg = "Underdog lost but less than the line, ppl win money";
          logger.log("info", underMsg);
          updateBetsWon(currentGame._id, underdog);
        } else {
          // else if they lose, status lose
          underMsg = "Underdog lost";
          logger.log("info", underMsg);
          updateBetsLoss(currentGame._id, underdog);
        }
      }
      return {
        [`${data.schedule.event_name} - ${currentGame._id}`]: [favMsg, underMsg],
      };
    })
  );

  return allMsgs;
};
export const updateBetsGamePostponed = async ({ data }) => {
  const allGames = await Games.find({ eventID: data.event_id }, { _id: 1 });

  if (allGames.length === 0) {
    return `${data.schedule.event_name}: Game not found in db`;
  }

  const allMsgs = await Promise.all(
    allGames.map(async (game) => {
      const currentGame = await Games.findOneAndUpdate(
        {
          $and: [{ eventID: game._id }, { gameOverUpdated: false }],
        },
        { $set: { gameOverUpdated: true } },
        { returnOriginal: false }
      );

      if (!currentGame) {
        const favMsg = "Game has already been postponed and updated";

        return `${data.schedule.event_name}: ${favMsg}`;
      }

      returnMoneyBackUnfulfilled(currentGame._id);
      returnMoneyBackPartialUnfulfilled(currentGame._id, STATUS_MAP.CANCEL);
      returnMoneyBack(currentGame._id, STATUS_MAP.CANCEL);

      return {
        [`${data.schedule.event_name} - ${currentGame._id}`]: "Money returned back to everyone - game postponed",
      };
    })
  );

  return allMsgs;
};

export const checkScore = async (events) => {
  const allmsgs = await Promise.all(
    events.map(async (data) => {
      let msg;
      if (data?.score && data?.score.event_status === "STATUS_FINAL") {
        msg = await updateBetsAfterGameOver({ data });
      } else if (data?.score.event_status === "STATUS_POSTPONED") {
        const currentGame = await Games.find({
          $and: [{ eventID: data.event_id }, { gameOverUpdated: true }],
        });

        if (currentGame.length > 0) {
          msg = `Game was postponed and updated earlier ${data.schedule.event_name}`;
        } else {
          msg = await updateBetsGamePostponed({ data });
        }
      } else {
        logger.log("info", "Game aint over yet, nothing to check");
        msg = `Game aint over yet, nothing to check ${data.schedule.event_name}`;
      }

      return msg;
    })
  );

  return allmsgs;
};

export const getGameBettors = (req, res) => {
  Games.findOne({ _id: req.params.id }, (err, game) => {
    if (err) {
      res.status(500).json({
        status: RETURN_STATUS.FAIL,
        message: "Unknown error",
      });
    }

    Bets.find({
      game: req.params.id,
      side: req.params.side,
      party: { $exists: false },
    })
      .populate({
        path: "user",
        select: "name username picture source isFirstEdit",
      })
      .exec((err, bets) => {
        if (err)
          return res.status(500).json({
            status: RETURN_STATUS.FAIL,
            message: "Unknown error",
          });
        res.status(200).json({ game, bets });
      });
  });
};

export const getLeaderboard = (req, res) => {
  const from = moment.tz("America/Los_Angeles").utc().subtract(30, "days").startOf("day").toDate();
  const to = moment.tz("America/Los_Angeles").utc().toDate();

  Bets.aggregate(
    [
      {
        $match: {
          $and: [
            {
              $or: [{ status: "WON" }, { status: "LOSE" }],
            },
            {
              createdAt: {
                $gte: from,
                $lt: to,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
    ],
    (err, resp) => {
      if (err)
        res.status(500).json({
          status: RETURN_STATUS.FAIL,
          message: "Unknown error",
        });

      const filteredResp = extractLeaderboardResp(resp);
      const formatResp = transformLeaderboardResp(filteredResp);

      res.status(200).json({ resp: formatResp });
    }
  );
};

const extractLeaderboardResp = (resp) => {
  return resp.reduce((accumulator, bet) => {
    const { _id, source, isFirstEdit, name, username, picture } = bet.user[0];
    const userId = bet.user[0]._id;
    const status = bet.status;
    const amount = bet.isMatched ? bet.amount : bet.partialAmount;

    if (!accumulator[userId]) {
      accumulator[userId] = {
        user: {
          _id,
          source,
          isFirstEdit,
          name,
          username,
          picture,
        },
        [bet.game]: {
          wonMaxAmount: status === STATUS_MAP.WON ? amount : 0,
          lostMaxAmount: status === STATUS_MAP.LOSE ? amount : 0,
        },
      };
    }

    if (!accumulator[userId][bet.game]) {
      accumulator[userId][bet.game] = {
        wonMaxAmount: status === STATUS_MAP.WON ? amount : 0,
        lostMaxAmount: status === STATUS_MAP.LOSE ? amount : 0,
      };
    } else {
      accumulator[userId][bet.game]["wonMaxAmount"] += status === STATUS_MAP.WON ? amount : 0;
      accumulator[userId][bet.game]["lostMaxAmount"] += status === STATUS_MAP.LOSE ? amount : 0;
    }

    return accumulator;
  }, {});
};

const transformLeaderboardResp = (filteredResp) => {
  return Object.keys(filteredResp).map((userObj) => {
    const { user, ...games } = filteredResp[userObj];

    let wonCount = 0;
    let lostCount = 0;
    Object.keys(games).map((gameId) => {
      const { wonMaxAmount, lostMaxAmount } = games[gameId];
      wonMaxAmount > lostMaxAmount ? wonCount++ : lostCount++;
    });

    return {
      ...user,
      won: wonCount,
      lose: lostCount,
      delta: wonCount - lostCount,
    };
  });
};
