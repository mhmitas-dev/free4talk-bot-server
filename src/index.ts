import express, { type Request, type Response } from 'express';
import 'dotenv/config';
import cors, { type CorsOptions } from 'cors';
import rateLimit from 'express-rate-limit';
import { callAgent } from './bot/agent.js';

const app = express();

const corsOptions: CorsOptions = {
  // Allow only your frontend's domain
  origin: [
    'chrome-extension://iocmdpdgbmhgebahciahcpkhdofjdlkf',
    "https://www.free4talk.com"
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Required if sending cookies or auth headers
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());

const callAgentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute in milliseconds
  limit: 10,           // Maximum of 40 requests per window
  message: 'Too many requests to this agent. Please try again after a minute.',
  standardHeaders: 'draft-8', // Returns rate limit info in the `RateLimit` header
  legacyHeaders: false,       // Disables the `X-RateLimit-*` headers
});


app.post("/chat", callAgentLimiter, async (req: Request, res: Response) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI Server running on port ${PORT}`));