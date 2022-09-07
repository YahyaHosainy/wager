import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import * as Sentry from "@sentry/node";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import config from "./config/config.js";
import prerenderNode from "prerender-node";
import NFLUpcoming from './functions/NFLUpcoming.js'

import {
  listGamesFilter,
  listGamesFilter10,
  getGame,
  getGameBets,
  getMatchBets,
  getGameBettors,
  getLeaderboard,
} from "./controllers/gameController.js";
import {
  getBudget,
  createAccount,
  loginAccount,
  forgotAccount,
  confirmAccount,
  resetAccount,
  getProfile,
} from "./controllers/userController.js";
import { withdraw, getBilling } from "./controllers/billingController.js";
import http from "http";
// import cronjob from './cronjob.js';

// Routes
import bet from "./routes/bet.js";
import paypal from "./routes/billing.js";
import profile from "./routes/user.js";
import cronjobs from "./routes/cronjobs.js";
import comment from "./routes/comment.js";
import party from "./routes/party.js";
import story from "./routes/story.js";
import { verifyToken } from "./utils/token.utils.js";
import notifications from "./routes/notifications.js";

// DB  instance connection
import configureDatabase from "./config/mongoose.js";
import { setUpNotificationHook } from "./middlewares/notifications.js";

Sentry.init({
  dsn: "https://accc15e6f5624d12b220c8c8def0f824@o508446.ingest.sentry.io/5600982",
  enabled: process.env.NODE_ENV === "production",
});

(async () => {
  await config.load();
  configureDatabase();
  const app = express();
  // Sentry config must be as early in the server instantiation process as possible
  app.use(Sentry.Handlers.requestHandler());

  const httpClient = http.createServer(app);
  const port = process.env.PORT || 3001;

  app.enable("trust proxy");

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  app.use(mongoSanitize());
  app.use(helmet());

  const corsOption = {
    origin: true,
    methods: "GET,PUT,POST",
    credentials: true,
    exposedHeaders: ["x-access-token"],
  };

  app.use(cors(corsOption));

  app.use(express.static("public"));
  // app.get('*', function (req, res) {
  //     res.sendFile(path.resolve(appPath, 'index.html'))
  // })
  let sess = {
    secret: "wagergame",
    name: "sessionId",
    resave: true,
    saveUninitialized: true,
  };

  const prerender = prerenderNode
    .set("prerenderToken", process.env.PRERENDER_KEY)
    .set("protocol", "https");
  prerender.crawlerUserAgents.push("googlebot");
  prerender.crawlerUserAgents.push("bingbot");
  prerender.crawlerUserAgents.push("yandex");
  app.use(prerender);

  if (app.get("env") === "production") {
    const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    app.set("trust proxy", 1); // trust first proxy
    sess = {
      ...sess,
      cookie: {
        secure: true,
        httpOnly: true,
        sameSite: true,
        domain: "wager.games",
        expires: expiryDate,
      },
    };
  }
  app.use(session(sess));
  // TODO(tomarak): need to make passport initialization happen after config is loaded
  let { default: passport } = await import("./middlewares/passport.js");
  app.use(passport.initialize());
  app.use(passport.session());

  // DO NOT DELETE: Tied to healthcheck on Google Cloud
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });
  // TODO(tomarak): need to make passport initialization happen after config is loaded
  let { default: facebookRoute } = await import("./routes/facebook.js");
  app.use("/api/auth/facebook/", facebookRoute);

  // Game Routes
  app.route("/api/gamesfilter/:date").get(listGamesFilter);
  app.route("/api/until10games/from/:date").get(listGamesFilter10);
  app.get('/api/nflgames',async (req,res) => {
    let upc = await NFLUpcoming()
    res.send(upc)
  })
  app.route("/api/game/:id").get(getGame);
  app.route("/api/game/bets/:id").get(getGameBets);
  app.route("/api/match/bets/:id").get(getMatchBets);
  app.route("/api/game/bettors/:id/:side").get(getGameBettors);
  app.route("/api/leaderboard").get(getLeaderboard);

  // Bet
  app.use("/api/bet", bet);

  // Billing
  app.use("/api/paypal/", paypal);
  app.route("/api/billing/:id", verifyToken).get(getBilling);
  app.route("/api/withdraw", verifyToken).post(withdraw);

  // Profile
  app.route("/api/login").post(loginAccount);
  app.route("/api/register").post(createAccount);
  app.route("/api/forgot").post(forgotAccount);
  app.route("/api/confirm").post(confirmAccount);
  app.route("/api/reset").post(resetAccount);
  app.use("/api/profile", profile);
  app.use("/api/bettor-profile/:id", getProfile);
  app.use("/api/budget/:id", verifyToken, getBudget);
  app.use("/api/profilefilter", profile);

  // Comments
  app.use("/api/comments", comment);

  // cronjobs
  app.use("/api/cronjobs", cronjobs);

  // notifications
  app.use("/api/notifications", notifications);

  // parties
  app.use("/api/party/", party);
  app.use("/api/story/", story);

  // TODO: Make error handler return true error
  // catch 404 and forward to error handler
  // app.use((req, res, next) => {
  //   const err = new Error('Not Found');
  //   err.status = 404;
  //   next(err);
  // });

  setUpNotificationHook();

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());

  httpClient.listen(port, () =>
    console.log(`Server running on port ${port} ${process.env.NODE_ENV}`)
  );
})();
