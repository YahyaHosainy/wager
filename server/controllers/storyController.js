import { logger } from "../config/winston.js";
import { GCLOUD_STORAGE_BUCKET } from "../config/google-cloud-storage.js";
import Story from "../models/story.js";
import { uploadMedia } from "./uploadController.js";
import { RETURN_STATUS } from "../consts.js";

const folderMap = {
  video: "videos",
  image: "images",
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
    return res.status(200).json({ party: req.params.id, stories });
  }
  return res.status(404);
};

export const create = async (req, party) => {
  const folderName = folderMap[file.fieldname];

  req.files.forEach(async (file) => {
    const url = await uploadMedia(file, `${GCLOUD_STORAGE_BUCKET}/stories/${folderName}`);

    if (url) {
      Story.create({
        party: party._id,
        media_type: file.fieldname,
        media_url: url,
        caption: req.body.tagline,
      });
    }
  });
};

export const update = async (req, res) => {
  const rawStories = await Promise.all(
    req.files.map(async (file, idx) => {
      const mediaType = file.mimetype.split("/")[0];
      const folderName = folderMap[mediaType];
      const url = await uploadMedia(file, `${GCLOUD_STORAGE_BUCKET}/stories/${folderName}`);
      const caption =
        Array.isArray(req.body.caption) && req.body.caption.length > 1
          ? req.body.caption[idx]
          : req.body.caption;
      return {
        party: req.body.partyId,
        media_type: mediaType,
        media_url: url,
        caption,
      };
    })
  );

  Story.insertMany(rawStories, function (err, stories) {
    if (err) {
      return res.status(500);
    }
    return res.status(201).json({
      status: RETURN_STATUS.SUCCESS,
      party: req.body.partyId,
      stories,
    });
  });
};

export const likeStory = async (req, res) => {
  try {
    let story = await Story.findById(req.params.id);
    if (story.likes.indexOf(req.userId) !== -1) {
      story = await Story.findByIdAndUpdate(
        req.params.id,
        { $pull: { likes: req.userId } },
        (err) => {
          if (err) logger.log("error", err);
        }
      );
    } else {
      story = await Story.findByIdAndUpdate(
        req.params.id,
        { $push: { likes: req.userId } },
        (err) => {
          if (err) logger.log("error", err);
        }
      );
    }
    return res.status(201).json({ id: story._id, likes: story.likes });
  } catch (error) {
    logger.log("error", error);
    return res.status(400);
  }
};

export const createStory = async (req, res) => {
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

export const deleteStory = async (req, res) => {
  const story = await Story.findOne({ _id: req.params.id }).populate("party").exec();
  // verify user can delete this story
  if (story) {
    if (story.party.host.toString() === req.userId) {
      await Story.deleteOne({ _id: req.params.id });
      return res.status(200).json(story._id);
    }
    return res.status(403);
  } else {
    return res.status(404);
  }
};
