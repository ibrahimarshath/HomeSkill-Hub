const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { findUserByEmail, createUser, getUserById } = require("../db.cjs");
const { JWT_SECRET, TOKEN_COOKIE, TOKEN_MAX_AGE, setTokenCookie, authMiddleware } = require("../middleware/auth.cjs");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existing = findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "A user with that email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = createUser({
      name,
      email,
      passwordHash,
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: TOKEN_MAX_AGE,
    });

    setTokenCookie(res, token);

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Signup error", err);
    return res.status(500).json({ message: "Failed to sign up" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: TOKEN_MAX_AGE,
    });

    setTokenCookie(res, token);

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({ message: "Failed to log in" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie(TOKEN_COOKIE);
  res.json({ message: "Logged out" });
});

router.get("/me", authMiddleware, (req, res) => {
  const user = getUserById(req.user.id);
  if (!user) {
    return res.status(401).json({ message: "User no longer exists" });
  }

  return res.json({ id: user.id, name: user.name, email: user.email });
});

module.exports = router;
