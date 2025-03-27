import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import generateRunScript from "../controllers/scriptControllers/runController";

const scriptRouter = Router();

scriptRouter.get("/generate-run-sh", authMiddleware, generateRunScript);

export default scriptRouter;
