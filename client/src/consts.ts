export const favoriteBetText = ({ amount, team }) =>
  `To win this bet, the ${team} must win by ${amount} point(s) or more`;

export const underdogBetText = ({ amount, team }) =>
  `To win this bet, the ${team} must win or they can lose by ${amount} point(s) or less`;

export enum STATUS_MAP {
  WON = "WON",
  LOSE = "LOSE",
  TIE = "TIE",
  PENDING = "PENDING",
  CANCEL = "CANCEL",
  CANCEL_MOVE_LINE = "CANCEL_MOVE_LINE",
  PENDING_PARTIAL_LINE_CHANGE = "PENDING_PARTIAL_LINE_CHANGE",
}

export const OWN_PROFILE = "OWN";
export const OTHER_PROFILE = "OTHER";

export const UPLOAD_MAX_SIZE_IMAGE = 5000000;
export const UPLOAD_MAX_SIZE_VIDEO = 20000000;

export const GCLOUD_BUCKET_URL =
  "https://storage.googleapis.com/wager-static-assets";

export const idToLeagueMap = {
  2: "nfl",
  4: "nba",
  5: "ncaa",
};

export default { favoriteBetText, underdogBetText };
