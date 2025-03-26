import { Request, Response } from "express";
import {
  createAccessToken,
  verifyRefreshToken,
} from "../../services/tokenService";

export default async function refreshToken(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token is required" });
    return;
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
    return;
  }

  // Generate a new access token
  const newAccessToken = createAccessToken(decoded.userId);

  res.status(200).json({ accessToken: newAccessToken });
  return;
}
