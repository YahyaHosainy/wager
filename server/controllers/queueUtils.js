import { logger } from "../config/winston.js";
import Bet from "../models/bet.js";
import User from "../models/user.js";
import pick from "lodash/pick.js";
// import * as event from './socketHelper.js';

const updateStoredBet = async (bet) => {
  try {
    const findOrCreateBet = await Bet.findOneAndUpdate({ _id: bet._id }, bet, {
      new: true,
      upsert: true,
    });

    return findOrCreateBet;
  } catch (error) {
    logger.log("error", "error updating the bet " + error);
  }
};

export const betIsMatchedOnFirst = async ({ bet, oppSideBet }) => {
  const findOppSideBetUser = await User.findById(oppSideBet.user);
  const parsedUserinfo = pick(findOppSideBetUser, [
    "_id",
    "name",
    "picture",
    "isFirstEdit",
    "username",
  ]);

  bet.matchedUser.push(parsedUserinfo);
  bet.isMatched = bet.lastDeltaAmount <= oppSideBet.lastDeltaAmount;
  bet.isPartialMatched = !bet.isMatched;
  bet.partialAmount = bet.isPartialMatched ? bet.partialAmount + oppSideBet.lastDeltaAmount : 0;
  if (bet.isPartialMatched) {
    // store the last difference because partialAmount will get overwritten
    bet.lastDeltaAmount = bet.amount - bet.partialAmount;
  }

  return updateStoredBet(bet);
};

export default {
  betIsMatchedOnFirst,
};
