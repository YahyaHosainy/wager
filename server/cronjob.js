import moment from "moment";
import pkg from "cron";
const { CronJob } = pkg;
import { makeRequest } from "./controllers/utils.js";
import * as GameCtrlr from "./controllers/gameController.js";

const getGamesCronJob = new CronJob(
  "58 12 * * *",
  () => {
    // GameCtrlr.makeRequestGamesAPI(4); // Basketball
    makeRequest({
      cb: GameCtrlr.extractGameData,
      sportID: 2,
      date: moment().format("YYYY-MM-DD"),
    });
  },
  null,
  true,
  "America/Los_Angeles"
);

const getScoreCronJob = new CronJob(
  "3 12 * * *",
  () => {
    // GameCtrlr.getScore(4); // Basketball
    makeRequest({
      cb: GameCtrlr.checkScore,
      sportID: 2,
      date: moment().format("YYYY-MM-DD"),
    });
  },
  null,
  true,
  "America/Los_Angeles"
);

getGamesCronJob.start();
getScoreCronJob.start();

export default {
  getScoreCronJob,
  getGamesCronJob,
};
