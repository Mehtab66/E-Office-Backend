const mongoose = require("mongoose");

const deliverableSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "delivered", "approved"],
      default: "pending",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

deliverableSchema.index({ project: 1, status: 1 });

module.exports = mongoose.model("Deliverable", deliverableSchema);
