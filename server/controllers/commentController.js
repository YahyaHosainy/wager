import Comment from "../models/comment.js";
import { logger } from "../config/winston.js";
import Party from "../models/party.js";

export const getComment = async (req, res) => {
  let id = req.params.id;

  if (req.params.from === "party") id = await findGamesID(req.params.id);

  Comment.find({ game: id })
    .populate("user", "name username picture")
    .select("user message")
    .sort({ createdAt: -1 })
    .exec((err, comments) => {
      if (err) return res.status(500).send(err);
      res.status(200).json({ comments });
    });
};

export const saveComments = async (req, res) => {
  let id = req.body.gameID;

  if (req.body.partyID) id = await findGamesID(req.body.partyID);

  const comment = new Comment({
    message: req.body.comment,
    user: req.body.userID,
    game: id,
  });

  return comment.save((err, savedComments) => {
    if (err) return logger.log("error", err);

    Comment.findById(savedComments._id)
      .populate("user", "name username picture")
      .select("user message")
      .exec((err, comments) => {
        if (err) return res.status(500).send(err);
        res.status(200).json([comments]);
      });
  });
};

export const findGamesID = (partyID) => {
  return new Promise((resolve) => {
    Party.findById(partyID).then((resp) => resolve(resp.game));
  });
};
