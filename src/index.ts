import "dotenv/config";
import express from "express";
import { helsinki } from "./bot/helsinki.js";
import cors from "cors"
import { callAgent } from "bot/agent.js";
const app = express();
app.use(express.json());

const allowedOrigins = ['chrome-extension://iocmdpdgbmhgebahciahcpkhdofjdlkf', 'http://localhost:3000'];
app.use(cors({
  origin: function (origin: any, callback: any) {
    // Allow requests with no origin (like mobile apps or curl requests) or from the allowed list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));


// Health check endpoint
app.get("/", (_, res) => {
  res.json({ status: "Helsinki bot is running" });
});

// Main endpoint - receives messages from polling system
app.post("/chat", async (req: any, res: any) => {
  try {
    const { groupId, newMessage } = req.body;

    // Validate input
    if (!groupId || !newMessage?.username || !newMessage?.text) {
      return res.status(400).json({
        error: "Missing required fields: groupId, newMessage.username, newMessage.text"
      });
    }

    // Call Helsinki bot
    const response = await helsinki(groupId, newMessage.username, newMessage.text);

    // Return response
    res.json({ response });

  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/test", async (req: any, res: any) => {
  const { groupId, newMessage } = req.body;

  // Validate input
  if (!groupId || !newMessage?.username || !newMessage?.text) {
    return res.status(400).json({
      error: "Missing required fields: groupId, newMessage.username, newMessage.text"
    });
  }

  console.log({ groupId, newMessage })
  res.json({ response: "Helsinki bot received message" });
});


app.post("/test-agent", async (req: any, res: any) => {
  const { groupId, newMessage } = req.body;

  // Validate input
  if (!groupId || !newMessage?.username || !newMessage?.text) {
    return res.status(400).json({
      error: "Missing required fields: groupId, newMessage.username, newMessage.text"
    });
  }

  const response = await callAgent({
    message: newMessage.text,
    username: newMessage.username,
    groupId: groupId
  })

  return res.json({ response });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Helsinki bot running on port ${PORT}`);
});