import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "your_access_secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your_refresh_secret";

// Token expiration times
const ACCESS_TOKEN_EXPIRY = "3d"; // 15 minutes
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

// Function to create an access token
export function createAccessToken(userId: number) {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

// Function to create a refresh token
export function createRefreshToken(userId: number) {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

// Function to verify an access token
export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

// Function to verify a refresh token
export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: number };
}
