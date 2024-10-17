// api/analyze.js

import { Configuration, OpenAIApi } from 'openai';
import { v4 as uuidv4 } from 'uuid';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { fileContent } = req.body;

  try {
    // Step 1: Create a thread
    const thread = await openai.createThread({
      messages: [
        {
          role: 'user',
          content: 'Create 3 data visualizations based on the trends in this file.',
          attachments: [
            {
              file_id: 'uploaded_file_id_here', // Replace with actual file ID
              tools: [{ type: 'code_interpreter' }],
            },
          ],
        },
      ],
    });

    // Step 2: Create a run
    const run = await openai.createRun({
      thread_id: thread.id,
      assistant_id: 'assistant_id_here', // Replace with actual Assistant ID
    });

    // Optionally, poll for run completion or handle streaming responses

    res.status(200).json({ message: 'Run created successfully', run_id: run.id });
  } catch (error) {
    console.error('Analyze Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
