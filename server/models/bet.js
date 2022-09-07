import mongoose from "mongoose";
import { STATUS, STATUS_MAP } from "../consts.js";
import User from "./user.js";
const { Schema } = mongoose;

const betSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    matchedUser: [
      {
        type: Object,
        ref: "User",
      },
    ],
    game: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
    side: {
      type: String,
      required: "Choose side is required",
    },
    line: {
      type: Number,
      required: true,
    },
    isMatched: {
      type: Boolean,
      default: false,
    },
    isPartialMatched: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: STATUS,
      default: STATUS_MAP.PENDING,
    },
    amount: {
      type: Number,
      required: true,
    },
    partialAmount: {
      type: Number,
      default: 0,
    },
    lastDeltaAmount: {
      type: Number,
    },
    party: {
      type: Schema.Types.ObjectId,
      ref: "Party",
    },
  },
  {
    timestamps: true,
  }
);

betSchema.pre("save", async function (next) {
  const bet = this.toObject();
  const foundUser = await User.findById(bet.user);
  if (foundUser.currentAmount < bet.amount) {
    return next(Error("You do not have enough money to make this bet"));
  }
  next();
});

const Bet = mongoose.model("Bet", betSchema);
export default Bet;
