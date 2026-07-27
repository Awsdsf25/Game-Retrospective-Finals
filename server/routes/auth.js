const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// 1. REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, userType, bio, imageUrl } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email or username already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      bio: bio || "",
      imageUrl: imageUrl || "",
      userType: userType || "author",
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // ✅ FIXED: Search the database by username, not email
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials." });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        bio: user.bio || "",
        imageUrl: user.imageUrl || "",
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. GET CURRENT USER PROFILE
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. UPDATE CURRENT USER PROFILE
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { username, email, bio, imageUrl } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ message: "Username is already taken." });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail && existingEmail._id.toString() !== req.user.id) {
        return res.status(400).json({ message: "Email is already taken." });
      }
      user.email = email;
    }

    if (bio !== undefined) user.bio = bio;
    if (imageUrl !== undefined) user.imageUrl = imageUrl;

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
