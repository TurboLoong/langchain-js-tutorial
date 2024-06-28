import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";
import { ChatBaiduWenxin } from "@langchain/community/chat_models/baiduwenxin";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { RedisChatMessageHistory } from "@langchain/redis";
import { config } from "dotenv";
config();

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "你是一个擅长{ability}的助手"],
  new MessagesPlaceholder("history"),
  ["human", "{question}"],
]);

const chain = prompt.pipe(
  new ChatBaiduWenxin({
    model: "ERNIE-Speed-128K",
    temperature: 1,
    apiKey: process.env.api_key,
    baiduSecretKey: process.env.secret_key,
  })
);

const chainWithHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory: (sessionId) =>
    new RedisChatMessageHistory({
      sessionId: sessionId,
      sessionTTL: 300,
      url: "redis://localhost:6379/DB0",
    }),
  inputMessagesKey: "question",
  historyMessagesKey: "history",
});

// await chainWithHistory.invoke(
//   { ability: "历史", question: "中国人口最多城市是哪个?" },
//   {
//     configurable: {
//       sessionId: "my-session-id",
//     },
//   }
// );

// await chainWithHistory.invoke(
//   { ability: "历史", question: "它有多少人口？" },
//   {
//     configurable: {
//       sessionId: "my-session-id",
//     },
//   }
// );
const result = await chainWithHistory.invoke(
  { ability: "历史", question: "刚才我们的聊天记录出现了几个城市" },
  {
    configurable: {
      sessionId: "my-session-id",
    },
  }
);
console.log("result", result);
