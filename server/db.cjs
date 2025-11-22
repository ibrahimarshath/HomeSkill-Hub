const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "db.json");

function ensureDbFile() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      users: [],
      tasks: [],
      profiles: [],
      reviews: [],
      ratings: [],
      messages: [],
      _counters: {
        userId: 1,
        taskId: 1,
        profileId: 1,
        reviewId: 1,
        ratingId: 1,
        messageId: 1,
      },
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

function normalizeCounters(db) {
  db._counters = db._counters || {
    userId: 1,
    taskId: 1,
    profileId: 1,
    reviewId: 1,
    ratingId: 1,
    messageId: 1,
  };

  if (!db.messages) db.messages = [];

  const maxUserId = db.users.reduce((m, u) => Math.max(m, u.id || 0), 0);
  const maxTaskId = db.tasks.reduce((m, t) => Math.max(m, t.id || 0), 0);
  const maxProfileId = db.profiles.reduce((m, p) => Math.max(m, p.id || 0), 0);
  const maxReviewId = db.reviews.reduce((m, r) => Math.max(m, r.id || 0), 0);
  const maxRatingId = db.ratings.reduce((m, r) => Math.max(m, r.id || 0), 0);
  const maxMessageId = db.messages.reduce((m, msg) => Math.max(m, msg.id || 0), 0);

  if (db._counters.userId < maxUserId + 1) db._counters.userId = maxUserId + 1;
  if (db._counters.taskId < maxTaskId + 1) db._counters.taskId = maxTaskId + 1;
  if (db._counters.profileId < maxProfileId + 1) db._counters.profileId = maxProfileId + 1;
  if (db._counters.reviewId < maxReviewId + 1) db._counters.reviewId = maxReviewId + 1;
  if (db._counters.ratingId < maxRatingId + 1) db._counters.ratingId = maxRatingId + 1;
  if (db._counters.messageId < maxMessageId + 1) db._counters.messageId = maxMessageId + 1;
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  const db = JSON.parse(raw);
  normalizeCounters(db);
  return db;
}

function writeDb(data) {
  normalizeCounters(data);
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function nextId(db, counterKey) {
  const current = db._counters?.[counterKey] ?? 1;
  db._counters[counterKey] = current + 1;
  return current;
}

// User helpers
function findUserByEmail(email) {
  const db = readDb();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function createUser(user) {
  const db = readDb();
  const id = nextId(db, "userId");
  const newUser = { id, createdAt: new Date().toISOString(), ...user };
  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

function getUserById(id) {
  const db = readDb();
  return db.users.find((u) => u.id === id) || null;
}

function updateUser(id, updates) {
  const db = readDb();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  db.users[idx] = { ...db.users[idx], ...updates };
  writeDb(db);
  return db.users[idx];
}

// Task helpers
function createTask(task) {
  const db = readDb();
  const id = nextId(db, "taskId");
  const newTask = {
    id,
    createdAt: new Date().toISOString(),
    status: "open",
    ...task,
  };
  db.tasks.push(newTask);
  writeDb(db);
  return newTask;
}

function getAllTasks() {
  const db = readDb();
  return db.tasks;
}

function getTasksByPosterId(userId) {
  const db = readDb();
  return db.tasks.filter((t) => t.posterId === userId);
}

function getTasksByAssigneeId(userId) {
  const db = readDb();
  return db.tasks.filter((t) => t.assignedToUserId === userId);
}

function updateTask(id, updates) {
  const db = readDb();
  const idx = db.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  db.tasks[idx] = { ...db.tasks[idx], ...updates };
  writeDb(db);
  return db.tasks[idx];
}

function deleteTask(id) {
  const db = readDb();
  const idx = db.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const deleted = db.tasks.splice(idx, 1)[0];
  writeDb(db);
  return deleted;
}

// Profile helpers
function upsertProfile(userId, profile) {
  const db = readDb();
  const idx = db.profiles.findIndex((p) => p.userId === userId);
  const existing = idx !== -1 ? db.profiles[idx] : null;
  const newProfile = {
    id: existing ? existing.id : nextId(db, "profileId"),
    userId,
    ...existing,
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  if (idx === -1) {
    db.profiles.push(newProfile);
  } else {
    db.profiles[idx] = newProfile;
  }
  writeDb(db);
  return newProfile;
}

function getProfileByUserId(userId) {
  const db = readDb();
  return db.profiles.find((p) => p.userId === userId) || null;
}

// Review helpers
function addReview(review) {
  const db = readDb();
  const id = nextId(db, "reviewId");
  const newReview = { id, createdAt: new Date().toISOString(), ...review };
  db.reviews.push(newReview);
  writeDb(db);
  return newReview;
}

function getReviewsForUser(userId) {
  const db = readDb();
  return db.reviews.filter((r) => r.toUserId === userId);
}

// Rating helpers
function addRating(rating) {
  const db = readDb();
  const id = nextId(db, "ratingId");
  const newRating = { id, createdAt: new Date().toISOString(), ...rating };
  db.ratings.push(newRating);
  writeDb(db);
  return newRating;
}

function getRatingsForUser(userId) {
  const db = readDb();
  return db.ratings.filter((r) => r.toUserId === userId);
}

// Chat helpers
function addMessage(message) {
  const db = readDb();
  const id = nextId(db, "messageId");
  const newMessage = { id, createdAt: new Date().toISOString(), ...message };
  db.messages.push(newMessage);
  writeDb(db);
  return newMessage;
}

function getMessagesForTask(taskId) {
  const db = readDb();
  return db.messages.filter((m) => m.taskId === taskId).sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

module.exports = {
  readDb,
  writeDb,
  findUserByEmail,
  createUser,
  getUserById,
  updateUser,
  createTask,
  getAllTasks,
  getTasksByPosterId,
  getTasksByAssigneeId,
  updateTask,
  deleteTask,
  upsertProfile,
  getProfileByUserId,
  addReview,
  getReviewsForUser,
  addRating,
  getRatingsForUser,
  addMessage,
  getMessagesForTask,
};
