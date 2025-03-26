import { Server } from "http";
import Websocket from "ws";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || "your_secret";

// Interfaces
interface RegisterPayload {
  type: "register";
  token: string;
}

const clients = new Map<number, Websocket>(); // userId -> websocketClient

export function initializeWebSocket(httpServer: Server) {
  // Start the web socket server
  const websocketServer = new Websocket.Server({ server: httpServer });
  console.log("WebSocket server initialized");

  // Listen for connections
  websocketServer.on("connection", (websocketClient) => {
    // Listen for messages
    websocketClient.on("message", (message: string) => {
      const data = JSON.parse(message) as RegisterPayload;

      if (data.type === "register") {
        try {
          const decoded = jwt.verify(data.token, JWT_SECRET) as {
            userId: number;
          };

          clients.set(decoded.userId, websocketClient);
          (websocketClient as any).userId = decoded.userId;

          websocketClient.send("Registered successfully");
        } catch (err) {
          console.error("Invalid token:", err);
          websocketClient.send("Unauthorized");
          websocketClient.close();
        }
      }
    });

    // De-register the client
    websocketClient.on("close", () => {
      clients.delete((websocketClient as any).userId);
    });
  });
}

export function sendNotification(userId: number, message: object) {
  // Get the client
  const websocketClient = clients.get(userId);

  // Send the messsage
  if (websocketClient && websocketClient.readyState === Websocket.OPEN) {
    websocketClient.send(JSON.stringify(message));
    return true;
  }

  return false;
}
