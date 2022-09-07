import { format } from "util";
import path from "path";
import {
  GCLOUD_STORAGE_BUCKET,
  GCP_PARTY_FOLDER,
  GCP_PROFILE_FOLDER,
  GCP_STORIES_FOLDER,
  storage,
  validateStorage,
} from "../config/google-cloud-storage.js";
import { v4 as uuidv4 } from "uuid";
import * as exifremove from "exifremove";
import { logger } from "../config/winston.js";
import ffmpeg from "fluent-ffmpeg";
import stream from "stream";
import { isVideoMimeType } from "./utils.js";

export const uploadToGoogleStorage = (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }

  if (["image/jpg", "image/jpeg"].includes(req.file.mimetype)) {
    req.file.buffer = exifremove.remove(req.file.buffer);
  }

  const fileExtension = path.extname(req.file.originalname);
  const bucket = storage.bucket(GCLOUD_STORAGE_BUCKET);
  // appending this prefix should allow us to clean up files in the future
  const environmentPrefix = process.env.NODE_ENV === "production" ? "" : `${process.env.NODE_ENV}_`;
  const blob = bucket.file(`${GCP_PROFILE_FOLDER}/${environmentPrefix}${uuidv4()}${fileExtension}`);

  blob
    .createWriteStream({ gzip: true })
    .on("error", (err) => {
      logger.log("error", err);
      next(err);
    })
    .on("finish", () => {
      const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
      logger.log("info", `Succesfully uploaded ${publicUrl}`);
      res.locals.publicUrl = publicUrl;
      next();
    })
    .end(req.file.buffer);
};

export async function deleteFile(filename) {
  const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);
  await bucket.file(filename).delete();

  logger.log("info", `gs://${bucket.name}/${filename} deleted.`);
}

export const uploadMedia = (file, folder) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return;
    }
    const bucket = storage.bucket(GCLOUD_STORAGE_BUCKET);
    const environmentPrefix =
      process.env.NODE_ENV === "production" ? "" : `${process.env.NODE_ENV}_`;
    const [_, subfolder] = folder.split("/");

    if (isVideoMimeType(file.mimetype)) {
      const originStream = new stream.Readable.from(file.buffer);
      const destFile = bucket.file(
        `${GCP_PARTY_FOLDER}/${subfolder}/${environmentPrefix}${uuidv4()}.mp4`
      );
      const destinationStream = destFile.createWriteStream({
        metadata: {
          contentType: "video/mp4",
        },
        gzip: true,
      });

      ffmpeg(originStream)
        .withInputOption("-analyzeduration 2147483647")
        .withInputOption("-probesize 2147483647")
        .withOutputOption("-f mp4")
        .withOutputOption("-preset ultrafast")
        .addOutputOption("-movflags", "frag_keyframe+empty_moov")
        .withOutputOption("-max_muxing_queue_size 9999")
        .withVideoCodec("libx264")
        .on("start", (cmdLine) => {
          logger.log("info", ` Started FFMpeg`, cmdLine);
        })
        .on("end", () => {
          logger.log("info", ` Success`);
          const publicUrl = format(
            `https://storage.googleapis.com/${bucket.name}/${destFile.name}`
          );
          logger.log("info", `Succesfully uploaded ${publicUrl}`);
          resolve(publicUrl);
        })
        .on("error", (err, stdout, stderr) => {
          logger.log("error", `Error:`, err.message);
          logger.log("error", "stdout:", stdout);
          logger.log("error", "stderr:", stderr);
          reject();
        })
        .pipe(destinationStream, { end: true });
    } else {
      const fileExtension = path.extname(file.originalname);
      const validateBucketExists = validateStorage(bucket, folder);

      if (!validateBucketExists) {
        reject(`folder does not exist in gcs ${folder}`);
      }
      const [_, subfolder] = folder.split("/");
      const blob = bucket.file(
        `${GCP_PARTY_FOLDER}/${subfolder}/${environmentPrefix}${uuidv4()}${fileExtension}`
      );

      blob
        .createWriteStream({ gzip: true })
        .on("error", (err) => {
          logger.log("error", `Unable to upload ${file.mimetype} ${err}`);
          reject(`Unable to upload image ${err}`);
        })
        .on("finish", () => {
          const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
          logger.log("info", `Succesfully uploaded ${publicUrl}`);
          transcodeMedia;
          resolve(publicUrl);
        })
        .end(file.buffer);
    }
  });
};
