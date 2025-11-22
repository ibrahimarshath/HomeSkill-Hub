const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const TOKEN_COOKIE = "taskexchange_token";
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function setTokenCookie(res, token) {
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: TOKEN_MAX_AGE * 1000,
  });
}

function authMiddleware(req, res, next) {
  const token = req.cookies[TOKEN_COOKIE];
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    console.error("JWT verify error", err);
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = {
  JWT_SECRET,
  TOKEN_COOKIE,
  TOKEN_MAX_AGE,
  setTokenCookie,
  authMiddleware,
};
