const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { findUserByEmail, createUser, getUserById, updateUser } = require("../db.cjs");
const { JWT_SECRET, TOKEN_COOKIE, TOKEN_MAX_AGE, setTokenCookie, authMiddleware } = require("../middleware/auth.cjs");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, gender, phoneNumber, email, password } = req.body;

    if (!firstName || !lastName || !gender || !phoneNumber || !email || !password) {
      return res.status(400).json({ message: "First name, last name, gender, phone number, email, and password are required" });
    }

    const existing = findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "A user with that email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const name = `${firstName} ${lastName}`;

    // Check if this is an admin registration
    const isAdmin = email.toLowerCase() === "admin1@gmail.com" && password === "admin123";
    const role = isAdmin ? "admin" : "user";

    const user = createUser({
      firstName,
      lastName,
      gender,
      phoneNumber,
      name,
      email,
      passwordHash,
      role,
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: TOKEN_MAX_AGE,
    });

    setTokenCookie(res, token);

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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

    // Check if this is admin login and grant admin role if credentials match
    const isAdminLogin = email.toLowerCase() === "admin1@gmail.com" && password === "admin123";
    let userRole = user.role || "user";
    
    // If admin credentials match, ensure user has admin role
    if (isAdminLogin && userRole !== "admin") {
      updateUser(user.id, { role: "admin" });
      userRole = "admin";
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: userRole }, JWT_SECRET, {
      expiresIn: TOKEN_MAX_AGE,
    });

    setTokenCookie(res, token);

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRole,
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

  return res.json({ 
    id: user.id, 
    name: user.name, 
    email: user.email,
    role: user.role || "user",
    firstName: user.firstName || null,
    lastName: user.lastName || null,
    gender: user.gender || null,
    phoneNumber: user.phoneNumber || null,
  });
});

module.exports = router;
