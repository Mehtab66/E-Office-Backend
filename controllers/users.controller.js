// controllers/users.controller.js
const User = require("../models/users.model");
const bcrypt = require("bcryptjs");
const { createUserSchema, updateUserSchema } = require("../validators/users.validator");

// Create user (manager or employee)
exports.createUser = async (req, res, next) => {
  try {
    const { error, value } = createUserSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    // hash password
    const hashed = await bcrypt.hash(value.password, 10);
    value.password = hashed;

    const user = new User(value);
    await user.save();

    const out = user.toObject();
    delete out.password;
    res.status(201).json(out);
  } catch (err) {
    // duplicate email handling
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({ message: "Email already in use" });
    }
    next(err);
  }
};

// Get a user by id
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password").populate("projects");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Get the first manager (for your frontend)
exports.getFirstManager = async (req, res, next) => {
  try {
    const manager = await User.findOne({ role: "manager" }).select("-password").populate("projects");
    if (!manager) return res.status(404).json({ message: "No manager found" });
    res.json(manager);
  } catch (err) {
    next(err);
  }
};

// Get all managers
exports.getManagers = async (req, res, next) => {
  try {
    const managers = await User.find({ role: "manager" }).select("-password").populate("projects");
    res.json(managers);
  } catch (err) {
    next(err);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Ensure users can only update their own profile unless they're a manager
    if (userRole !== "manager" && id !== userId) {
      return res.status(403).json({ message: "You can only update your own profile" });
    }

    const { error, value } = updateUserSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    if (value.password) {
      value.password = await bcrypt.hash(value.password, 10);
    }

    const updated = await User.findByIdAndUpdate(id, value, { new: true }).select("-password");
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const removed = await User.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
