const fs = require('fs');
let css = fs.readFileSync('index.html', 'utf8');

css = css.replace(/\.sp-q-text\s*\{[^}]+\}/, `.sp-q-text {
            font-size: 1.25rem; font-weight: 500;
            line-height: 1.5; margin-bottom: 1.5rem;
            color: var(--sp-text);
        }`);

css = css.replace(/\.sp-opt\s*\{[^}]+\}/, `.sp-opt {
            display: flex; align-items: center; gap: 1rem;
            padding: 1rem 1.2rem;
            background: var(--sp-bg-surface-light); border: 2px solid var(--sp-border);
            border-radius: var(--sp-radius-sm); cursor: pointer; transition: all 0.2s;
            font-size: 1.15rem; color: var(--sp-text);
        }`);

css = css.replace(/\.sp-transcript\s*\{[^}]+\}/, `.sp-transcript {
            background: var(--sp-bg-surface);
            backdrop-filter: blur(20px);
            border: 1px solid var(--sp-border);
            border-radius: var(--sp-radius-lg);
            padding: 2rem;
            height: 400px;
            overflow-y: auto;
            scroll-behavior: smooth;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.05);
        }`);

fs.writeFileSync('index.html', css);
console.log('Fonts upgraded');
