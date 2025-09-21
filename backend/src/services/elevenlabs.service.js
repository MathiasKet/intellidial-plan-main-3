import axios from 'axios';
import { logger } from '../utils/logger.js';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Initialize Axios instance
const elevenLabs = axios.create({
  baseURL: ELEVENLABS_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'xi-api-key': process.env.ELEVENLABS_API_KEY,
  },
});

/**
 * Convert text to speech using ElevenLabs
 * @param {string} text - The text to convert to speech
 * @param {Object} options - Options for the TTS conversion
 * @param {string} options.voiceId - The voice ID to use (default: process.env.ELEVENLABS_VOICE_ID or '21m00Tcm4TlvDq8ikWAM' - Rachel)
 * @param {number} options.stability - Stability parameter (0-1)
 * @param {number} options.similarityBoost - Similarity boost parameter (0-1)
 * @param {string} options.modelId - The model ID to use (default: 'eleven_monolingual_v1')
 * @returns {Promise<Buffer>} The audio buffer
 */
export const textToSpeech = async (
  text,
  {
    voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM', // Rachel voice by default
    stability = 0.5,
    similarityBoost = 0.75,
    modelId = 'eleven_monolingual_v1',
  } = {}
) => {
  try {
    const response = await elevenLabs.post(
      `/text-to-speech/${voiceId}`,
      {
        text,
        model_id: modelId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
        },
      },
      {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
      }
    );

    logger.info('Text-to-speech conversion successful');
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    logger.error(`Text-to-speech error: ${error.message}`, {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error('Failed to convert text to speech');
  }
};

/**
 * Get available voices from ElevenLabs
 * @returns {Promise<Array>} List of available voices
 */
export const getVoices = async () => {
  try {
    const response = await elevenLabs.get('/voices');
    return response.data.voices;
  } catch (error) {
    logger.error(`Failed to fetch voices: ${error.message}`);
    throw new Error('Failed to fetch voices');
  }
};

/**
 * Get voice settings for a specific voice
 * @param {string} voiceId - The voice ID to get settings for
 * @returns {Promise<Object>} Voice settings
 */
export const getVoiceSettings = async (voiceId) => {
  try {
    const response = await elevenLabs.get(`/voices/${voiceId}/settings`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to fetch voice settings: ${error.message}`);
    throw new Error('Failed to fetch voice settings');
  }
};

/**
 * Update voice settings for a specific voice
 * @param {string} voiceId - The voice ID to update settings for
 * @param {Object} settings - The new settings
 * @param {number} settings.stability - Stability parameter (0-1)
 * @param {number} settings.similarityBoost - Similarity boost parameter (0-1)
 * @returns {Promise<Object>} Updated voice settings
 */
export const updateVoiceSettings = async (voiceId, { stability, similarityBoost }) => {
  try {
    const response = await elevenLabs.post(
      `/voices/${voiceId}/settings`,
      {
        stability,
        similarity_boost: similarityBoost,
      }
    );
    return response.data;
  } catch (error) {
    logger.error(`Failed to update voice settings: ${error.message}`);
    throw new Error('Failed to update voice settings');
  }
};

/**
 * Get the default voice settings
 * @returns {Object} Default voice settings
 */
export const getDefaultVoiceSettings = () => ({
  stability: 0.5,
  similarity_boost: 0.75,
});

/**
 * Stream text to speech (for real-time applications)
 * @param {string} text - The text to convert to speech
 * @param {Object} options - Options for the TTS conversion
 * @param {string} options.voiceId - The voice ID to use
 * @param {number} options.stability - Stability parameter (0-1)
 * @param {number} options.similarityBoost - Similarity boost parameter (0-1)
 * @returns {Promise<ReadableStream>} A readable stream of the audio data
 */
export const streamTextToSpeech = async (
  text,
  {
    voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
    stability = 0.5,
    similarityBoost = 0.75,
  } = {}
) => {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'Failed to stream text to speech');
    }

    return response.body;
  } catch (error) {
    logger.error(`Stream TTS error: ${error.message}`);
    throw error;
  }
};
