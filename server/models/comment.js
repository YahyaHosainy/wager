import mongoose from "mongoose";
const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    message: {
      type: String,
      required: "Comments can not be null",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    game: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", CommentSchema);

export default Comment;
