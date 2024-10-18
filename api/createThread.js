// api/createThread.js

import { Configuration, OpenAIApi } from 'openai';
import nextConnect from 'next-connect';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const handler = nextConnect();

handler.post(async (req, res) => {
  try {
    const thread = await openai.beta.threads.create();

    res.status(200).json({ thread_id: thread.id, message: "Thread created successfully." });
  } catch (error) {
    console.error('Create Thread Error:', error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.error?.message || 'Internal Server Error',
    });
  }
});

export default handler;
