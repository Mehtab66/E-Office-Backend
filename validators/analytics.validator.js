const { query } = require("express-validator");

exports.validateAnalytics = [
  query("userId")
    .optional()
    .isMongoId()
    .withMessage("Invalid User ID format"),
  query("timeSpan")
    .optional()
    .isIn(["7days", "30days", "3months", "all"])
    .withMessage("Invalid time span"),
  query("startDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid start date"),
  query("endDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid end date"),
];
