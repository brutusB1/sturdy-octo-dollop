// api/addMessage.js

import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { thread_id, message, file_id } = req.body;

  if (!thread_id || !message) {
    return res.status(400).json({ message: 'thread_id and message are required' });
  }

  try {
    const userMessage = {
      role: 'user',
      content: message,
    };

    if (file_id) {
      userMessage.attachments = [
        {
          file_id: file_id,
          tools: [{ type: 'code_interpreter' }],
        },
      ];
    }

    const response = await openai.beta.threads.messages.create({
      thread_id: thread_id,
      message: userMessage,
    });

    res.status(200).json({ message_id: response.id });
  } catch (error) {
    console.error('Add Message Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.response ? error.response.data : error.message });
  }
}
