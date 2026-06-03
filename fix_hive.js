const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Remove Light Theme completely
const lightThemeRegex = /@media \(prefers-color-scheme: light\) \{[\s\S]*?\}\s*\}/;
code = code.replace(lightThemeRegex, '');

// 2. Change .sp-bg to use honeycomb image and force dark
const oldSpBg = /\.sp-bg\s*\{[\s\S]*?var\(--sp-bg-deep\);\s*\}/;
const newSpBg = `.sp-bg {
            position: fixed; inset: 0; z-index: 0;
            background-color: #050505;
            background-image: 
                radial-gradient(ellipse at 20% 0%, rgba(132, 204, 22, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 100%, rgba(234, 179, 8, 0.15) 0%, transparent 50%),
                url('assets/honeycomb_bg.png');
            background-size: 100% 100%, 100% 100%, cover;
            background-position: center;
            background-attachment: fixed;
        }`;
code = code.replace(oldSpBg, newSpBg);

// 3. Change spoken word styling
const oldSpWord = /\.sp-word\s*\{[^}]+\}/;
const newSpWord = `.sp-word { 
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
            border-radius: 4px; padding: 2px 4px; cursor: default; 
            font-size: 1.6rem; line-height: 1.8; font-weight: 500;
            color: var(--sp-text-muted); opacity: 0.6;
        }`;
code = code.replace(oldSpWord, newSpWord);

const oldSpWordSpoken = /\.sp-word\.spoken\s*\{[^}]+\}/;
const newSpWordSpoken = `.sp-word.spoken { 
            background-color: #fbbf24;
            color: #000000 !important;
            opacity: 1; 
            font-weight: 700;
            box-shadow: 0 0 12px rgba(251, 191, 36, 0.4);
        }`;
code = code.replace(oldSpWordSpoken, newSpWordSpoken);

// Let's also adjust the transcript background to fit the dark theme beautifully
const oldTranscript = /\.sp-transcript\s*\{[^}]+\}/;
const newTranscript = `.sp-transcript {
            padding: 2rem 0;
            height: 450px;
            overflow-y: auto;
            scroll-behavior: smooth;
            background: transparent;
            border: none;
            box-shadow: none;
            -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
            mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
        }`;
code = code.replace(oldTranscript, newTranscript);


fs.writeFileSync('index.html', code);
console.log('Hive theme applied');
