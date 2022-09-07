import express from "express";
const router = express.Router();

import * as BetCtrl from "../controllers/betController.js";
import { verifyToken } from "../utils/token.utils.js";

router.get("/ticket/:id", BetCtrl.getTicket);
router.post("/create", verifyToken, BetCtrl.makeABet);
router.post("/cancel", verifyToken, BetCtrl.cancelABet);
router.post("/update/ismatch", BetCtrl.setIsMatched);
router.post("/update/haswon", BetCtrl.setHasWon);

export default router;
