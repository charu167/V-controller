import { Request, Response } from "express";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

// Creating S3 client
const s3Client = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Creating Redis client
const redisClient = createClient({
  username: "default",
  password: "K5ymQ77FLG0zem0EUBw5XqHbGIsloX8t",
  socket: {
    host: "redis-12944.c61.us-east-1-3.ec2.redns.redis-cloud.com",
    port: 12944,
  },
});

// Actual Controller
export async function s3Upload(req: Request, res: Response) {
  try {
    const result = await s3Client
      .upload({
        Bucket: "distributed-video-transcoder-in-bucket",
        Key: `uploads/${req.file?.originalname}`,
        Body: req.file?.buffer,
        ContentType: req.file?.mimetype,
      })
      .promise();

    await pushToRedisQueue(result);

    res.json({ success: true, result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
}

async function pushToRedisQueue(s3Data: AWS.S3.ManagedUpload.SendData) {
  try {
    await redisClient.connect();
    const qlen = await redisClient.lLen("video-processing-in-queue");

    await redisClient.lPush(
      "video-processing-in-queue",
      JSON.stringify(s3Data)
    );

    if (qlen === 0) {
      await redisClient.publish("video_processing_channel", "job_data");
    }
    await redisClient.disconnect();
  } catch (error) {
    console.error("Redis queue error:", error);
    throw error;
  }
}
