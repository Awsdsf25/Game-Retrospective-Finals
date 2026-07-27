const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    releaseDate: { type: Date, required: true },
    coverImage: { type: String, default: "" },
    genre: [{ type: String }],
    description: { type: String, default: "" },
  },
  { timestamps: true },
);

// Helper method to check if the game is at least 5 years old
gameSchema.methods.isEligibleForRetrospective = function () {
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  return this.releaseDate <= fiveYearsAgo;
};

module.exports = mongoose.model("Game", gameSchema);
