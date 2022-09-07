import { RETURN_STATUS } from "../consts.js";
import Notification from "../models/notification.js";

export const getAll = async (req, res, next) => {
  Notification.find({ userId: req.userId }).exec(function (err, data) {
    if (!err) {
      res.send(data);
    } else {
      res.json({
        status: RETURN_STATUS.FAIL,
        message: "Unknown error",
      });
    }
  });
};

export const getUnseen = async (req, res, next) => {
  try {
    const notifications = await Notification.find(
      { userID: req.userId },
      ["type", "message", "seen", "createdAt", "details"],
      { sort: { createdAt: -1 }, limit: 30 }
    );
    res.send({ notifications });
  } catch (err) {
    res.json({
      status: RETURN_STATUS.FAIL,
      message: "Unknown error",
    });
  }
};

export const markSeen = async (req, res, next) => {
  Notification.updateMany(
    { userID: req.userId, _id: { $in: req.body.notifications } },
    { seen: true },
    { multi: true },
    function (err) {
      if (!err) {
        res.send(req.body.notifications);
      } else {
        res.json({
          status: RETURN_STATUS.FAIL,
          message: "Unknown error",
        });
      }
    }
  );
};
