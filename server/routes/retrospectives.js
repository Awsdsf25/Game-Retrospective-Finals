const express = require("express");
const router = express.Router();
const Retrospective = require("../models/Retrospective");
const Game = require("../models/Game");
const auth = require("../middleware/auth");

// 1. CREATE OR UPDATE RETROSPECTIVE (Allows one per game, per user)
router.post("/", auth, async (req, res) => {
  try {
    const {
      gameId,
      title,
      content,
      score,
      impactScore,
      status,
      gameTitle,
      gameCoverImage,
      gameReleaseDate,
    } = req.body;

    if (!gameId || !gameTitle) {
      return res.status(400).json({
        message: "Game ID and game title are required to save a retrospective.",
      });
    }

    const scoreValue = Number(score);
    const impactValue = Number(impactScore);

    if (Number.isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
      return res
        .status(400)
        .json({ message: "Score must be a number between 0 and 100." });
    }

    if (Number.isNaN(impactValue) || impactValue < 1 || impactValue > 5) {
      return res
        .status(400)
        .json({ message: "Impact score must be between 1 and 5." });
    }

    // Identify the specific retrospective by User AND Game
    const searchCriteria = {
      gameId: String(gameId),
      userId: req.user.id,
    };

    const updateFields = {
      gameTitle,
      gameCoverImage: gameCoverImage || "",
      gameReleaseDate: gameReleaseDate ? new Date(gameReleaseDate) : undefined,
      title: title || `${gameTitle} Retrospective`,
      content: content || "Draft content...", // Fallback in case frontend sends empty content
      score: scoreValue,
      impactScore: impactValue,
      status: status || "published",
    };

    const retrospective = await Retrospective.findOneAndUpdate(
      searchCriteria,
      { $set: updateFields },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    );

    res.status(200).json(retrospective);
  } catch (err) {
    console.error("🚨 BACKEND SAVE ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 1b. GET MY RETROSPECTIVES (Updated to return all retros for the user)
router.get("/my", auth, async (req, res) => {
  try {
    const retros = await Retrospective.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    if (!retros || retros.length === 0)
      return res.status(404).json({ message: "No retrospectives found." });
    res.json(retros);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET RETROSPECTIVES (Supports filter queries: ?status=published & ?userId=xxx & ?gameId=xxx)
router.get("/", async (req, res) => {
  try {
    const { status, userId, gameId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (gameId) filter.gameId = String(gameId);

    const retrospectives = await Retrospective.find(filter)
      .populate("userId", "username email userType")
      .sort({ createdAt: -1 });

    res.json(retrospectives);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. PANEL: BEST RETROSPECTIVES (Published, sorted by score descending)
router.get("/panels/best", async (req, res) => {
  try {
    const topRetros = await Retrospective.find({ status: "published" })
      .populate("userId", "username")
      .sort({ score: -1 })
      .limit(10);

    res.json(topRetros);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. GET SINGLE RETROSPECTIVE BY ID
router.get("/:id", async (req, res) => {
  try {
    const retro = await Retrospective.findById(req.params.id).populate(
      "userId",
      "username email userType",
    );

    if (!retro)
      return res.status(404).json({ message: "Retrospective not found." });
    res.json(retro);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. UPDATE RETROSPECTIVE & STATUS WORKFLOW (draft -> review -> published / unpublished)
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, content, score, impactScore, status, unpublishReason } =
      req.body;
    let retro = await Retrospective.findById(req.params.id);

    if (!retro)
      return res.status(404).json({ message: "Retrospective not found." });

    // Permissions check: Author owns it OR User is Admin
    if (
      retro.userId.toString() !== req.user.id &&
      req.user.userType !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized action." });
    }

    // Enforce reason column if status set to 'unpublished'
    if (
      status === "unpublished" &&
      !unpublishReason &&
      !retro.unpublishReason
    ) {
      return res.status(400).json({
        message: "Reason is required when unpublishing a retrospective.",
      });
    }

    if (title !== undefined) retro.title = title;
    if (content !== undefined) retro.content = content;
    if (score !== undefined) retro.score = score;
    if (impactScore !== undefined) retro.impactScore = impactScore;
    if (status !== undefined) retro.status = status;
    if (unpublishReason !== undefined) retro.unpublishReason = unpublishReason;

    await retro.save();
    res.json(retro);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. DELETE RETROSPECTIVE
router.delete("/:id", auth, async (req, res) => {
  try {
    const retro = await Retrospective.findById(req.params.id);

    if (!retro)
      return res.status(404).json({ message: "Retrospective not found." });

    if (
      retro.userId.toString() !== req.user.id &&
      req.user.userType !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized action." });
    }

    await retro.deleteOne();
    res.json({ message: "Retrospective deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
