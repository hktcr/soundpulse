const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldStr = `// Student list
        html += '<div style="margin-top:0.8rem;border-top:1px solid var(--sp-border);padding-top:0.5rem;">';
        SP.knownStudents.forEach((name, sid) => {
            const ansCount = (SP.studentAnswers.get(sid) ? Object.keys(SP.studentAnswers.get(sid)).length : 0);
            html += \`<div style="font-size:0.75rem;color:var(--sp-text-secondary);padding:0.2rem 0;">
                \${name} <span style="color:var(--sp-text-muted)">(\${ansCount}/\${CONFIG_DATA.questions.length} svar)</span>
            </div>\`;
        });
        html += '</div>';`;

const newStr = `// Student list
        html += '<div style="margin-top:1.5rem;border-top:1px solid var(--sp-border);padding-top:1rem;">';
        html += '<div style="font-size:0.85rem; font-weight:600; margin-bottom:1rem; color:var(--sp-text); font-family:var(--sp-font-display); letter-spacing:0.5px;">ELEVFRAMSTEG</div>';
        
        SP.knownStudents.forEach((name, sid) => {
            const ansMap = SP.studentAnswers.get(sid) || {};
            let correct = 0;
            let incorrect = 0;
            let answered = 0;
            
            CONFIG_DATA.questions.forEach((q) => {
                if (ansMap[q.id]) {
                    answered++;
                    if (q.type === 'multiple-choice') {
                        if (ansMap[q.id] === q.correct) correct++;
                        else incorrect++;
                    } else if (q.type === 'freetext') {
                        correct++;
                    } else {
                        if (ansMap[q.id] === 'correct') correct++;
                        else incorrect++;
                    }
                }
            });
            
            const total = CONFIG_DATA.questions.length;
            const correctPct = Math.round((correct / total) * 100);
            const incorrectPct = Math.round((incorrect / total) * 100);
            
            html += \`
                <div style="margin-bottom:1rem; font-size:0.8rem;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; align-items:flex-end;">
                        <span style="color:var(--sp-text); font-weight:500;">\${name}</span>
                        <span style="font-size:0.7rem; color:var(--sp-text-muted);">
                            \${answered} / \${total} besvarade 
                            <span style="color:var(--sp-correct); margin-left:0.3rem; font-weight:600;">✓\${correct}</span> 
                            <span style="color:var(--sp-incorrect); margin-left:0.2rem; font-weight:600;">✗\${incorrect}</span>
                        </span>
                    </div>
                    <div style="width:100%; height:10px; background:var(--sp-bg-glass); border: 1px solid var(--sp-border); border-radius:5px; overflow:hidden; display:flex;">
                        <div style="width:\${correctPct}%; height:100%; background:var(--sp-correct); box-shadow:0 0 8px var(--sp-correct-bg); transition:width 0.4s ease;"></div>
                        <div style="width:\${incorrectPct}%; height:100%; background:var(--sp-incorrect); box-shadow:0 0 8px var(--sp-incorrect-bg); transition:width 0.4s ease;"></div>
                    </div>
                </div>\`;
        });
        html += '</div>';`;

if (html.includes('// Student list')) {
    html = html.replace(oldStr, newStr);
    fs.writeFileSync('index.html', html);
    console.log("Updated dashboard UI successfully.");
} else {
    console.log("Failed to find replacement block.");
}
