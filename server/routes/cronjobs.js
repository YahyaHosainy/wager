import express from "express";
const router = express.Router();
import { makeRequest } from "../controllers/utils.js";
import { SPORTS } from "../consts.js";
import moment from "moment";
import * as GameCtrlr from "../controllers/gameController.js";

router.get("/getgameinfo/:sport", async (req, res) => {
  const today = moment().tz("America/Los_Angeles").format("YYYY-MM-DD");
  const tomorrow = moment(today).tz("America/Los_Angeles").add(1, "days").format("YYYY-MM-DD");
  const data = {};
  if (req.params.sport === "nfl") {
    for (const date of [today, tomorrow]) {
      const msgs = await makeRequest({
        cb: GameCtrlr.extractGameData,
        sportID: SPORTS[req.params.sport],
        date,
      });
      data[date] = msgs;
    }
  } else {
    const msgs = await makeRequest({
      cb: GameCtrlr.extractGameData,
      sportID: SPORTS[req.params.sport],
      date: today,
    });
    data[today] = msgs;
  }
  res.status(200).json(data);
});

router.get("/getscoreinfo/:sport", async (req, res) => {
  const msgs = await makeRequest({
    cb: GameCtrlr.checkScore,
    sportID: SPORTS[req.params.sport],
    date: moment().tz("America/Los_Angeles").format("YYYY-MM-DD"),
  });
  res.status(200).json(msgs);
});

// .../api/cronjobs/moveline?line=3&gameid='foo'
router.get("/moveline", async (req, res) => {
  const { line } = req.query;
  // gameId is MongoDb objectId
  const gameId = req.query.gameid;
  GameCtrlr.moveTheGameLine({ line, gameId });
  res.status(200).json("Moving the line");
});

export default router;
