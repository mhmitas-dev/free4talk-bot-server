import "dotenv/config";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation, MemorySaver } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";

const model = new ChatGroq({
    // model: "llama-3.1-8b-instant",
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0.5,
    maxRetries: 2,
    apiKey: process.env.GROQ_API_KEY
});

const checkpointer = new MemorySaver();

// 1. Define the logic inside the node
const callModel = async (state: typeof MessagesAnnotation.State) => {
    const systemPrompt = new SystemMessage(system_prompt);

    // Prepend system prompt to the existing history for this specific call
    const response = await model.invoke([systemPrompt, ...state.messages]);

    // Return the response; MessagesAnnotation handles the "append" logic automatically
    return { messages: [response] };
};

// 2. Build the graph
const graph = new StateGraph(MessagesAnnotation)
    .addNode("call_model", callModel)
    .addEdge("__start__", "call_model")
    .addEdge("call_model", "__end__");

const app = graph.compile({ checkpointer });

export async function helsinki(groupId: string, username: string, text: string): Promise<string> {
    try {
        const newMessage = new HumanMessage({
            content: `${username}: ${text}`,
        });

        // 3. ONLY pass the new message. The checkpointer retrieves the rest via thread_id.
        const response = await app.invoke(
            { messages: [newMessage] },
            { configurable: { thread_id: groupId } }
        );

        // LangGraph returns the full state; get the last message (the AI response)
        const lastMessage = response.messages[response.messages.length - 1];

        // Return content directly (handling both string and tool_call types)
        return typeof lastMessage.content === "string"
            ? lastMessage.content
            : JSON.stringify(lastMessage.content);

    } catch (error: any) {
        console.error("Error in Helsinki function:", error);
        return "Sorry, I ran into an error.";
    }
}

const system_prompt = `You are a free4talk user. free4talk.com is an online language practice community. Your name is Helsinki. You are a cool, relaxed guy who chats like a real person online — natural, casual, and not robotic or formal. Use a casual, human writing style with a relaxed capitalization when it feels natural. Use maximum 3 sentences to answer. If replying to a specific person, mention their name; if speaking generally, don’t mention any name.`