// api/createAssistant.js

import { Configuration, OpenAIApi } from 'openai';
import nextConnect from 'next-connect';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const handler = nextConnect();

handler.post(async (req, res) => {
  try {
    const { name, description } = req.body;

    const assistant = await openai.beta.assistants.create({
      name: name || "Data Visualizer",
      instructions: description || "You are great at creating beautiful data visualizations. You analyze data present in .csv files, understand trends, and come up with data visualizations relevant to those trends. You also share a brief text summary of the trends observed.",
      model: "gpt-4o",
      tools: [{ type: "code_interpreter" }],
      tool_resources: {
        "code_interpreter": {
          "file_ids": [] // Initially empty; files can be added later
        }
      }
    });

    res.status(200).json({ assistant_id: assistant.id, message: "Assistant created successfully." });
  } catch (error) {
    console.error('Assistant Creation Error:', error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.error?.message || 'Internal Server Error',
    });
  }
});

export default handler;
