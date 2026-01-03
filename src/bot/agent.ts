import "dotenv/config";
import { createAgent, HumanMessage, summarizationMiddleware } from "langchain";
import { system_prompt_for_agent } from "./prompts.js";
import { ChatOpenAI } from "@langchain/openai";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { getMongoClient } from "../lib/db.js";

const client = await getMongoClient();
const checkpointer = new MongoDBSaver({
    client: client as any,
    dbName: "helsinki_memory"
});

const llm = new ChatOpenAI({
    model: "deepseek-ai/deepseek-v3.1-terminus",
    configuration: {
        baseURL: "https://integrate.api.nvidia.com/v1",
        apiKey: process.env.NVIDIA_API_KEY
    }
});

const agent = createAgent({
    model: llm,
    systemPrompt: system_prompt_for_agent,
    checkpointer,
    middleware: [
        summarizationMiddleware({
            model: llm,
            trigger: { tokens: 1200 },
            keep: { messages: 26 },
        }),
    ],
})

export async function callAgent({ message, username, groupId }: { message: string, username: string, groupId: string }) {
    if (!message || !username || !groupId) {
        return "❌ Missing required fields: message, username, or groupId";
    }

    const config = {
        configurable: { thread_id: groupId }
    };

    const result = await agent.invoke({
        messages: [new HumanMessage(`Name: ${username}\nMessage: ${message}`)],
    }, config);

    return result?.messages?.at(-1)?.content || "⚠️🤖 No response generated.";
}