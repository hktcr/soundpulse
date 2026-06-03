const fs = require('fs');
let data = JSON.parse(fs.readFileSync('assets/soundpulse_config.json', 'utf8'));

const newQ = {
    id: "q0",
    type: "multiple-choice",
    triggerTime: 20,
    difficulty: "easy",
    text: "Vilken art kommer det här programmet handla om?",
    options: [
      { letter: "A", text: "Sammetsgeting" },
      { letter: "B", text: "Honungsbi" },
      { letter: "C", text: "Bålgeting" },
      { letter: "D", text: "Jordgeting" }
    ],
    correct: "A",
    feedbackOk: "Helt rätt! Sammetsgetingen (Vespa velutina) är fokus för det här programmet.",
    feedbackNok: "Nja, rubriken och introt avslöjar att det är Sammetsgetingen vi ska fördjupa oss i!"
};

data.questions.unshift(newQ);
fs.writeFileSync('assets/soundpulse_config.json', JSON.stringify(data, null, 2));
console.log('Added question 0');
