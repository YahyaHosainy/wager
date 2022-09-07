import mongoose from "mongoose";
const { Schema } = mongoose;

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    abbreviation: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
    },
    teams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Organization = mongoose.model("Organization", organizationSchema);
export default Organization;
