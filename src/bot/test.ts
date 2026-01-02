import OpenAI from 'openai';
import "dotenv/config";

const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
})

export async function callTestAgent({ message }: { message: string }) {
    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek-ai/deepseek-v3.1-terminus",
            messages: [{ "role": "user", "content": message }],
            temperature: 0.5,
            top_p: 1,
            max_tokens: 1024,
            stream: true,
        })

        for await (const chunk of completion) {
            process.stdout.write(chunk.choices[0]?.delta?.content || '')
        }
    } catch (error) {
        console.log(error)
    }

}

callTestAgent({ message: "Hello! Could you which framework or tool should i use to build ai agents? I don't want to use langchain ecosystem though, as they don't provide good support for TS" })