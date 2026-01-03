import "dotenv/config";
import { createAgent, HumanMessage, summarizationMiddleware } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { system_prompt_for_agent } from "./prompts.js";
import { ChatCerebras } from "@langchain/cerebras";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatCerebras({
    model: "llama-3.3-70b",
    temperature: 0.5,
    maxTokens: 100,
    maxRetries: 2,
})

const summarizationModel = new ChatOpenAI({
    modelName: "deepseek-ai/deepseek-v3.1-terminus",
    configuration: {
        baseURL: "https://integrate.api.nvidia.com/v1",
        apiKey: process.env.NVIDIA_API_KEY
    }
});

const checkpointer = new MemorySaver()
const agent = createAgent({
    model: llm,
    systemPrompt: system_prompt_for_agent,
    checkpointer,
    middleware: [
        summarizationMiddleware({
            model: summarizationModel,
            trigger: { tokens: 1200 },
            keep: { messages: 26 },
        }),
    ],
})


export async function callAgent({ message, username, groupId }: { message: string, username: string, groupId: string }) {
    if (!message || !username || !groupId) {
        return "??? Missing required fields: message, username, groupId";
    }

    // const humanMsg = new HumanMessage({
    //     // content: `${username.toUpperCase()}: ${message}`,
    //     content: message,
    //     name: username,
    // });

    const formattedMessage = `Name: ${username} \nMessage: ${message}`

    const result = await agent.invoke({
        messages: [new HumanMessage(formattedMessage)],
    }, {
        configurable: {
            thread_id: groupId
        }
    });
    // console.log(result?.messages?.at(-1)?.content)
    return result?.messages?.at(-1)?.content || "Couldn't find anything to send!"
}