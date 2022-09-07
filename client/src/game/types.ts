import { BetUser, PartialUser } from "../user/types.js";

export interface Game {
  _id: string;
  eventID: string;
  bets: Bet[];
  favorite: string;
  favoriteImage: string;
  favoriteAbrv: string;
  favoriteRecord: string;
  favoriteHomeOrAway: string;
  underdog: string;
  underdogImage: string;
  underdogAbrv: string;
  underdogRecord: string;
  underdogHomeOrAway: string;
  line: number;
  title: string;
  attendance: string;
  eventDateUTC: string;
  eventDate: string;
  sportID: number;
  favoriteBetCount: number;
  underdogBetCount: number;
  favoriteArray: Array<[]>;
  underdogArray: Array<[]>;
  gameOverUpdated: boolean;
}

export interface Bet {
  amount: number;
  createdAt: Date;
  bettor?: PartialUser[];
  game: string;
  isMatched: boolean;
  isPartialMatched: boolean;
  lastDeltaAmount: number;
  line: number;
  matchedUser: BetUser[];
  partialAmount: number;
  side: string;
  status: string;
  updatedAt: Date;
  user: BetUser;
  party: string;
}
