import { BufferMemory } from "langchain/memory";
import { ChatBaiduWenxin } from "@langchain/community/chat_models/baiduwenxin";
import { PromptTemplate } from "@langchain/core/prompts";
import { ConversationChain } from "langchain/chains";
import { config } from "dotenv";
config();

// Initialize the memory to store chat history and set up the language model with a specific temperature.
const memory = new BufferMemory({ memoryKey: "chat_history" });
const model = new ChatBaiduWenxin({
  model: "ERNIE-Speed-128K",
  temperature: 1,
  apiKey: process.env.api_key,
  baiduSecretKey: process.env.secret_key,
});

// Create a prompt template for a friendly conversation between a human and an AI.
const prompt =
  PromptTemplate.fromTemplate(`The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
{chat_history}
Human: {input}
AI:`);

// Set up the chain with the language model, prompt, and memory.
const chain = new ConversationChain({ llm: model, prompt, memory });

// Example usage of the chain to continue the conversation.
// The `call` method sends the input to the model and returns the AI's response.
const res = await chain.call({ input: "Hi! I'm Jim." });
console.log({ res });

const res2 = await chain.invoke({ input: "What did I just say my name was?" });
console.log({ res2 });
