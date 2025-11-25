// const TimeEntry = require("../models/timeEntry.model");
// const Deliverable = require("../models/deliverable.model");
// const User = require("../models/users.model");
// const { validationResult } = require("express-validator");

// exports.getProjectAnalytics = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//         const { userId, timeSpan, startDate: customStartDate, endDate: customEndDate } = req.query;

//         let startDate = null;
//         let endDate = customEndDate ? new Date(customEndDate) : new Date();
//         endDate.setHours(23, 59, 59, 999);

//         if (customStartDate) {
//             startDate = new Date(customStartDate);
//             startDate.setHours(0, 0, 0, 0);
//         } else if (timeSpan && timeSpan !== "all") {
//             startDate = new Date();
//             startDate.setHours(0, 0, 0, 0);
//             switch (timeSpan) {
//                 case "7days":
//                     startDate.setDate(startDate.getDate() - 6);
//                     break;
//                 case "30days":
//                     startDate.setDate(startDate.getDate() - 29);
//                     break;
//                 case "3months":
//                     startDate.setMonth(startDate.getMonth() - 3);
//                     break;
//             }
//         }

//         // Build query filters
//         const timeEntryFilter = {};
//         const deliverableFilter = {};

//         if (userId) {
//             timeEntryFilter.user = userId;
//             deliverableFilter.createdBy = userId;
//         }

//         if (startDate) {
//             timeEntryFilter.date = { $gte: startDate, $lte: endDate };
//             deliverableFilter.date = { $gte: startDate, $lte: endDate };
//         } else if (timeSpan !== "all") {
//             // If no start date and not "all", default to 7 days? 
//             // Logic in frontend was: if "all", return null (no filter).
//             // Here if timeSpan is "all", we don't add date filter.
//             // If timeSpan is undefined and no dates, maybe default to 7 days or all?
//             // Let's assume if nothing provided, return all or default to 7days. 
//             // The frontend defaults to 7days.
//             if (!timeSpan && !customStartDate) {
//                 const defaultStart = new Date();
//                 defaultStart.setHours(0, 0, 0, 0);
//                 defaultStart.setDate(defaultStart.getDate() - 6);
//                 timeEntryFilter.date = { $gte: defaultStart, $lte: endDate };
//                 deliverableFilter.date = { $gte: defaultStart, $lte: endDate };
//             }
//         }

//         const [timeEntries, deliverables] = await Promise.all([
//             TimeEntry.find(timeEntryFilter).populate("user", "name email").sort({ date: 1 }),
//             Deliverable.find(deliverableFilter).populate("createdBy", "name email").sort({ date: 1 }),
//         ]);

//         res.json({
//             timeEntries,
//             deliverables,
//         });
//     } catch (err) {
//         console.error("Error fetching project analytics:", err);
//         res.status(500).json({ message: "Server error" });
//     }
// };

// exports.getUsers = async (req, res) => {
//     try {
//         const users = await User.find({}, "name email _id");
//         res.json(users);
//     } catch (err) {
//         console.error("Error fetching users:", err);
//         res.status(500).json({ message: "Server error" });
//     }
// }


const TimeEntry = require("../models/timeEntry.model");
const Deliverable = require("../models/deliverable.model");
const User = require("../models/users.model");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

exports.getProjectAnalytics = async (req, res) => {
    try {
        const { userId, timeSpan, projectId, startDate: qStart, endDate: qEnd } = req.query;

        console.log("Analyze Request:", { projectId, userId, timeSpan, qStart, qEnd });

        let dateFilter = {};

        // 1. Priority: Custom Date Range (From Filters)
        if (qStart || qEnd) {
            // Force UTC boundaries to ensure we catch everything in that day
            const start = qStart ? new Date(qStart) : new Date("1970-01-01");
            start.setUTCHours(0, 0, 0, 0);

            const end = qEnd ? new Date(qEnd) : new Date();
            end.setUTCHours(23, 59, 59, 999);

            dateFilter.date = { $gte: start, $lte: end };
        }
        // 2. Secondary: TimeSpan dropdown (if no custom dates)
        else if (timeSpan && timeSpan !== "all") {
            const end = new Date();
            end.setUTCHours(23, 59, 59, 999);
            const start = new Date();
            start.setUTCHours(0, 0, 0, 0);

            if (timeSpan === "7days") start.setDate(end.getDate() - 6);
            else if (timeSpan === "30days") start.setDate(end.getDate() - 29);
            else if (timeSpan === "3months") start.setMonth(end.getMonth() - 3);

            dateFilter.date = { $gte: start, $lte: end };
        }

        // 3. Build Query
        const baseQuery = { ...dateFilter };

        if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
            baseQuery.project = new mongoose.Types.ObjectId(projectId);
        }

        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            // For TimeEntries it's 'user', for Deliverables it's 'createdBy'
        }

        const timeEntryQuery = { ...baseQuery };
        const deliverableQuery = { ...baseQuery };

        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            timeEntryQuery.user = new mongoose.Types.ObjectId(userId);
            deliverableQuery.createdBy = new mongoose.Types.ObjectId(userId);
        }

        // 4. Fetch
        const [timeEntries, deliverables] = await Promise.all([
            TimeEntry.find(timeEntryQuery).populate("user", "name email firstName lastName").sort({ date: 1 }),
            Deliverable.find(deliverableQuery).populate("createdBy", "name email firstName lastName").sort({ date: 1 }),
        ]);

        res.json({ timeEntries, deliverables });

    } catch (err) {
        console.error("Analytics Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}, "name email firstName lastName _id");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};