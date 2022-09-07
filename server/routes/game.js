import express from "express";
const router = express.Router();

import * as GameCtrlr from "../controllers/gameController.js";

// dummy route for fetching games - TODO: cronjob
router.get("/fetch", GameCtrlr.makeRequestGamesReqRes);
// dummy route for checking game over - TODO: cronjob
router.get("/over", GameCtrlr.getScore);
// TODO: cronjob to run every hour from 2pm PST - 10pmPST
// dummy route to move the line
router.get("/moveline", GameCtrlr.clearGameAndChangeLine);

export default router;
