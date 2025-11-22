const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoutes = require("./routes/auth.cjs");
const taskRoutes = require("./routes/tasks.cjs");
const userRoutes = require("./routes/users.cjs");
const ratingRoutes = require("./routes/ratings.cjs");
const chatRoutes = require("./routes/chat.cjs");
const adminRoutes = require("./routes/admin.cjs");

const PORT = process.env.PORT || 4001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();

// Ensure a default admin user exists in the dev DB
try {
  const { findUserByEmail, createUser } = require("./db.cjs");
  const bcrypt = require("bcryptjs");

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin1@gmail.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

  const existingAdmin = findUserByEmail(ADMIN_EMAIL);
  if (!existingAdmin) {
    const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
    createUser({
      firstName: "Admin",
      lastName: "User",
      name: "Admin User",
      email: ADMIN_EMAIL,
      passwordHash,
      role: "admin",
    });
    console.log(`Created default admin: ${ADMIN_EMAIL}`);
  }
} catch (err) {
  // Non-fatal: log and continue
  console.error("Failed to ensure admin user:", err && err.message ? err.message : err);
}

app.use(
  cors({
    // In development, allow whatever origin the frontend uses (e.g. http://localhost:8083)
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "TaskExchange API is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
