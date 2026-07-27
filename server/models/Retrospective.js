const mongoose = require("mongoose");

const retrospectiveSchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    score: { type: Number, min: 0, max: 100, required: true },
    impactScore: { type: Number, min: 1, max: 5, required: true },
    status: {
      type: String,
      enum: ["draft", "review", "published", "unpublished"],
      default: "draft",
    },
    unpublishReason: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Retrospective", retrospectiveSchema);
