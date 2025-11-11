// models/users.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    grade: { type: Number, default: 0 },
    password: { type: String, required: true }, // hashed
    designation: { type: String, trim: true, default: "" },
    department: { type: String, trim: true, default: "" },
    cnic: { type: String, trim: true, default: "" },
    role: { type: String, enum: ["manager", "employee"], default: "employee" },
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    avatar: { type: String, default: "" }, // optional: data URL or file path/URL
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", UserSchema);
