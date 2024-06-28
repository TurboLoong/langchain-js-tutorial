import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { ChatBaiduWenxin } from "@langchain/community/chat_models/baiduwenxin";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { config } from "dotenv";
config();

const prompt1 = ChatPromptTemplate.fromTemplate(
  "生成一个{attribute}属性的颜色。除了返回这个颜色的名字不要做其他事:"
);
const prompt2 = ChatPromptTemplate.fromTemplate(
  "什么水果是这个颜色:{color},只返回一个水果的名字就可以了，不要做其他事情:"
);
const prompt3 = ChatPromptTemplate.fromTemplate(
  "哪个国家的国旗有这个颜色:{color},只返回一个国家的名字不要做其他事情:"
);
const prompt4 = ChatPromptTemplate.fromTemplate(
  "有这个颜色的水果是{fruit},有这个颜色的国旗是{country}？"
);
const model = new ChatBaiduWenxin({
  model: "ERNIE-Speed-128K",
  temperature: 1,
  apiKey: process.env.api_key,
  baiduSecretKey: process.env.secret_key,
});

const model_parser = model.pipe(new StringOutputParser());

const color_generator = RunnableSequence.from([
  { attribute: new RunnablePassthrough() },
  prompt1,
  { color: model_parser },
]);

const color_to_fruit = prompt2.pipe(model_parser);
const color_to_country = prompt3.pipe(model_parser);

const question_generator = RunnableSequence.from([
  color_generator,
  { fruit: color_to_fruit, country: color_to_country },
  prompt4,
]);

const result = await question_generator.invoke("天空");
console.log(result);
