require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const db = require("./config/db");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var adminRouter = require("./routes/admin.route");
const authRoutes = require("./routes/auth.route");
const clientRoutes = require("./routes/client.route");
const projectRoutes = require("./routes/project.route");
const taskRoutes = require("./routes/task.route");
const timeEntryRoutes = require("./routes/timeEntry.route");
const deliverableRoutes = require("./routes/deliverable.route");
const managerRoutes = require("./routes/manager.route"); // <-- manager
const employeeRoutes = require("./routes/employee.route");
const cors = require("cors");

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
app.use(cors());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);
app.use("/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);
app.use("/api/projects/:projectId/time-entries", timeEntryRoutes);
app.use("/api/projects/:projectId/deliverables", deliverableRoutes);
app.use("/manager", managerRoutes); // manager routes
app.use("/employee", employeeRoutes); // employee routes

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

module.exports = app;
