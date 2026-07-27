// client/src/pages/Dashboard.jsx
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { sampleGames } from "../data/sampleGames";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [topGames, setTopGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/games");
        const games =
          response.data && response.data.length > 0
            ? response.data
            : sampleGames;
        setTopGames(games);
      } catch (err) {
        console.error("Failed to load games", err);
        setTopGames(sampleGames);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  const filteredGames = topGames.filter((game) => {
    const title = game.title || "";
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getScoreColor = (score) => {
    if (score === 0 || score === undefined) return "#37333d";
    if (score >= 90) return "#10B981";
    if (score >= 80) return "#F59E0B";
    return "#EF4444";
  };

  const getEligibility = (releaseYear) => {
    const age = currentYear - releaseYear;
    return age >= 5
      ? { eligible: true, text: "Eligible for retrospective" }
      : {
          eligible: false,
          text: `Not yet eligible in ${5 - age} ${5 - age === 1 ? "year" : "years"}`,
        };
  };

  const normalizeGame = (game) => {
    const title = game.title || game.name || "Untitled Title";
    const rawReleaseDate =
      game.releaseDate ||
      (typeof game.first_release_date === "number"
        ? new Date(game.first_release_date * 1000).toISOString()
        : game.first_release_date || game.release_date || null);

    const parsedReleaseYear = rawReleaseDate
      ? new Date(rawReleaseDate).getFullYear()
      : currentYear;

    const releaseYear = Number.isNaN(parsedReleaseYear)
      ? currentYear
      : parsedReleaseYear;

    const coverImage =
      game.coverImage ||
      (game.cover?.url
        ? game.cover.url.startsWith("//")
          ? `https:${game.cover.url}`
          : game.cover.url
        : "/images/persona_5_royal.jpg");

    const genres =
      Array.isArray(game.genre) && game.genre.length > 0
        ? game.genre
        : Array.isArray(game.genres)
          ? game.genres.map((item) => item.name || item).filter(Boolean)
          : [];

    return {
      id: game._id || game.id || game.name || title,
      title,
      developer: genres.length > 0 ? genres.join(", ") : "Archive",
      releaseYear,
      tags: genres.length > 0 ? genres.slice(0, 2) : ["Archive"],
      image: coverImage,
      score: 0,
    };
  };

  const displayGames = filteredGames.map(normalizeGame);
  if (!user) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.loadingFallback}>Loading discovery...</div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card-image { transition: transform 0.5s ease; }
        .game-card:hover .card-image { transform: scale(1.05); }
        .nav-link:hover { color: #d0bcff !important; }
        .dropdown-item:hover { background-color: #3b3742; color: #d0bcff; }
        .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 24px; }
      `}</style>

      {/* Top Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navInner}>
          <div style={styles.navLeft}>
            <Link to="/dashboard" style={styles.logo}>
              QuestLog
            </Link>
            <div style={styles.searchBar}>
              <span style={{ marginRight: "8px", color: "#958ea0" }}>🔍</span>
              <input
                type="text"
                placeholder="Search archive..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.navCenter}>
            <Link
              to="/dashboard"
              style={{ ...styles.navLink, ...styles.navLinkActive }}
            >
              Discovery
            </Link>
            <Link to="/rankings" style={styles.navLink}>
              Rankings
            </Link>
          </div>

          <div style={styles.navRight}>
            <div style={{ position: "relative" }}>
              <div
                style={styles.avatar}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.username || "User",
                  )}&background=4b5563&color=ffffff&rounded=true&size=128`}
                  alt={user?.username || "Profile"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {isProfileOpen && (
                <div style={styles.dropdownMenu}>
                  <Link
                    to="/profile"
                    style={styles.dropdownLink}
                    className="dropdown-item"
                  >
                    My Profile
                  </Link>
                  <div
                    style={{
                      ...styles.dropdownLink,
                      color: "#ffb4ab",
                      cursor: "pointer",
                    }}
                    className="dropdown-item"
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Discovery</h1>
            <p style={styles.pageSubtitle}>
              Explore the archive of modern legends and critically acclaimed
              masterpieces.
            </p>
          </div>
          <div style={styles.filtersContainer}>
            <span style={styles.topGamesLabel}>
              Top games curated from the archive
            </span>
          </div>
        </header>

        <div className="grid-container">
          {isLoading ? (
            <div style={styles.loadingFallback}>Loading top games...</div>
          ) : displayGames.length === 0 ? (
            <div style={styles.loadingFallback}>
              No top games match your search.
            </div>
          ) : (
            displayGames.map((game) => {
              const eligibility = getEligibility(game.releaseYear);
              return (
                <Link
                  to={`/game/${game.id}`}
                  key={game.id}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <article
                    className="game-card"
                    style={{
                      ...styles.card,
                      transform:
                        hoveredCard === game.id
                          ? "translateY(-4px)"
                          : "translateY(0)",
                      boxShadow:
                        hoveredCard === game.id
                          ? "0 8px 40px rgba(208, 188, 255, 0.15)"
                          : "none",
                    }}
                    onMouseEnter={() => setHoveredCard(game.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div style={styles.cardImageContainer}>
                      <img
                        src={game.image}
                        alt={game.title}
                        className="card-image"
                        style={styles.cardImage}
                      />
                      <div style={styles.gradientOverlay}></div>
                      <div
                        style={{
                          ...styles.scoreBadge,
                          backgroundColor: getScoreColor(game.score),
                        }}
                      >
                        {game.score}
                      </div>
                    </div>
                    <div style={styles.cardContent}>
                      <div style={styles.tagContainer}>
                        {game.tags.map((tag) => (
                          <span key={tag} style={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 style={styles.cardTitle}>{game.title}</h2>
                      <p style={styles.cardDeveloper}>{game.developer}</p>
                      <div
                        style={{
                          ...styles.eligibilityBadge,
                          backgroundColor: eligibility.eligible
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(239, 68, 68, 0.15)",
                          color: eligibility.eligible ? "#4edea3" : "#ffb4ab",
                          border: `1px solid ${eligibility.eligible ? "rgba(78, 222, 163, 0.3)" : "rgba(255, 180, 171, 0.3)"}`,
                        }}
                      >
                        {eligibility.text}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })
          )}
        </div>
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
  loadingFallback: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "var(--text)",
    fontSize: "1.1rem",
  },
  navbar: {
    position: "fixed",
    top: 0,
    width: "100%",
    backgroundColor: "rgba(21, 18, 27, 0.8)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    zIndex: 50,
    height: "80px",
  },
  navInner: {
    maxWidth: "1440px",
    margin: "0 auto",
    padding: "0 24px",
    height: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navLeft: { display: "flex", alignItems: "center", gap: "24px" },
  logo: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 800,
    fontSize: "24px",
    color: "#d0bcff",
    textDecoration: "none",
    letterSpacing: "-0.02em",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "4px 12px",
    width: "256px",
    height: "40px",
  },
  searchInput: {
    backgroundColor: "transparent",
    border: "none",
    color: "var(--text)",
    outline: "none",
    width: "100%",
    fontSize: "14px",
  },
  navCenter: { display: "flex", gap: "24px" },
  navLink: {
    color: "#cbc3d7",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "16px",
    transition: "color 0.2s",
  },
  navLinkActive: {
    color: "#d0bcff",
    fontWeight: 700,
    borderBottom: "2px solid #d0bcff",
    paddingBottom: "4px",
  },
  navRight: { display: "flex", alignItems: "center", gap: "16px" },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "2px solid #494454",
    cursor: "pointer",
  },
  dropdownMenu: {
    position: "absolute",
    top: "48px",
    right: "0",
    backgroundColor: "#211e27",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    width: "150px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 100,
  },
  dropdownLink: {
    padding: "12px 16px",
    color: "#e7e0ed",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 500,
  },
  mainContent: {
    flexGrow: 1,
    paddingTop: "120px",
    paddingBottom: "64px",
    paddingLeft: "24px",
    paddingRight: "24px",
    maxWidth: "1440px",
    margin: "0 auto",
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "40px",
    flexWrap: "wrap",
    gap: "24px",
  },
  pageTitle: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "32px",
    fontWeight: 700,
    marginBottom: "4px",
  },
  pageSubtitle: { color: "#cbc3d7", fontSize: "16px" },
  filtersContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  topGamesLabel: {
    color: "#d0bcff",
    fontSize: "14px",
    fontWeight: 600,
  },
  card: {
    backgroundColor: "#211e27",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid rgba(73, 68, 84, 0.5)",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    transition: "all 0.3s ease",
    height: "100%",
  },
  cardImageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: "16/9",
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: "100%", objectFit: "cover" },
  gradientOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, #211e27 0%, transparent 100%)",
    opacity: 0.9,
  },
  scoreBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    color: "#e7e0ed",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    fontSize: "20px",
    padding: "4px 8px",
    borderRadius: "4px",
    textAlign: "center",
    zIndex: 10,
  },
  cardContent: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    position: "relative",
    zIndex: 10,
    marginTop: "-48px",
  },
  tagContainer: {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap",
    marginBottom: "8px",
  },
  tag: {
    fontSize: "10px",
    textTransform: "uppercase",
    fontWeight: 500,
    backgroundColor: "#3b3742",
    color: "#cbc3d7",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  cardTitle: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "20px",
    fontWeight: 600,
    color: "#e7e0ed",
    marginBottom: "8px",
  },
  cardDeveloper: { fontSize: "12px", color: "#958ea0", marginTop: "auto" },
  eligibilityBadge: {
    marginTop: "12px",
    fontSize: "11px",
    fontWeight: 600,
    padding: "4px 8px",
    borderRadius: "6px",
    display: "inline-block",
    textAlign: "center",
  },
};

export default Dashboard;
