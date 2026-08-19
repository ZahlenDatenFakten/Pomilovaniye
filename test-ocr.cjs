const fs = require('fs');
const Tesseract = require('tesseract.js');

const imgPath = 'C:/Users/tamer/.gemini/antigravity/brain/8035792a-f1b6-4b0f-a100-f6469c994b92/.user_uploaded/media_1787153968395.png';

async function main() {
    console.log("Running Tesseract...");
    const { data: { text } } = await Tesseract.recognize(imgPath, 'rus+eng');
    console.log("=== RAW TEXT ===");
    console.log(text);
    console.log("================");

    function extractName(rawText) {
        let foundName = '';
        let foundPass = '';
        const arrestingOfficers = new Set();
        
        // 1. EXTRACT ARRESTING OFFICERS
        const linesForOfficers = rawText.split('\n');
        linesForOfficers.forEach(l => {
          if (/проводил\s*арест|напарник|lspd|fib|usss|shpd|lscsd|sasp/i.test(l)) {
            const m = l.match(/\b([A-Z][a-z0-9]{1,15}[_\s]+[A-Z][a-z0-9]{1,20})\b/g);
            if (m) m.forEach(off => arrestingOfficers.add(off.toLowerCase().replace(/\s+/, '_')));
          }
        });

        // 2. EXTRACT PASSPORT NUMBER
        const passHeaderMatch = rawText.match(/Паспорт\s*#?\s*(\d{4,8})/i) || rawText.match(/\b(\d{5,7})\b/);
        if (passHeaderMatch) {
          foundPass = passHeaderMatch[1].trim();
        }

        // Strategy A
        const fioFormatMatch = rawText.match(/ФИО:\s*([A-Za-zА-Яа-я0-9_\-\.\s]{3,40})(?:\s*\|\s*(\d{4,8}))?/i);
        if (fioFormatMatch) {
          foundName = fioFormatMatch[1].trim();
        }

        // Strategy B
        if (!foundName) {
          const nearPassMatch = rawText.match(/([A-ZА-Я][a-zа-яA-ZА-Я0-9]{1,20}[_\s]+[A-ZА-Я][a-zа-яA-ZА-Я0-9]{1,20})[\r\n\s]*Паспорт\s*#?\s*(\d{4,8})/i) ||
                                rawText.match(/Паспорт\s*#?\s*(\d{4,8})[\r\n\s]*([A-ZА-Я][a-zа-яA-ZА-Я0-9]{1,20}[_\s]+[A-ZА-Я][a-zа-яA-ZА-Я0-9]{1,20})/i);
          if (nearPassMatch) {
            const potentialName = (nearPassMatch[1] && isNaN(Number(nearPassMatch[1])) ? nearPassMatch[1] : nearPassMatch[2]).trim().replace(/\s+/, '_');
            const normPot = potentialName.toLowerCase();
            if (!arrestingOfficers.has(normPot) && !/database|gov|gta5|rp|lspd|fbi|fib|usss|sasp|redwood|police|sheriff/i.test(potentialName)) {
              foundName = potentialName;
            }
          }
        }

        // Strategy C
        if (!foundName) {
          const passPos = foundPass ? rawText.indexOf(foundPass) : -1;
          const focusSnippet = passPos !== -1 ? rawText.slice(Math.max(0, passPos - 350), passPos + 100) : rawText;

          const nameRegex = /(?:^|[\s,;:.!?"'\[\]{}()])([A-ZА-Я][a-zа-яA-ZА-Я0-9]{1,20}[_\s]+[A-ZА-Я][a-zа-яA-ZА-Я0-9]{1,20})(?=$|[\s,;:.!?"'\[\]{}()])/g;
          const getMatches = (text) => {
              const matches = [];
              let m;
              while ((m = nameRegex.exec(text)) !== null) {
                  matches.push(m[1]);
              }
              return matches;
          };

          const nameMatchList = [...getMatches(focusSnippet), ...getMatches(rawText)];

          const validName = nameMatchList.find(n => {
            const norm = n.toLowerCase();
            return !arrestingOfficers.has(norm.replace(/\s+/, '_')) && !/database|gov|gta5|rp|lspd|fbi|fib|usss|sasp|redwood|jorno|vegas|police|sheriff/i.test(n);
          });

          if (validName) foundName = validName;
        }

        if (foundName) {
          foundName = foundName.replace(/[\s\.]+/g, '_');
          let parts = foundName.split('_');
          let first = parts[0] || '';
          let last = parts[1] || '';
          
          if (first) first = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
          if (last) last = last.charAt(0).toUpperCase() + last.slice(1).toLowerCase();
          
          foundName = last ? `${first}_${last}` : first;
        }
        return { foundName, foundPass };
    }

    console.log("Extraction Result:", extractName(text));
}
main().catch(console.error);
