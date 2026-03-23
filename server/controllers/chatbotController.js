const axios = require('axios');

// Hugging Face API Configuration
const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;
const HF_API_URL = 'https://api-inference.huggingface.co/models';

// Model: Hugging Face conversational model (use distilbert for fast responses)
const DEFAULT_MODEL = 'gpt2'; // Free tier model
const CONVERSATIONAL_MODEL = 'microsoft/DialoGPT-medium'; // Conversational model

// Store conversation history in memory (for demo)
const conversationHistory = {};

/**
 * Send message to chatbot and get AI response using Hugging Face API
 * @route POST /api/chatbot/message
 * @access Private (authenticated users)
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, courseId, userId } = req.body;
    const user_id = userId || req.user?.id; // Use userId from body or JWT token

    // Validate input
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    // Check Hugging Face API Key
    if (!HF_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Chatbot service not configured. Please add HUGGING_FACE_API_KEY to environment variables.'
      });
    }

    // Initialize conversation history for this user if it doesn't exist
    if (!conversationHistory[user_id]) {
      conversationHistory[user_id] = [];
    }

    // Add user message to history
    conversationHistory[user_id].push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Build context from course if provided
    let context = '';
    if (courseId) {
      context = `The student is learning about course with ID: ${courseId}. `;
    }
    context += 'You are a helpful educational assistant for an online learning management system. ';

    // Prepare the prompt for the API
    const prompt = `${context}\nUser: ${message}\nAssistant:`;

    // Call Hugging Face API
    const response = await axios.post(
      `${HF_API_URL}/${CONVERSATIONAL_MODEL}`,
      { inputs: prompt },
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Extract the generated text from response
    let botResponse = '';
    if (response.data && Array.isArray(response.data) && response.data[0]) {
      botResponse = response.data[0].generated_text || 'I could not generate a response.';
      // Clean up the response by removing the prompt
      if (botResponse.includes('Assistant:')) {
        botResponse = botResponse.split('Assistant:')[1].trim();
      }
    } else if (response.data && response.data.generated_text) {
      botResponse = response.data.generated_text;
    } else {
      botResponse = 'I could not generate a response. Please try again.';
    }

    // Add bot response to history
    conversationHistory[user_id].push({
      role: 'assistant',
      content: botResponse,
      timestamp: new Date()
    });

    // Keep only last 20 messages in history to avoid memory issues
    if (conversationHistory[user_id].length > 20) {
      conversationHistory[user_id] = conversationHistory[user_id].slice(-20);
    }

    res.status(200).json({
      success: true,
      message: botResponse,
      history: conversationHistory[user_id]
    });
  } catch (error) {
    console.error('Chatbot Error:', error.message);

    // Handle specific error scenarios
    if (error.response?.status === 503) {
      return res.status(503).json({
        success: false,
        message: 'Chatbot service is temporarily unavailable. Please try again later.'
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        message: 'Request timeout. The chatbot took too long to respond.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get chatbot response'
    });
  }
};

/**
 * Get conversation history for a user
 * @route GET /api/chatbot/history/:userId
 * @access Private
 */
exports.getHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!conversationHistory[userId]) {
      return res.status(200).json({
        success: true,
        history: []
      });
    }

    res.status(200).json({
      success: true,
      history: conversationHistory[userId]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation history'
    });
  }
};

/**
 * Clear conversation history for a user
 * @route DELETE /api/chatbot/history/:userId
 * @access Private
 */
exports.clearHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    delete conversationHistory[userId];

    res.status(200).json({
      success: true,
      message: 'Conversation history cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear conversation history'
    });
  }
};

/**
 * Get chatbot status and available models
 * @route GET /api/chatbot/status
 * @access Public
 */
exports.getStatus = async (req, res) => {
  try {
    const isConfigured = !!HF_API_KEY;

    res.status(200).json({
      success: true,
      status: isConfigured ? 'configured' : 'not-configured',
      message: isConfigured ? 'Chatbot is ready' : 'Hugging Face API key not configured',
      defaultModel: DEFAULT_MODEL,
      conversationalModel: CONVERSATIONAL_MODEL
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get chatbot status'
    });
  }
};

module.exports = exports;
