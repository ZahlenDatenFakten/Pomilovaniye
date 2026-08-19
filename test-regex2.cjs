const text1 = 'Morphy_VanceПаспорт';
const text2 = 'Mishan_OsnovnoiПаспорт';

const newRegex1 = /(?:^|[\s,;:.!?"'\[\]{}()])([A-ZА-Я][a-zа-яA-ZА-Я0-9]{1,20}[_\s]+[A-ZА-Я][a-zа-яA-ZА-Я0-9]{1,20})(?=$|[\s,;:.!?"'\[\]{}()])/g;
console.log('New regex text1:', newRegex1.exec(text1));

const newRegex2 = /(?:^|[\s,;:.!?"'\[\]{}()])([A-ZА-Я][a-zа-яA-ZА-Я0-9]{1,20}[_\s]+[A-ZА-Я][a-zа-яA-ZА-Я0-9]{1,20})(?=$|[\s,;:.!?"'\[\]{}()])/g;
console.log('New regex text2:', newRegex2.exec(text2));

const oldRegex1 = /\b([A-Za-z0-9]{2,15}_[A-Za-z0-9]{2,20})\b/g;
console.log('Old regex text1:', oldRegex1.exec(text1));

const oldRegex2 = /\b([A-Za-z0-9]{2,15}_[A-Za-z0-9]{2,20})\b/g;
console.log('Old regex text2:', oldRegex2.exec(text2));

const fixedRegex1 = /(?:^|[^a-zA-ZА-Яа-я0-9_])([A-ZА-Я][a-zа-яA-ZА-Я0-9]{1,20}[_\s]+[A-ZА-Я][a-zа-яA-ZА-Я0-9]{1,20})(?=$|[^a-zA-ZА-Яа-я0-9_])/g;
console.log('Fixed regex text1:', fixedRegex1.exec(text1));
console.log('Fixed regex text2:', fixedRegex1.exec(text2));
