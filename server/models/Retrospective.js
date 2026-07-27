const mongoose = require("mongoose");

const retrospectiveSchema = new mongoose.Schema(
  {
    gameId: {
      type: String,
      required: true,
    },
    gameTitle: { type: String, required: true, trim: true },
    gameCoverImage: { type: String, default: "" },
    gameReleaseDate: { type: Date },
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

retrospectiveSchema.index({ gameId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Retrospective", retrospectiveSchema);
