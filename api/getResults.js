// api/getRunResult.js

import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  const { run_id } = req.query;

  if (!run_id) {
    return res.status(400).json({ message: 'run_id is required' });
  }

  try {
    const run = await openai.beta.threads.runs.retrieve(run_id);

    if (run.status === 'completed') {
      res.status(200).json({ insights: run.result.content });
    } else if (run.status === 'failed') {
      res.status(500).json({ message: 'Run failed', details: run.error });
    } else {
      res.status(200).json({ message: 'Run is still in progress', status: run.status });
    }
  } catch (error) {
    console.error('Get Run Result Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.response ? error.response.data : error.message });
  }
}
