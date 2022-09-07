import express from "express";
const router = express.Router();

import * as NotificationsController from "../controllers/notificationsController.js";
import { verifyToken } from "../utils/token.utils.js";

router.get("/:id", verifyToken, NotificationsController.getUnseen);
router.post("/:id/markseen", verifyToken, NotificationsController.markSeen);

export default router;
