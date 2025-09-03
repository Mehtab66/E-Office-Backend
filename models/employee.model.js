const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    grade: { type: Number, required: true },
    password: { type: String, required: true }, // Add password field
    designation: { type: String, required: true },
    department: { type: String, required: true },
    cnic: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
