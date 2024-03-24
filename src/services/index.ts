import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { Document } from '@langchain/core/documents';
import { PromptTemplate } from '@langchain/core/prompts';
import { DATA_PATH, TEMPLATE, TEMPLATE_VARIABLES } from '../constants';
import { validLanguages } from '../constants';

export const getDocs = async (folder: string) => {
  const docsLoader = new DirectoryLoader(folder, {'.txt': path => new TextLoader(path)});
  const docs = await docsLoader.load();
  return docs;
};

export const insertMetadata = (docs: Document[]) => {
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const [artist, album] = doc.metadata.source.split('/').slice(-3);
    const track = doc.pageContent.split('\n')[0];
    doc.pageContent = doc.pageContent.replace(/^(?:.*\n){2}/, '');
    doc.metadata = {
      source: `${artist}/${album}/${track}`,
      artist,
      album,
      track,
    };
  }
};

export const splitDocs = async (docs: Document[]) => {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splits = await textSplitter.splitDocuments(docs);

  return splits;
};

export const saveVectorStore = async (splits: Document[]) => {
  const vectorStore = await FaissStore.fromDocuments(splits, new OpenAIEmbeddings());

  await vectorStore.save(DATA_PATH);
};

export const getVectorStore = async () => {
  const vectorStore = await FaissStore.load(DATA_PATH, new OpenAIEmbeddings());
  return vectorStore;
};

export const similaritySearch = async (vectorStore: FaissStore, query: string, k: number) => {
  const docs = await vectorStore.similaritySearch(query, k);
  return docs;
};

export const getFormattedQuery = (docs: Document[]) => {
  const newDocs = [];
  for (let i = 0; i < docs.length; i++) {
    newDocs.push(`ALBUM: ${docs[i].metadata.album}\nTRACK: ${docs[i].metadata.track}\n\n${docs[i].pageContent}`);
  }
  return newDocs.join('\n-------------\n');
};

export const prompt = async (query: string, docs: string, language = 'en') => {
  const validLanguage = validLanguages[language] || language;
  const prompt = new PromptTemplate({
    inputVariables: TEMPLATE_VARIABLES,
    template: TEMPLATE,
  });

  const formattedTemplate = await prompt.format({
    language: validLanguage,
    theme: query,
    docs,
  });

  const llm = new ChatOpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0.5 });

  const response = await llm.invoke(formattedTemplate);

  return response;
};

export const getAnswer = (response: any) => {
  const content = response.content.toString();
  const jsonContent = content.match(/\[[\s\S]*\]/)?.[0] || '';
  return JSON.parse(jsonContent);
};
