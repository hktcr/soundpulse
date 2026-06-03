const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Upgrade Light Theme
const oldLightTheme = /--sp-bg-deep: #f7fceb;[\s\S]*?--sp-incorrect: #dc2626;\s*\}/;
const newLightTheme = `--sp-bg-deep: #f8fafc;
                --sp-bg-primary: #ffffff;
                --sp-bg-surface: rgba(255, 255, 255, 0.95);
                --sp-bg-surface-light: rgba(248, 250, 252, 0.8);
                --sp-text: #0f172a;
                --sp-text-secondary: #334155;
                --sp-text-muted: #64748b;
                --sp-border: rgba(0, 0, 0, 0.08);
                --sp-border-hover: rgba(0, 0, 0, 0.15);
                --sp-accent: #10b981;
                --sp-accent-glow: rgba(16, 185, 129, 0.35);
                --sp-accent-soft: rgba(16, 185, 129, 0.12);
                --sp-accent-warm: #ca8a04;
                --sp-bg-glass: rgba(0, 0, 0, 0.03);
                --sp-correct: #059669;
                --sp-incorrect: #dc2626;
            }`;
code = code.replace(oldLightTheme, newLightTheme);

// 2. Upgrade Transcript CSS
const oldTranscript = /\.sp-transcript\s*\{[^}]+\}/;
const newTranscript = `.sp-transcript {
            padding: 2rem 0;
            height: 450px;
            overflow-y: auto;
            scroll-behavior: smooth;
            /* Apple Music style fade edges */
            -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
            mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
        }
        .sp-line { margin-bottom: 2rem; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); transform-origin: left center; }
        .sp-line.active-line { transform: scale(1.03); }`;
code = code.replace(oldTranscript, newTranscript);

// 3. Upgrade .sp-word
const oldSpWord = /\.sp-word\s*\{[^}]+\}/;
const newSpWord = `.sp-word { 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            border-radius: 4px; padding: 2px; cursor: default; 
            font-size: 1.6rem; line-height: 1.8; font-weight: 500;
            color: var(--sp-text-muted); opacity: 0.4;
        }`;
code = code.replace(oldSpWord, newSpWord);

// 4. Upgrade .sp-word.spoken
const oldSpWordSpoken = /\.sp-word\.spoken\s*\{[^}]+\}/;
const newSpWordSpoken = `.sp-word.spoken { 
            color: var(--sp-text); opacity: 1; font-weight: 600;
        }`;
code = code.replace(oldSpWordSpoken, newSpWordSpoken);

// 5. Add logic to JS to highlight active line
const oldJsTranscript = /el\.classList\.add\('spoken'\);\s*\}\s*\}\);/;
const newJsTranscript = `el.classList.add('spoken');
                // Highlight active line
                const parentLine = el.closest('.sp-line');
                if (parentLine && !parentLine.classList.contains('active-line')) {
                    document.querySelectorAll('.sp-line').forEach(l => l.classList.remove('active-line'));
                    parentLine.classList.add('active-line');
                }
            }
        });`;
code = code.replace(oldJsTranscript, newJsTranscript);

fs.writeFileSync('index.html', code);
console.log('Premium UI Upgrade Applied!');
