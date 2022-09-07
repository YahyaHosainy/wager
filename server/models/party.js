import mongoose from "mongoose";
const { Schema } = mongoose;

const PartySchema = new Schema(
  {
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pick: {
      type: String,
      enum: ["favorite", "underdog"],
      required: true,
    },
    game: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
    bets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Bet",
      },
    ],
    tagline: {
      type: String,
      maxLength: 260,
      default: "Check this party out!",
    },
    coverImageURL: {
      type: String,
    },
    hostBet: {
      type: Schema.Types.ObjectId,
      ref: "Bet",
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Party = mongoose.model("Party", PartySchema);
export default Party;
