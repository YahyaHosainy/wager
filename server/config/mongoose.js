import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { logger } from "./winston.js";
import config from "./config.js";

export default function() {
    const uri = config.get("MONGO_DB_URI");
    console.log(uri);

    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
        poolSize: 6,
    };

    mongoose.connect(uri, options, (err) => {
        if (err) {
            logger.log("error", "MongoDB Atlas Connection error: " + err.message);
        } else {
            logger.log("info", "MongoDB Atlas Connected");
        }
    });
}