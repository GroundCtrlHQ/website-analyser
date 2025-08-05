document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('analyzeForm');
    const urlInput = document.getElementById('urlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const btnText = document.querySelector('.btn-text');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const resultsSection = document.getElementById('results');
    const errorDiv = document.getElementById('error');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const url = urlInput.value.trim();
        if (!url) return;
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            urlInput.value = 'https://' + url;
        }
        
        await analyzeWebsite(urlInput.value);
    });
    
    async function analyzeWebsite(url) {
        try {
            setLoadingState(true);
            hideError();
            hideResults();
            
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });
            
            const responseText = await response.text();
            console.log('Raw response:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.error('Response text:', responseText);
                throw new Error('Server returned invalid response. Check console for details.');
            }
            
            if (!response.ok) {
                throw new Error(data.error || 'Analysis failed');
            }
            
            displayResults(data);
            
        } catch (error) {
            showError(error.message);
        } finally {
            setLoadingState(false);
        }
    }
    
    function setLoadingState(loading) {
        analyzeBtn.disabled = loading;
        
        if (loading) {
            btnText.textContent = 'Analyzing...';
            loadingSpinner.style.display = 'block';
        } else {
            btnText.textContent = 'Analyze Website';
            loadingSpinner.style.display = 'none';
        }
    }
    
    function displayResults(data) {
        const { scores, aiReport, technicalData } = data;
        
        updateScore('performanceScore', scores.performance);
        updateScore('accessibilityScore', scores.accessibility);
        updateScore('bestPracticesScore', scores.bestPractices);
        updateScore('seoScore', scores.seo);
        
        if (technicalData) {
            displayTechnicalData(technicalData);
        }
        
        document.getElementById('aiReport').innerHTML = aiReport;
        
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function displayTechnicalData(techData) {
        const technicalDetails = document.getElementById('technicalDetails');
        
        const categories = [
            { title: 'Technologies', items: techData.technologies || [] },
            { title: 'CDNs', items: techData.scriptAnalysis?.cdns || [] },
            { title: 'Analytics', items: techData.scriptAnalysis?.analytics || [] },
            { title: 'Libraries', items: techData.scriptAnalysis?.libraries || [] },
            { title: 'Server Info', items: [
                techData.serverInfo?.server !== 'Unknown' ? `Server: ${techData.serverInfo.server}` : null,
                techData.serverInfo?.poweredBy !== 'Unknown' ? `Powered by: ${techData.serverInfo.poweredBy}` : null
            ].filter(Boolean) }
        ];
        
        technicalDetails.innerHTML = categories
            .filter(category => category.items.length > 0)
            .map(category => `
                <div class="tech-category">
                    <h4>${category.title}</h4>
                    <ul class="tech-list">
                        ${category.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
        
        if (technicalDetails.innerHTML === '') {
            technicalDetails.innerHTML = '<p style="color: var(--color-text); text-align: center;">No technical data available</p>';
        }
    }
    
    function updateScore(elementId, score) {
        const element = document.getElementById(elementId);
        element.textContent = score;
        
        element.className = 'score';
        if (score >= 90) {
            element.classList.add('good');
        } else if (score >= 50) {
            element.classList.add('okay');
        } else {
            element.classList.add('poor');
        }
    }
    
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    function hideError() {
        errorDiv.style.display = 'none';
    }
    
    function hideResults() {
        resultsSection.style.display = 'none';
    }
});