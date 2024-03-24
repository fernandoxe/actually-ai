import { Router } from 'express';
import { getAnswer, getFormattedQuery, getVectorStore, prompt, similaritySearch } from '../services';

export const Api = Router();

Api.post('/', async (req, res) => {
  const { query, language } = req.body;

  try {
    const vectorStore = await getVectorStore();
    const docs = await similaritySearch(vectorStore, query, 5);
    const formattedDocs = getFormattedQuery(docs);
    const response = await prompt(query, formattedDocs, language);
    const answer = getAnswer(response);
    
    res.send(answer);
  } catch(error) {
    console.log(error);
    res.status(500).send('Error');
  }
});
