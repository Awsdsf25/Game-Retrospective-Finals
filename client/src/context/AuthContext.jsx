// client/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrosVersion, setRetrosVersion] = useState(0);

  // Check if a user is already logged in when the app loads
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function to save token and user data
  const login = (token, userData) => {
    const profileUser = {
      ...userData,
      imageUrl: userData.imageUrl || "",
      bio: userData.bio || "",
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(profileUser));
    setUser(profileUser);
  };

  // Logout function to clear data
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateProfile = async (updates) => {
    try {
      const response = await api.put("/auth/me", updates);
      const updatedUser = response.data;
      const profileUser = {
        ...updatedUser,
        imageUrl: updatedUser.imageUrl || "",
        bio: updatedUser.bio || "",
      };
      localStorage.setItem("user", JSON.stringify(profileUser));
      setUser(profileUser);
      return profileUser;
    } catch (error) {
      console.error("Failed to update profile", error);
      return user;
    }
  };

  const refreshRetrospectives = () => {
    setRetrosVersion((prev) => prev + 1);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateProfile,
        refreshRetrospectives,
        retrosVersion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
