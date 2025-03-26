import { Router } from "express";
import signup from "../controllers/userControllers/signup";
import signin from "../controllers/userControllers/signin";

const userRouter = Router();

userRouter.post("/signup", signup);
userRouter.post("/signin", signin);

export default userRouter;
