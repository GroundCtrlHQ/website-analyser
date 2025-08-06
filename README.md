# 🚨 Website Analyser

A powerful web application that analyzes websites using Google Lighthouse and provides AI-powered, user-friendly reports with technical deep-dive insights.

## ✨ Features

- 🚀 **Google Lighthouse Integration** - Complete performance, accessibility, SEO analysis
- 🤖 **AI-Powered Reports** - User-friendly recommendations via OpenAI GPT
- 🔍 **Technical Deep Dive** - Wappalyzer-like technology stack detection
- 📊 **Visual Score Cards** - Easy-to-understand performance metrics
- 🎨 **Cyberpunk UI** - Dark theme with glowing effects
- ⚡ **Hybrid Architecture** - Optimized deployment across platforms

## 🏗️ Architecture

**Hybrid Deployment Strategy:**
- **Frontend**: Vercel (Static files, CDN, auto-scaling)
- **Backend**: Railway (Chrome, Puppeteer, heavy processing)

```
Frontend (Vercel)  ←→  API (Railway)
├── HTML/CSS/JS         ├── Lighthouse analysis  
├── Static serving      ├── Tech stack detection
├── Fast CDN           ├── OpenAI integration
└── Global edge        └── Container processing
```

## 🚀 Quick Start

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Local Development
```bash
# Start API
cd api && npm install && npm start

# Serve Frontend  
cd frontend && python -m http.server 8000
```

## 📁 Project Structure

```
├── api/                 # Railway Backend
│   ├── server.js       # Express API server
│   ├── package.json    # Dependencies
│   └── Dockerfile      # Container config
├── frontend/           # Vercel Frontend
│   ├── index.html      # Main UI
│   ├── script.js       # Frontend logic
│   └── styles.css      # Cyberpunk styling
└── DEPLOYMENT.md       # Deployment guide
```

## 🔧 Tech Stack

**Frontend:**
- Vanilla JavaScript (no framework overhead)
- CSS Custom Properties & Grid
- Manifold CF typography
- Responsive design

**Backend:**
- Node.js + Express
- Google Lighthouse
- Puppeteer (technology detection)
- OpenAI GPT integration
- Docker containerization

## 🎯 What It Analyzes

**Lighthouse Metrics:**
- Performance optimization
- Accessibility compliance  
- SEO best practices
- Security & best practices

**Technology Detection:**
- Frameworks (React, Vue, Angular)
- CDNs and libraries
- Analytics tools
- Server information
- Meta tag analysis

## 🚀 Live Demo

- **Frontend**: Deploy to Vercel
- **API**: Deploy to Railway
- **One Repo**: Monorepo structure for easy management