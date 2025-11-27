const socketIo = require("socket.io");

let io;
const userSockets = new Map(); // Map userId -> socketId

module.exports = {
    init: (server) => {
        io = socketIo(server, {
            cors: {
                origin: "http://localhost:5173", // Frontend URL
                methods: ["GET", "POST"],
                credentials: true,
            },
        });

        io.on("connection", (socket) => {
            console.log("Client connected:", socket.id);

            socket.on("register", (userId) => {
                if (userId) {
                    userSockets.set(userId, socket.id);
                    console.log(`User registered: ${userId} -> ${socket.id}`);
                }
            });

            socket.on("disconnect", () => {
                console.log("Client disconnected:", socket.id);
                // Remove user from map on disconnect
                for (const [userId, socketId] of userSockets.entries()) {
                    if (socketId === socket.id) {
                        userSockets.delete(userId);
                        console.log(`User unregistered: ${userId}`);
                        break;
                    }
                }
            });
        });

        return io;
    },
    getIo: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    },
    getUserSocketId: (userId) => {
        return userSockets.get(userId);
    },
};
