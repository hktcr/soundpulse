const fs = require('fs');
const transcript = JSON.parse(fs.readFileSync('assets/soundpulse_transcription.json', 'utf8'));
const config = JSON.parse(fs.readFileSync('assets/soundpulse_config.json', 'utf8'));

config.questions.forEach(q => {
    let t = q.triggerTime;
    let segContext = "Between segments";
    let wContext = "";
    for(let seg of transcript.segments) {
        if (t > seg.start && t < seg.end) {
            segContext = `Mid-segment! Seg [${seg.start.toFixed(1)} - ${seg.end.toFixed(1)}]: ${seg.text}`;
            // Find word
            if(seg.words) {
                 for(let w of seg.words) {
                     if(t > w.start && t < w.end) {
                         wContext = `Mid-word! ${w.word}`;
                     }
                 }
            }
        }
    }
    console.log(`Q: ${q.id} @ ${t}s -> ${segContext} ${wContext}`);
});
