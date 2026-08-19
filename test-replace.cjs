const text = 'Mishan_OsnovnoiПаспорт #296885';
let rawText = text.replace(/Паспорт/ig, ' Паспорт ');

const nearPassMatch = rawText.match(/([A-ZА-Я][a-zа-яA-ZА-Я0-9]{1,20}[_\s]+[A-ZА-Я][a-zа-яA-ZА-Я0-9]{1,20})[\r\n\s]*Паспорт\s*#?\s*(\d{4,8})/i);
console.log('Strategy B matches:', nearPassMatch ? nearPassMatch[1] : null);

const nameRegex = /(?:^|[\s,;:.!?"'\[\]{}()])([A-ZА-Я][a-zа-яA-ZА-Я0-9]{1,20}[_\s]+[A-ZА-Я][a-zа-яA-ZА-Я0-9]{1,20})(?=$|[\s,;:.!?"'\[\]{}()])/g;
const m = nameRegex.exec(rawText);
console.log('Strategy C matches:', m ? m[1] : null);
