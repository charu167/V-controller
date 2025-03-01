import { Router } from "express";
import { s3Upload } from "../controllers/jobControllers/s3Upload.controller";
import multer from "multer";
const upload = multer();

const jobRouter = Router();

jobRouter.post("/", upload.single("file"), s3Upload);

export default jobRouter;
