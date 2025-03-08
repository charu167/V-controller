import { Router } from "express";
import videoNotificationController from "../controllers/notificationControllers/videoNotificationController";

const notificationRouter = Router();

notificationRouter.post("/video-processed", videoNotificationController);

export default notificationRouter;
