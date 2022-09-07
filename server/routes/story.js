import express from "express";
import { multerStory } from "../config/google-cloud-storage.js";
const router = express.Router();

import * as StoryController from "../controllers/storyController.js";
import { verifyToken } from "../utils/token.utils.js";

router.get("/:id", verifyToken, StoryController.getStories);
router.post("/like/:id", verifyToken, StoryController.likeStory);
router.post("/delete/:id", verifyToken, StoryController.deleteStory);
router.post("/update", verifyToken, multerStory.array("storyContent", 10), (req, res) => {
  StoryController.update(req, res);
});

export default router;
