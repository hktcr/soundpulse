const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Update rewindFromQuestion logic
html = html.replace(/function rewindFromQuestion\(\) \{[\s\S]*?closeQuestion\(\);\s*\}/, `function rewindFromQuestion() {
        if (SP.currentQ !== undefined) SP.activatedQuestions.delete(SP.currentQ);
        audioEl.currentTime = Math.max(0, audioEl.currentTime - 30);
        audioEl.play().catch(() => {});
        SP.isPlaying = true;
        updatePlayBtn();
        closeQuestion();
    }`);

// 2. Update button HTML
html = html.replace(/<button class="sp-rewind-btn" onclick="rewindFromQuestion\(\)" role="button" tabindex="0" \$\{keyHandler\('rewindFromQuestion\(\)'\)\}\>⏪ Lyssna igen \([^\)]+\)<\/button>/, `<button class="sp-rewind-btn" onclick="rewindFromQuestion()" role="button" tabindex="0" \${keyHandler('rewindFromQuestion()')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Lyssna igen (30s)
            </button>`);

// 3. Update CSS
html = html.replace(/\.sp-rewind-btn\s*\{[\s\S]*?margin-top:\s*0\.5rem;\s*\}/, `.sp-rewind-btn {
            display: inline-flex; align-items: center; gap: 0.5rem;
            background: var(--sp-bg-surface-light); border: 1px solid var(--sp-border);
            color: var(--sp-text); border-radius: var(--sp-radius-sm);
            padding: 0.6rem 1rem; font-size: 0.85rem; font-weight: 500;
            cursor: pointer; transition: all 0.2s;
            margin-top: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }`);

html = html.replace(/\.sp-rewind-btn:hover\s*\{[\s\S]*?\}/, `.sp-rewind-btn:hover { 
            border-color: var(--sp-accent); color: var(--sp-accent); 
            background: var(--sp-bg-surface); transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .sp-rewind-btn:active { transform: translateY(0); }`);

fs.writeFileSync('index.html', html);
console.log('Index updated');
