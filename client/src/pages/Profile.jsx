// client/src/pages/Profile.jsx
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user, updateProfile, retrosVersion } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    bio: "",
    imageUrl: "",
  });
  const [retrospectives, setRetrospectives] = useState([]);
  const [isLoadingRetros, setIsLoadingRetros] = useState(true);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
        bio:
          user.bio ||
          "Add a bio and start building your retrospective archive.",
        imageUrl: user.imageUrl || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchRetrospectives = async () => {
      if (!user) return;
      setIsLoadingRetros(true);
      try {
        const response = await api.get(`/retrospectives?userId=${user.id}`);
        setRetrospectives(response.data || []);
      } catch (err) {
        console.error("Failed to load retrospectives", err);
      } finally {
        setIsLoadingRetros(false);
      }
    };

    fetchRetrospectives();
  }, [user, retrosVersion]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile(profileData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  if (!user) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.loadingFallback}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-link:hover { color: #d0bcff !important; }
        input:focus, textarea:focus { border-color: #d0bcff !important; outline: none; }
        .retro-card:hover { border-color: #d0bcff !important; transform: translateY(-4px); }
      `}</style>

      <nav style={styles.navbar}>
        <div style={styles.navInner}>
          <Link to="/dashboard" style={styles.logo}>
            QuestLog
          </Link>
          <Link to="/dashboard" style={styles.backLink}>
            ← Back to Discovery
          </Link>
        </div>
      </nav>

      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Profile: {profileData.username}</h1>
        </div>

        <div style={styles.contentLayout}>
          <section style={styles.profileSection}>
            <div style={styles.card}>
              <div style={styles.avatarLarge}>
                <img
                  src={
                    profileData.imageUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      profileData.username || "User",
                    )}&background=4b5563&color=ffffff&rounded=true&size=256`
                  }
                  alt={profileData.username || "Profile"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {!isEditing ? (
                <div style={{ marginTop: "24px" }}>
                  <h2 style={styles.username}>{profileData.username}</h2>
                  <p style={styles.email}>{profileData.email}</p>
                  <p style={styles.bio}>{profileData.bio}</p>

                  <button
                    onClick={() => setIsEditing(true)}
                    style={styles.editBtn}
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSaveProfile}
                  style={{ marginTop: "24px" }}
                >
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={profileData.username}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      Profile Image URL{" "}
                      <span style={styles.optionalLabel}>(optional)</span>
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      placeholder="https://example.com/photo.jpg"
                      value={profileData.imageUrl}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Bio</label>
                    <textarea
                      name="bio"
                      rows="4"
                      value={profileData.bio}
                      onChange={handleChange}
                      style={styles.input}
                    ></textarea>
                  </div>

                  <div
                    style={{ display: "flex", gap: "12px", marginTop: "20px" }}
                  >
                    <button type="submit" style={styles.saveBtn}>
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      style={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          <section style={styles.retroSection}>
            <h2 style={styles.sectionTitle}>My Retrospectives</h2>

            {isLoadingRetros ? (
              <p style={styles.loadingText}>Loading your retrospectives...</p>
            ) : retrospectives.length === 0 ? (
              <p style={styles.loadingText}>
                You haven’t added any retrospectives yet.
              </p>
            ) : (
              <div style={styles.retroGrid}>
                {retrospectives.map((retro) => (
                  <Link
                    to={`/game/${retro.gameId?._id || retro.gameId}`}
                    key={retro._id}
                    style={{ textDecoration: "none" }}
                  >
                    <article className="retro-card" style={styles.retroCard}>
                      <div style={styles.retroImageContainer}>
                        <img
                          src={
                            retro.gameId?.coverImage ||
                            "https://via.placeholder.com/100x150?text=Game"
                          }
                          alt={retro.gameId?.title || "Retrospective"}
                          style={styles.retroImage}
                        />
                      </div>
                      <div style={styles.retroInfo}>
                        <h3 style={styles.retroTitle}>
                          {retro.gameId?.title || retro.title}
                        </h3>
                        <p style={styles.retroDate}>
                          Logged on{" "}
                          {new Date(retro.createdAt).toLocaleDateString()}
                        </p>

                        <div style={styles.badgesRow}>
                          <span style={styles.scoreBadge}>{retro.score}</span>
                          <span style={styles.impactBadge}>
                            Impact: {retro.impactScore}/5
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </section>
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
  backLink: {
    color: "#cbc3d7",
    textDecoration: "none",
    fontSize: "14px",
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
  header: { marginBottom: "32px" },
  pageTitle: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "32px",
    fontWeight: 700,
  },
  contentLayout: {
    display: "flex",
    gap: "40px",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  profileSection: { flex: "1 1 350px", maxWidth: "400px" },
  retroSection: { flex: "2 1 500px" },
  card: {
    backgroundColor: "var(--surface)",
    borderRadius: "16px",
    padding: "32px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  avatarLarge: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "4px solid #494454",
    margin: "0 auto",
  },
  username: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "24px",
    fontWeight: 700,
    textAlign: "center",
    marginBottom: "4px",
  },
  email: {
    color: "#958ea0",
    textAlign: "center",
    fontSize: "14px",
    marginBottom: "24px",
  },
  bio: {
    color: "#cbc3d7",
    fontSize: "15px",
    lineHeight: 1.6,
    marginBottom: "24px",
    textAlign: "center",
  },
  editBtn: {
    width: "100%",
    backgroundColor: "transparent",
    border: "1px solid #d0bcff",
    color: "#d0bcff",
    padding: "12px",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
  },
  inputGroup: { marginBottom: "16px" },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#958ea0",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    backgroundColor: "var(--surface-secondary)",
    border: "1px solid #494454",
    padding: "12px",
    borderRadius: "8px",
    color: "#e7e0ed",
    fontSize: "14px",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#d0bcff",
    color: "#3c0091",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "transparent",
    border: "1px solid #494454",
    color: "#e7e0ed",
    padding: "12px",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
  },
  sectionTitle: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "22px",
    fontWeight: 700,
    marginBottom: "24px",
  },
  retroGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  retroCard: {
    display: "flex",
    backgroundColor: "#211e27",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    transition: "all 0.3s ease",
  },
  retroImageContainer: { width: "100px", flexShrink: 0 },
  retroImage: { width: "100%", height: "100%", objectFit: "cover" },
  retroInfo: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  retroTitle: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "16px",
    fontWeight: 700,
    color: "#e7e0ed",
    marginBottom: "4px",
  },
  retroDate: { fontSize: "12px", color: "#958ea0", marginBottom: "12px" },
  badgesRow: { display: "flex", gap: "8px", alignItems: "center" },
  scoreBadge: {
    backgroundColor: "#10B981",
    color: "#15121b",
    fontWeight: 700,
    fontSize: "12px",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  impactBadge: {
    backgroundColor: "rgba(208, 188, 255, 0.1)",
    color: "#d0bcff",
    border: "1px solid rgba(208, 188, 255, 0.3)",
    fontWeight: 600,
    fontSize: "12px",
    padding: "4px 8px",
    borderRadius: "4px",
  },
};

export default Profile;
