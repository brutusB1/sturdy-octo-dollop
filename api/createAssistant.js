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
    const assistant = await openai.beta.assistants.create({
      name: name || "Math Tutor",
      instructions: description || "You are a personal math tutor. Write and run code to answer math questions.",
      tools: [{ type: "code_interpreter" }],
      model: "gpt-4o",
    });

    // Save Assistant ID to environment variable or database as needed
    // For simplicity, we'll return it in the response
    res.status(200).json({ assistant_id: assistant.id });
  } catch (error) {
    console.error('Assistant Creation Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.response ? error.response.data : error.message });
  }
}
