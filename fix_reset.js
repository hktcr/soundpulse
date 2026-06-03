const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/apiSet\('student_list',\s*strToHex\(''\)\);/, `apiSet('student_list', strToHex('RESET'));`);

html = html.replace(/const ids = decoded\.split\(\',\'\)\.filter\(id => id\.trim\(\)\);/, `if (decoded === 'RESET') {
                if (SP.knownStudents.size > 0) {
                    SP.knownStudents.clear();
                    SP.studentAnswers.clear();
                    pollStudentResponses();
                }
                return;
            }
            const ids = decoded.split(',').filter(id => id.trim() && id !== 'RESET');`);

fs.writeFileSync('index.html', html);
console.log('Reset fix applied');
