// Minimal server for Railway debugging
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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