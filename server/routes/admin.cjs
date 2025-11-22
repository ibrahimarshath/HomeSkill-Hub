const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middleware/auth.cjs");
const { getAllUsers, deleteUser, getAllTasks, deleteTask } = require("../db.cjs");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all users
router.get("/users", (req, res) => {
  try {
    const users = getAllUsers();
    // Don't send password hashes
    const safeUsers = users.map(({ passwordHash, ...user }) => user);
    res.json(safeUsers);
  } catch (err) {
    console.error("Error fetching users", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Delete a user
router.delete("/users/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const deleted = deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// Get all tasks
router.get("/tasks", (req, res) => {
  try {
    const tasks = getAllTasks();
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// Delete a task
router.delete("/tasks/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const deleted = deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task", err);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

module.exports = router;

