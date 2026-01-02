import "dotenv/config";
import express from "express";
import { helsinki } from "./bot/helsinki.js";
import cors from "cors"
import { callAgent } from "bot/agent.js";
import { rateLimit } from 'express-rate-limit';

const app = express();
app.use(express.json());

const allowedOrigins = [
  'chrome-extension://iocmdpdgbmhgebahciahcpkhdofjdlkf',
  'http://localhost:3000',
  "https://www.free4talk.com"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
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


const callAgentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute in milliseconds
  limit: 30,           // Maximum of 40 requests per window
  message: 'Too many requests to this agent. Please try again after a minute.',
  standardHeaders: 'draft-8', // Returns rate limit info in the `RateLimit` header
  legacyHeaders: false,       // Disables the `X-RateLimit-*` headers
});


app.post("/test-agent", callAgentLimiter, async (req: any, res: any) => {
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