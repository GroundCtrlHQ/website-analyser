import dotenv from 'dotenv';
import express from 'express';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import puppeteer from 'puppeteer';
import OpenAI from 'openai';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
app.use(cors());
app.use(express.json());
// API-only server - no static files

let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} else {
  console.warn('⚠️  OPENAI_API_KEY not set. AI report generation will be disabled.');
}

async function runTechnicalAnalysis(url) {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Extract technical information
    const techInfo = await page.evaluate(() => {
      const data = {
        technologies: [],
        frameworks: [],
        analytics: [],
        cdn: [],
        cms: [],
        jsLibraries: [],
        headers: {},
        meta: {},
        scripts: []
      };
      
      // Check for common frameworks and libraries
      const checks = {
        'React': () => window.React || document.querySelector('[data-reactroot]'),
        'Vue.js': () => window.Vue || document.querySelector('[data-v-]'),
        'Angular': () => window.angular || window.ng || document.querySelector('[ng-app]'),
        'jQuery': () => window.jQuery || window.$,
        'Bootstrap': () => document.querySelector('link[href*="bootstrap"]') || document.querySelector('.container'),
        'WordPress': () => document.querySelector('meta[name="generator"][content*="WordPress"]') || document.querySelector('link[href*="wp-content"]'),
        'Shopify': () => window.Shopify || document.querySelector('script[src*="shopify"]'),
        'Google Analytics': () => window.gtag || window.ga || document.querySelector('script[src*="google-analytics"]'),
        'Google Tag Manager': () => window.google_tag_manager || document.querySelector('script[src*="googletagmanager"]'),
        'Cloudflare': () => document.querySelector('script[src*="cloudflare"]') || document.querySelector('[data-cf-beacon]'),
        'Font Awesome': () => document.querySelector('link[href*="font-awesome"]') || document.querySelector('i[class*="fa-"]'),
        'Tailwind CSS': () => document.querySelector('link[href*="tailwind"]') || document.documentElement.className.includes('tailwind')
      };
      
      // Run checks
      Object.entries(checks).forEach(([name, check]) => {
        try {
          if (check()) {
            data.technologies.push(name);
          }
        } catch (e) {
          // Silent fail for individual checks
        }
      });
      
      // Get meta tags
      document.querySelectorAll('meta').forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) {
          data.meta[name] = content;
        }
      });
      
      // Get script sources
      document.querySelectorAll('script[src]').forEach(script => {
        const src = script.getAttribute('src');
        if (src) {
          data.scripts.push(src);
        }
      });
      
      return data;
    });
    
    // Get response headers
    const response = await page.goto(url);
    const headers = response.headers();
    
    // Analyze scripts for more technologies
    const scriptAnalysis = analyzeScripts(techInfo.scripts);
    
    await browser.close();
    
    return {
      ...techInfo,
      headers,
      scriptAnalysis,
      serverInfo: {
        server: headers.server || 'Unknown',
        poweredBy: headers['x-powered-by'] || 'Unknown',
        contentType: headers['content-type'] || 'Unknown'
      }
    };
    
  } catch (error) {
    await browser.close();
    throw new Error(`Technical analysis failed: ${error.message}`);
  }
}

function analyzeScripts(scripts) {
  const analysis = {
    cdns: [],
    libraries: [],
    analytics: [],
    advertising: []
  };
  
  const patterns = {
    cdns: [
      { name: 'Cloudflare', pattern: /cloudflare|cdnjs/ },
      { name: 'jsDelivr', pattern: /jsdelivr/ },
      { name: 'unpkg', pattern: /unpkg/ },
      { name: 'Google CDN', pattern: /googleapis/ }
    ],
    libraries: [
      { name: 'jQuery', pattern: /jquery/ },
      { name: 'Lodash', pattern: /lodash/ },
      { name: 'Moment.js', pattern: /moment/ },
      { name: 'D3.js', pattern: /d3\./ },
      { name: 'Chart.js', pattern: /chart\.js/ }
    ],
    analytics: [
      { name: 'Google Analytics', pattern: /google-analytics|gtag/ },
      { name: 'Facebook Pixel', pattern: /connect\.facebook\.net/ },
      { name: 'Hotjar', pattern: /hotjar/ },
      { name: 'Mixpanel', pattern: /mixpanel/ }
    ],
    advertising: [
      { name: 'Google Ads', pattern: /googleadservices|googlesyndication/ },
      { name: 'Facebook Ads', pattern: /facebook\.com\/tr/ },
      { name: 'Twitter Ads', pattern: /ads-twitter/ }
    ]
  };
  
  scripts.forEach(script => {
    Object.entries(patterns).forEach(([category, patternList]) => {
      patternList.forEach(({ name, pattern }) => {
        if (pattern.test(script) && !analysis[category].includes(name)) {
          analysis[category].push(name);
        }
      });
    });
  });
  
  return analysis;
}

