const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static frontend files (index.html, style.css, script.js)
app.use(express.static(path.join(__dirname)));

// Root route to load index.html when visiting http://localhost:5000
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize Groq Client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const systemPrompt = `
You are a expert UI designer. Build dynamic, modern, responsive websites using Tailwind CSS CDN and FontAwesome icons.
Rules:
1. Always include Tailwind CDN (<script src="https://cdn.tailwindcss.com"></script>) and FontAwesome CDN in <head>.
2. Use modern dark themes (bg-slate-900), smooth gradients, glassmorphism cards, and interactive JS.
3. Output ONLY full valid HTML starting with <!DOCTYPE html>. No markdown or code blocks.
`;

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, existingCode } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const messages = [{ role: 'system', content: systemPrompt }];

    if (existingCode && existingCode.trim().length > 0) {
      messages.push({
        role: 'assistant',
        content: `Current website code:\n${existingCode}`
      });
    }

    messages.push({ role: 'user', content: prompt });

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      max_tokens: 2500,
    });

    let generatedCode = completion.choices[0]?.message?.content || '';
    generatedCode = generatedCode.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

    res.json({ success: true, code: generatedCode });
  } catch (error) {
    console.error('Groq Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate code' });
  }
});

// Local machine par chalne ke liye
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Vercel deployment ke liye compulsory export
module.exports = app;