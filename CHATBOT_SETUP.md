# 🤖 LearnFlow AI Chatbot Setup Guide

## Overview

This guide explains how to set up and integrate the **Hugging Face-powered AI Chatbot** into the LearnFlow Learning Management System.

The chatbot provides intelligent, context-aware responses to student questions using **Hugging Face's conversational models**.

---

## Features

✅ **Real-time AI Responses** - Uses Hugging Face DialoGPT model
✅ **Conversation History** - Maintains chat history per user
✅ **Course Context** - Can be trained on specific course content
✅ **User-Friendly UI** - Floating chat widget with modern design
✅ **Mobile Responsive** - Works on all devices
✅ **Production Ready** - Error handling and fallbacks included

---

## Prerequisites

- Node.js v18+
- MongoDB Atlas account
- **Hugging Face API Key** (Free tier available at https://huggingface.co)
- React 18+ (frontend already set up)

---

## Step 1: Get Hugging Face API Key

1. Visit **https://huggingface.co** and create a free account
2. Go to **Settings > Access Tokens**
3. Create a new **Read** access token
4. Copy the token (you'll need it soon)

### Free Tier Limits:
- **Rate Limit**: Reasonable for learning/demo purposes
- **Model Used**: `microsoft/DialoGPT-medium` (free, reliable)
- **Inference Type**: API calls (no local GPU needed)

---

## Step 2: Backend Setup

### 2.1 Update `.env` file

Add your Hugging Face API key to `/server/.env`:

```bash
# .env (server directory)
HUGGING_FACE_API_KEY=hf_your_actual_token_here
```

### 2.2 Install Dependencies

```bash
cd server
npm install
```

The required dependencies are:
- `axios` - HTTP client (already in package.json)
- `express` - API framework (already in package.json)

### 2.3 Verify Chatbot Routes

Check that `/server/routes/chatbotRoutes.js` exists with these endpoints:

```javascript
GET  /api/chatbot/status          // Check if chatbot is configured
POST /api/chatbot/message         // Send message to chatbot
GET  /api/chatbot/history/:userId // Get chat history
DELETE /api/chatbot/history/:userId // Clear chat history
```

---

## Step 3: Frontend Setup

### 3.1 Add ChatBot Component to Your Pages

Import and use the ChatBot component in any page:

```jsx
// In client/src/pages/LearningPage.jsx (or any page)

import ChatBot from '../components/ChatBot';

const LearningPage = () => {
  return (
    <div>
      {/* Your existing content */}
      
      {/* Add chatbot at the end */}
      <ChatBot courseId={currentCourseId} />
    </div>
  );
};

export default LearningPage;
```

### 3.2 Component Props

```jsx
<ChatBot 
  courseId="507f1f77bcf86cd799439011"  // Optional: for context
/>
```

### 3.3 Features of the ChatBot Component

- **Floating Button**: Bottom-right corner
- **Auto-scroll**: Messages auto-scroll to latest
- **Error Handling**: User-friendly error messages
- **Loading States**: Typing indicators
- **Clear Chat**: Button to clear conversation
- **Dark Mode**: Respects system dark mode preference

---

## Step 4: Test the Chatbot

### 4.1 Start Backend Server

```bash
cd server
npm run dev
```

You should see:
```
🚀 LMS Server running
📚 Environment: development
```

### 4.2 Check Chatbot Status

```bash
curl http://localhost:3000/api/chatbot/status
```

Expected response:
```json
{
  "success": true,
  "status": "configured",
  "message": "Chatbot is ready",
  "defaultModel": "gpt2",
  "conversationalModel": "microsoft/DialoGPT-medium"
}
```

### 4.3 Start Frontend

```bash
cd client
npm run dev
```

Open http://localhost:5173 in your browser

### 4.4 Try the Chatbot

1. Look for the **🤖 chat button** in the bottom-right corner
2. Click to open the chat widget
3. Type a question: "What is React?"
4. Wait for AI response

---

## API Endpoints

### POST /api/chatbot/message

**Description**: Send a message and get AI response

**Request**:
```json
{
  "message": "Explain JavaScript",
  "courseId": "507f1f77bcf86cd799439011",  // Optional
  "userId": "user123"  // From JWT token
}
```

**Response**:
```json
{
  "success": true,
  "message": "JavaScript is a programming language...",
  "history": [
    { "role": "user", "content": "Explain JavaScript", "timestamp": "..."},
    { "role": "assistant", "content": "JavaScript is...", "timestamp": "..."}
  ]
}
```

### GET /api/chatbot/history/:userId

**Description**: Retrieve conversation history

**Response**:
```json
{
  "success": true,
  "history": [ /* messages */ ]
}
```

### DELETE /api/chatbot/history/:userId

**Description**: Clear chat history for user

**Response**:
```json
{
  "success": true,
  "message": "Conversation history cleared"
}
```

---

## Troubleshooting

### ❌ "Chatbot service not configured"

**Cause**: `HUGGING_FACE_API_KEY` not set in `.env`

**Fix**:
```bash
# .env
HUGGING_FACE_API_KEY=hf_your_token_here
npm run dev  # Restart server
```

### ❌ "Request timeout" or 503 Service Unavailable

**Cause**: Hugging Face API overloaded or model loading

**Fix**:
- Wait 1-2 minutes (first API call loads the model)
- Check your internet connection
- Try a simpler question
- Check Hugging Face status at https://status.huggingface.co

### ❌ "CORS error"

**Cause**: Frontend cannot reach backend API

**Fix**:
- Ensure backend is running on http://localhost:3000
- Check `/server/server.js` for CORS configuration
- Verify `baseURL` in `/client/src/api/api.js`

### ❌ Messages not sending

**Cause**: User not authenticated

**Fix**:
- Login to the LMS first
- Check browser console for JWT token
- Ensure auth middleware is configured

---

## Production Deployment

### Backend (Render/Railway)

1. Add environment variable:
   ```
   HUGGING_FACE_API_KEY = hf_your_token
   ```

2. Deploy with:
   ```bash
   npm start
   ```

### Frontend (Vercel/Netlify)

1. Update `vite.config.js` to use production API URL
2. Set `VITE_API_URL` environment variable
3. Deploy as usual

---

## Customization

### Change Chatbot Model

Edit `/server/controllers/chatbotController.js`:

```javascript
// Line ~12: Change the model
const CONVERSATIONAL_MODEL = 'google/flan-t5-base'; // Different model
```

### Custom System Prompt

Edit `/server/controllers/chatbotController.js` line ~53:

```javascript
let context = 'You are a helpful math tutor. ';  // Custom prompt
```

### Styling

Edit `/client/src/components/ChatBot.jsx` for Tailwind classes:

```jsx
// Change button color
className="bg-purple-500..."  // Instead of cyan-500
```

---

## Performance Tips

1. **Cache Responses**: Store common answers locally
2. **Batch Messages**: Don't send too many requests at once
3. **Limit History**: Currently stores last 20 messages per user
4. **Use Smaller Models**: For faster responses

---

## Security Best Practices

✅ API key stored in `.env` (not in code)
✅ JWT authentication required for messages
✅ Rate limiting recommended for production
✅ Input validation on all endpoints
✅ HTTPS required in production

---

## Support & Resources

- **Hugging Face Docs**: https://huggingface.co/docs/hub/security-tokens
- **DialoGPT Model**: https://huggingface.co/microsoft/DialoGPT-medium
- **React Chat UI Ideas**: https://huggingface.co/spaces
- **Troubleshooting**: Check server logs with `npm run dev`

---

## License

This chatbot implementation is part of the LearnFlow project.

---

**Last Updated**: March 2026
**Maintainer**: TusharHegde-03
