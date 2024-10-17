// api/uploadAssistantResource.js

import { Configuration, OpenAIApi } from 'openai';
import multer from 'multer';
import nextConnect from 'next-connect';
import fs from 'fs';
import path from 'path';

const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads', // Ensure this directory exists
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const handler = nextConnect();

handler.use(upload.single('file'));

handler.post(async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
    const fileStream = fs.createReadStream(filePath);

    const resource = await openai.createFile({
      file: fileStream,
      purpose: 'assistants',
    });

    res.status(200).json({ resource });
  } catch (error) {
    console.error('Upload Assistant Resource Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default handler;
