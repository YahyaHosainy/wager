import Bet from "../models/bet.js";
import Games from "../models/games.js";
import { betIsMatchedOnFirst } from "./queueUtils.js";

export const queueBet = async ({ bet, foundGame, pickedSide, oppositeSide }) => {
  let updatedBet = bet;
  let updatedOppSideBet;

  let oppositeSideBets = await Bet.find({
    game: foundGame._id,
    side: foundGame.favorite === bet.side ? foundGame.underdog : foundGame.favorite,
    isMatched: false,
    // if this is a party bet, search for party bets, otherwise look for bets with party set to undefined
    ...(bet.party ? { party: bet.party } : { party: { $exists: false } }),
  }).sort({ createdAt: 1 });

  let filledBets = [];

  while (oppositeSideBets.length > 0 && !updatedBet.isMatched) {
    const firstOppSideBet = oppositeSideBets[0];
    // todo clean this if statement up
    if (updatedBet.lastDeltaAmount > firstOppSideBet.lastDeltaAmount) {
      updatedOppSideBet = await betIsMatchedOnFirst({
        bet: firstOppSideBet,
        oppSideBet: updatedBet,
      });

      updatedBet = await betIsMatchedOnFirst({
        bet: updatedBet,
        oppSideBet: firstOppSideBet,
      });
    } else {
      updatedBet = await betIsMatchedOnFirst({
        bet: updatedBet,
        oppSideBet: firstOppSideBet,
      });

      updatedOppSideBet = await betIsMatchedOnFirst({
        bet: firstOppSideBet,
        oppSideBet: updatedBet,
      });
    }

    if (updatedOppSideBet.isMatched) {
      filledBets.push(oppositeSideBets.shift());
    } else {
      oppositeSideBets[0] = updatedOppSideBet;
    }
  }

  if (updatedBet.isPartialMatched) {
    foundGame[`${pickedSide}Array`].push(updatedBet);
  }

  try {
    let updateOpt = {
      $inc: { [`${pickedSide}BetCount`]: 1 },
      $set: {
        [`${pickedSide}Array`]: foundGame[`${pickedSide}Array`],
      },
      $pull: { [`${oppositeSide}Array`]: { _id: { $in: filledBets.map((bet) => bet._id) } } },
    };

    // if party exists
    if (updatedBet?.party) {
      delete updateOpt["$inc"];
    }

    const modifiedFoundGame = await Games.findOneAndUpdate({ _id: foundGame._id }, updateOpt, {
      returnNewDocument: true,
    });

    return [modifiedFoundGame, updatedBet];
  } catch (error) {
    return error;
  }
};
