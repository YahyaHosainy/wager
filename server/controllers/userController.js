import mongoose from "mongoose";
import User from "../models/user.js";
import Bet from "../models/bet.js";
import bcrypt from "bcrypt";
const saltRounds = 10;
import { RETURN_STATUS, STATUS_MAP } from "../consts.js";
import nodemailer from "nodemailer";
import sgTransport from "nodemailer-sendgrid-transport";
import { deleteFile } from "./uploadController.js";
import { GCP_PROFILE_FOLDER } from "../config/google-cloud-storage.js";
import jwt from "jsonwebtoken";
import { findGames } from "./gameController.js";
import { logger } from "../config/winston.js";
import config from "../config/config.js";

export const getBudget = (req, res) => {
    User.findById(req.userId)
        .select("currentAmount")
        .exec(async(err, profile) => {
            if (err)
                return res.status(500).json({
                    status: RETURN_STATUS.FAIL,
                    message: "Unknown error",
                });

            return res.status(200).json({
                profile,
            });
        });
};

export const getProfile = async(req, res) => {
    const userId = req.params.id === req.userId ? req.userId : req.params.id;
    const betStatusCount = await Bet.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: "$status",
                totalAmount: {
                    $sum: {
                        $cond: [{ $eq: ["$isMatched", true] }, "$amount", "$partialAmount"],
                    },
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    const user = await User.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(userId) } },
        {
            $project: {
                name: 1,
                isFirstEdit: 1,
                username: 1,
                picture: 1,
                currentAmount: 1,
                winnings: 1,
                source: 1,
                bio: 1,
                createdAt: 1,
            },
        },
        {
            $lookup: {
                from: "bets",
                let: { bettorId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$user", "$$bettorId"] } } },
                    { $sort: { createdAt: -1 } },
                    {
                        $lookup: {
                            from: "games",
                            let: { gameId: "$game" },
                            pipeline: [
                                { $match: { $expr: { $eq: ["$_id", "$$gameId"] } } },
                                { $project: { eventDate: 1, favorite: 1, underdog: 1 } },
                            ],
                            as: "game",
                        },
                    },
                ],
                as: "bets",
            },
        },
    ]);

    return res.status(200).json({
        betStatusCount,
        user: user[0],
    });
};

export const getActiveBets = async(req, res) => {
    const foundGames = await findGames(req.params.date);
    const gameIdArray = foundGames.map((game) => game._id);
    const activeBets = await Bet.aggregate(
        [{
                $match: {
                    $and: [{ user: mongoose.Types.ObjectId(req.userId) }, { game: { $in: gameIdArray } }],
                },
            },
            {
                $lookup: {
                    from: "games",
                    let: { gameId: "$game" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$gameId"] } } },
                        { $project: { favorite: 1, underdog: 1 } },
                    ],
                    as: "game",
                },
            },
            { $sort: { createdAt: -1 } },
        ],
        (err, resp) => {
            if (err) return err;
            return resp;
        }
    );

    const todaysBets = activeBets.filter((bet) => bet.game !== null);
    return res.status(200).json({
        todaysBets,
    });
};

export const saveProfile = async(req, res) => {
    const url = res.locals.publicUrl;
    const { bio, username } = req.body;
    const user = await User.findById(req.userId);

    if (
        user.picture !== undefined &&
        url !== undefined &&
        url !== user.picture &&
        user.picture.includes(process.env.GCLOUD_STORAGE_BUCKET)
    ) {
        const parsedUrl = user.picture.split("/");
        const previousFileName = parsedUrl[parsedUrl.length - 1];
        deleteFile(`${GCP_PROFILE_FOLDER}/${previousFileName}`);
    }

    let filename = "noimage";
    let data = {
        bio,
        username,
        isFirstEdit: true,
    };

    if (url) {
        filename = url;
        data = {
            ...data,
            picture: url,
        };
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.userId, {
            $set: data,
        }, { returnOriginal: false },
        (err) => {
            if (err)
                return res.status(422).json({
                    status: RETURN_STATUS.FAIL,
                    message: "Unknown error",
                });
        }
    );

    return res.status(200).json({
        message: "Profile update success",
        user: updatedUser,
        url: filename,
    });
};

