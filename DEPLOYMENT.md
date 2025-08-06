# Hybrid Deployment Guide

This project uses a **monorepo** with **hybrid deployment**:

## 🏗️ Architecture

```
Frontend (Vercel)  ←→  API (Railway)
├── Static files        ├── Lighthouse analysis
├── UI/UX              ├── Puppeteer tech detection
├── Fast CDN           ├── OpenAI integration
└── Auto-scaling       └── Heavy processing
```

## 📁 Project Structure

```
Website Analyser/
├── api/                 # Railway Backend
│   ├── server.js       # Express API server
│   ├── package.json    # Backend dependencies
│   ├── Dockerfile      # Railway container config
│   └── railway.json    # Railway deployment config
├── frontend/           # Vercel Frontend  
│   ├── index.html      # Main HTML
│   ├── script.js       # Frontend JavaScript
│   ├── styles.css      # Styling
│   └── vercel.json     # Vercel deployment config
├── README.md           
└── DEPLOYMENT.md
```

## 🚀 Deployment Steps

### 1. Deploy API to Railway

1. **Connect Railway to repo**
2. **Set root directory**: `/api`
3. **Add environment variables**:
   - `OPENAI_API_KEY=your_openai_key`
4. **Deploy** - Railway will use `api/Dockerfile`
5. **Note the Railway URL**: `https://your-app.railway.app`

### 2. Deploy Frontend to Vercel

1. **Connect Vercel to repo** 
2. **Set root directory**: `/frontend`
3. **Update API URL** in `frontend/script.js`:
   ```javascript
   const API_URL = 'https://your-railway-api-domain.railway.app';
   ```
4. **Deploy** - Vercel will use `frontend/vercel.json`

### 3. Configure CORS

The API already includes CORS headers for cross-origin requests.

## 🔧 Local Development

```bash
# Terminal 1: Start API
cd api
npm install
npm start

# Terminal 2: Serve Frontend
cd frontend  
python -m http.server 8000
# or use any static server
```

Visit `http://localhost:8000` for frontend
API runs on `http://localhost:3000`

## ✅ Benefits

- **Optimized platforms**: Each service on ideal infrastructure
- **Independent scaling**: Frontend and API scale separately
- **Easier debugging**: Issues isolated to specific services
- **Better performance**: Static files on CDN, heavy processing on containers
- **Cost effective**: Pay only for what each service needs