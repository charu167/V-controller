import { Request, Response, NextFunction, RequestHandler } from "express";
import { sendNotification } from "../../websocket/websocketManager";

// Interfaces
interface ReqBody {
  userId: number;
  videoId?: number;
  status: string;
  error?: string;
}

export default function videoNotificationController(
  req: Request,
  res: Response
) {
  try {
    const data = req.body;

    // Validate request body
    if (!data.userId || !data.videoId || !data.status) {
      res
        .status(400)
        .json({ message: "userId, videoId, and status are required" });
      return;
    }

    // Build the appropriate message
    let message;
    if (data.status === "completed") {
      message = {
        type: "videoProcessed",
        videoId: data.videoId,
        message: "Your video has been successfully processed!",
      };
    } else if (data.status === "failed") {
      message = {
        type: "videoProcessingFailed",
        videoId: data.videoId,
        message: `Video processing failed: ${data.error || "Unknown error"}`,
      };
    } else {
      res
        .status(400)
        .json({ message: "Invalid status. Must be 'completed' or 'failed'." });
      return;
    }

    // Send WebSocket notification
    const userId = data.userId;
    const sent = sendNotification(userId, message);

    if (sent) {
      res.status(200).json({ message: "Notification sent successfully" });
    } else {
      res
        .status(200)
        .json({ message: "User is offline, notification not sent" });
    }
    return;
  } catch (error) {
    console.error("Error in videoNotificationController:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}
