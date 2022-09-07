import express from "express";
const router = express.Router();
import * as UserCtrl from "../controllers/userController.js";
import { multer } from "../config/google-cloud-storage.js";
import { uploadToGoogleStorage } from "../controllers/uploadController.js";
import { verifyToken } from "../utils/token.utils.js";

router.get("/:id", verifyToken, UserCtrl.getProfile);
router.get("/:id/getfollow", verifyToken, UserCtrl.getFollow);
router.get("/:id/newsfeed", verifyToken, async (req, res) => {
  const resp = await UserCtrl.followedBets(req.userId);
  res.status(200).json(resp);
});
router.get("/:id/:date", verifyToken, UserCtrl.getActiveBets);
router.post("/:id", verifyToken, multer.single("image"), uploadToGoogleStorage, (req, res) => {
  UserCtrl.saveProfile(req, res);
});
router.post("/:id/follow/:followUserId", verifyToken, async (req, res) => {
  const resp = await UserCtrl.follow(req.userId, req.params.followUserId);
  res.status(200).json(resp);
});
router.post("/:id/unfollow/:followUserId", verifyToken, async (req, res) => {
  const resp = await UserCtrl.unfollow(req.userId, req.params.followUserId);
  res.status(200).json(resp);
});
router.get("/followerlist/:userId/:type", verifyToken, async (req, res) => {
  const resp = await UserCtrl.getFollowList(req.userId, req.params.type);
  res.status(200).json(resp);
});

export default router;
