const User = require("./models/user");
const { validateUser, validateUpdateUser } = require("./validators");

// Create a new user
const createUser = async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, phone, grade, designation, cnic } = req.body;

    // Check if user already exists by email or CNIC
    const existingUser = await User.findOne({ $or: [{ email }, { cnic }] });
    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.email === email
            ? "Email already exists"
            : "CNIC already exists",
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      grade,
      designation,
      cnic,
    });

    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users with optional search and pagination
const getUsers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 3 } = req.query;
    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
      ],
    };

    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      users,
      total,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = validateUpdateUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, phone, grade, designation, cnic } = req.body;

    // Check if email or CNIC is taken by another user
    const existingUser = await User.findOne({
      $or: [{ email }, { cnic }],
      _id: { $ne: id },
    });
    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.email === email
            ? "Email already exists"
            : "CNIC already exists",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, phone, grade, designation, cnic },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createUser, getUsers, updateUser, deleteUser };
