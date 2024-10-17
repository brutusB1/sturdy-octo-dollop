// api/createAssistant.js

import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, description } = req.body;

  try {
    const assistant = await openai.createAssistant({
      name,
      description,
      model: 'gpt-4',
      tools: [{ type: 'code_interpreter' }],
    });

    res.status(200).json({ assistant });
  } catch (error) {
    console.error('Assistant Creation Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
