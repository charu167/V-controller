import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "your_access_secret";

// Extend the Request type to include `userId`
declare module "express" {
  interface Request {
    userId?: number;
  }
}

// Middleware to protect routes
export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized - No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as {
      userId: number;
    };
    req.userId = decoded.userId; // Attach userId to the request object
    next(); // Proceed to the next middleware or controller
  } catch (error) {
    res.status(401).json({ message: "Unauthorized - Invalid token" });
    return;
  }
}
