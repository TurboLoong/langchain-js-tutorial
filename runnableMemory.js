import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableLambda, RunnablePassthrough } from "@langchain/core/runnables";
import { ChatBaiduWenxin } from "@langchain/community/chat_models/baiduwenxin";
import { BufferMemory } from "langchain/memory";

import { config } from "dotenv";
config();
const model = new ChatBaiduWenxin({
  model: "ERNIE-Speed-128K",
  temperature: 1,
  apiKey: process.env.api_key,
  baiduSecretKey: process.env.secret_key,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "你是一个乐于助人的机器人"],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

const memory = new BufferMemory({ returnMessages: true });
const chain = RunnablePassthrough.assign({
  history: RunnableLambda.from(async function () {
    const res = await memory.loadMemoryVariables();
    return res.history;
  }),
})
  .pipe(prompt)
  .pipe(model);
const input = { input: "你好我是tomie" };
const result = await chain.invoke(input);
memory.saveContext(input, { output: result.content });
const resp = await chain.invoke({ input: "我叫什么名字?" });
console.log(resp);
