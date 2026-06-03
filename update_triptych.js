const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Update CSS for triptych
html = html.replace('.sp-visual-side {', `.sp-triptych {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            height: 100%;
        }
        .sp-triptych-top {
            display: flex;
            gap: 1rem;
            height: 40%;
        }
        .sp-triptych-top img {
            width: 50%;
            object-fit: cover;
            border-radius: var(--sp-radius);
            border: 1px solid var(--sp-border);
        }
        .sp-triptych-bottom {
            position: relative;
            flex: 1;
            border-radius: var(--sp-radius);
            overflow: hidden;
            border: 1px solid var(--sp-border);
            background: #000;
        }
        .sp-visual-side {`);

// Update HTML for triptych
const visualSideRegex = /<div class="sp-visual-side">[\s\S]*?<\/div>(\s*<div class="sp-dynamic-side">)/;
const newVisualSide = `<div class="sp-visual-side">
                    <div class="sp-triptych">
                        <div class="sp-triptych-top">
                            <img src="assets/honungsbi.jpg" alt="Honungsbi">
                            <img src="assets/sammetsgeting.jpg" alt="Sammetsgeting">
                        </div>
                        <div class="sp-triptych-bottom" id="spVisual">
                            <video class="sp-bg-video" src="assets/bikupa.mp4" autoplay loop muted playsinline></video>
                            <img id="spVisualImg" src="" alt="Segment illustration" style="position:absolute; inset:0; width:100%; height:100%; object-fit:contain; z-index:10; opacity:0; transition: opacity 0.5s;">
                            <div class="sp-segment-title" id="spSegTitle" style="z-index:20; background: linear-gradient(transparent, rgba(0,0,0,0.9)); position:absolute; bottom:0; width:100%; padding:1rem;"></div>
                        </div>
                    </div>
                </div>$1`;

html = html.replace(visualSideRegex, newVisualSide);

fs.writeFileSync('index.html', html);
console.log("Triptych updated.");
