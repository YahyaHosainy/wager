import express from "express";
const router = express.Router();
import { generateToken, sendToken } from "../utils/token.utils.js";
import passport from "../middlewares/passport.js";

router.route("/").post(
  passport.authenticate("facebook-token", { session: false }),
  (req, res, next) => {
    if (!req.user) {
      return res.send(401, "User Not Authenticated");
    }
    next();
  },
  generateToken,
  sendToken
);

export default router;
