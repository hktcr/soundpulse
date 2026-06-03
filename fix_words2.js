const fs = require('fs');
let data = JSON.parse(fs.readFileSync('assets/soundpulse_transcription.json', 'utf8'));

// 130: bioglingar -> biodlingar
data.segments[129].words.forEach(w => { if (w.word === 'bioglingar') w.word = 'biodlingar'; });

// 231: binan. -> bina.
data.segments[230].words.forEach(w => { if (w.word === 'binan.') w.word = 'bina.'; });

// 238: blombrämsor -> blomremsor
data.segments[237].words.forEach(w => { if (w.word === 'blombrämsor') w.word = 'blomremsor'; });

fs.writeFileSync('assets/soundpulse_transcription.json', JSON.stringify(data, null, 2));
console.log('Fixed additional typos.');
