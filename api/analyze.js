// Vercel serverless function
const lighthouse = require('lighthouse').default;
const chromeLauncher = require('chrome-launcher');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const urlPattern = /^https?:\/\/.+\..+/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ error: 'Please provide a valid URL starting with http:// or https://' });
    }

    // Simplified Lighthouse analysis
    let chrome;
    try {
      chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless', '--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port: chrome.port,
      };
      
      const runnerResult = await lighthouse(url, options);
      const lighthouseData = runnerResult.lhr;
      
      // Generate basic report
      const categories = lighthouseData.categories;
      const reportData = {
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        bestPractices: Math.round(categories['best-practices'].score * 100),
        seo: Math.round(categories.seo.score * 100),
        url: lighthouseData.finalUrl
      };

      const response = {
        scores: reportData,
        technicalData: null, // Skip technical analysis in serverless
        aiReport: `<h3>Website Analysis Complete!</h3>
          <p>Your website scored:</p>
          <ul>
            <li><strong>Performance:</strong> ${reportData.performance}/100</li>
            <li><strong>Accessibility:</strong> ${reportData.accessibility}/100</li>
            <li><strong>Best Practices:</strong> ${reportData.bestPractices}/100</li>
            <li><strong>SEO:</strong> ${reportData.seo}/100</li>
          </ul>
          <p><em>Technical deep dive and AI recommendations are available in the full version.</em></p>`
      };

      await chrome.kill();
      return res.status(200).json(response);
      
    } catch (error) {
      if (chrome) await chrome.kill();
      throw error;
    }
    
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ error: error.message || 'Analysis failed' });
  }
}