const text1 = 'ФИО: Mishan_0snovnoi | 123456';
const match1 = text1.match(/ФИО:\s*([A-Za-zА-Яа-я0-9_\-\.\s]{3,40})(?:\s*\|\s*(\d{4,8}))?/i);
console.log(match1 ? match1[1] : 'null');
