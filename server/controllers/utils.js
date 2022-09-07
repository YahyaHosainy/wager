import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

export const makeRequest = async ({ cb, sportID, date }) => {
  const { GAME_BASE_URL } = process.env;
  const fullUrl = new URL(date, `${GAME_BASE_URL}/${sportID}/events/`);
  try {
    let message;
    await axios({
      method: "GET",
      url: fullUrl.href,
      headers: {
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      },
      params: {
        include: "scores, all_periods",
        offset: "480", // offset utc in minutes pst is 8 hours
      },
    })
      .then(async (response) => {
        const resp = response.data.events;
        if (resp.length === 0) {
          const msg = `No Games Found today ${date}`;
          message = msg;

          return;
        }
        message = await cb(resp);
      })
      .catch((err) => console.error(err));

    return message;
  } catch (err) {
    console.error(err);
  }
};

export const videoMimeTypes = [
  "application/vnd.apple.mpegurl",
  "application/x-mpegurl",
  "video/3gpp",
  "video/mp2t",
  "video/mp4",
  "video/mpeg",
  "video/ms-asf",
  "video/ogg",
  "video/quicktime",
  "video/webm",
  "video/x-flv",
  "video/x-m4v",
  "video/x-ms-wmv",
  "video/x-msvideo",
];

export const isVideoMimeType = (mimeType) => videoMimeTypes.includes(mimeType.toLowerCase());

export default {
  makeRequest,
};
