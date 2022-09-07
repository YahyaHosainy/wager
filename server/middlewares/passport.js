import "../config/mongoose.js";
import passport from "passport";
import User from "../models/user.js";
import FacebookTokenStrategy from "passport-facebook-token";
import config from "../config/config.js";

const facebookStrategy = new FacebookTokenStrategy(
  {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: config.get("FACEBOOK_APP_SECRET"),
  },
  (accessToken, refreshToken, profile, done) => {
    User.upsertFbUser(accessToken, refreshToken, profile, (err, user) => done(err, user));
  }
);
passport.use(facebookStrategy);

export default passport;
