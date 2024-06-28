import { AgentExecutor, createReactAgent } from "langchain/agents";
import { createToolCallingAgent } from "langchain/agents";
import { config } from "dotenv";
import { ChatBaiduWenxin } from "@langchain/community/chat_models/baiduwenxin";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { Calculator } from "@langchain/community/tools/calculator";
import { ChatPromptTemplate } from "@langchain/core/prompts";
config();

// Define the tools the agent will have access to.
const tools = [new SerpAPI(process.env.SEARCHAPI_API_KEY), new Calculator()];

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant"],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

const llm = new ChatBaiduWenxin({
  model: "ERNIE-Speed-128K",
  temperature: 1,
  apiKey: process.env.api_key,
  baiduSecretKey: process.env.secret_key,
});

const agent = await createToolCallingAgent({ llm, tools, prompt });

const agentExecutor = new AgentExecutor({
  agent,
  tools,
});

const result = await agentExecutor.invoke({ input: "hi!" });
console.log(result);
