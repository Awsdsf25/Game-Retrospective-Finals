const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    bio: { type: String, trim: true, default: "" },
    imageUrl: { type: String, trim: true, default: "" },
    userType: {
      type: String,
      enum: ["author", "admin"],
      default: "author",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
