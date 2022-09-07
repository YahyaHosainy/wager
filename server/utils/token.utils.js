import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const createToken = function (req) {
  return jwt.sign({ user: req.user.id }, config.get("JWT_SECRET"), {
    expiresIn: "2d",
  });
};

export const generateToken = (req, _, next) => {
  req.token = createToken(req);

  return next();
};

export const sendToken = (req, res) => {
  res.setHeader("x-access-token", req.token);

  return res.status(200).send({ auth: true, token: req.token, user: req.user });
};

export function verifyToken(req, res, next) {
  const token = req.headers["x-access-token"];
  if (!token) return res.status(403).send({ auth: false, message: "No token provided." });
  try {
    const verified = jwt.verify(token, config.get("JWT_SECRET"));
    req.userId = verified.user;
  } catch (err) {
    console.error(err);

    return res.status(403).send({ auth: false, message: "Failed to authenticate token." });
  }
  if (req.hasOwnProperty("userID") && req.userId !== req.userID) {
    return res.status(403).send({ auth: false, message: "Action not authorized." });
  }
  next();
}
