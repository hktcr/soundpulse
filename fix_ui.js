const fs = require('fs');
let css = fs.readFileSync('index.html', 'utf8');

// 1. Root variables
css = css.replace(/:root\s*\{[^}]+\}/, `:root {
            --sp-bg-deep: #0f140a;
            --sp-bg-primary: #151c0f;
            --sp-bg-surface: rgba(20, 26, 15, 0.7);
            --sp-bg-surface-light: rgba(30, 40, 25, 0.5);
            --sp-bg-glass: rgba(255, 255, 255, 0.04);
            --sp-border: rgba(255, 255, 255, 0.06);
            --sp-border-hover: rgba(255, 255, 255, 0.12);
            --sp-accent: #84cc16;
            --sp-accent-glow: rgba(132, 204, 22, 0.35);
            --sp-accent-soft: rgba(132, 204, 22, 0.12);
            --sp-accent-warm: #eab308;
            --sp-accent-warm-glow: rgba(234, 179, 8, 0.3);
            --sp-correct: #10b981;
            --sp-correct-bg: rgba(16, 185, 129, 0.12);
            --sp-incorrect: #ef4444;
            --sp-incorrect-bg: rgba(239, 68, 68, 0.1);
            --sp-warning: #eab308;
            --sp-text: #f0f4f8;
            --sp-text-secondary: #cbd5e1;
            --sp-text-muted: #94a3b8;
            --sp-font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            --sp-font-display: 'Oswald', sans-serif;
            --sp-radius: 16px;
            --sp-radius-sm: 10px;
            --sp-radius-lg: 24px;
            --z-base: 1;
            --z-content: 10;
            --z-player: 50;
            --z-overlay: 100;
            --z-message: 500;
            --z-toast: 1000;
        }`);

// 2. sp-bg
css = css.replace(/\.sp-bg\s*\{\s*position[^}]+}/, `.sp-bg {
            position: fixed; inset: 0; z-index: 0;
            background:
                radial-gradient(ellipse at 20% 0%, var(--sp-accent-soft) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 100%, var(--sp-accent-warm-glow) 0%, transparent 50%),
                var(--sp-bg-deep);
        }`);

// 3. sp-login-wrapper::before
css = css.replace(/\.sp-login-wrapper::before\s*\{[^}]+\}/, `.sp-login-wrapper::before {
            content: '';
            position: absolute; inset: 0;
            background: radial-gradient(circle at top right, var(--sp-accent-soft), transparent 40%),
                        radial-gradient(circle at bottom left, var(--sp-accent-soft), transparent 40%);
            z-index: -1; pointer-events: none;
        }`);

// 4. Input focus
css = css.replace(/\.sp-login-input:focus\s*\{[^}]+\}/, `.sp-login-input:focus { 
            border-color: var(--sp-accent); 
            background: var(--sp-bg-surface-light);
            box-shadow: 0 0 0 3px var(--sp-accent-soft), inset 0 2px 4px rgba(0,0,0,0.1); 
        }`);

// 5. Transcript styling
css = css.replace(/\.sp-transcript-line\s*\{[^}]+\}/, `.sp-transcript-line {
            margin-bottom: 1.2rem;
            color: var(--sp-text-secondary);
            font-size: 1.2rem;
            line-height: 1.7;
            cursor: pointer;
            padding: 0.5rem 1rem;
            border-radius: var(--sp-radius-sm);
            transition: all 0.2s;
        }`);

css = css.replace(/\.sp-transcript-line\.active\s*\{[^}]+\}/, `.sp-transcript-line.active {
            color: var(--sp-text); font-weight: 600; font-size: 1.25rem;
            background: var(--sp-bg-surface-light);
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            transform: scale(1.01);
            border-left: 4px solid var(--sp-accent);
        }`);

// 6. Segment Title (overlay on image)
css = css.replace(/\.sp-segment-title\s*\{[^}]+\}/, `.sp-segment-title {
            position: absolute; bottom: 0; left: 0; right: 0;
            padding: 1.5rem 1.5rem 1rem 1.5rem;
            background: linear-gradient(transparent, rgba(0,0,0,0.85));
            font-family: var(--sp-font-display);
            font-size: 1.4rem; font-weight: 600;
            color: #ffffff !important;
            text-shadow: 0 2px 6px rgba(0,0,0,0.9);
        }`);

// 7. Light theme
css = css.replace(/@media \(prefers-color-scheme: light\) \{[^}]+\}/, `@media (prefers-color-scheme: light) {
            :root {
                --sp-bg-deep: #f7fceb;
                --sp-bg-primary: #ffffff;
                --sp-bg-surface: rgba(255, 255, 255, 0.85);
                --sp-bg-surface-light: rgba(240, 245, 235, 0.7);
                --sp-text: #1a2e05;
                --sp-text-secondary: #3f6212;
                --sp-text-muted: #65a30d;
                --sp-border: rgba(0, 0, 0, 0.1);
                --sp-border-hover: rgba(0, 0, 0, 0.2);
                --sp-accent: #4d7c0f;
                --sp-accent-glow: rgba(77, 124, 15, 0.35);
                --sp-accent-soft: rgba(77, 124, 15, 0.12);
                --sp-accent-warm: #ca8a04;
                --sp-bg-glass: rgba(0, 0, 0, 0.03);
            }
        }`);

fs.writeFileSync('index.html', css);
console.log('UI fixes applied');
