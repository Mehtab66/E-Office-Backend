// const jwt = require("jsonwebtoken");

// const authMiddleware = (allowedRoles) => {
//   console.log("Allowed Roles",allowedRoles);
  
//   return (req, res, next) => {
//     console.log("Middleware invoked for:", req.method, req.url); // Debug: Log request details
//     const authHeader = req.header("Authorization");

//     if (!authHeader) {
//       console.log("No Authorization header provided"); // Debug
//       return res
//         .status(401)
//         .json({ message: "No Authorization header provided" });
//     }

//     const token = authHeader.startsWith("Bearer ")
//       ? authHeader.replace("Bearer ", "")
//       : authHeader;

//     if (!token) {
//       console.log("No token provided"); // Debug
//       return res.status(401).json({ message: "No token provided" });
//     }

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       console.log("Decoded token:", decoded); // Debug: Log decoded payload
//       req.user = decoded; // Contains { id, role, isAdmin }

//       // Normalize roles to lowercase for case-insensitive comparison
//       const userRole = decoded.role.toLowerCase();
//       const normalizedAllowedRoles = Array.isArray(allowedRoles)
//         ? allowedRoles.map((role) => role.toLowerCase())
//         : [];

//       if (
//         !Array.isArray(allowedRoles) ||
//         !normalizedAllowedRoles.includes(userRole)
//       ) {
//         console.log(
//           "Access denied: Role",
//           decoded.role,
//           "not in",
//           allowedRoles
//         ); // Debug
//         return res.status(403).json({ message: "Access denied" });
//       }
//       next();
//     } catch (error) {
//       console.error("Token verification error:", error.message); // Debug: Log error
//       return res.status(401).json({ message: "Invalid token" });
//     }
//   };
// };

// module.exports = authMiddleware;

// middlewares/auth.middleware.js  (DEV version — remove verbose logs in production)
const jwt = require("jsonwebtoken");

const authMiddleware = (allowedRoles) => {
  console.log("Allowed Roles", allowedRoles);
  return (req, res, next) => {
    console.log("Middleware invoked for:", req.method, req.originalUrl);
    console.log("Raw Authorization header:", req.headers.authorization);

    const authHeader = req.header("Authorization") || req.headers.authorization || "";
    if (!authHeader) {
      console.warn("No Authorization header provided");
      return res.status(401).json({ message: "No Authorization header provided" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      console.warn("No token provided after parsing header");
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);

      // Normalize and populate req.user reliably
      const userId = decoded.id || decoded._id || decoded.userId || decoded.sub;
      const role =
        (decoded.role && String(decoded.role)) ||
        (decoded.roles && (Array.isArray(decoded.roles) ? decoded.roles[0] : String(decoded.roles))) ||
        (decoded.roleName && String(decoded.roleName)) ||
        "";

      if (!userId) {
        console.warn("Decoded token missing user id claim; decoded:", decoded);
        return res.status(401).json({ message: "Invalid token payload" });
      }

      req.user = {
        id: String(userId),
        role: String(role).toLowerCase(),
        raw: decoded,
      };

      // If allowedRoles is not provided (undefined/null/false), allow any authenticated user
      if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
        console.log("No allowedRoles provided — authenticated user allowed");
        return next();
      }

      // Normalize allowed roles to lowercase strings
      const normalizedAllowed = allowedRoles.map((r) => String(r).toLowerCase());
      if (!req.user.role || !normalizedAllowed.includes(req.user.role)) {
        console.warn(
          "Access denied — user role not allowed",
          "userRole:", req.user.role,
          "allowed:", normalizedAllowed
        );
        return res.status(403).json({ message: "Access denied" });
      }

      return next();
    } catch (err) {
      console.error("Token verification error:", err.name, err.message);
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};

module.exports = authMiddleware;
