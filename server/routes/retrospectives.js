const express = require("express");
const router = express.Router();
const Retrospective = require("../models/Retrospective");
const Game = require("../models/Game");
const auth = require("../middleware/auth");

// 1. CREATE RETROSPECTIVE (Draft Status - Checks 5-Year Rule)
router.post("/", auth, async (req, res) => {
  try {
    const { gameId, title, content, score, impactScore, status } = req.body;

    // Verify game existence
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    // ENFORCE 5-YEAR RULE
    if (!game.isEligibleForRetrospective()) {
      return res.status(400).json({
        message:
          "Ineligible: Retrospectives can only be created for games released at least 5 years ago.",
      });
    }

    const retrospective = new Retrospective({
      gameId,
      userId: req.user.id,
      title,
      content,
      score,
      impactScore,
      status: status || "draft",
    });

    await retrospective.save();
    res.status(201).json(retrospective);
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
    if (gameId) filter.gameId = gameId;

    const retrospectives = await Retrospective.find(filter)
      .populate("gameId", "title releaseDate coverImage")
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
      .populate("gameId", "title releaseDate coverImage")
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
    const retro = await Retrospective.findById(req.params.id)
      .populate("gameId")
      .populate("userId", "username email userType");

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
