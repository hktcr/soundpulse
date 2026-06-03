const fs = require('fs');
let data = JSON.parse(fs.readFileSync('assets/soundpulse_transcription.json', 'utf8'));

// 12: mot bot -> mot boet
data.segments[12].words.forEach(w => { if (w.word === 'bot,') w.word = 'boet,'; });
// 15: reporten -> reportern, blir nedlagt -> blir nerringda
data.segments[15].words.forEach(w => { 
  if (w.word === 'reporten') w.word = 'reportern'; 
  if (w.word === 'nedlagt.') w.word = 'nerringda.'; 
});
// 16: Nedringda -> Nerringda
data.segments[16].words.forEach(w => { if (w.word === 'Nedringda') w.word = 'Nerringda'; });
// 31: Bergen. -> bergen.
data.segments[31].words.forEach(w => { if (w.word === 'Bergen.') w.word = 'bergen.'; });
// 42: bot -> boet
data.segments[42].words.forEach(w => { if (w.word === 'bot') w.word = 'boet'; });
// 136: 20 hornet kommer in och fördjurar allt. -> 20 sammetsgetingar kommer in och förstör allt.
data.segments[136].words.forEach(w => { 
  if (w.word === 'hornet') w.word = 'sammetsgetingar'; 
  if (w.word === 'fördjurar') w.word = 'förstör'; 
});
// 139: frön. -> faran.
data.segments[139].words.forEach(w => { if (w.word === 'frön.') w.word = 'faran.'; });
// 141: Lotte-Garon -> Lot-et-Garonne, kontinens -> container, importade -> importerade
data.segments[141].words.forEach(w => { 
  if (w.word === 'Lotte-Garon,') w.word = 'Lot-et-Garonne,'; 
  if (w.word === 'kontinens') w.word = 'container'; 
  if (w.word === 'importade') w.word = 'importerade'; 
});
// 149: arten på 2020-talet, det är ju en av de största arten som har blivit mindre blommor. 
let removeMode = false;
data.segments[149].words.forEach((w, i) => { 
  if (w.word === 'arten') w.word = 'orsakerna'; 
  if (w.word === 'som') removeMode = true;
  if (removeMode && i >= 13 && i <= 17) w.word = ''; // 'som', 'har', 'blivit', 'mindre', 'blommor.'
});
data.segments[149].words[data.segments[149].words.length - 1].word += '.'; // ensure period at end of "arten/orsakerna" or just leave it
// 160: Kalabroni asiatico Q2. -> Calabrone asiatico.
data.segments[160].words.forEach(w => { 
  if (w.word === 'Kalabroni') w.word = 'Calabrone'; 
  if (w.word === 'Q2.') w.word = ''; 
});
// 164: en intrat -> entrata
data.segments[164].words.forEach(w => { 
  if (w.word === 'en') w.word = ''; 
  if (w.word === 'intrat') w.word = 'entrata'; 
});
// 167: nidor? -> nidos?
data.segments[167].words.forEach(w => { if (w.word === 'nidor?') w.word = 'nidos?'; });
// 172: I -> Die
data.segments[172].words.forEach(w => { if (w.word === 'I') w.word = 'Die'; });
// 174: Binen stegn -> Bienen stehen
data.segments[174].words.forEach(w => { 
  if (w.word === 'Binen') w.word = 'Bienen'; 
  if (w.word === 'stegn') w.word = 'stehen'; 
});
// 189: gedhams -> gedehams
data.segments[189].words.forEach(w => { if (w.word === 'gedhams') w.word = 'gedehams'; });
// 195: gedhams -> gedehams
data.segments[195].words.forEach(w => { if (w.word === 'gedhams') w.word = 'gedehams'; });
// 227: hårt bina är. -> hårt bina jobbar.
data.segments[227].words.forEach(w => { if (w.word === 'är.') w.word = 'jobbar.'; });
// 255: Sellström. -> Sällström.
data.segments[255].words.forEach(w => { if (w.word === 'Sellström.') w.word = 'Sällström.'; });

// Clean up extra spaces in UI by setting empty words to invisible or just empty.
fs.writeFileSync('assets/soundpulse_transcription.json', JSON.stringify(data, null, 2));
console.log('Fixed words.');
