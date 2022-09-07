import Notifications from "../models/notification.js";
import { logger } from "../config/winston.js";
import mongoose from "mongoose";

const createNotification = async(fields) => {
    await Notifications.create({...fields }, function(err, notification) {
        if (err) {
            logger.log("error", err);
        }
        logger.log("info", JSON.stringify(notification));
    });
};

const handleBets = (data) => {
    if (data.operationType === "insert") {
        let message = `We've successfully received your bet for $${data.fullDocument.amount} - ${data.fullDocument.side}`;
        let associatedType = "ticket";
        if (data.fullDocument.isMatched) {
            message = `${message}, and your bet is fully filled.`;
            associatedType = "match";
        } else if (data.fullDocument.isPartialMatched && data.fullDocument.partialAmount > 0) {
            message = `${message}, and your bet was partially filled to $${data.fullDocument.partialAmount}.`;
            associatedType = "match";
        }
        createNotification({
            message,
            userID: data.fullDocument.user,
            type: "BET_CREATED",
            details: {
                associatedID: data.fullDocument._id,
                associatedType,
            },
            token: data.documentKey._id + data.clusterTime.getHighBits(),
        });
    } else if (data.operationType === "update") {
        if ("isMatched" in data.updateDescription.updatedFields) {
            let message = `Your bet $${data.fullDocument.amount} - ${data.fullDocument.side} is now fully filled.`;
            createNotification({
                message,
                userID: data.fullDocument.user,
                type: "BET_UPDATED_MATCHED",
                details: {
                    associatedID: data.fullDocument._id,
                    associatedType: "match",
                },
                token: data.documentKey._id + data.clusterTime.getHighBits(),
            });
        } else if (
            "matchedUser" in data.updateDescription.updatedFields &&
            data.updateDescription.updatedFields.partialAmount > 0
        ) {
            const message = `We found a partial match for your bet $${data.fullDocument.amount} - ${data.fullDocument.side}, and your bet is now partially filled to $${data.updateDescription.updatedFields.partialAmount}.`;
            createNotification({
                message,
                userID: data.fullDocument.user,
                type: "BET_UPDATED_PARTIAL",
                details: {
                    associatedID: data.fullDocument._id,
                    associatedType: "match",
                },
                token: data.documentKey._id + data.clusterTime.getHighBits(),
            });
        }
    }
};

const handleBilling = (data) => {
    if (data.operationType === "insert") {
        const message = `We've successfully received your deposit for $${data.fullDocument.paypal.amount}`;
        createNotification({
            message,
            userID: data.fullDocument.userID,
            type: "BILLING_CREATED_DEPOSIT_RECEIVED",
            token: data.documentKey._id + data.clusterTime.getHighBits(),
        });
    }
};

const handleUser = (data) => {
    if (data.operationType === "update") {
        if ("username" in data.updateDescription.updatedFields) {
            createNotification({
                message: `You have updated your username to ${data.updateDescription.updatedFields.username}`,
                userID: data.fullDocument._id,
                type: "USER_PROFILE_UPDATE",
                token: data.documentKey._id + data.clusterTime.getHighBits(),
            });
        }
    }
};

export const setUpNotificationHook = () => {
    const pipeline = [{
        $match: {
            $and: [{
                $or: [{ operationType: "insert" }, { operationType: "update" }],
                $or: [{ "ns.coll": "bets" }, { "ns.coll": "billing" }, { "ns.coll": "user" }],
            }, ],
        },
    }, ];
    // mongoose.connection.watch(pipeline, { fullDocument: "updateLookup" }).on("change", (data) => {
    //   switch (data.ns.coll) {
    //     case "bets":
    //       handleBets(data);
    //       break;
    //     case "billing":
    //       handleBilling(data);
    //       break;
    //     case "user":
    //       handleUser(data);
    //       break;
    //     default:
    //       break;
    //   }
    // });
};