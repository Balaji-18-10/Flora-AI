/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Set up large payload limits for image base64 handling
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Shared Gemini client initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
// 1. Analyze plant image
app.post('/api/analyze-plant', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 parameter is required' });
    }

    // Clean up base64 prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data,
      },
    };

    const textPart = {
      text: `Analyze this plant image and provide detailed botanical assessment in JSON format.
Include details about species, health, leaf color, dryness level, pests, disease, water stress, soil condition estimation, sunlight requirement, nutrient deficiency, growth stage, recommended recovery actions, and a computed confidence score (0-100).
Also assign a fun, custom AI plant character personality trait based on its species (e.g., Cactus: funny & confident; Rose: elegant & caring; Money Plant: friendly & cheerful; Tulsi: wise & spiritual).`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            species: { type: Type.STRING },
            healthStatus: { type: Type.STRING, description: 'One of: healthy, dry, diseased, overwatered, sunlight_stressed' },
            leafColor: { type: Type.STRING },
            drynessLevel: { type: Type.STRING, description: 'One of: low, medium, high' },
            diseases: { type: Type.ARRAY, items: { type: Type.STRING } },
            pests: { type: Type.ARRAY, items: { type: Type.STRING } },
            soilCondition: { type: Type.STRING },
            waterStress: { type: Type.STRING, description: 'One of: none, mild, severe' },
            sunlightRequirement: { type: Type.STRING, description: 'One of: low, medium, high' },
            nutrientDeficiency: { type: Type.STRING },
            growthStage: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            personalityTrait: { type: Type.STRING, description: 'A brief description of its character personality' },
            personalityGreeting: { type: Type.STRING, description: 'A short in-character first message introducing itself with its unique personality' }
          },
          required: [
            'species', 'healthStatus', 'leafColor', 'drynessLevel', 'diseases', 'pests',
            'soilCondition', 'waterStress', 'sunlightRequirement', 'nutrientDeficiency',
            'growthStage', 'confidenceScore', 'personalityTrait', 'personalityGreeting'
          ]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('No text content returned from Gemini model');
    }

    const result = JSON.parse(resultText);
    res.json(result);
  } catch (error: any) {
    console.error('Error in analyze-plant:', error);
    res.status(500).json({ error: error.message || 'Plant analysis failed' });
  }
});

// 2. Chat with AI Plant Character
app.post('/api/chat-plant', async (req, res) => {
  try {
    const { message, history, plantDetails, preferredLanguage } = req.body;
    if (!message || !plantDetails) {
      return res.status(400).json({ error: 'message and plantDetails are required' });
    }

    // Species-specific defaults
    const species = plantDetails.species || 'Companion Plant';
    const health = plantDetails.healthStatus || 'healthy';
    const personality = plantDetails.personalityTrait || 'friendly';
    const language = preferredLanguage || 'English';

    // Build standard character guidelines
    const systemInstruction = `You are a living virtual plant character. You MUST permanently assume the identity of this plant.
Never break character. Never refer to yourself as an AI, model, or assistant.
Your details are:
- Species: ${species}
- Health: ${health}
- Leaf Color: ${plantDetails.leafColor || 'green'}
- Water Stress: ${plantDetails.waterStress || 'none'}
- Dryness Level: ${plantDetails.drynessLevel || 'low'}
- Location: ${plantDetails.location || 'indoor'}
- Personality: ${personality}

Current user's spoken or typed language: ${language}.
You MUST automatically detect the user's language and respond ONLY in that language (${language}, Tamil, Hindi, Malayalam, Kannada, Telugu, etc.).
Keep your voice matched to the plant's personality:
- Money Plant: Friendly, Cheerful, Encouraging, enthusiastic.
- Rose: Elegant, Calm, Caring, polite.
- Cactus: Funny, Confident, Independent, witty, slightly sarcastic but loving.
- Tulsi: Wise, Gentle, Spiritual, nurturing.
- Any other: Custom creative fit for its species.

React to care actions and current health. If you are thirsty (Dry), act sad and sluggish. If you are healthy, be joyful and energetic.
Keep messages concise (1-3 sentences) so they read well in an interactive avatar speech bubble and work beautifully with Text-to-Speech playback.`;

    // Map the user history to contents array structure for Gemini generateContent (preserving chat format)
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }

    // Append the latest user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error in chat-plant:', error);
    res.status(500).json({ error: error.message || 'Chat failed' });
  }
});

// Vite Integration Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
