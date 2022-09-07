import mongoose from "mongoose";
const { Schema } = mongoose;

const gameSchema = new Schema(
  {
    eventID: {
      type: String,
    },
    favorite: {
      type: String,
    },
    favoriteImage: {
      type: String,
    },
    favoriteAbrv: {
      type: String,
    },
    favoriteRecord: {
      type: String,
    },
    favoriteHomeOrAway: {
      type: String,
    },
    underdog: {
      type: String,
    },
    underdogImage: {
      type: String,
    },
    underdogAbrv: {
      type: String,
    },
    underdogRecord: {
      type: String,
    },
    underdogHomeOrAway: {
      type: String,
    },
    line: {
      type: Number,
    },
    title: {
      type: String,
    },
    attendance: {
      type: String,
    },
    eventDateUTC: {
      type: String,
    },
    eventDate: {
      type: String,
    },
    sportID: {
      type: Number,
    },
    favoriteBetCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    underdogBetCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    favoriteArray: {
      type: Array,
    },
    underdogArray: {
      type: Array,
    },
    gameOverUpdated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Game = mongoose.model("Game", gameSchema);
export default Game;