async function runLighthouseAnalysis(url) {
  let chrome;
  try {
    chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    };
    
    const runnerResult = await lighthouse(url, options);
    return runnerResult.lhr;
  } catch (error) {
    throw new Error(`Lighthouse analysis failed: ${error.message}`);
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

async function generateFriendlyReport(lighthouseData, technicalData = null) {
  const categories = lighthouseData.categories;
  const audits = lighthouseData.audits;
  
  const reportData = {
    performance: Math.round(categories.performance.score * 100),
    accessibility: Math.round(categories.accessibility.score * 100),
    bestPractices: Math.round(categories['best-practices'].score * 100),
    seo: Math.round(categories.seo.score * 100),
    url: lighthouseData.finalUrl,
    issues: []
  };
  
  Object.keys(audits).forEach(auditKey => {
    const audit = audits[auditKey];
    if (audit.score !== null && audit.score < 0.9 && audit.description) {
      reportData.issues.push({
        title: audit.title,
        description: audit.description,
        score: Math.round(audit.score * 100)
      });
    }
  });
  
  if (!openai) {
    return {
      scores: reportData,
      technicalData,
      aiReport: `Website Analysis Complete!\n\nYour website scored:\n• Performance: ${reportData.performance}/100\n• Accessibility: ${reportData.accessibility}/100\n• Best Practices: ${reportData.bestPractices}/100\n• SEO: ${reportData.seo}/100\n\nTo get AI-powered recommendations and detailed insights, please set up your OpenAI API key in the .env file.\n\nKey issues to address:\n${reportData.issues.slice(0, 3).map(issue => `• ${issue.title}`).join('\n')}`
    };
  }
  
  const technicalSummary = technicalData ? `
Technologies Detected: ${technicalData.technologies.join(', ') || 'None detected'}
Server: ${technicalData.serverInfo.server}
CDNs: ${technicalData.scriptAnalysis.cdns.join(', ') || 'None detected'}
Analytics: ${technicalData.scriptAnalysis.analytics.join(', ') || 'None detected'}
Key Meta Tags: ${Object.keys(technicalData.meta).slice(0, 5).join(', ')}` : '';

  const prompt = `Based on this comprehensive website analysis, create a friendly, easy-to-understand HTML report for a website owner:

URL: ${reportData.url}
Performance Score: ${reportData.performance}/100
Accessibility Score: ${reportData.accessibility}/100
Best Practices Score: ${reportData.bestPractices}/100
SEO Score: ${reportData.seo}/100

Key Issues Found: ${reportData.issues.slice(0, 5).map(issue => `${issue.title} (${issue.score}/100): ${issue.description}`).join('; ')}

Technical Stack Analysis:${technicalSummary}

Please provide a well-formatted HTML response with:
1. A brief overall summary of the website's performance
2. Technical stack overview and recommendations
3. Top 3 priority improvements with specific, actionable steps
4. Positive aspects to highlight
5. Simple explanations without technical jargon

Use proper HTML formatting with headings (h3, h4), paragraphs, lists (ul/ol), and emphasis tags (strong, em). 
Keep the tone encouraging and focus on practical next steps.
Do not include DOCTYPE, html, head, or body tags - just the content HTML.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7
    });
    
    return {
      scores: reportData,
      technicalData,
      aiReport: completion.choices[0].message.content
    };
  } catch (error) {
    throw new Error(`AI report generation failed: ${error.message}`);
  }
}

app.post('/analyze', async (req, res) => {
  try {
    console.log('Analysis request received:', req.body);
    
    const { url } = req.body;
    
    if (!url) {
      console.log('Error: URL is required');
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const urlPattern = /^https?:\/\/.+\..+/;
    if (!urlPattern.test(url)) {
      console.log('Error: Invalid URL format:', url);
      return res.status(400).json({ error: 'Please provide a valid URL starting with http:// or https://' });
    }
    
    console.log('Starting analysis for:', url);
    
    // Try running analyses separately to identify which one fails
    let lighthouseData, technicalData;
    
    try {
      console.log('Running Lighthouse analysis...');
      lighthouseData = await runLighthouseAnalysis(url);
      console.log('Lighthouse analysis completed');
    } catch (lighthouseError) {
      console.error('Lighthouse analysis failed:', lighthouseError);
      return res.status(500).json({ error: `Lighthouse analysis failed: ${lighthouseError.message}` });
    }
    
    try {
      console.log('Running technical analysis...');
      technicalData = await runTechnicalAnalysis(url);
      console.log('Technical analysis completed');
    } catch (techError) {
      console.error('Technical analysis failed:', techError);
      // Continue without technical data if it fails
      technicalData = null;
      console.log('Continuing without technical analysis data');
    }
    
    console.log('Generating report...');
    const report = await generateFriendlyReport(lighthouseData, technicalData);
    console.log('Report generated successfully');
    
    res.json(report);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Add a simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working', timestamp: new Date().toISOString() });
});

// Add a debug endpoint for the analyze function
app.post('/api/debug', (req, res) => {
  try {
    const { url } = req.body;
    res.json({ 
      received: true, 
      url: url,
      body: req.body,
      env: {
        vercel: !!process.env.VERCEL,
        openai: !!process.env.OPENAI_API_KEY
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Website Analyser API',
    version: '1.0.0',
    endpoints: {
      analyze: 'POST /analyze',
      health: 'GET /health'
    },
    docs: 'https://github.com/your-username/website-analyser'
  });
});

// Add explicit error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (!process.env.OPENAI_API_KEY) {
    console.log('📝 To enable AI reports, add OPENAI_API_KEY environment variable');
  } else {
    console.log('✅ AI reports are enabled');
  }
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});