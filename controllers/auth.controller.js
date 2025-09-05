const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");
const Employee = require("../models/employee.model");
const {
  validateLogin,
  validateUpdatePassword,
} = require("../validators/auth.validator");
const login = async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    console.log(email);
    console.log(password);

    // Check if user is an admin
    let user = await Admin.findOne({ email });
    let role = "Admin"; // Capitalize
    let isAdmin = true;

    // If not admin, check employee
    if (!user) {
      user = await Employee.findOne({ email });
      isAdmin = false;
      role = user?.designation; // Capitalize
    }

    // Validate credentials
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role, isAdmin },
      process.env.JWT_SECRET
    );

    // Prepare response
    const userData = isAdmin
      ? { _id: user._id, email: user.email, role }
      : {
          _id: user._id,
          email: user.email,
          name: user.name,
          designation: user.designation,
          phone: user.phone,
          grade: user.grade,
          cnic: user.cnic,
          role: user.role,
        };

    res.json({ user: userData, token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { error } = validateUpdatePassword(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { newPassword } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    let user;
    if (isAdmin) {
      user = await Admin.findById(userId);
    } else {
      user = await Employee.findById(userId);
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login, updatePassword };
