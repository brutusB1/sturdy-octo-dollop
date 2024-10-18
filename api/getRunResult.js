// api/getRunResult.js

import { Configuration, OpenAIApi } from 'openai';
import nextConnect from 'next-connect';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const handler = nextConnect();

handler.get(async (req, res) => {
  try {
    const { run_id } = req.query;

    if (!run_id) {
      return res.status(400).json({ message: 'run_id is required.' });
    }

    const run = await openai.beta.threads.runs.retrieve(run_id);

    if (run.status === 'completed') {
      res.status(200).json({ insights: run.result.content, status: run.status });
    } else if (run.status === 'failed') {
      res.status(500).json({ message: 'Run failed.', details: run.error, status: run.status });
    } else {
      res.status(200).json({ message: `Run is ${run.status}.`, status: run.status });
    }
  } catch (error) {
    console.error('Get Run Result Error:', error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.error?.message || 'Internal Server Error',
    });
  }
});

export default handler;
