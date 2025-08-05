// Vercel serverless function - simplified version
module.exports = async function handler(req, res) {
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

    // Return mock data for now (Lighthouse is too heavy for Vercel serverless)
    const reportData = {
      performance: Math.floor(Math.random() * 40) + 60, // Random score 60-100
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
        <p><em>Note: This is a demo version with mock data. Deploy locally for full Lighthouse analysis.</em></p>`
    };

    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ error: error.message || 'Analysis failed' });
  }
};