import mongoose from "mongoose";
const { Schema } = mongoose;

const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    abbreviation: {
      type: String,
    },
    city: {
      type: String,
    },
    mascot: {
      type: String,
    },
    logoUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

teamSchema.virtual("fullName").get(function () {
  let lastName = this.mascot ? " " + this.mascot : "";
  return this.firstname + lastName;
});

const Team = mongoose.model("Team", teamSchema);
export default Team;
