const text = 'Mishan_Osnovnoi12.8';
const text2 = 'Morphy_VanceПаспорт'; // Without replace
const text3 = 'Morphy_Vance Паспорт'; // With replace

// If name only contains letters and underscores/hyphens:
const nameRegex = /(?:^|[^A-ZА-Яa-zа-я_\-])([A-ZА-Я][a-zа-яA-ZА-Я]{1,20}[_\s]+[A-ZА-Я][a-zа-яA-ZА-Я]{1,20})(?=$|[^A-ZА-Яa-zа-я_\-])/g;

console.log('text1:', nameRegex.exec(text)['1']); // Should be Mishan_Osnovnoi
console.log('text2:', nameRegex.exec(text2)); // Will fail because Паспорт is letters!
console.log('text3:', nameRegex.exec(text3)['1']); // Should be Morphy_Vance
