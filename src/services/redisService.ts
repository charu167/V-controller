import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

// ✅ Create a persistent Redis client instance
const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 12944,
  },
});

(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Connected to Redis");
  } catch (error) {
    console.error("❌ Redis connection error:", error);
  }
})();

// ✅ Use the same client for all Redis operations
export async function pushToRedisQueue(
  userId: number,
  fileUrl: string,
  fileKey: string
) {
  try {
    const qlen = await redisClient.lLen("video-processing-in-queue");

    const jobData = {
      userId,
      fileUrl,
      fileKey,
      bucket: process.env.AWS_INPUT_BUCKET,
      uploadedAt: new Date().toISOString(),
    };

    await redisClient.lPush(
      "video-processing-in-queue",
      JSON.stringify(jobData)
    );

    if (qlen === 0) {
      await redisClient.publish("video_processing_channel", "new_job");
    }
  } catch (error) {
    console.error("❌ Redis queue error:", error);
    throw error;
  }
}

// ✅ Gracefully handle Redis disconnect on app shutdown
process.on("SIGINT", async () => {
  await redisClient.quit();
  console.log("🔌 Disconnected from Redis");
  process.exit(0);
});
