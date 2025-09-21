import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribe audio using OpenAI Whisper
 * @param {Buffer} audioBuffer - The audio buffer to transcribe
 * @param {string} language - The language code (default: 'en')
 * @returns {Promise<string>} The transcribed text
 */
export const transcribeAudio = async (audioBuffer, language = 'en') => {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioBuffer,
      model: 'whisper-1',
      language,
      response_format: 'text',
    });

    logger.info('Audio transcription completed');
    return transcription;
  } catch (error) {
    logger.error(`Transcription error: ${error.message}`);
    throw new Error('Failed to transcribe audio');
  }
};

/**
 * Generate AI response using GPT
 * @param {string} prompt - The user's input or prompt
 * @param {Array} history - Conversation history
 * @param {Object} options - Additional options
 * @param {string} options.model - The model to use (default: 'gpt-3.5-turbo')
 * @param {number} options.temperature - Controls randomness (0-1)
 * @param {number} options.maxTokens - Maximum number of tokens to generate
 * @returns {Promise<string>} The AI's response
 */
export const generateResponse = async (
  prompt,
  history = [],
  { model = 'gpt-3.5-turbo', temperature = 0.7, maxTokens = 150 } = {}
) => {
  try {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant that helps with customer support and sales calls. Be polite, concise, and professional.',
      },
      ...history,
      { role: 'user', content: prompt },
    ];

    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      throw new Error('No response generated');
    }

    logger.info('AI response generated successfully');
    return aiResponse;
  } catch (error) {
    logger.error(`AI response generation error: ${error.message}`);
    throw new Error('Failed to generate AI response');
  }
};

/**
 * Analyze sentiment of a text
 * @param {string} text - The text to analyze
 * @returns {Promise<Object>} Sentiment analysis result
 */
export const analyzeSentiment = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment of the following text and return a JSON object with the following structure: { sentiment: "positive"|"neutral"|"negative", score: number (0-1), confidence: number (0-1) }',
        },
        { role: 'user', content: text },
      ],
      temperature: 0,
      max_tokens: 100,
    });

    const result = response.choices[0]?.message?.content?.trim();
    
    try {
      return JSON.parse(result);
    } catch (e) {
      logger.error('Failed to parse sentiment analysis result', { result });
      return {
        sentiment: 'neutral',
        score: 0.5,
        confidence: 0.8,
      };
    }
  } catch (error) {
    logger.error(`Sentiment analysis error: ${error.message}`);
    return {
      sentiment: 'neutral',
      score: 0.5,
      confidence: 0.5,
      error: error.message,
    };
  }
};

/**
 * Extract key information from conversation
 * @param {string} conversation - The conversation text
 * @param {Array<string>} fields - The fields to extract
 * @returns {Promise<Object>} Extracted information
 */
export const extractInformation = async (conversation, fields = []) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Extract the following information from the conversation and return as JSON: ${fields.join(', ')}. If a field is not mentioned, set it to null.`,
        },
        { role: 'user', content: conversation },
      ],
      temperature: 0,
      max_tokens: 500,
    });

    const result = response.choices[0]?.message?.content?.trim();
    
    try {
      return JSON.parse(result);
    } catch (e) {
      logger.error('Failed to parse extracted information', { result });
      return fields.reduce((acc, field) => ({
        ...acc,
        [field]: null,
      }), {});
    }
  } catch (error) {
    logger.error(`Information extraction error: ${error.message}`);
    return fields.reduce((acc, field) => ({
      ...acc,
      [field]: null,
    }), { error: error.message });
  }
};
