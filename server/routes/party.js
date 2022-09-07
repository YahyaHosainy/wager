import express from "express";
import { multer } from "../config/google-cloud-storage.js";
const router = express.Router();

import * as CommentController from "../controllers/commentController.js";
import * as PartyController from "../controllers/partyController.js";
import { verifyToken } from "../utils/token.utils.js";

router.post("/comment", verifyToken, CommentController.saveComments);
router.post(
  "/create",
  verifyToken,
  multer.single("coverImage"),
  PartyController.uploadCoverImage,
  PartyController.createPartyBet,
  PartyController.createParty
);
router.get("/all", verifyToken, PartyController.all);
router.get("/:id", verifyToken, PartyController.get);
router.get("/:id/stories", verifyToken, PartyController.getStories);

export default router;
