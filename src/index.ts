import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routers
import jobRouter from "./routes/jobRouter";
import notificationRouter from "./routes/notificationRouter";

// websocket initializer
import { initializeWebSocket } from "./websocket/websocketManager";

// Config
dotenv.config();

// Express app
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;

// Starting express (http) Server
const httpServer = app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});

// Starting websocket server
initializeWebSocket(httpServer);

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello");
});

app.use("/fileUpload", jobRouter);
app.use("/notification", notificationRouter);
