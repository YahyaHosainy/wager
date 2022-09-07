import Multer from "multer";
import { Storage } from "@google-cloud/storage";

export const GCLOUD_STORAGE_BUCKET = process.env.GCLOUD_STORAGE_BUCKET || "wager-static-assets";
export const GCP_PROFILE_FOLDER = "profile-pictures";
export const GCP_STORIES_FOLDER = "stories";
export const GCP_PARTY_FOLDER = "parties";

const imageFileTypes = ["image/png", "image/jpg", "image/jpeg"];
const videoFileTypes = ["video/mp4", "video/quicktime"];

// Instantiate a storage client
export const storage = new Storage(GCLOUD_STORAGE_BUCKET);

export const validateStorage = async (bucket, folder, subfolder) => {
  const options = {
    prefix: `${folder}/`,
  };
  // Lists files in the bucket, filtered by a prefix
  const [files] = await bucket.getFiles(options);

  return files.includes(`${folder}/${subfolder}`);
};

const fileFilter = (req, file, next) => {
  if (imageFileTypes.includes(file.mimetype)) {
    next(null, true);
  } else {
    next(null, false);

    return next("Only .png, .jpg, and .jpeg formats are allowed");
  }
};

export const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    // no larger than 5mb.
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

const storyFilter = (req, file, next) => {
  if (imageFileTypes.includes(file.mimetype) || videoFileTypes.includes(file.mimetype)) {
    next(null, true);
  } else {
    next(null, false);

    return next("Only png, jpg, jpeg, mp4, mov formats are allowed");
  }
};

export const multerStory = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    // no larger than 2mb.
    fileSize: 20 * 1024 * 1024,
  },
  onError: (err, next) => {
    logger.log("error", err);
    next(err);
  },
  fileFilter: storyFilter,
});
