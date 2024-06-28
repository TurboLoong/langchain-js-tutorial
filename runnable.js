import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableMap } from "@langchain/core/runnables";
import { ChatBaiduWenxin } from "@langchain/community/chat_models/baiduwenxin";
import { config } from "dotenv";
config();
const model = new ChatBaiduWenxin({
  model: "ERNIE-Speed-128K",
  temperature: 1,
  apiKey: process.env.api_key,
  baiduSecretKey: process.env.secret_key,
});

const jokeChain = PromptTemplate.fromTemplate(
  "Tell me a joke about {topic}"
).pipe(model);
const poemChain = PromptTemplate.fromTemplate(
  "write a 2-line poem about {topic}"
).pipe(model);

const mapChain = RunnableMap.from({
  joke: jokeChain,
  poem: poemChain,
});
const result = await mapChain.invoke({ topic: "bear" });
console.log(result);
