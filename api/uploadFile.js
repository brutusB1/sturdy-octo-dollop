// api/uploadFile.js

const nextConnect = require('next-connect'); // Changed from import to require
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');
const logger = require('../../src/utils/logger'); // Ensure you have a logger setup

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Configure multer for file uploads to /tmp/uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp/uploads', // Vercel's writable directory
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit; adjust as needed
  },
});

// Ensure the /tmp/uploads directory exists
const uploadsDir = '/tmp/uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const handler = nextConnect();

handler.use(upload.single('file'));

handler.post(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const filePath = path.join('/tmp/uploads', req.file.filename);
    const fileStream = fs.createReadStream(filePath);

    // Validate file type based on your requirements
    const allowedMimeTypes = [
      'text/csv',
      'application/json',
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(filePath); // Delete the uploaded file
      return res.status(400).json({ message: 'Unsupported file type.' });
    }

    // Upload the file using OpenAI's Assistants API
    const fileUploadResponse = await openai.beta.files.create({
      file: fileStream,
      purpose: 'assistants',
    });

    // Delete the file after successful upload
    fs.unlinkSync(filePath);

    res.status(200).json({ file_id: fileUploadResponse.id, message: 'File uploaded successfully.' });
  } catch (error) {
    logger.error('File Upload Error: %o', error.response ? error.response.data : error.message);

    if (error.response) {
      res.status(error.response.status).json({
        message: error.response.data.error.message || 'File upload failed.',
      });
    } else {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }
});

module.exports = handler;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
