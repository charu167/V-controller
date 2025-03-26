import { Request, Response } from "express";
import { uploadToS3 } from "../../services/s3Service";
import { pushToRedisQueue } from "../../services/redisService";

// Actual Controller
export async function s3Upload(req: Request, res: Response) {
  try {
    // Get userId from authMiddleware
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Ensure file exists
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    const result = await uploadToS3(Number(userId), req.file);

    await pushToRedisQueue(Number(userId), result.Location, result.Key);

    res.json({ success: true, result });
  } catch (error) {
    console.error("S3 Upload Error:", error);
    res.status(500).json({ success: false, error });
    return;
  }
}
