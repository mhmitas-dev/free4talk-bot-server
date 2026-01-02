import "dotenv/config";
import { createAgent, HumanMessage } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { system_prompt_for_agent } from "./prompts.js";
import { ChatCerebras } from "@langchain/cerebras";

const llm = new ChatCerebras({
    model: "llama-3.3-70b",
    temperature: 0.5,
    maxTokens: 100,
    maxRetries: 2,
})

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
        // content: `${username.toUpperCase()}: ${message}`,
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
    console.log(result?.messages?.at(-1)?.content)
    return result?.messages?.at(-1)?.content || "Couldn't find anything to send!"
}