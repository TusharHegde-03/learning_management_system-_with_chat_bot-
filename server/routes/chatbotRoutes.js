const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/chatbot/message
 * @desc    Send a message to the chatbot and get AI response
 * @access  Private
 */
router.post('/message', protect, chatbotController.sendMessage);

/**
 * @route   GET /api/chatbot/history/:userId
 * @desc    Get conversation history for a user
 * @access  Private
 */
router.get('/history/:userId', protect, chatbotController.getHistory);

/**
 * @route   DELETE /api/chatbot/history/:userId
 * @desc    Clear conversation history for a user
 * @access  Private
 */
router.delete('/history/:userId', protect, chatbotController.clearHistory);

/**
 * @route   GET /api/chatbot/status
 * @desc    Get chatbot status and available models
 * @access  Public
 */
router.get('/status', chatbotController.getStatus);

module.exports = router;
