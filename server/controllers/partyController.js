import moment from "moment-timezone";
import Comment from "../models/comment.js";
import Party from "../models/party.js";
import Story from "../models/story.js";
import User from "../models/user.js";
import Game from "../models/games.js";
import { create as createBet } from "./betController.js";
import { logger } from "../config/winston.js";
import { create as createStory } from "./storyController.js";
import { uploadMedia } from "./uploadController.js";
import { GCP_PARTY_FOLDER } from "../config/google-cloud-storage.js";
import Bet from "../models/bet.js";

export const saveComments = (req, res) => {
  const comment = new Comment({
    message: req.body.comment,
    user: req.body.userID,
    game: req.body.gameID,
  });

  return comment.save((err, savedComments) => {
    if (err) return logger.log("error", err);

    Comment.aggregate(
      [
        { $match: { _id: savedComments._id } },
        {
          $lookup: {
            from: "users",
            let: { commenterId: "$user" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$commenterId"] } } },
              { $project: { name: 1, username: 1, picture: 1 } },
            ],
            as: "commenter",
          },
        },
        { $sort: { createdAt: -1 } },
      ],
      (err, formattedComment) => {
        if (err) return err;
        return res.status(201).json(formattedComment);
      }
    );
  });
};

export const get = async (req, res) => {
  const party = await Party.findById(req.params.id)
    .populate(
      "game",
      "eventDateUTC favoriteAbrv favorite underdogAbrv underdog line sportID favoriteHomeOrAway underdogHomeOrAway"
    )
    .populate({
      path: "host",
      select: "name username picture bio followers",
    })
    .populate({
      path: "hostBet",
      select:
        "side user amount partialAmount matchedUser.name matchedUser.username matchedUser.picture matchedUser._id",
    })
    .populate({
      path: "bets",
      select:
        "side user amount partialAmount matchedUser.name matchedUser.username matchedUser.picture matchedUser._id",
      populate: {
        path: "user",
        model: User,
        select: "name username picture",
      },
    })
    .exec();
  if (party) {
    return res.status(200).json(party);
  }
  return res.status(404);
};

export const uploadCoverImage = async (req, res, next) => {
  let coverImageURL = "";
  try {
    coverImageURL = req.file ? await uploadMedia(req.file, `${GCP_PARTY_FOLDER}/cover-images`) : "";
  } catch (error) {
    logger.log("error", error);
    return res.status(500).json(error);
  }
  req.coverImageURL = coverImageURL;
  next();
};

export const createPartyBet = async (req, res, next) => {
  const game = await Game.findById(req.body.gameID);
  let hostBet = null;
  try {
    hostBet = await createBet(req, game);
  } catch (error) {
    logger.log("error", error);
    return res.status(500).json(error);
  }
  req.hostBet = hostBet;
  next();
};

export const createParty = async (req, res, next) => {
  try {
    const party = await Party.create({
      host: req.userId,
      game: req.body.gameID,
      pick: req.body.pick,
      tagline: req.body.tagline,
      hostBet: req.hostBet._id,
      coverImageURL: req.coverImageURL,
    });
    await Bet.findOneAndUpdate({ _id: req.hostBet._id }, { party: party._id });
    return res.status(201).json(party);
  } catch (error) {
    logger.log("error", error);
    return res.status(500).json(error);
  }
};

export const getStories = async (req, res) => {
  const stories = await Story.find({ party: req.params.id }, [
    "media_type",
    "media_url",
    "party",
    "likes",
    "caption",
    "createdAt",
  ]);
  if (stories) {
    return res.status(200).json(stories);
  }
  return res.status(404);
};

export const all = async (req, res) => {
  const date = moment.tz("America/Los_Angeles").startOf("day").utc().toDate();
  try {
    const results = await Party.find({
      createdAt: {
        $gte: date,
      },
    })
      .populate("host", "name username picture")
      .populate("game", "favoriteHomeOrAway favorite underdog underdogHomeOrAway sportID")
      .sort({ createdAt: -1 });

    if (results) {
      let followingParties = [];
      const userFollowingIds = await User.findById(req.userId)
        .select("following")
        .distinct("following");
      if (userFollowingIds) {
        const idsSet = new Set(
          userFollowingIds.map((follow) => {
            return follow._id.toString();
          })
        );
        followingParties = results.filter((party) => idsSet.has(party.host._id.toString()));
      }
      return res.status(200).json({ all: results, following: followingParties });
    }
    return res.status(404);
  } catch (err) {
    throw err;
  }
};
