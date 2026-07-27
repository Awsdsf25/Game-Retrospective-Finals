import React, { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { getSampleGameById } from "../data/sampleGames";

const normalizeGame = (game, currentYear) => {
  if (!game) return null;

  const title = game.title || game.name || "Untitled Game";
  const description =
    game.description || game.summary || "No description available.";

  const rawReleaseDate =
    game.releaseDate ||
    (typeof game.first_release_date === "number"
      ? new Date(game.first_release_date * 1000).toISOString()
      : game.first_release_date || game.release_date || null);

  const releaseYear = rawReleaseDate
    ? new Date(rawReleaseDate).getFullYear()
    : game.releaseYear || currentYear;

  const coverImage =
    game.coverImage ||
    game.image ||
    (game.cover?.url
      ? game.cover.url.startsWith("//")
        ? `https:${game.cover.url}`
        : game.cover.url
      : "/images/persona_5_royal.jpg");

  const genres =
    Array.isArray(game.genre) && game.genre.length > 0
      ? game.genre
      : Array.isArray(game.genres)
        ? game.genres
            .map((item) => (item?.name ? item.name : item))
            .filter(Boolean)
        : [];

  const developer =
    game.developer || genres.length > 0
      ? genres.join(", ")
      : "Unknown developer";

  const tags =
    Array.isArray(game.tags) && game.tags.length > 0
      ? game.tags
      : genres.slice(0, 2);

  return {
    id: game._id || String(game.id || game.name || title),
    title,
    description,
    releaseYear: Number.isNaN(Number(releaseYear))
      ? currentYear
      : Number(releaseYear),
    coverImage,
    developer,
    tags: tags.length > 0 ? tags : ["Archive"],
    score: game.score || 0,
  };
};

const GameDetail = () => {
  const { id } = useParams();
  const { user, refreshRetrospectives } = useContext(AuthContext);
  const currentYear = new Date().getFullYear();

  const [fetchedGame, setFetchedGame] = useState(null);
  const [isLoadingGame, setIsLoadingGame] = useState(true);
  const [userScore, setUserScore] = useState("");
  const [impactScore, setImpactScore] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [myReview, setMyReview] = useState(null);
  const [showOtherRankings, setShowOtherRankings] = useState(false);
  const [retrospectives, setRetrospectives] = useState([]);
  const [isLoadingRetros, setIsLoadingRetros] = useState(true);
  const [saveMessage, setSaveMessage] = useState({ text: "", type: "" });

  const fallbackGame = getSampleGameById(id);
  const currentGame = normalizeGame(
    fetchedGame || fallbackGame,
    currentYear,
  ) || {
    title: "Untitled Game",
    description: "No description available.",
    releaseYear: currentYear,
    coverImage: "/images/persona_5_royal.jpg",
    developer: "Unknown",
    tags: ["Archive"],
    score: 0,
  };
  const isEligible = currentYear - currentGame.releaseYear >= 5;

  // 1. FETCH ALL RETROSPECTIVES (For global rankings & archive score)
  useEffect(() => {
    const fetchRetrospectives = async () => {
      setIsLoadingRetros(true);
      try {
        const response = await api.get(`/retrospectives?gameId=${id}`);
        setRetrospectives(response.data || []);
      } catch (err) {
        console.error("Failed to load retrospectives", err);
      } finally {
        setIsLoadingRetros(false);
      }
    };

    if (id) {
      fetchRetrospectives();
    }
  }, [id, refreshRetrospectives]);

  // 2. POPULATE USER'S FORM (Runs whenever user data or retrospectives finish loading)
  useEffect(() => {
    if (user && retrospectives.length > 0) {
      const currentUserId = user.id || user._id;

      const existing = retrospectives.find((retro) => {
        const retroUserId = retro.userId?._id || retro.userId;
        return String(retroUserId) === String(currentUserId);
      });

      if (existing) {
        setMyReview(existing);
        setUserScore(existing.score?.toString() || "");
        setImpactScore(existing.impactScore?.toString() || 5);
        setReviewText(existing.content || "");
      }
    }
  }, [user, retrospectives]);

  // 3. FETCH GAME DETAILS
  useEffect(() => {
    const fetchGameDetails = async () => {
      setIsLoadingGame(true);
      try {
        const response = await api.get(`/games/${id}`);
        setFetchedGame(response.data);
      } catch (err) {
        console.error("Failed to load game details", err);
      } finally {
        setIsLoadingGame(false);
      }
    };

    if (id) {
      fetchGameDetails();
    }
  }, [id]);

  const archiveScore = retrospectives.length
    ? Math.round(
        retrospectives.reduce(
          (sum, retro) => sum + Number(retro.score || 0),
          0,
        ) / retrospectives.length,
      )
    : 0;

  const otherUsersRankings = retrospectives
    .filter(
      (retro) => retro.userId?._id !== user?.id && retro.userId !== user?.id,
    )
    .map((retro) => ({
      username: retro.userId?.username || "Player",
      score: retro.score,
      impactScore: retro.impactScore,
    }));

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user || !userScore) return;

    const payload = {
      gameId: id,
      title: `${currentGame.title} Retrospective`,
      content: reviewText || "Rated without written commentary.",
      score: Number(userScore),
      impactScore: Number(impactScore),
      gameTitle: currentGame.title,
      gameCoverImage: currentGame.coverImage,
      gameReleaseDate: currentGame.releaseYear
        ? `${currentGame.releaseYear}-01-01`
        : null,
      status: "published",
    };

    try {
      setSaveMessage({ text: "", type: "" });
      let response;
      if (myReview && myReview._id) {
        response = await api.put(`/retrospectives/${myReview._id}`, payload);
      } else {
        response = await api.post("/retrospectives", payload);
      }
      const savedRetro = response.data;
      setMyReview(savedRetro);
      setRetrospectives((prev) => {
        const remaining = prev.filter((retro) => retro._id !== savedRetro._id);
        return [...remaining, savedRetro];
      });
      setShowOtherRankings(true);
      setSaveMessage({
        text: "Saved to archive successfully.",
        type: "success",
      });
      refreshRetrospectives();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to save retrospective. Please try again.";
      console.error("Failed to save retrospective", err);
      setSaveMessage({ text: message, type: "error" });
    }
  };

  const getScoreColor = (score) => {
    if (score === 0 || score === "NR") return "#37333d";
    if (score >= 90) return "#10B981";
    if (score >= 80) return "#F59E0B";
    return "#EF4444";
  };

  if (isLoadingGame && !fallbackGame) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.loadingFallback}>Loading game details...</div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <nav style={styles.navbar}>
        <div style={styles.navInner}>
          <Link to="/dashboard" style={styles.logo}>
            QuestLog
          </Link>
          <div style={{ display: "flex", gap: "24px" }}>
            <Link to="/dashboard" style={styles.navLink}>
              Discovery
            </Link>
            <Link to="/rankings" style={styles.navLink}>
              Rankings
            </Link>
          </div>
        </div>
      </nav>

      <main style={styles.mainContent}>
        <div style={styles.headerSection}>
          <div style={styles.coverContainer}>
            <img
              src={currentGame.coverImage}
              alt={currentGame.title}
              style={styles.coverImage}
            />
          </div>
          <div style={styles.headerInfo}>
            <div style={styles.tagContainer}>
              {currentGame.tags.map((tag) => (
                <span key={tag} style={styles.tag}>
                  {tag}
                </span>
              ))}
              <span style={styles.yearTag}>{currentGame.releaseYear}</span>
            </div>
            <h1 style={styles.title}>{currentGame.title}</h1>
            <p style={styles.developer}>
              Developed by{" "}
              <span style={{ color: "#e7e0ed" }}>{currentGame.developer}</span>
            </p>
            <p style={styles.description}>{currentGame.description}</p>
            <div style={styles.scoresRow}>
              <div style={styles.scoreBox}>
                <span style={styles.scoreLabel}>ARCHIVE SCORE</span>
                <div
                  style={{
                    ...styles.scoreValue,
                    backgroundColor: getScoreColor(archiveScore),
                    color: "#15121b",
                  }}
                >
                  {archiveScore || "NR"}
                </div>
              </div>
              <div style={styles.scoreBox}>
                <span style={styles.scoreLabel}>MY RANKING</span>
                <div
                  style={{
                    ...styles.scoreValue,
                    backgroundColor: getScoreColor(
                      myReview ? myReview.score : 0,
                    ),
                    color: myReview ? "#15121b" : "#e7e0ed",
                  }}
                >
                  {myReview ? myReview.score : "NR"}
                </div>
              </div>
              <div
                style={{
                  ...styles.eligibilityBanner,
                  backgroundColor: isEligible
                    ? "rgba(16, 185, 129, 0.1)"
                    : "rgba(239, 68, 68, 0.1)",
                  color: isEligible ? "#4edea3" : "#ffb4ab",
                  border: `1px solid ${isEligible ? "rgba(78, 222, 163, 0.3)" : "rgba(255, 180, 171, 0.3)"}`,
                }}
              >
                <strong>
                  {isEligible
                    ? "Eligible for Retrospective"
                    : "Retrospective Locked"}
                </strong>
                <span style={styles.eligibilitySubtitle}>
                  {isEligible
                    ? "This title meets the 5-year threshold."
                    : "Not yet eligible."}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowOtherRankings(!showOtherRankings)}
              style={styles.seeRankingsBtn}
            >
              {showOtherRankings
                ? "Hide Full Rankings ↑"
                : "See Full Rankings ↓"}
            </button>
          </div>
        </div>

        {myReview && (
          <section style={styles.reviewSummaryCard}>
            <h2 style={styles.sectionTitle}>Your Saved Review</h2>
            <p style={styles.reviewSummaryText}>{myReview.content}</p>
            <div style={styles.reviewSummaryFooter}>
              <span>Score: {myReview.score}/100</span>
              <span>Impact: {myReview.impactScore}/5</span>
            </div>
          </section>
        )}

        {showOtherRankings && (
          <div style={styles.otherRankingsContainer}>
            <h3 style={styles.otherRankingsTitle}>
              Global Player Rankings for {currentGame.title}
            </h3>
            {isLoadingRetros ? (
              <p style={styles.loadingText}>Loading retrospectives...</p>
            ) : otherUsersRankings.length === 0 ? (
              <p style={styles.loadingText}>
                No other player rankings available yet.
              </p>
            ) : (
              otherUsersRankings.map((user, idx) => (
                <div key={idx} style={styles.rankingItem}>
                  <span style={{ fontWeight: 600, color: "#e7e0ed" }}>
                    {user.username}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        ...styles.miniScoreBadge,
                        backgroundColor: getScoreColor(user.score),
                      }}
                    >
                      {user.score}
                    </span>
                    <span style={styles.miniImpactBadge}>
                      Impact: {user.impactScore}/5
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            {myReview ? "Your Logged Retrospective" : "Log Your Retrospective"}
          </h2>
          <form onSubmit={handleSubmitReview} style={styles.formCard}>
            <div style={styles.formRow}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Your Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  placeholder="e.g. 92"
                  value={userScore}
                  onChange={(e) => setUserScore(e.target.value)}
                  style={styles.inputBox}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Impact Score (1 - 5)</label>
                <select
                  value={impactScore}
                  onChange={(e) => setImpactScore(e.target.value)}
                  style={styles.inputBox}
                >
                  <option value="5">5 - Masterpiece</option>
                  <option value="4">4 - Excellent</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Mixed</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: "16px" }}>
              <label style={styles.label}>
                {isEligible ? "Retrospective Analysis" : "Standard Review"}
              </label>
              <textarea
                rows="4"
                placeholder={
                  isEligible
                    ? "Write your detailed retrospective..."
                    : "Write a standard review..."
                }
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                style={styles.inputBox}
              />
            </div>
            <button
              type="submit"
              style={{ ...styles.submitBtn, opacity: userScore ? 1 : 0.5 }}
              disabled={!userScore}
            >
              {myReview ? "Update Retrospective" : "Publish Retrospective"}
            </button>
            {saveMessage.text && (
              <p
                style={{
                  marginTop: "12px",
                  color: saveMessage.type === "success" ? "#10B981" : "#EF4444",
                  fontSize: "14px",
                }}
              >
                {saveMessage.text}
              </p>
            )}
          </form>
        </section>
      </main>
    </div>
  );
};

