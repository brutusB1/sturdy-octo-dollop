// api/createRun.js

import { Configuration, OpenAIApi } from 'openai';
import nextConnect from 'next-connect';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const handler = nextConnect();

handler.post(async (req, res) => {
  try {
    const { thread_id, assistant_id, instructions, tools } = req.body;

    if (!thread_id || !assistant_id) {
      return res.status(400).json({ message: 'thread_id and assistant_id are required.' });
    }

    const runPayload = {
      thread_id: thread_id,
      assistant_id: assistant_id,
      instructions: instructions || "Please address the user as Jane Doe. The user has a premium account.",
    };

    if (tools && Array.isArray(tools)) {
      runPayload.tools = tools;
    }

    const run = await openai.beta.threads.runs.create(runPayload);

    res.status(200).json({ run_id: run.id, message: "Run created successfully." });
  } catch (error) {
    console.error('Create Run Error:', error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.error?.message || 'Internal Server Error',
    });
  }
});

export default handler;
