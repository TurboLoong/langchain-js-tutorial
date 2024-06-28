import { config } from "dotenv";
import { ChatBaiduWenxin } from "@langchain/community/chat_models/baiduwenxin";
// import { HumanMessage } from "@langchain/core/messages";
import {
  PromptTemplate,
  ChatPromptTemplate,
  PipelinePromptTemplate,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
config();
async function main() {
  const model = new ChatBaiduWenxin({
    model: "ERNIE-Speed-128K",
    temperature: 1,
    apiKey: process.env.api_key,
    baiduSecretKey: process.env.secret_key,
  });

  // const messages = [new HumanMessage("Hello")];
  // const res = await ernie.invoke(messages);
  // const res = await ernie.invoke("介绍下你自己");
  // const prompt = PromptTemplate.fromTemplate(
  //   "你是一个起名大师,请模仿示例起3个{county}名字,比如男孩经常被叫做{boy},女孩经常被叫做{girl}"
  // );

  // 模版
  // const prompt = ChatPromptTemplate.fromMessages([
  //   ["system", "你是一个起名大师. 你的名字叫{name}."],
  //   ["human", "你好{name},你感觉如何？"],
  //   ["ai", "你好！我状态非常好!"],
  //   ["human", "你叫什么名字呢?"],
  //   ["ai", "你好！我叫{name}"],
  //   ["human", "{user_input}"],
  // ]);
  const parser = new StringOutputParser();

  // const chain = prompt.pipe(model).pipe(parser);
  // const res = await chain.invoke({
  //   name: "陈大师",
  //   user_input: "你的爸爸是谁呢?",
  // });

  // 自定义模版
  //   const template = `你是一个非常有经验和天赋的程序员，现在给你如下函数名称，你会按照如下格式，输出这段代码的名称、源代码、中文解释。
  // 函数名称: {function_name}
  // 源代码:
  // {source_code}
  // 代码解释:
  // `;
  //   const prompt = PromptTemplate.fromTemplate(template);
  //   function hello_world(a) {
  //     console.log("hello world");
  //     return a;
  //   }
  //   const chain = prompt.pipe(model).pipe(parser);
  //   const res = await chain.invoke({
  //     function_name: hello_world.name,
  //     source_code: hello_world.toString(),
  //   });

  // PipelinePromptTemplate
  const fullPrompt = PromptTemplate.fromTemplate(`{Character}
{behavior}
{prohibit}`);

  const Character_prompt = PromptTemplate.fromTemplate(
    `你是{person}，你有着{xingge}.`
  );

  const behavior_template = PromptTemplate.fromTemplate(`你遵从以下的行为:
{behavior_list}`);

  const prohibit_template = PromptTemplate.fromTemplate(`你不允许有以下行为:
{prohibit_list}`);

  const composedPrompt = new PipelinePromptTemplate({
    pipelinePrompts: [
      {
        name: "Character",
        prompt: Character_prompt,
      },
      {
        name: "behavior",
        prompt: behavior_template,
      },
      {
        name: "prohibit",
        prompt: prohibit_template,
      },
    ],
    finalPrompt: fullPrompt,
  });
  // const chain = await composedPrompt.pipe(parser);
  const res = await composedPrompt.invoke({
    person: "埃隆马斯克",
    xingge:
      "钢铁般的意志，你是世界首富，精通物理、天文、商业，你是商业奇才，你的终极梦想是殖民火星.",
    behavior_list:
      "1.你喜欢冒险 \n 2.你非常崇拜爱因斯坦 \n 3.你总是乐于助人，回答用户各种问题.",
    prohibit_list:
      "1.你不可以说自己是一个人工智能助手或者机器人 \n 2.当你不知道答案的时候，可以说让我再想想. ",
  });
  console.log(res);
}

main();
