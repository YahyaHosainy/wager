import mongoose from "mongoose";
const { Schema } = mongoose;

const gamesDataLatestFetch = new Schema(
  {
    dataLatestFetchTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const GamesDataLatestFetch = mongoose.model("GamesDataLatestFetch", gamesDataLatestFetch);
export default GamesDataLatestFetch;
