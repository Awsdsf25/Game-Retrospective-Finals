const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Game = require("../models/Game");
const auth = require("../middleware/auth");

const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
const IGDB_CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;
const IGDB_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_GAMES_URL = "https://api.igdb.com/v4/games";

let cachedIgdbToken = null;
let cachedIgdbTokenExpireAt = 0;

const getIgdbToken = async () => {
  if (Date.now() < cachedIgdbTokenExpireAt && cachedIgdbToken) {
    return cachedIgdbToken;
  }

  if (!IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET) {
    throw new Error("IGDB client credentials are not configured.");
  }

  const body = new URLSearchParams({
    client_id: IGDB_CLIENT_ID,
    client_secret: IGDB_CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  const response = await fetch(IGDB_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `IGDB token request failed: ${response.status} ${errorText}`,
    );
  }

  const data = await response.json();
  cachedIgdbToken = data.access_token;
  cachedIgdbTokenExpireAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedIgdbToken;
};

const fetchIgdbGames = async () => {
  const token = await getIgdbToken();
  const requestBody = `fields name,summary,first_release_date,genres.name,cover.url; where first_release_date != null; sort first_release_date desc; limit 20;`;

  const response = await fetch(IGDB_GAMES_URL, {
    method: "POST",
    headers: {
      "Client-ID": IGDB_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: requestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `IGDB games request failed: ${response.status} ${errorText}`,
    );
  }

  const results = await response.json();

  return results.map((game) => ({
    id: String(game.id),
    title: game.name || "Untitled",
    releaseDate: game.first_release_date
      ? new Date(game.first_release_date * 1000).toISOString()
      : null,
    coverImage: game.cover?.url
      ? game.cover.url.startsWith("//")
        ? `https:${game.cover.url}`
        : game.cover.url
      : "",
    genre: Array.isArray(game.genres)
      ? game.genres.map((genre) => genre.name).filter(Boolean)
      : [],
    description: game.summary || "",
  }));
};

const fetchIgdbGameById = async (gameId) => {
  const token = await getIgdbToken();
  const requestBody = `fields name,summary,first_release_date,genres.name,cover.url; where id = ${gameId};`;

  const response = await fetch(IGDB_GAMES_URL, {
    method: "POST",
    headers: {
      "Client-ID": IGDB_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: requestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `IGDB game detail request failed: ${response.status} ${errorText}`,
    );
  }

  const [game] = await response.json();
  if (!game) {
    return null;
  }

  return {
    id: String(game.id),
    title: game.name || "Untitled",
    releaseDate: game.first_release_date
      ? new Date(game.first_release_date * 1000).toISOString()
      : null,
    coverImage: game.cover?.url
      ? game.cover.url.startsWith("//")
        ? `https:${game.cover.url}`
        : game.cover.url
      : "",
    genre: Array.isArray(game.genres)
      ? game.genres.map((genre) => genre.name).filter(Boolean)
      : [],
    description: game.summary || "",
  };
};

// 1. CREATE A GAME
router.post("/", auth, async (req, res) => {
  try {
    const { title, releaseDate, coverImage, genre, description } = req.body;

    const game = new Game({
      title,
      releaseDate,
      coverImage,
      genre,
      description,
    });

    await game.save();
    res.status(201).json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET ALL GAMES
router.get("/", async (req, res) => {
  try {
    if (IGDB_CLIENT_ID && IGDB_CLIENT_SECRET) {
      try {
        const games = await fetchIgdbGames();
        return res.json(games);
      } catch (igdbError) {
        console.error(
          "IGDB request failed, falling back to local DB:",
          igdbError,
        );
      }
    }

    const games = await Game.find().sort({ releaseDate: -1 });
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. GET GAMES ELIGIBLE FOR RETROSPECTIVE (>= 5 Years Old)
router.get("/eligible", async (req, res) => {
  try {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    const eligibleGames = await Game.find({
      releaseDate: { $lte: fiveYearsAgo },
    }).sort({ releaseDate: -1 });
    res.json(eligibleGames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. PANEL: NEW RELEASES (Released within the last 1 year up to today)
router.get("/panels/new-releases", async (req, res) => {
  try {
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const games = await Game.find({
      releaseDate: { $gte: oneYearAgo, $lte: now },
    }).sort({ releaseDate: -1 });

    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. PANEL: UPCOMING RELEASES (Release date is in the future)
router.get("/panels/upcoming", async (req, res) => {
  try {
    const now = new Date();
    const games = await Game.find({ releaseDate: { $gt: now } }).sort({
      releaseDate: 1,
    });
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. GET SINGLE GAME BY ID
router.get("/:id", async (req, res) => {
  try {
    let game = null;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      game = await Game.findById(req.params.id);
    }

    if (!game && IGDB_CLIENT_ID && IGDB_CLIENT_SECRET) {
      try {
        game = await fetchIgdbGameById(req.params.id);
      } catch (igdbError) {
        console.error("IGDB detail request failed:", igdbError);
      }
    }

    if (!game) return res.status(404).json({ message: "Game not found." });

    res.json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. UPDATE GAME DETAILS
router.put("/:id", auth, async (req, res) => {
  try {
    const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedGame);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 8. DELETE GAME
router.delete("/:id", auth, async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: "Game deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
