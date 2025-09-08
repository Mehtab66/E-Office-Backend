const jwt = require("jsonwebtoken");

const authMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    console.log("Middleware invoked for:", req.method, req.url); // Debug: Log request details
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      console.log("No Authorization header provided"); // Debug
      return res
        .status(401)
        .json({ message: "No Authorization header provided" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : authHeader;

    if (!token) {
      console.log("No token provided"); // Debug
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded); // Debug: Log decoded payload
      req.user = decoded; // Contains { id, role, isAdmin }

      // Normalize roles to lowercase for case-insensitive comparison
      const userRole = decoded.role.toLowerCase();
      const normalizedAllowedRoles = Array.isArray(allowedRoles)
        ? allowedRoles.map((role) => role.toLowerCase())
        : [];

      if (
        !Array.isArray(allowedRoles) ||
        !normalizedAllowedRoles.includes(userRole)
      ) {
        console.log(
          "Access denied: Role",
          decoded.role,
          "not in",
          allowedRoles
        ); // Debug
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    } catch (error) {
      console.error("Token verification error:", error.message); // Debug: Log error
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};

module.exports = authMiddleware;