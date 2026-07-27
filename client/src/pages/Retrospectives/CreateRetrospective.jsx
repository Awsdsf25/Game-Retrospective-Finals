// client/src/pages/Retrospectives/CreateRetrospective.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";

const CreateRetrospective = () => {
  const [eligibleGames, setEligibleGames] = useState([]);
  const [formData, setFormData] = useState({
    gameId: "",
    title: "",
    content: "",
    score: "",
    impactScore: 5,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkExisting = async () => {
      try {
        const res = await api.get("/retrospectives/my");
        if (res.data) {
          navigate(`/game/${res.data.gameId}`);
        }
      } catch {
        // No existing retrospective — show the form
      }
    };
    checkExisting();
  }, [navigate]);

  // Fetch only games that are 5+ years old
  useEffect(() => {
    const fetchEligibleGames = async () => {
      try {
        const response = await api.get("/games/eligible");
        setEligibleGames(response.data);
      } catch (err) {
        console.error("Failed to fetch games", err);
      }
    };
    fetchEligibleGames();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Submitting will default to 'draft' status in the backend
      await api.post("/retrospectives", formData);
      setSuccess("Retrospective drafted successfully! Redirecting...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create retrospective.",
      );
    }
  };

  return (
    <div>
      <Navbar />
      <div
        style={{
          maxWidth: "600px",
          margin: "40px auto",
          padding: "20px",
          background: "#f9f9f9",
          borderRadius: "8px",
        }}
      >
        <h2>✍️ Write a Retrospective</h2>
        <p style={{ color: "#555", marginBottom: "20px" }}>
          *You can only write retrospectives for games released 5 or more years
          ago.
        </p>

        {error && (
          <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>
        )}
        {success && (
          <div style={{ color: "green", marginBottom: "15px" }}>{success}</div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <label style={{ fontWeight: "bold" }}>Select Game:</label>
          <select
            name="gameId"
            onChange={handleChange}
            required
            style={{ padding: "10px" }}
          >
            <option value="">-- Choose an eligible game --</option>
            {eligibleGames.map((game) => (
              <option key={game._id} value={game._id}>
                {game.title} ({new Date(game.releaseDate).getFullYear()})
              </option>
            ))}
          </select>

          <label style={{ fontWeight: "bold" }}>Retrospective Title:</label>
          <input
            type="text"
            name="title"
            placeholder="e.g., A Timeless Masterpiece"
            onChange={handleChange}
            required
            style={{ padding: "10px" }}
          />

          <label style={{ fontWeight: "bold" }}>Your Review:</label>
          <textarea
            name="content"
            placeholder="Write your retrospective here..."
            onChange={handleChange}
            required
            rows="6"
            style={{ padding: "10px" }}
          />

          <label style={{ fontWeight: "bold" }}>Rating:</label>
          <input
            type="number"
            name="score"
            min="0"
            max="100"
            placeholder="85"
            onChange={handleChange}
            required
            style={{ padding: "10px" }}
          />

          <label style={{ fontWeight: "bold" }}>Impact Score:</label>
          <select
            name="impactScore"
            value={formData.impactScore}
            onChange={handleChange}
            style={{ padding: "10px" }}
          >
            <option value="5">5 - Masterpiece</option>
            <option value="4">4 - Excellent</option>
            <option value="3">3 - Good</option>
            <option value="2">2 - Mixed</option>
            <option value="1">1 - Poor</option>
          </select>

          <button
            type="submit"
            style={{
              background: "#646cff",
              color: "white",
              padding: "12px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          >
            Save as Draft
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRetrospective;
