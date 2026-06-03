const fs = require('fs');
const transcript = JSON.parse(fs.readFileSync('assets/soundpulse_transcription.json', 'utf8'));
const config = JSON.parse(fs.readFileSync('assets/soundpulse_config.json', 'utf8'));

let gaps = [];
for (let i=0; i<transcript.segments.length; i++) {
    // We want the trigger to happen right after a segment ends
    gaps.push(transcript.segments[i].end + 0.1);
}

config.questions.forEach(q => {
    let t = q.triggerTime;
    let bestGap = gaps[0];
    let minDiff = Math.abs(t - bestGap);
    for (let g of gaps) {
        if (Math.abs(t - g) < minDiff) {
            minDiff = Math.abs(t - g);
            bestGap = g;
        }
    }
    console.log(`Q: ${q.id} moved from ${t} to ${bestGap.toFixed(1)}`);
    q.triggerTime = parseFloat(bestGap.toFixed(1));
});

fs.writeFileSync('assets/soundpulse_config.json', JSON.stringify(config, null, 2));
