const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/--sp-accent-warm: #ca8a04;\s*--sp-bg-glass: rgba\(0, 0, 0, 0\.03\);/, `--sp-accent-warm: #ca8a04;
                --sp-bg-glass: rgba(0, 0, 0, 0.03);
                --sp-correct: #059669;
                --sp-incorrect: #dc2626;`);

fs.writeFileSync('index.html', html);
console.log('Fixed light mode contrast colors');
