# Website Analyser

A web application that analyzes websites using Google Lighthouse and provides AI-powered, user-friendly reports.

## Features

- 🚀 Google Lighthouse integration for comprehensive website analysis
- 🤖 AI-powered report generation using OpenAI GPT
- 📊 Performance, Accessibility, Best Practices, and SEO scoring
- 🎨 Clean, responsive user interface
- ⚡ Real-time analysis results

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

3. **Install Google Chrome:**
   Make sure you have Google Chrome installed as Lighthouse requires it for analysis.

4. **Run the application:**
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## How to Use

1. Enter a website URL in the input field
2. Click "Analyze Website"
3. Wait for the Lighthouse analysis to complete
4. View your scores and AI-generated friendly report

## Requirements

- Node.js 18+
- Google Chrome browser
- OpenAI API key

## Security Features

- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- Environment variable protection