const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    client: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "pending", "completed"],
    },
    startDate: { type: Date, required: true },
    estimatedTime: { type: String, required: true },
    teamLead: { type: String, required: true },
    teamMembers: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
