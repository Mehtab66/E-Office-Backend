const Notification = require("../models/notification.model");

const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications
        res.json(notifications);
    } catch (err) {
        next(err);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        res.json(notification);
    } catch (err) {
        next(err);
    }
};

const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
};
