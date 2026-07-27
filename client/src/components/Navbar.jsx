import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "15px 30px",
        background: "#222",
        color: "#fff",
      }}
    >
      <div>
        <Link
          to="/dashboard"
          style={{
            color: "#fff",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "1.2rem",
          }}
        >
          🎮 GameRetro
        </Link>
      </div>
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Link to="/dashboard" style={{ color: "#fff", textDecoration: "none" }}>
          Dashboard
        </Link>
        <Link to="/profile" style={{ color: "#fff", textDecoration: "none" }}>
          Profile ({user?.username})
        </Link>
        <button
          onClick={handleLogout}
          style={{
            background: "#ff4d4d",
            color: "#fff",
            border: "none",
            padding: "5px 10px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
