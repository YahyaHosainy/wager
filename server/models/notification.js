import mongoose from "mongoose";
const { Schema } = mongoose;

const NotificationsSchema = new Schema(
  {
    type: {
      type: String,
      required: "Type is required",
    },
    message: {
      type: String,
      required: "Notifications can not be null",
    },
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      unique: true,
      required: true,
    },
    details: {
      type: {
        associatedID: Schema.Types.ObjectId,
        associatedType: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Notifications = mongoose.model("Notifications", NotificationsSchema);

export default Notifications;
