// api/addMessage.js

import { Configuration, OpenAIApi } from 'openai';
import nextConnect from 'next-connect';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const handler = nextConnect();

handler.post(async (req, res) => {
  try {
    const { thread_id, message, file_id } = req.body;

    if (!thread_id || !message) {
      return res.status(400).json({ message: 'thread_id and message are required.' });
    }

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

    res.status(200).json({ message_id: response.id, message: "Message added successfully." });
  } catch (error) {
    console.error('Add Message Error:', error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.error?.message || 'Internal Server Error',
    });
  }
});

export default handler;
