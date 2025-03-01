import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jobRouter from "./routes/jobRouter";

dotenv.config();

const app = express();
app.use(cors());

app.use("/fileUpload", jobRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
