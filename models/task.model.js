const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priority: {
      type: String,
      enum: ["urgent", "high", "medium", "low"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
      index: true,
    },
    subtasks: [
      {
        _id: String,
        title: String,
        status: { type: String, enum: ["todo", "in_progress", "done"] },
        assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        priority: {
          type: String,
          enum: ["urgent", "high", "medium", "low"],
          default: "medium",
        },
      },
    ],
    dueDate: { type: Date },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, status: 1 });

module.exports = mongoose.model("Task", taskSchema);
