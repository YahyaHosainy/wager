import mongoose from "mongoose";
const { Schema } = mongoose;

const BillingSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    paypal: {
      type: {
        orderID: String,
        payerID: String,
        status: String,
        amount: String,
        currencyCode: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Billing = mongoose.model("Billing", BillingSchema);

export default Billing;
