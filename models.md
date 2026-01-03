# NVIDIA
```ts
const llm = new ChatOpenAI({
    modelName: "deepseek-ai/deepseek-v3.1-terminus",
    configuration: {
        baseURL: "https://integrate.api.nvidia.com/v1",
        apiKey: process.env.NVIDIA_API_KEY
    }
});
```
### Models
- deepseek-ai/deepseek-v3.1-terminus
- vidia/nemotron-3-nano-30b-a3b