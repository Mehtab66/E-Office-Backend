const jwt = require("jsonwebtoken");

const authMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    console.log("Middleware invoked for:", req.method, req.url); // Debug: Log request details
    const authHeader = req.header("Authorization");
    console.log("Authorization header:", authHeader); // Debug: Log full header

    if (!authHeader) {
      console.log("No Authorization header provided"); // Debug
      return res
        .status(401)
        .json({ message: "No Authorization header provided" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : authHeader;
    console.log("Token:", token); // Debug: Log extracted token

    if (!token) {
      console.log("No token provided"); // Debug
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      console.log("Verifying token with JWT_SECRET:", !!process.env.JWT_SECRET); // Debug: Check if JWT_SECRET is set
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded); // Debug: Log decoded payload
      req.user = decoded; // Contains { id, role, isAdmin }

      if (
        !Array.isArray(allowedRoles) ||
        !allowedRoles.includes(decoded.role)
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
