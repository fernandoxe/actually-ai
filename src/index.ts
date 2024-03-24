import 'dotenv/config';
import express from 'express';
import { Api } from './api';

const app = express();

app.use(express.json());

app.use('/api', Api);

app.get('*', (req, res) => {
  res.status(404).send('Not Found');
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
