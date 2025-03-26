import { Router } from "express";
import { s3Upload } from "../controllers/jobControllers/s3Upload.controller";
import multer from "multer";
import authMiddleware from "../middlewares/authMiddleware";
const upload = multer();

const jobRouter = Router();

jobRouter.post("/", authMiddleware, upload.single("file"), s3Upload);

export default jobRouter;
