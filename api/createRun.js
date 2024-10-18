// api/createRun.js

import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { thread_id, assistant_id, instructions } = req.body;

  if (!thread_id || !assistant_id) {
    return res.status(400).json({ message: 'thread_id and assistant_id are required' });
  }

  try {
    const run = await openai.beta.threads.runs.create({
      thread_id: thread_id,
      assistant_id: assistant_id,
      instructions: instructions || "Please address the user as Jane Doe. The user has a premium account.",
      tools: [{ type: 'code_interpreter' }],
    });

    res.status(200).json({ run_id: run.id });
  } catch (error) {
    console.error('Create Run Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.response ? error.response.data : error.message });
  }
}
