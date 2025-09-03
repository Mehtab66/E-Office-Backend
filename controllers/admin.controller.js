const User = require("../models/employee.model");
const bcrypt = require("bcrypt");

const {
  validateUser,
  validateUpdateUser,
} = require("../validators/employee.validator");

const createUser = async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      name,
      email,
      phone,
      grade,
      designation,
      department,
      cnic,
      password,
    } = req.body;

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

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      grade,
      designation,
      department,
      cnic,
      password: hashedPassword,
    });
    console.log("New user data:", user);
    await user.save();

    // Return user data without the password
    const { password: _, ...userResponse } = user.toObject();
    res
      .status(201)
      .json({ message: "User created successfully", user: userResponse });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users with optional search and pagination
const getUsers = async (req, res) => {
  console.log("into the get users");
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
    console.log("into the update user");
    const { id } = req.params;
    console.log("User ID to update:", id);
    console.log("Request body:", req.body);
    const { error } = validateUpdateUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      name,
      email,
      phone,
      grade,
      designation,
      department,
      cnic,
      password,
    } = req.body;

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

    // Build update object dynamically
    const updateData = {
      name,
      email,
      phone,
      grade,
      designation,
      department,
      cnic,
    };

    // Hash password if provided
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user data without the password
    const { password: _, ...userResponse } = user.toObject();
    res
      .status(200)
      .json({ message: "User updated successfully", user: userResponse });
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

const getDashboardStats = async (req, res) => {
  try {
    // Aggregate data for designations and departments
    const stats = await User.aggregate([
      {
        // Group by designation to count users per designation
        $group: {
          _id: "$designation",
          count: { $sum: 1 },
        },
      },
      {
        // Project to format the output
        $project: {
          name: "$_id",
          value: "$count",
          _id: 0,
        },
      },
    ]);

    // Get total users and unique departments
    const totalUsers = await User.countDocuments();
    const uniqueDepartments = await User.distinct("department");

    res.status(200).json({
      totalUsers,
      designations: stats,
      totalDepartments: uniqueDepartments.length,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { createUser, getUsers, updateUser, deleteUser, getDashboardStats };
