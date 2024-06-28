import { config } from "dotenv";
import { BaiduQianfanEmbeddings } from "@langchain/community/embeddings/baidu_qianfan";
import { PromptTemplate, FewShotPromptTemplate } from "@langchain/core/prompts";
import { SemanticSimilarityExampleSelector } from "@langchain/core/example_selectors";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";
config();
async function main() {
  const examples = [
    { input: "happy", output: "sad" },
    { input: "tall", output: "short" },
    { input: "sunny", output: "gloomy" },
    { input: "windy", output: "calm" },
    { input: "高兴", output: "悲伤" },
  ];

  const example_prompt = PromptTemplate.fromTemplate(
    "原词：{input}\n反义：{output}"
  );

  const example_selector = await SemanticSimilarityExampleSelector.fromExamples(
    // 传入示例组
    examples,
    // 使用openai的嵌入来做相似性搜索
    new BaiduQianfanEmbeddings({
      baiduApiKey: process.env.api_key,
      baiduSecretKey: process.env.secret_key,
      modelName: "embedding-v1",
    }),
    // 设置使用的向量数据库是什么
    FaissStore,
    // 结果条数
    {
      k: 2,
    }
  );
  const similar_prompt = new FewShotPromptTemplate({
    exampleSelector: example_selector,
    examplePrompt: example_prompt,
    prefix: "给出每个输入词的反义词",
    suffix: "原词: {adjective}\n反义:",
    inputVariables: ["adjective"],
  });

  const res = await similar_prompt.format({
    adjective: "worried",
  });

  console.log(res);
}
main();
