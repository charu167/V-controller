import { Server } from "http";
import Websocket from "ws";

// Interfaces
interface Data {
  type: string;
  userId: number;
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
      const data = JSON.parse(message) as Data;

      // Register the client
      if (data.type == "register") {
        clients.set(data.userId, websocketClient);
        (websocketClient as any).userId = data.userId;
        websocketClient.send("All set!");
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
