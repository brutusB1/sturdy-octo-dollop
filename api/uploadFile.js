// api/uploadFile.js

import { Configuration, OpenAIApi } from 'openai';
import multer from 'multer';
import nextConnect from 'next-connect';
import fs from 'fs';
import path from 'path';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads', // Ensure this directory exists
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
});

// Create the uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const handler = nextConnect();

handler.use(upload.single('file'));

handler.post(async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
    const fileStream = fs.createReadStream(filePath);

    // Upload the file to OpenAI as an Assistant resource
    const fileUploadResponse = await openai.beta.files.create({
      file: fileStream,
      purpose: 'assistants',
    });

    // Optionally, delete the file after upload to save space
    fs.unlinkSync(filePath);

    res.status(200).json({ file_id: fileUploadResponse.id });
  } catch (error) {
    console.error('File Upload Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.response ? error.response.data : error.message });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default handler;