const styles = {
  pageContainer: {
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    fontFamily: "'Inter', sans-serif",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    position: "fixed",
    top: 0,
    width: "100%",
    backgroundColor: "rgba(21, 18, 27, 0.9)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    zIndex: 50,
    height: "70px",
  },
  navInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
    height: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 800,
    fontSize: "22px",
    color: "#d0bcff",
    textDecoration: "none",
  },
  navLink: {
    color: "#cbc3d7",
    textDecoration: "none",
    fontWeight: 500,
  },
  mainContent: {
    flexGrow: 1,
    paddingTop: "100px",
    paddingBottom: "64px",
    paddingLeft: "24px",
    paddingRight: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
  },
  headerSection: {
    display: "flex",
    gap: "40px",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  coverContainer: {
    width: "100%",
    maxWidth: "440px",
    aspectRatio: "16/9",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    flexShrink: 0,
  },
  coverImage: { width: "100%", height: "100%", objectFit: "cover" },
  headerInfo: { flex: 1, display: "flex", flexDirection: "column" },
  tagContainer: { display: "flex", gap: "8px", marginBottom: "12px" },
  tag: {
    fontSize: "11px",
    textTransform: "uppercase",
    fontWeight: 600,
    backgroundColor: "#3b3742",
    color: "#cbc3d7",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  yearTag: {
    fontSize: "11px",
    fontWeight: 600,
    backgroundColor: "rgba(208, 188, 255, 0.1)",
    color: "#d0bcff",
    padding: "4px 8px",
    borderRadius: "4px",
    border: "1px solid rgba(208, 188, 255, 0.2)",
  },
  title: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "36px",
    fontWeight: 700,
    color: "#e7e0ed",
    marginBottom: "8px",
  },
  developer: { fontSize: "14px", color: "#958ea0", marginBottom: "16px" },
  description: {
    fontSize: "15px",
    lineHeight: 1.6,
    color: "#cbc3d7",
    marginBottom: "24px",
  },
  scoresRow: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  scoreBox: {
    backgroundColor: "#211e27",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "12px 16px",
    textAlign: "center",
    minWidth: "120px",
  },
  scoreLabel: {
    display: "block",
    fontSize: "10px",
    fontWeight: 700,
    color: "#958ea0",
    marginBottom: "4px",
    letterSpacing: "0.05em",
  },
  scoreValue: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "22px",
    fontWeight: 700,
    padding: "4px 8px",
    borderRadius: "4px",
  },
  eligibilityBanner: {
    borderRadius: "12px",
    padding: "14px 18px",
    minWidth: "220px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  eligibilitySubtitle: {
    fontSize: "12px",
    opacity: 0.8,
  },
  seeRankingsBtn: {
    marginTop: "16px",
    backgroundColor: "#3b3742",
    color: "#e7e0ed",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  otherRankingsContainer: {
    marginTop: "24px",
    backgroundColor: "#1f1b26",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "20px",
  },
  otherRankingsTitle: {
    marginBottom: "18px",
    color: "#e7e0ed",
  },
  loadingText: { color: "#cbc3d7" },
  rankingItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  miniScoreBadge: {
    borderRadius: "6px",
    padding: "4px 8px",
    color: "#15121b",
    fontWeight: 700,
  },
  miniImpactBadge: {
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#cbc3d7",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
  },
  reviewSummaryCard: {
    marginTop: "24px",
    padding: "24px",
    borderRadius: "20px",
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  reviewSummaryText: {
    marginTop: "16px",
    lineHeight: 1.8,
    color: "#d7d0e0",
    whiteSpace: "pre-wrap",
  },
  reviewSummaryFooter: {
    marginTop: "18px",
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
    fontWeight: 600,
    color: "#e7e0ed",
  },
  section: {
    marginTop: "32px",
    backgroundColor: "#1f1b26",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "24px",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#e7e0ed",
    marginBottom: "16px",
  },
  formCard: { display: "flex", flexDirection: "column", gap: "16px" },
  formRow: { display: "flex", gap: "16px", flexWrap: "wrap" },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "13px",
    color: "#cbc3d7",
    fontWeight: 600,
  },
  inputBox: {
    width: "100%",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    backgroundColor: "#16131b",
    color: "#e7e0ed",
    padding: "12px 14px",
    outline: "none",
    fontSize: "14px",
  },
  submitBtn: {
    backgroundColor: "#d0bcff",
    color: "#15121b",
    border: "none",
    padding: "14px 18px",
    fontWeight: 700,
    borderRadius: "12px",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
};

export default GameDetail;
