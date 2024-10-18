// api/createThread.js

import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const thread = await openai.beta.threads.create();

    res.status(200).json({ thread_id: thread.id });
  } catch (error) {
    console.error('Create Thread Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.response ? error.response.data : error.message });
  }
}
