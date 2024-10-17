// api/upload.js

import { Configuration, OpenAIApi } from 'openai';
import multer from 'multer';
import nextConnect from 'next-connect';
import fs from 'fs';
import path from 'path';

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads', // Ensure this directory exists
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
});

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Create handler
const handler = nextConnect();

handler.use(upload.single('file'));

handler.post(async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // TODO: Implement Assistant creation and interaction as per OpenAI Assistants API

    // For demonstration, let's assume we send the file content to the Assistant
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that creates data visualizations based on provided CSV data.',
        },
        {
          role: 'user',
          content: `Create 3 data visualizations based on the following data:\n${fileContent}`,
        },
      ],
    });

    res.status(200).json({ insights: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Upload Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default handler;
