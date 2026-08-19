const fs = require('fs');

function extractName(rawText) {
    let foundName = '';
    let foundPass = '';
    const arrestingOfficers = new Set();
    
    // 2. EXTRACT PASSPORT NUMBER
    const passHeaderMatch = rawText.match(/Паспорт\s*#?\s*(\d{4,8})/i) || rawText.match(/(?:^|[^\d])(\d{5,7})(?:$|[^\d])/);
    if (passHeaderMatch) {
      foundPass = passHeaderMatch[1].trim();
    }

    // Strategy A: Explicit "ФИО: Name | Passport" line from Groq
    const fioFormatMatch = rawText.match(/ФИО:\s*([A-Za-zА-Яа-я0-9_\-\.\s]{3,40})(?:\s*\|\s*(\d{4,8}))?/i);
    if (fioFormatMatch) {
      foundName = fioFormatMatch[1].trim();
      if (!foundPass && fioFormatMatch[2]) foundPass = fioFormatMatch[2].trim();
    }

    // Strategy B: Name adjacent to "Паспорт #" inside profile card
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

    // Strategy C: Search snippet around Passport position and global regex
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

    return foundName;
}

console.log("Test B1:", extractName("Kazil Navalny \n Паспорт 123456"));
console.log("Test B2:", extractName("Паспорт # 601226 \n Kazil Navalny"));
console.log("Test C1:", extractName("Random text database gov \n Kazil Navalny \n other text"));
console.log("Test C2:", extractName("Казил Навальный 17.6 13:45 12.05"));
console.log("Test C3:", extractName("Текст текст текст [Иван Иванов] текст"));

