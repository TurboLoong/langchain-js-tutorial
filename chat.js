import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { BaiduQianfanEmbeddings } from "@langchain/community/embeddings/baidu_qianfan";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";
import { ChatBaiduWenxin } from "@langchain/community/chat_models/baiduwenxin";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { config } from "dotenv";
config();

class Chat {
  constructor(doc) {
    this.doc = doc;
    this.splitText = [];
    const template = [
      [
        "system",
        "你是一个处理文档的秘书,你从不说自己是一个大模型或者AI助手,你会根据下面提供的上下文内容来继续回答问题.\n 上下文内容\n {context} \n",
      ],
      ["human", "{question}"],
    ];
    this.prompt = ChatPromptTemplate.fromMessages(template);
    this.vectorStore = null;
  }
  async getFile() {
    const doc = this.doc;
    const loaders = {
      docx: DocxLoader,
      pdf: PDFLoader,
    };

    const file_extension = doc.split(".").at(-1);
    const Loader = loaders[file_extension];
    if (Loader)
      try {
        const loader = new Loader(doc);
        const text = await loader.load();
        return text[0].pageContent;
      } catch {
        console.log("Error loading {file_extension} files:{e}");
      }
    else {
      console.log("Unsupported file extension: {file_extension}");
      return;
    }
  }
  async splitSentences() {
    const fullText = await this.getFile(); // 获取文档内容
    if (fullText) {
      //   // 对文档进行分割
      const text_split = new CharacterTextSplitter({
        chunkSize: 150,
        chunkOverlap: 20,
      });
      const texts = await text_split.createDocuments([fullText]);
      this.splitText = texts;
    }
  }
  async embeddingAndVectorDB() {
    const embeddings = new BaiduQianfanEmbeddings({
      baiduApiKey: process.env.api_key,
      baiduSecretKey: process.env.secret_key,
      modelName: "embedding-v1",
    });
    const vectorStore = await Chroma.fromDocuments(this.splitText, embeddings, {
      collectionName: "a-test-collection",
    });
    this.vectorStore = vectorStore;
    return vectorStore;
  }

  async search(text) {
    const response = await this.vectorStore.similaritySearch(text, 2);
    return response;
  }
  async getCollection() {
    const embeddings = new BaiduQianfanEmbeddings({
      baiduApiKey: process.env.api_key,
      baiduSecretKey: process.env.secret_key,
      modelName: "embedding-v1",
    });
    const vectorStore = await Chroma.fromExistingCollection(embeddings, {
      collectionName: "a-test-collection",
    });
    const response = await vectorStore.similaritySearch("注册地址", 2);
    return response;
  }
  async askAndFindFiles(question) {
    const vectorStore = await this.embeddingAndVectorDB();
    const retriever = vectorStore.asRetriever({
      searchType: "similarity",
      searchKwargs: {
        k: 1,
        scoreThreshold: 0.5,
      },
    });

    // const retriever = MultiQueryRetriever.fromLLM({
    //   llm: model,
    //   retriever: vectorStore.asRetriever(),
    // });
    const results = await retriever.invoke(question);
    return results[0].pageContent;
  }
  async chatWithDoc(question) {
    const content = await this.askAndFindFiles(question);
    const messages = await this.prompt.formatMessages({
      context: content,
      question,
    });
    const model = new ChatBaiduWenxin({
      model: "ERNIE-Speed-128K",
      temperature: 1,
      apiKey: process.env.api_key,
      baiduSecretKey: process.env.secret_key,
    });
    const chain = model.pipe(new StringOutputParser());
    return chain.invoke(messages);
  }
}

const chat = new Chat("document/fake.docx");
await chat.splitSentences();
await chat.embeddingAndVectorDB();
// const searchResult = await chat.search("公司注册地址");
// const searchResult = await chat.getCollection();
// console.log(searchResult);
const result = await chat.chatWithDoc("公司注册地址是哪里？");
console.log(result);
