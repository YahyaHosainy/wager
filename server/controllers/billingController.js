import mongoose from "mongoose";
import nodemailer from "nodemailer";
import sgTransport from "nodemailer-sendgrid-transport";
import { logger } from "../config/winston.js";
import { RETURN_STATUS } from "../consts.js";
import Billing from "../models/billing.js";
import User from "../models/user.js";

export const upsertPayment = (req, res) => {
  const { userID, paypal } = req.body;
  const newPayment = new Billing({
    userID,
    paypal: {
      orderID: paypal.orderID,
      payerID: paypal.payerID,
      status: paypal.status,
      amount: paypal.amount,
      currency_code: paypal.currency_code,
    },
  });
  newPayment.save((error) => {
    if (error) {
      logger.log("error", "you have an error: " + error);
    }

    User.findByIdAndUpdate(
      userID,
      {
        $inc: { currentAmount: parseFloat(paypal.amount) },
      },
      { returnOriginal: false },
      (err) => {
        if (err)
          return res.status(422).json({
            status: RETURN_STATUS.FAIL,
            message: "Unknown error",
          });
      }
    );

    return res.send("Successfully added to billings db");
  });
};

export const withdraw = (req, res) => {
  const options = {
    auth: {
      user: "apikey",
      api_key: process.env.SENDGRID_API_KEY,
    },
  };

  const client = nodemailer.createTransport(sgTransport(options));

  const email = {
    from: process.env.WAGER_EMAIL,
    to: process.env.WAGER_EMAIL,
    subject: "Wager Games - Withdrawal Request",
    html: `<h1>You have a new Withdrawal Request</h1><p><b>Paypal Email:</b> ${req.body.email}</p><p><b>Amount:</b> $${req.body.amount}</p>`,
  };

  client.sendMail(email, (error) => {
    if (error) {
      logger.log("error", error);
      res.status(500).json("failed");
    } else {
      logger.log("info", `Email sent: ${req.body.email}`);

      User.findByIdAndUpdate(
        req.body.user,
        {
          $inc: { currentAmount: -parseFloat(req.body.amount) },
        },
        { returnOriginal: false },
        (err, updatedUser) => {
          if (err)
            return res.status(422).json({
              status: RETURN_STATUS.FAIL,
              message: "Unknown error",
            });

          return res.status(200).json({
            message: "success",
            currentAmount: updatedUser.currentAmount,
          });
        }
      );
    }
  });
};

export const getBilling = (req, res) => {
  const user = req.userId;

  return Billing.aggregate(
    [{ $match: { userID: mongoose.Types.ObjectId(user) } }, { $sort: { createdAt: -1 } }],
    (err, list) => {
      res.status(200).json({ list });
    }
  );
};
