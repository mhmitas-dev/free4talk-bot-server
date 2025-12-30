import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage } from "@langchain/core/messages";
import * as dotenv from "dotenv";

dotenv.config();

const model = new ChatMistralAI({
    model: "mistral-tiny", // or "mistral-small", "mistral-medium", etc.
    apiKey: "HQYTjWRjxA62S2rWWFLpdEdjj5sdocUM",
});

async function chat() {
    const response = await model.invoke([
        new HumanMessage("Hello, how are you?")
    ]);
    console.log(response.content);
}

chat();