export const createAccount = async(req, res) => {
    const token = bcrypt.hashSync(req.body.email, saltRounds);

    const phone = req.body.phone.replace(/[^0-9]/g, "");

    if (phone && phone.length !== 10)
        return res.status(200).json({
            status: RETURN_STATUS.FAIL,
            message: "Enter valid phone number",
        });

    const user = new User({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        age: req.body.age,
        password: bcrypt.hashSync(req.body.password, saltRounds),
        bio: null,
        picture: "",
        source: "manual",
        token,
    });

    const foundUser = await User.find({ username: user.username });
    if (foundUser.length)
        return res.status(200).json({
            status: RETURN_STATUS.FAIL,
            message: "Username already exists",
        });

    const foundEmail = await User.find({ email: user.email });
    if (foundEmail.length)
        return res.status(200).json({
            status: RETURN_STATUS.FAIL,
            message: "Email already exists",
        });

    if (user.phone) {
        const foundPhone = await User.find({ phone: user.phone });
        if (foundPhone.length)
            return res.status(200).json({
                status: RETURN_STATUS.FAIL,
                message: "Phone number already exists",
            });
    }

    try {
        const newUser = await user.save();

        console.log(process.env.WAGER_EMAIL);

        const options = {
            auth: {
                user: "apikey",
                api_key: process.env.SENDGRID_API_KEY,
            },
            // auth: {
            //     user: process.env.WAGER_EMAIL,
            //     pass: process.env.WAGER_EMAIL_PASSWORD,
            // },
        };

        const client = nodemailer.createTransport(sgTransport(options));

        const link = "http://" +
            req.headers.host + `/confirm/${encodeURIComponent(
      req.body.email
    )}/${encodeURIComponent(token)}`;

        const email = {
            from: process.env.WAGER_EMAIL,
            to: req.body.email,
            subject: "Wager Games - Confirm Email",
            html: `<h1>Account Created</h1><p>Your account successfully created. Please click the link below to verify your email.</p><a href="${link}">Verify Account</a>`,
        };

        client.sendMail(email, (error) => {
            if (error) {
                logger.log("error", error);
            } else {
                console.log("Mail sent successfully");
            }
        });

        return res.status(200).json({
            status: RETURN_STATUS.SUCCESS,
            message: "Your account has been created. Please check your email to verify your account to login",
            result: newUser,
        });
    } catch (err) {
        logger.log("error", "error occurred while creating new user:" + err);
    }
};

export const loginAccount = (req, res) => {
    User.find({
            $or: [
                { email: req.body.usernameOrEmailOrPhone },
                { username: req.body.usernameOrEmailOrPhone },
                { phone: req.body.usernameOrEmailOrPhone },
            ],
        },
        "password emailVerify name bio username currentAmount winnings picture email",
        (err, foundUser) => {
            if (err)
                res.status(500).json({
                    status: RETURN_STATUS.FAIL,
                    message: "Unknown error",
                });
            if (foundUser.length) {
                const { emailVerify, password, ...user } = foundUser[0];
                if (emailVerify) {
                    if (bcrypt.compareSync(req.body.password, password)) {
                        const token = jwt.sign({ user: user._id }, config.get("JWT_SECRET"), {
                            expiresIn: "2d",
                        });
                        res.token = token;
                        res.result = user;

                        return res.status(200).send({ auth: true, token, foundUser: user });
                    }

                    return res.status(200).json({
                        status: RETURN_STATUS.FAIL,
                        message: "Incorrect username/password combination",
                    });
                }

                return res.status(200).json({
                    status: RETURN_STATUS.FAIL,
                    message: "Uh oh! You haven't verified this email yet, please check your email",
                });
            }

            return res.status(200).json({
                status: RETURN_STATUS.FAIL,
                message: "Incorrect username/password combination",
            });
        }
    ).lean(true);
};

export const forgotAccount = (req, res) => {
    const { email } = req.body;

    User.find({ email }, (err, check) => {
        if (err)
            res.status(422).json({
                status: RETURN_STATUS.FAIL,
                message: "Unknown error",
            });

        if (check.length) {
            const token = bcrypt.hashSync(email, saltRounds);

            User.findOneAndUpdate({ email }, { $set: { token } }, { new: true }, (err) => {
                if (err)
                    res.status(422).json({
                        status: RETURN_STATUS.FAIL,
                        message: "Unknown error",
                    });

                const options = {
                    auth: {
                        user: "apikey",
                        api_key: process.env.SENDGRID_API_KEY,
                    },
                };

                const client = nodemailer.createTransport(sgTransport(options));

                const link = `https://www.wager.games/reset/${encodeURIComponent(token)}`;

                const email = {
                    from: process.env.WAGER_EMAIL,
                    to: req.body.email,
                    subject: "Wager Games - Forgot Password",
                    html: `<h1>Forgot Password</h1><p>Please click the link below to reset your password.</p><a href="${link}">Reset Password</a>`,
                };

                client.sendMail(email, (error) => {
                    if (error) {
                        logger.log("error", error);

                        return res.status(200).json({
                            status: RETURN_STATUS.FAIL,
                            message: "Something went wrong. Try again.",
                        });
                    }

                    return res.status(200).json({
                        status: RETURN_STATUS.SUCCESS,
                        message: "We have sent password reset instructions to your email.",
                    });
                });
            });
        } else
            return res.status(200).json({
                status: RETURN_STATUS.FAIL,
                message: "Email not found. Try to register",
            });
    });
};

