NVIDIA:
- meta/llama3-70b-instruct
- moonshotai/kimi-k2-thinking


```ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '$NVIDIA_API_KEY',
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

async function main() {
  const completion = await openai.chat.completions.create({
    model: "meta/llama3-70b-instruct",
    messages: [{"role":"user","content":""}],
    temperature: 0.5,
    top_p: 1,
    max_tokens: 1024,
    stream: true,
  })
   
  for await (const chunk of completion) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '')
  }
  
}

main();
```