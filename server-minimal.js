// Minimal server for Railway debugging
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Simple test route
app.get('/test', (req, res) => {
  console.log('Test route requested');
  res.send('<h1>Server is working!</h1><p><a href="/health">Health Check</a></p>');
});

// Homepage
app.get('/', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'public', 'index.html');
    console.log('Trying to serve file:', filePath);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send(`
          <html>
            <body>
              <h1>Website Analyser - Railway Test</h1>
              <p>Server is running but index.html not found.</p>
              <p>Health check: <a href="/health">/health</a></p>
              <p>Error: ${err.message}</p>
            </body>
          </html>
        `);
      }
    });
  } catch (error) {
    console.error('Homepage error:', error);
    res.status(500).send(`
      <html>
        <body>
          <h1>Website Analyser - Railway Test</h1>
          <p>Server is running but there's an issue serving files.</p>
          <p>Health check: <a href="/health">/health</a></p>
          <p>Error: ${error.message}</p>
        </body>
      </html>
    `);
  }
});

// Minimal analyze endpoint (no Chrome/Puppeteer)
app.post('/analyze', (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Mock data for testing
    const reportData = {
      performance: Math.floor(Math.random() * 40) + 60,
      accessibility: Math.floor(Math.random() * 40) + 60,
      bestPractices: Math.floor(Math.random() * 40) + 60,
      seo: Math.floor(Math.random() * 40) + 60,
      url: url
    };

    const response = {
      scores: reportData,
      technicalData: null,
      aiReport: `<h3>Website Analysis Complete!</h3>
        <p>Analysis for: <strong>${url}</strong></p>
        <p>Your website scored:</p>
        <ul>
          <li><strong>Performance:</strong> ${reportData.performance}/100</li>
          <li><strong>Accessibility:</strong> ${reportData.accessibility}/100</li>
          <li><strong>Best Practices:</strong> ${reportData.bestPractices}/100</li>
          <li><strong>SEO:</strong> ${reportData.seo}/100</li>
        </ul>
        <p><em>Railway deployment test - Chrome analysis disabled for debugging.</em></p>`
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`📋 Memory usage:`, process.memoryUsage());
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Working directory:`, __dirname);
  console.log(`📋 Public directory exists:`, fs.existsSync(path.join(__dirname, 'public')));
  console.log(`📋 Index.html exists:`, fs.existsSync(path.join(__dirname, 'public', 'index.html')));
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => process.exit(0));
});