// SENDGRID is linked to wager.games in prod.
// This func does not get called in development
// TODO: create tests/make it work in development
export const confirmAccount = (req, res) => {
    User.findOneAndUpdate({
            email: decodeURIComponent(req.body.email),
            token: decodeURIComponent(req.body.token),
        }, {
            $set: {
                emailVerify: true,
            },
        }, { new: true },
        (err, result) => {
            if (err)
                return res.status(422).json({
                    status: RETURN_STATUS.FAIL,
                    message: "Unknown error",
                });

            if (result) {
                const token = jwt.sign({ user: result._id }, config.get("JWT_SECRET"), {
                    expiresIn: "2d",
                });

                return res.status(200).json({
                    status: "success",
                    message: "Email verification success.",
                    user: result,
                    auth: true,
                    token,
                });
            }

            return res.status(200).json({
                status: RETURN_STATUS.FAIL,
                message: "An error occurred when verifying your account. Please try again",
            });
        }
    );
};

export const resetAccount = (req, res) => {
    User.findOneAndUpdate({ token: decodeURIComponent(req.body.token) }, {
            $set: {
                password: bcrypt.hashSync(req.body.password, saltRounds),
                token: null,
            },
        }, { new: true },
        (err, result) => {
            if (err)
                return res.status(422).json({
                    status: RETURN_STATUS.FAIL,
                    message: "Unknown error",
                });

            if (result) {
                const token = jwt.sign({ user: result._id }, config.get("JWT_SECRET"), {
                    expiresIn: "2d",
                });

                return res.status(200).json({
                    status: RETURN_STATUS.SUCCESS,
                    message: "Password reset success.",
                    user: result,
                    auth: true,
                    token,
                });
            }

            return res.status(200).json({
                status: RETURN_STATUS.FAIL,
                message: "An error occurred when resetting your password. Please reset your password and try again",
            });
        }
    );
};

export const getFollow = (req, res) => {
    const userId = req.params.id === req.userId ? req.userId : req.params.id;

    const query = User.findById(userId).select("following followers");

    query.exec((err, result) => {
        if (err)
            return res.status(422).json({
                status: RETURN_STATUS.FAIL,
                message: "Unknown error",
            });

        return res.status(200).json(result);
    });
};

export const isFollowing = (userId, followingUserId) =>
    User.findById(userId)
    .select("following")
    .then((user) => {
        logger.log("info", user.following);
        if (
            user.following.filter((following) => following._id.toString() === followingUserId).length >
            0
        ) {
            return true;
        }

        return false;
    });

export const follow = async(userId, followingUserId) => {
    try {
        const isFollowingValidate = await isFollowing(userId, followingUserId);

        if (isFollowingValidate) {
            return "Already following";
        }
        User.findById(userId)
            .select("following")
            .then((user) => {
                user.following.push(followingUserId);
                user.save();
            });
        // add user followed by originalUser
        User.findById(followingUserId)
            .select("followers")
            .then((followedUser) => {
                followedUser.followers.push(userId);
                followedUser.save();
            });

        return { following: true };
    } catch (error) {
        logger.log("error", "Error occured in follow func:" + error);

        return { following: false };
    }
};

export const unfollow = async(userId, followingUserId) => {
    try {
        const isFollowingValidate = await isFollowing(userId, followingUserId);

        if (!isFollowingValidate) {
            return "Can't unfollow someone you're not already following";
        }
        // remove the user you want to unfollow to originalUser
        User.findById(userId)
            .select("following")
            .then((originalUser) => {
                originalUser.following = originalUser.following.filter(
                    (followers) => followers._id.toString() !== followingUserId
                );
                originalUser.save();
            });
        // remove user followed by originalUser
        User.findById(followingUserId)
            .select("followers")
            .then((followedUser) => {
                followedUser.followers = followedUser.followers.filter(
                    (followers) => followers._id.toString() !== userId
                );
                followedUser.save();
            });

        return { unfollowing: true };
    } catch (error) {
        logger.log("error", "Error occured in unfollow func:" + error);

        return { unfollowing: false };
    }
};

export const getFollowList = async(userId, type) => {
    const foundUser = await User.findById(userId).select(type);
    const usersIds =
        type === "following" ?
        foundUser.following.map((user) => user._id) :
        foundUser.followers.map((user) => user._id);

    return User.find({ _id: { $in: usersIds } }).select("name username picture source isFirstEdit");
};

export const followedBets = async(user) => {
    const foundUser = await User.findById(user).select("following");
    const followingUsersIds = foundUser.following.map((user) => user._id);

    return Bet.aggregate(
        [{
                $match: {
                    user: { $in: followingUsersIds },
                    status: STATUS_MAP.PENDING,
                },
            },
            {
                $lookup: {
                    from: "users",
                    let: { betUserId: "$user" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$betUserId"] } } },
                        {
                            $project: {
                                username: 1,
                                name: 1,
                                picture: 1,
                                isFirstEdit: 1,
                            },
                        },
                    ],
                    as: "user",
                },
            },
            { $sort: { createdAt: -1 } },
        ],
        (err, resp) => resp
    );
};