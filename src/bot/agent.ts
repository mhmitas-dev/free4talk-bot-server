import { ChatGroq } from "@langchain/groq";
import "dotenv/config";
import { createAgent, HumanMessage } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { system_prompt_for_agent } from "./prompts.js";

const llm = new ChatGroq({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0.5,
    apiKey: process.env.GROQ_API_KEY
});

const checkpointer = new MemorySaver()
const agent = createAgent({
    model: llm,
    systemPrompt: system_prompt_for_agent,
    checkpointer
})


export async function callAgent({ message, username, groupId }: { message: string, username: string, groupId: string }) {
    if (!message || !username || !groupId) {
        return "??? Missing required fields: message, username, groupId";
    }

    const humanMsg = new HumanMessage({
        content: message,
        name: username,
    });

    const result = await agent.invoke({
        messages: [humanMsg],
    }, {
        configurable: {
            thread_id: groupId
        }
    });

    return result?.messages?.at(-1)?.content || "Couldn't find anything to send!"
}