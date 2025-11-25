require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const db = require("./config/db");
const cors = require("cors");
const usersRoutes = require("./routes/users.route");
// --- Route Imports ---
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var adminRouter = require("./routes/admin.route");
const authRoutes = require("./routes/auth.route");
const clientRoutes = require("./routes/client.route");
const projectRoutes = require("./routes/project.route"); // Handles nested routes
const managerRoutes = require("./routes/manager.route");
const employeeRoutes = require("./routes/employee.route");
const analyticsRoutes = require("./routes/analytics.routes");

// --- Controller and Middleware Imports for Global Routes ---
const authMiddleware = require("./middlewares/auth.middleware");

// Import controller helpers used for global routes
const { getAllTasks } = require("./controllers/project.controller");
const { getAllTimeEntries } = require("./controllers/timeEntryController");

// Import timeEntry router so we can mount it both globally and scoped under projects
const timeEntryRouter = require("./routes/timeEntry.route");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
db; // initialize DB (assumes your config runs on import)

// --- CORS configuration ---
const corsOptions = {
  origin: "http://localhost:5173", // frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
};
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
// --- end CORS ---

// --- API & app routes ---
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);
app.use("/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/analytics", analyticsRoutes);
// Mount projects router
app.use("/api/projects", projectRoutes);

// Mount timeEntry router as project-scoped route handler as well as a global endpoint.
// This ensures routes like:
//   GET /api/projects/:projectId/time-entries    -> project-scoped listing
//   POST /api/projects/:projectId/time-entries   -> create (scoped)
// and also
//   GET /api/time-entries                         -> global listing with query params
app.use("/api/projects/:projectId/time-entries", timeEntryRouter);
app.use("/api/time-entries", timeEntryRouter);

// Manager / Employee routers
app.use("/manager", managerRoutes);
app.use("/employee", employeeRoutes);

// Global convenience endpoints (kept if you use them elsewhere)
app.get("/api/global/tasks", authMiddleware(["manager", "employee"]), getAllTasks);
app.get("/api/global/time-entries", authMiddleware(["manager", "employee"]), getAllTimeEntries);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

// start server (useful when running app.js directly)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

module.exports = app;
