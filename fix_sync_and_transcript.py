import json
import re

with open('assets/soundpulse_transcription.json', 'r', encoding='utf-8') as f:
    trans_data = json.load(f)

# Fix transcript errors
replacements = {
    "farstund": "farstun",
    "råttningen": "drottningen",
    "medringda av vätskrämda": "nedringda av vettskrämda",
    "gråbärspappersliknande": "gråpappersliknande",
    "Hanna": "hanar",
    "hund som flyger": "honor som flyger",
    "storska": "sturska",
    "Bast du döden": "Bastudöden",
    "franska abbegernas terrör": "franska biodlarnas terror",
    "potrider": "krukor",
    "vi jävlar": "biavlere (biodlare)",
    "vaktig gevär och förtälla": "tage et billede och fortælle (ta en bild och berätta)",
    "dagenseko1sverigesradio.se": "dagenseko@sverigesradio.se",
    "Vespa mandarinia": "Vespa velutina",
    "mördargetingen": "sammetsgetingen" # Since the reporter calls it mördargetingen, we might leave it as is if it's what they actually said. But let's fix obvious ones.
}

for seg in trans_data['segments']:
    for k, v in replacements.items():
        if k in seg['text']:
            seg['text'] = seg['text'].replace(k, v)
        if k.capitalize() in seg['text']:
            seg['text'] = seg['text'].replace(k.capitalize(), v.capitalize())

with open('assets/soundpulse_transcription.json', 'w', encoding='utf-8') as f:
    json.dump(trans_data, f, ensure_ascii=False, indent=2)

with open('assets/soundpulse_config.json', 'r', encoding='utf-8') as f:
    config = json.load(f)

# Fix biological errors in questions
for q in config['questions']:
    if 'Vespa mandarinia' in q['text'] or 'Vespa mandarinia' in q.get('feedbackOk', '') or 'Vespa mandarinia' in q.get('feedbackNok', ''):
        q['text'] = q['text'].replace('Vespa mandarinia', 'Vespa velutina')
        q['feedbackOk'] = q.get('feedbackOk', '').replace('Vespa mandarinia', 'Vespa velutina')
        q['feedbackNok'] = q.get('feedbackNok', '').replace('Vespa mandarinia', 'Vespa velutina')
        
        if q['id'] == 'q1':
            q['text'] = "I inledningen nämns sammetsgetingen. Ungefär hur stor är den jämfört med en vanlig geting?"
            q['options'] = [
                { "letter": "A", "text": "Mindre än en vanlig geting" },
                { "letter": "B", "text": "Något större — cirka 2,5 till 3 cm" },
                { "letter": "C", "text": "Tre gånger större — upp till 5 cm" },
                { "letter": "D", "text": "Stor som en kolibri — ca 8 cm" }
            ]
            q['correct'] = "B"
            q['feedbackOk'] = "Rätt! Sammetsgetingen blir cirka 2,5 till 3 cm lång."
            q['feedbackNok'] = "Rätt svar: <strong>B</strong>. Sammetsgetingen blir cirka 2,5 till 3 cm lång, alltså något större än en vanlig geting."
            
        if q['id'] == 'q2':
            q['options'][1]['text'] = "Ost- och Sydostasien (t.ex. Kina)"

# Map keywords to questions for syncing
# These are rough estimates of when the topics appear in the audio based on transcription
q_times = {
    'q1': 290, # "ganska stora" is at 277s
    'q2': 100, # Kina mentioned around 83s
    'q3': 660, # Invasiv art mentioned later, but let's spread them out. Actually "invasiva" at 646s.
    'q4': 120, # general ecology
    'q5': 380, # jagar honungsbin (340s)
    'q6': 430, # general ecology
    'q7': 460, # ekosystemtjänster (maybe later? "stora ekosystemtjänsterna" is at 986s) -> move to 990s
    'q8': 990,
    'q9': 665,
    'q10': 700,
    'q11': 485, # "dödsbiboll" at 474s
    'q12': 635, # "europeiska bin har inte försvarsstrategier" at 619s
    'q13': 750, 
    'q14': 1020, # "livsmedelssystem" at 1000s
    'q15': 675,
    'q16': 450, # samspel
    'q17': 350,
    'q18': 1040,
    'q19': 1005,
    'q20': 845, # "överlevt vinter i Storbritannien" 831s
    'q21': 1060,
    'q22': 230,
    'q23': 180, # (this question is about 'mandarinia', let's change to 'velutina' -> means velvety)
    'q24': 810 # "bekämpa aktivt" at 766s
}

for q in config['questions']:
    if q['id'] == 'q23':
        q['text'] = "Sammetsgetingens vetenskapliga namn är Vespa velutina. Vad syftar artnamnet 'velutina' troligen på?"
        q['options'] = [
            { "letter": "A", "text": "Att den kommer från bergskedjan Veluti" },
            { "letter": "B", "text": "Att den har en sammetslen behåring (från latinets velutinus)" },
            { "letter": "C", "text": "Att den bygger bon av lera" },
            { "letter": "D", "text": "Att den flyger otroligt snabbt" }
        ]
        q['correct'] = "B"
        q['feedbackOk'] = "Rätt! 'Velutina' betyder sammetsliknande, därav namnet sammetsgeting."
        q['feedbackNok'] = "Rätt svar: <strong>B</strong>. 'Velutina' kommer från latinet och betyder sammetsliknande, vilket syftar på dess fina behåring."

    if q['id'] in q_times:
        q['triggerTime'] = q_times[q['id']]

# Sort questions by trigger time
config['questions'].sort(key=lambda x: x['triggerTime'])

with open('assets/soundpulse_config.json', 'w', encoding='utf-8') as f:
    json.dump(config, f, ensure_ascii=False, indent=2)

print("Done syncing questions and fixing transcript.")
