import { Chroma } from "@langchain/community/vectorstores/chroma";
import { BaiduQianfanEmbeddings } from "@langchain/community/embeddings/baidu_qianfan";
import { config } from "dotenv";
config();
const embeddings = new BaiduQianfanEmbeddings({
  baiduApiKey: process.env.api_key,
  baiduSecretKey: process.env.secret_key,
  modelName: "embedding-v1",
});
// const vectorStore = await Chroma.fromExistingCollection(embeddings, {
//   collectionName: "a-test-collection",
// });
// const response = await vectorStore.similaritySearch("注册地址", 1);

import { ChromaClient } from "chromadb";
const client = new ChromaClient();
// const result = await client.reset(); // Empties and completely resets the database. ⚠️ This is destructive and not reversible.
// const collection = await client.getCollection({
//   name: "a-test-collection",
//   embeddingFunction: embeddings,
// });
// const result = collection.query({
//   queryTexts: ["注册地址"], // Chroma will embed this for you
//   nResults: 2, // how many results to return
// });
client.deleteCollection({ name: "a-test-collection" });
// console.log(result);
