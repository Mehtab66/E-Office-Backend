const mongoose = require("mongoose");

const timeEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    date: { type: Date, required: true, index: true },
    hours: { type: Number, required: true, min: 0 },
    title: { type: String, required: true },
    note: { type: String },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

timeEntrySchema.index({ project: 1, date: 1 });

module.exports = mongoose.model("TimeEntry", timeEntrySchema);
