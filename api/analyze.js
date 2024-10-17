// api/analyze.js

import axios from 'axios';
import Papa from 'papaparse';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { fileContent } = req.body;

  if (!fileContent) {
    return res.status(400).json({ message: 'No file content provided' });
  }

  try {
    let data;

    // Attempt to parse as JSON
    try {
      data = JSON.parse(fileContent);
    } catch (jsonError) {
      // If JSON parsing fails, parse as CSV
      const parsed = Papa.parse(fileContent, { header: true });
      data = parsed.data;
    }

    // Prepare the prompt for OpenAI
    const prompt = `Analyze the following video engagement data and provide insightful metrics:\n${JSON.stringify(data)}`;

    // Call OpenAI API
    const openAIResponse = await axios.post(
      'https://api.openai.com/v1/engines/text-davinci-003/completions',
      {
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const insights = openAIResponse.data.choices[0].text.trim();
    res.status(200).json({ insights });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}
