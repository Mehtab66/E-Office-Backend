// // require("dotenv").config();

// // var createError = require("http-errors");
// // var express = require("express");
// // var path = require("path");
// // var cookieParser = require("cookie-parser");
// // var logger = require("morgan");
// // const db = require("./config/db");

// // // --- Route Imports ---
// // var indexRouter = require("./routes/index");
// // var usersRouter = require("./routes/users");
// // var adminRouter = require("./routes/admin.route");
// // const authRoutes = require("./routes/auth.route");
// // const clientRoutes = require("./routes/client.route");
// // const projectRoutes = require("./routes/project.route"); // This now handles nested routes
// // // const taskRoutes = require("./routes/task.route"); // No longer needed here
// // // const timeEntryRoutes = require("./routes/timeEntry.route"); // No longer needed here
// // // const deliverableRoutes = require("./routes/deliverable.route"); // No longer needed here
// // const managerRoutes = require("./routes/manager.route"); // <-- manager
// // const employeeRoutes = require("./routes/employee.route");
// // const cors = require("cors");

// // // --- Controller and Middleware Imports for Global Routes ---
// // const authMiddleware = require("./middlewares/auth.middleware");
// // const {
// //   getAllTimeEntries,
// //   getAllTasks,
// // } = require("./controllers/project.controller");

// // var app = express();

// // // view engine setup
// // app.set("views", path.join(__dirname, "views"));
// // app.set("view engine", "jade");

// // app.use(logger("dev"));
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: false }));
// // app.use(cookieParser());
// // app.use(express.static(path.join(__dirname, "public")));
// // db;
// // app.use(cors());

// // // --- API Routes ---
// // app.use("/", indexRouter);
// // app.use("/users", usersRouter);
// // app.use("/admin", adminRouter);
// // app.use("/auth", authRoutes);
// // app.use("/api/clients", clientRoutes);

// // // This single line now handles all project-specific routes,
// // // including /api/projects/:projectId/tasks
// // app.use("/api/projects", projectRoutes);

// // // --- REMOVED THESE LINES ---
// // // app.use("/api/projects/:projectId/tasks", taskRoutes);
// // // app.use("/api/projects/:projectId/time-entries", timeEntryRoutes);
// // // app.use("/api/projects/:projectId/deliverables", deliverableRoutes);
// // // ---

// // app.use("/manager", managerRoutes); // manager routes
// // app.use("/employee", employeeRoutes); // employee routes

// // // --- ADDED GLOBAL ROUTES ---
// // app.get(
// //   "/api/global/tasks",
// //   authMiddleware(["manager", "employee"]),
// //   getAllTasks
// // );

// // app.get(
// //   "/api/global/time-entries",
// //   authMiddleware(["manager", "employee"]),
// //   getAllTimeEntries
// // );

// // // --- Error Handlers ---

// // // catch 404 and forward to error handler
// // app.use(function (req, res, next) {
// //   next(createError(404));
// // });

// // // error handler
// // app.use(function (err, req, res, next) {
// //   // set locals, only providing error in development
// //   res.locals.message = err.message;
// //   res.locals.error = req.app.get("env") === "development" ? err : {};

// //   // render the error page
// //   res.status(err.status || 500);
// //   res.render("error");
// // });
// // // app.listen(3000, () => {
// // //   console.log("Server is running on port 3000");
// // // });

// // module.exports = app;

// require("dotenv").config();

// var createError = require("http-errors");
// var express = require("express");
// var path = require("path");
// var cookieParser = require("cookie-parser");
// var logger = require("morgan");
// const db = require("./config/db");

// // --- Route Imports ---
// var indexRouter = require("./routes/index");
// var usersRouter = require("./routes/users");
// var adminRouter = require("./routes/admin.route");
// const authRoutes = require("./routes/auth.route");
// const clientRoutes = require("./routes/client.route");
// const projectRoutes = require("./routes/project.route"); // Handles nested routes
// const managerRoutes = require("./routes/manager.route"); // <-- manager
// const employeeRoutes = require("./routes/employee.route");
// const cors = require("cors");

// // --- Controller and Middleware Imports for Global Routes ---
// const authMiddleware = require("./middlewares/auth.middleware");
// const {
//   getAllTimeEntries,
//   getAllTasks,
// } = require("./controllers/project.controller");

// var app = express();

// // view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");

// app.use(logger("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));
// db;
// app.use(cors());

// // --- API Routes ---
// app.use("/", indexRouter);
// app.use("/users", usersRouter);
// app.use("/admin", adminRouter);
// app.use("/auth", authRoutes);
// app.use("/api/clients", clientRoutes);

// // This single line handles all project-specific routes
// app.use("/api/projects", projectRoutes);

// app.use("/manager", managerRoutes); // manager routes
// app.use("/employee", employeeRoutes); // employee routes

// // --- ADDED GLOBAL ROUTES ---
// app.get(
//   "/api/global/tasks",
//   authMiddleware(["manager", "employee"]),
//   getAllTasks
// );

// app.get(
//   "/api/global/time-entries",
//   authMiddleware(["manager", "employee"]),
//   getAllTimeEntries
// );

// // --- Error Handlers ---

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });

// module.exports = app;



require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const db = require("./config/db");

// --- Route Imports ---
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var adminRouter = require("./routes/admin.route");
const authRoutes = require("./routes/auth.route");
const clientRoutes = require("./routes/client.route");
const projectRoutes = require("./routes/project.route"); // Handles nested routes
const managerRoutes = require("./routes/manager.route"); // <-- manager
const employeeRoutes = require("./routes/employee.route");
const cors = require("cors");

// --- Controller and Middleware Imports for Global Routes ---
const authMiddleware = require("./middlewares/auth.middleware");

// === FIX #1: CORRECT IMPORTS ===
// Import from project.controller (for tasks)
const { getAllTasks } = require("./controllers/project.controller");
// Import from timeEntry.controller (for time entries)
// (Make sure 'timeEntryController.js' is the exact, case-sensitive filename)
const { getAllTimeEntries } = require("./controllers/timeEntryController");
// === END OF FIX #1 ===

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
db;

// === FIX #2: CORRECT CORS CONFIGURATION ===
const corsOptions = {
  origin: "http://localhost:5173", // Your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true, // This is essential for authorization
};

// Handle preflight requests ('OPTIONS') for all routes
app.options("*", cors(corsOptions));

// Use the main CORS middleware for all other requests
app.use(cors(corsOptions));
// === END OF FIX #2 ===

// --- API Routes ---
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);
app.use("/auth", authRoutes);
app.use("/api/clients", clientRoutes);

// This single line handles all project-specific routes
app.use("/api/projects", projectRoutes);

app.use("/manager", managerRoutes); // manager routes
app.use("/employee", employeeRoutes); // employee routes

// --- ADDED GLOBAL ROUTES ---
app.get(
  "/api/global/tasks",
  authMiddleware(["manager", "employee"]),
  getAllTasks
);

app.get(
  "/api/global/time-entries",
  authMiddleware(["manager", "employee"]),
  getAllTimeEntries
);

// --- Error Handlers ---

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// === FIX #3: ADDED 'app.listen()' BACK ===
// This starts your server since you run 'app.js' directly.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
// === END OF FIX #3 ===

module.exports = app;