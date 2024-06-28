import { TextLoader } from "langchain/document_loaders/fs/text";
import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from "langchain/text_splitter";
// const loader = new TextLoader("document/test.txt");

// const docs = await loader.load();
// const textSplitter = new CharacterTextSplitter({
//   separator: "。",
//   keepSeparators: true,
//   chunkSize: 50,
//   chunkOverlap: 20,
//   lengthFunction: (text) => text.length, // 长度函数,也可以传递tokenize函数
// });

// const result = await textSplitter.createDocuments([docs[0].pageContent]);
const code = `
def hello_world():
    print("Hello, World!")
#调用函数
hello_world()
`;
RecursiveCharacterTextSplitter.fromLanguage("python");
const codeSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 50,
  chunkOverlap: 20,
});
const result = await codeSplitter.createDocuments([code]);

console.log(result[0].pageContent);
