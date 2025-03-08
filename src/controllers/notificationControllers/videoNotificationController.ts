import { Request, Response } from "express";
import { sendNotification } from "../../websocket/websocketManager";

// Interfaces
interface ReqBody {
  userId: number;
  videoId?: number;
  status: string;
  error?: string;
}

export default async function videoNotificationController(
  req: Request,
  res: Response
) {
  try {
    const data = req.body as ReqBody;

    // Validate request body
    if (!data.userId || !data.videoId || !data.status) {
      return res
        .status(400)
        .json({ message: "userId, videoId, and status are required" });
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
      return res
        .status(400)
        .json({ message: "Invalid status. Must be 'completed' or 'failed'." });
    }

    // Send WebSocket notification
    const userId = data.userId;
    const sent = sendNotification(userId, message);

    if (sent) {
      return res
        .status(200)
        .json({ message: "Notification sent successfully" });
    } else {
      return res
        .status(200)
        .json({ message: "User is offline, notification not sent" });
    }
  } catch (error) {
    console.error("Error in videoNotificationController:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
