import getSecret from "./google-secret-manager.js";
import { createRequire } from 'module';
const require = createRequire(
    import.meta.url);
const dotenv = require('dotenv').config();
let loadedConfig = {};

async function load() {
    //console.log(process.env.MONGO_DB_URI);
    switch (process.env.NODE_ENV) {
        case "production":
            loadedConfig = {
                JWT_SECRET: await getSecret("JWT_SECRET"),
                MONGO_DB_URI: await getSecret("MONGO_DB_URI"),
                FACEBOOK_APP_SECRET: await getSecret("FACEBOOK_APP_SECRET"),
            };
            break;
        case "development":
            loadedConfig = {
                JWT_SECRET: process.env.JWT_SECRET,
                MONGO_DB_URI: process.env.MONGO_DB_URI,
                FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
            };
    }
    return Promise.resolve();
}

function get(keyName) {
    return keyName in loadedConfig ? loadedConfig[keyName] : undefined;
}

export default { load, get };