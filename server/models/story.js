import mongoose from "mongoose";
const { Schema } = mongoose;

const StorySchema = new Schema(
  {
    media_type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    media_url: {
      type: String,
      required: true,
    },
    party: {
      type: Schema.Types.ObjectId,
      ref: "Party",
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    caption: {
      type: String,
    },
    order: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

StorySchema.path("media_url").validate((val) => {
  const urlRegex = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
  return urlRegex.test(val);
}, "Invalid URL.");

const Story = mongoose.model("Story", StorySchema);
export default Story;
