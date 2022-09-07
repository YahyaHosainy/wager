export const STATUS = ["WON", "LOSE", "TIE", "PENDING", "CANCEL"];

export const STATUS_MAP = {
  WON: "WON",
  LOSE: "LOSE",
  TIE: "TIE",
  PENDING: "PENDING",
  CANCEL: "CANCEL",
  CANCEL_MOVE_LINE: "CANCEL_MOVE_LINE",
  PENDING_PARTIAL_LINE_CHANGE: "PENDING_PARTIAL_LINE_CHANGE",
};

export const SPORTS = {
  nba: 4,
  nfl: 2,
  ncaa: 5,
};

export const RETURN_STATUS = {
  FAIL: "failed",
  SUCCESS: "success",
};

export default { STATUS, STATUS_MAP, RETURN_STATUS, SPORTS };
