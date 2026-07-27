// client/src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        <h2 style={styles.title}>Begin Your Journey</h2>
        <p style={styles.subtitle}>Create your retrospective archive.</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              required
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="PlayerOne"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              required
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="player@questlog.com"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              required
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" style={styles.primaryButton}>
            Create Account
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#15121b",
    color: "#e7e0ed",
    padding: "24px",
    boxSizing: "border-box",
  },
  glassCard: {
    background: "rgba(30, 30, 46, 0.6)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "40px 32px",
    borderRadius: "16px",
    maxWidth: "400px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 20px -2px rgba(208, 188, 255, 0.1)",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#e7e0ed",
    marginBottom: "8px",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#cbc3d7",
    marginBottom: "24px",
  },
  errorBox: {
    backgroundColor: "rgba(255, 69, 58, 0.1)",
    color: "#ff453a",
    border: "1px solid rgba(255, 69, 58, 0.3)",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "0.9rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#cbc3d7",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "rgba(21, 18, 27, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "#e7e0ed",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box",
  },
  primaryButton: {
    backgroundColor: "#d0bcff",
    color: "#3c0091",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    marginTop: "8px",
    boxShadow: "0 4px 20px -2px rgba(208, 188, 255, 0.2)",
  },
  footerText: {
    marginTop: "24px",
    fontSize: "0.9rem",
    color: "#cbc3d7",
  },
  link: {
    color: "#d0bcff",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default Register;
