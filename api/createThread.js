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

  const { message, file_id } = req.body;

  try {
    const thread = await openai.createThread({
      messages: [
        {
          role: 'user',
          content: message,
          attachments: [
            {
              file_id: file_id,
              tools: [{ type: 'code_interpreter' }],
            },
          ],
        },
      ],
    });

    const run = await openai.createRun({
      thread_id: thread.id,
      assistant_id: 'your_assistant_id_here', // Replace with actual Assistant ID
    });

    res.status(200).json({ thread, run_id: run.id });
  } catch (error) {
    console.error('Create Thread Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
