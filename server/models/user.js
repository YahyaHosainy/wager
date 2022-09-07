import mongoose from "mongoose";
import pkg from "uuidv4";

const { fromString } = pkg;

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: "Name is required",
    },
    bio: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: "Email is required",
      match: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}/g,
    },
    phone: {
      type: String,
      unique: true,
      trim: true,
    },
    age: {
      type: Number,
      trim: true,
      required: "Age is required",
    },
    emailVerify: {
      type: Boolean,
      default: false,
      select: false,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    identityProvider: {
      type: {
        id: String,
        token: String,
        provider: String,
      },
      select: false,
    },
    source: {
      type: String,
      default: null,
    },
    picture: {
      type: String,
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    winnings: {
      type: Number,
      default: 0,
    },
    token: {
      type: String,
      select: false,
    },
    isFirstEdit: {
      type: Boolean,
      default: false,
    },
    following: {
      type: [
        {
          user: {
            type: Schema.ObjectId,
            ref: "User",
          },
        },
      ],
    },
    followers: {
      type: [
        {
          user: {
            type: Schema.ObjectId,
            ref: "User",
          },
        },
      ],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});

UserSchema.virtual("displayName").get(function () {
  if ((this.source === null || this.source === "facebook") && this.isFirstEdit === false) {
    return this.name;
  } else {
    return this.username;
  }
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

UserSchema.statics.upsertFbUser = function (accessToken, refreshToken, profile, cb) {
  const that = this;

  return this.findOne(
    {
      "identityProvider.id": profile.id,
    },
    (err, user) => {
      // no user was found, lets create a new one
      if (!user) {
        const newUser = new that({
          name: profile.displayName,
          username: fromString(profile.displayName + getRandomInt(0, 99999999)),
          bio: null,
          email: profile.emails[0].value,
          emailVerify: true, // no need to verify if authed through FB
          picture: profile.photos[0].value,
          identityProvider: {
            id: profile.id,
            token: accessToken,
            provider: profile.provider,
          },
          source: profile.provider,
          age: 18, // TODO(tomarak): get this out of an additional dialog prompt
        });

        newUser.save((error, savedUser) => {
          if (error) {
            console.error(error);
          }

          return cb(error, savedUser);
        });
      } else {
        return cb(err, user);
      }
    }
  );
};

const User = mongoose.model("User", UserSchema);

export default User;
