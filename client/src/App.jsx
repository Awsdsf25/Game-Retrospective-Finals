// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateRetrospective from "./pages/Retrospectives/CreateRetrospective";
import GameDetail from "./pages/GameDetail";
import Profile from "./pages/Profile";
import Rankings from "./pages/Rankings"; // <-- Added Rankings import

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route
            path="/retrospectives/create"
            element={<CreateRetrospective />}
          />
          <Route path="/game/:id" element={<GameDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
