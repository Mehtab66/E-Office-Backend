require("dotenv").config();
console.log("MONGO_URL from env:", process.env.MONGO_URL); // 👈 Debug

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("../models/admin.model");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const adminExists = await Admin.findOne({ email: "admin@eoffice.com" });
    if (adminExists) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = new Admin({
      email: "admin@eoffice.com",
      password: hashedPassword,
    });

    await admin.save();
    console.log("Admin seeded successfully");
  } catch (error) {
    console.error("Error seeding admin:", error);
  } finally {
    mongoose.disconnect();
  }
};

seedAdmin();
