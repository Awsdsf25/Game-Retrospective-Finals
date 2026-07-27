// client/src/pages/Rankings.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Rankings = () => {
  const { retrosVersion } = useContext(AuthContext);
  const [rankedGames, setRankedGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/retrospectives/panels/best");
        setRankedGames(response.data || []);
      } catch (err) {
        console.error("Failed to load rankings", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, [retrosVersion]);

  const getScoreColor = (score) => {
    if (score >= 9) return "#10B981";
    if (score >= 8) return "#F59E0B";
    return "#EF4444";
  };

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
            <Link
              to="/rankings"
              style={{ ...styles.navLink, ...styles.navLinkActive }}
            >
              Rankings
            </Link>
          </div>
        </div>
      </nav>

      <main style={styles.mainContent}>
        <h1 style={styles.pageTitle}>Global Archive Rankings</h1>
        <p style={styles.pageSubtitle}>
          The highest-rated titles based on published retrospective scores.
        </p>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Rank</th>
                <th style={{ ...styles.th, textAlign: "left" }}>Title</th>
                <th style={styles.th}>Avg. Impact Score</th>
                <th style={styles.th}>Score</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr style={styles.tableRow}>
                  <td colSpan="4" style={styles.emptyRow}>
                    Loading rankings...
                  </td>
                </tr>
              ) : rankedGames.length === 0 ? (
                <tr style={styles.tableRow}>
                  <td colSpan="4" style={styles.emptyRow}>
                    No rankings are available yet. Publish retrospectives to
                    populate this list.
                  </td>
                </tr>
              ) : (
                rankedGames.map((retro, index) => {
                  const score = Number(retro.score) / 10;
                  const gameTitle =
                    retro.gameTitle || retro.gameId?.title || "Untitled Game";
                  const gameYear = retro.gameReleaseDate
                    ? new Date(retro.gameReleaseDate).getFullYear()
                    : retro.gameId?.releaseDate
                      ? new Date(retro.gameId.releaseDate).getFullYear()
                      : "";

                  return (
                    <tr key={retro._id} style={styles.tableRow}>
                      <td style={styles.tdRank}>#{index + 1}</td>
                      <td style={styles.tdTitle}>
                        <Link
                          to={`/game/${retro.gameId || ""}`}
                          style={{
                            color: "#e7e0ed",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          {gameTitle}
                        </Link>
                        <span style={styles.developerSubtext}>{gameYear}</span>
                      </td>
                      <td style={styles.tdCenter}>
                        <span style={styles.impactBadge}>
                          {retro.impactScore} / 5
                        </span>
                      </td>
                      <td style={styles.tdCenter}>
                        <span
                          style={{
                            ...styles.scoreBadge,
                            backgroundColor: getScoreColor(score),
                          }}
                        >
                          {score.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

const styles = {
  pageContainer: {
    backgroundColor: "#15121b",
    color: "#e7e0ed",
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
  navLink: { color: "#cbc3d7", textDecoration: "none", fontWeight: 500 },
  navLinkActive: {
    color: "#d0bcff",
    fontWeight: 700,
    borderBottom: "2px solid #d0bcff",
    paddingBottom: "4px",
  },
  mainContent: {
    flexGrow: 1,
    paddingTop: "100px",
    paddingBottom: "64px",
    paddingLeft: "24px",
    paddingRight: "24px",
    maxWidth: "1000px",
    margin: "0 auto",
    width: "100%",
  },
  pageTitle: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "32px",
    fontWeight: 700,
    marginBottom: "8px",
  },
  pageSubtitle: { color: "#cbc3d7", fontSize: "16px", marginBottom: "32px" },
  tableContainer: {
    backgroundColor: "#211e27",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeaderRow: {
    backgroundColor: "#15121b",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  th: {
    padding: "16px",
    color: "#958ea0",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tableRow: {
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    transition: "background-color 0.2s",
  },
  tdRank: {
    padding: "16px",
    textAlign: "center",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 700,
    color: "#d0bcff",
    fontSize: "20px",
  },
  tdTitle: { padding: "16px", display: "flex", flexDirection: "column" },
  developerSubtext: { fontSize: "12px", color: "#958ea0", marginTop: "4px" },
  tdCenter: { padding: "16px", textAlign: "center" },
  impactBadge: {
    backgroundColor: "rgba(208, 188, 255, 0.1)",
    color: "#d0bcff",
    border: "1px solid rgba(208, 188, 255, 0.3)",
    fontWeight: 600,
    fontSize: "13px",
    padding: "4px 12px",
    borderRadius: "4px",
  },
  scoreBadge: {
    color: "#15121b",
    fontWeight: 700,
    fontSize: "14px",
    padding: "6px 12px",
    borderRadius: "6px",
  },
};

export default Rankings;
