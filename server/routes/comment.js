import express from "express";
const router = express.Router();

import * as CommentController from "../controllers/commentController.js";
import { verifyToken } from "../utils/token.utils.js";

router.get("/:from/:id", verifyToken, CommentController.getComment);
router.post("/", verifyToken, CommentController.saveComments);

export default router;
