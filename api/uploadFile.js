// api/uploadFile.js

import multer from 'multer';
import nextConnect from 'next-connect';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp/uploads', // Vercel's writable directory
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit; adjust as needed
  },
});

const handler = nextConnect();

handler.use(upload.single('file'));

handler.post(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const filePath = path.join('/tmp/uploads', req.file.filename);
    const fileStream = fs.createReadStream(filePath);

    // Upload the file using Axios with beta headers
    const response = await axios.post('https://api.openai.com/v1/beta/files', fileStream, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/octet-stream',
        'OpenAI-Beta': 'assistants=v2',
      },
      params: {
        purpose: 'assistants',
      },
    });

    // Delete the file after successful upload
    fs.unlinkSync(filePath);

    res.status(200).json({ file_id: response.data.id, message: "File uploaded successfully." });
  } catch (error) {
    console.error('File Upload Error:', error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.error?.message || 'Internal Server Error',
    });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default handler;
