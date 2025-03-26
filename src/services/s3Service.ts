import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

// Creating S3 client
const s3Client = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function uploadToS3(userId: number, file: Express.Multer.File) {
  const timestamp = Date.now();
  const fileKey = `uploads/${userId}/${timestamp}_${file.originalname}`;

  return s3Client
    .upload({
      Bucket: "distributed-video-transcoder-in-bucket",
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: { userId: String(userId) }, // Attach userId in metadata
    })
    .promise();
}
