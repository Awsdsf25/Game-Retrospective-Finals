// client/src/pages/Login.jsx
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      login(response.data.token, response.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <Link to="/" style={styles.logo}>
          QuestLog
        </Link>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>
          Enter your credentials to access your archive.
        </p>

        <form onSubmit={handleLogin} style={styles.form}>
          {error && <div style={styles.errorBox}>{error}</div>}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              required
              placeholder="e.g. ariel"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            Log In
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an archive yet?{" "}
          <Link to="/register" style={styles.link}>
            Register
          </Link>
        </p>
      </div>
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
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
  },
  card: {
    backgroundColor: "#211e27",
    padding: "40px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.1)",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  logo: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 800,
    fontSize: "26px",
    color: "#d0bcff",
    textDecoration: "none",
    display: "inline-block",
    marginBottom: "24px",
  },
  title: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "8px",
  },
  subtitle: { color: "#958ea0", fontSize: "14px", marginBottom: "32px" },
  form: { textAlign: "left" },
  inputGroup: { marginBottom: "20px" },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#cbc3d7",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#15121b",
    border: "1px solid #494454",
    borderRadius: "8px",
    color: "#e7e0ed",
    fontSize: "15px",
  },
  submitBtn: {
    width: "100%",
    backgroundColor: "#d0bcff",
    color: "#3c0091",
    border: "none",
    padding: "14px",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
  footerText: { marginTop: "24px", fontSize: "14px", color: "#958ea0" },
  link: { color: "#d0bcff", textDecoration: "none", fontWeight: 600 },
  errorBox: {
    backgroundColor: "rgba(255, 80, 80, 0.15)",
    color: "#ffb4ab",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    border: "1px solid rgba(255, 80, 80, 0.3)",
  },
};

export default Login;
