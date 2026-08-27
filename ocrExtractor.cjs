const CONFIG = {
  CONTEXT_RADIUS: 250,
  MIN_NAME_LENGTH: 4,
  MAX_NAME_LENGTH: 45
};

const CANONICAL_BLOCKED = new Set([
  'san', 'andreas', 'andpeas', 'san_andreas', 'san_andpeas', 'database', 'gov', 'gta', 'gta5', 'rp',
  'lspd', 'fib', 'fbi', 'usss', 'sasp', 'shpd', 'lscsd', 'sahp',
  'redwood', 'jorno', 'vegas', 'alta', 'strawberry', 'downtown', 'hawick', 'sunrise', 'rockford', 'eclipse', 'richman',
  'police', 'sheriff', 'government', 'pravitelstvo', 'pravitelstva',
  'sledstvenniy', 'izolyator', 'pasport', 'grazhdanin', 'dosye', 'baza', 'dannih', 'baza_dannih',
  'pravonarushiteley', 'novosti', 'statya', 'stati', 'data', 'vremya', 'provodil', 'arest', 'naparnik',
  'kommentariy', 'mesto', 'otbivaniya', 'nakazaniya', 'rozisk', 'shtraf', 'nalichnie', 'tyurma',
  'organizatsiya', 'dolzhnost', 'propiska', 'grazhdanstvo', 'uroven', 'muzhskoy', 'zhenskiy', 'pol',
  'fio', 'familiya', 'imya', 'otchestvo', 'surname', 'name', 'nomer', 'telefon', 'adres', 'delo',
  'sudimost', 'sudimosti', 'istoriya', 'spisok', 'poisk', 'odobreno', 'otkaz', 'pomilovanie', 'pomilovaniya',
  'kalkulyator', 'id', 'lvl', 'age', 'level', 'smartgi', 'kols', 'kpz', 'lssd', 'yak', 'uak', 'uak_sa'
]);

function toCanonicalWord(word) {
  if (!word) return '';
  return word.toLowerCase()
    .replace(/[аa@4]/g, 'a')
    .replace(/[бb6]/g, 'b')
    .replace(/[вvvw]/g, 'v')
    .replace(/[гg]/g, 'g')
    .replace(/[дd]/g, 'd')
    .replace(/[еeё3]/g, 'e')
    .replace(/[ж]/g, 'zh')
    .replace(/[зz]/g, 'z')
    .replace(/[иiйj1!|]/g, 'i')
    .replace(/[кk]/g, 'k')
    .replace(/[лl]/g, 'l')
    .replace(/[мm]/g, 'm')
    .replace(/[нn]/g, 'n')
    .replace(/[оo0]/g, 'o')
    .replace(/[пp]/g, 'p')
    .replace(/[рr]/g, 'r')
    .replace(/[сsc5]/g, 's')
    .replace(/[тt7]/g, 't')
    .replace(/[уu]/g, 'u')
    .replace(/[фf]/g, 'f')
    .replace(/[хhx]/g, 'h')
    .replace(/[ц]/g, 'ts')
    .replace(/[ч]/g, 'ch')
    .replace(/[ш]/g, 'sh')
    .replace(/[щ]/g, 'shch')
    .replace(/[ъь]/g, '')
    .replace(/[ыy]/g, 'y')
    .replace(/[эe]/g, 'e')
    .replace(/[ю]/g, 'yu')
    .replace(/[я]/g, 'ya');
}

const CYRILLIC_TO_LATIN_MAP = {
  'а': 'a', 'с': 'c', 'е': 'e', 'о': 'o', 'р': 'p', 'х': 'x', 'у': 'y', 'к': 'k', 'і': 'i',
  'А': 'A', 'С': 'C', 'Е': 'E', 'О': 'O', 'Р': 'P', 'Х': 'X', 'У': 'Y', 'К': 'K', 'В': 'B', 'Н': 'H', 'М': 'M', 'Т': 'T'
};

const LATIN_TO_CYRILLIC_MAP = {
  'a': 'а', 'c': 'с', 'e': 'е', 'o': 'о', 'p': 'р', 'x': 'х', 'y': 'у', 'k': 'к', 'i': 'и',
  'A': 'А', 'C': 'С', 'E': 'Е', 'O': 'О', 'P': 'Р', 'X': 'Х', 'Y': 'У', 'K': 'К', 'B': 'В', 'H': 'Н', 'M': 'М', 'T': 'Т'
};

function harmonizeScript(text) {
  if (!text) return { text: '', isLatin: true };

  const latinUnambiguous = (text.match(/[dgjhklmqrsuvwzDGIJLNQRSUVWZ]/g) || []).length;
  const cyrillicUnambiguous = (text.match(/[бгджзийлпфцчшщъыьэюяБГДЖЗИЙЛПФЦЧШЩЪЫЬЭЮЯ]/g) || []).length;

  const totalLatin = (text.match(/[a-zA-Z]/g) || []).length;
  const totalCyrillic = (text.match(/[а-яА-ЯёЁ]/g) || []).length;

  const isLatin = latinUnambiguous >= cyrillicUnambiguous
    ? (totalLatin >= totalCyrillic || latinUnambiguous > 0)
    : (totalLatin > totalCyrillic && cyrillicUnambiguous === 0);

  let harmonized = '';
  for (const ch of text) {
    if (isLatin && CYRILLIC_TO_LATIN_MAP[ch]) {
      harmonized += CYRILLIC_TO_LATIN_MAP[ch];
    } else if (!isLatin && LATIN_TO_CYRILLIC_MAP[ch]) {
      harmonized += LATIN_TO_CYRILLIC_MAP[ch];
    } else {
      harmonized += ch;
    }
  }

  return { text: harmonized, isLatin };
}

function correctOcrLeet(part, isLatin) {
  if (!part) return '';
  let res = part;

  if (isLatin) {
    res = res
      .replace(/0/g, 'o')
      .replace(/1/g, 'i')
      .replace(/3/g, 'e')
      .replace(/4/g, 'a')
      .replace(/5/g, 's')
      .replace(/6/g, 'b')
      .replace(/7/g, 't')
      .replace(/8/g, 'b')
      .replace(/9/g, 'g');
  } else {
    res = res
      .replace(/0/g, 'о')
      .replace(/1/g, 'и')
      .replace(/3/g, 'е')
      .replace(/4/g, 'а')
      .replace(/5/g, 'с')
      .replace(/6/g, 'б')
      .replace(/7/g, 'т')
      .replace(/8/g, 'в');
  }

  return res;
}

function cleanRawCandidate(raw) {
  if (!raw) return '';

  let str = raw.trim();

  // Удаление UI префиксов
  str = str.replace(/^(?:ФИО|Имя|Фамилия|Гражданин|Досье|Паспорт|ID|Name|Passport|Surname)\s*[:\-#№.]*\s*/i, '');
  str = str.replace(/^[\s,;:!?"'\[\]{}()|\\/<>*~•★✓+=#№-]+/, '');
  str = str.replace(/^(?:[CС]\d{1,3}|N\s*[яr]|ID\s*\d+)\s+/i, '');

  // Удаление UI суффиксов
  str = str.replace(/\s*(?:История\s*розыска|Список\s*судимостей|Паспорт\s*#?.*|Следственный.*|КПЗ.*)$/i, '');
  str = str.replace(/\s*(?:лет|муж|жен|lvl|age|года?)\s*$/i, '');
  str = str.replace(/[\s,;:!?"'\[\]{}()|\\/<>*~•★✓+=#№-]+$/, '');

  // Удаление приклеенных статей и дат в конце
  str = str.replace(/\d{1,2}\.\d{1,2}(?:\.\d{1,2})?$/, '');
  str = str.replace(/\d{1,2}[.:]\d{1,2}(?:[.:]\d{2,4})?$/, '');

  // Удаление приклеенных цифр в начале или в конце
  str = str.replace(/^[0-9]{2,}/, '');
  str = str.replace(/[0-9]{2,}$/, '');

  return str.trim();
}

function formatName(rawName) {
  if (!rawName) return '';

  const cleaned = cleanRawCandidate(rawName);
  const { text: harmonized, isLatin } = harmonizeScript(cleaned);

  let rawParts = harmonized.split(/[_\s\-~.]+/).filter(Boolean);

  if (rawParts.length === 1 && /^[A-ZА-ЯЁ][a-zа-яё0-9]+[A-ZА-ЯЁ][a-zа-яё0-9]+$/.test(rawParts[0])) {
    const splitMatch = rawParts[0].match(/([A-ZА-ЯЁ][a-zа-яё0-9]+)/g);
    if (splitMatch && splitMatch.length >= 2) {
      rawParts = splitMatch;
    }
  }

  if (rawParts.length === 0) return '';

  const parts = rawParts.length > 2 ? [rawParts[0], rawParts[1]] : rawParts;

  const formattedParts = parts.map(p => {
    let corrected = correctOcrLeet(p, isLatin);
    corrected = corrected.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, '');
    if (!corrected) return '';

    const lower = corrected.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).filter(Boolean);

  if (formattedParts.length < 2) {
    return formattedParts[0] || '';
  }

  return `${formattedParts[0]}_${formattedParts[1]}`;
}

function isValidPassportNumber(numStr) {
  if (!numStr || numStr.length < 4 || numStr.length > 8) return false;
  if (/^(?:19|20)\d{6}$/.test(numStr) || /^\d{4}(?:19|20)\d{2}$/.test(numStr)) return false;
  return true;
}

function extractPassport(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  const markerMatch = rawText.match(/(?:Паспорт[7т]?|Passport|Macnopm|llacnopt|flacnopm|Поспорт|Пасnорт|nacnopt|ID)\s*[:\-#№~=]?\s*(\d{4,8})/i);
  if (markerMatch && isValidPassportNumber(markerMatch[1])) {
    return markerMatch[1];
  }

  const hashMatch = rawText.match(/(?:^|[\s(])(?:#|№)\s*(\d{5,7})(?=[^\d]|$)/m);
  if (hashMatch && isValidPassportNumber(hashMatch[1])) {
    return hashMatch[1];
  }

  const formMatch = rawText.match(/Номер\s*паспорта[\s:\-]*(\d{4,8})/i);
  if (formMatch && isValidPassportNumber(formMatch[1])) {
    return formMatch[1];
  }

  const tableHeaderIdx = rawText.search(/(?:ДАТА|СТАТЬЯ|ПРОВОДИЛ\s*АРЕСТ|КОММЕНТАРИЙ|\d{1,2}[:;]\d{2}\s+\d{1,2}[./-])/i);
  const headerText = tableHeaderIdx !== -1 ? rawText.slice(0, tableHeaderIdx) : rawText;

  const sixDigitMatch = headerText.match(/(?:^|[^\d])(\d{6})(?=[^\d]|$)/);
  if (sixDigitMatch && isValidPassportNumber(sixDigitMatch[1])) {
    return sixDigitMatch[1];
  }

  const genericMatch = headerText.match(/(?:^|[^\d])(\d{5,7})(?=[^\d]|$)/);
  if (genericMatch && isValidPassportNumber(genericMatch[1])) {
    return genericMatch[1];
  }

  return null;
}

function extractArrestingOfficers(rawText) {
  const arrestingOfficers = new Set();
  if (!rawText) return arrestingOfficers;

  const lines = rawText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Игнорируем строки карточки гражданина, кнопки и шапки
    if (/Паспорт\s*#?|История\s*розыска|Список\s*судимостей|БАЗА\s*ПРАВОНАРУШИТЕЛЕЙ|ГОСУДАРСТВЕННЫЕ/i.test(trimmed)) {
      continue;
    }
    // Если строка содержит имя через подчеркивание (Vasya_Bubanov), это гражданин, а не офицер
    if (/^[a-zA-Zа-яА-ЯёЁ0-9]{2,25}_[a-zA-Zа-яА-ЯёЁ0-9]{2,25}$/.test(trimmed)) {
      continue;
    }

    const hasTimestamp = /\b\d{1,2}[:;]\d{2}\b/.test(trimmed) || /\b\d{1,2}[./-]\d{1,2}\b/.test(trimmed);
    const hasArticle = /\b\d{1,2}\.\d{1,2}\b/.test(trimmed);
    const hasJail = /следственн|изолятор|кпз|lspd|lssd|sahp|fib|usss|тюрьм/i.test(trimmed);
    const hasOfficerKeyword = /проводил\s*арест|напарник|арестовал|officer/i.test(trimmed);

    const isArrestLine = (hasTimestamp && (hasArticle || hasJail)) || (hasArticle && hasJail) || hasOfficerKeyword;

    if (isArrestLine) {
      // Ищем имена офицеров (с пробелом: "Darius Watson", "Ace Miles")
      const matches = trimmed.match(/\b([A-ZА-ЯЁ][a-zа-яё0-9]{1,20}\s+[A-ZА-ЯЁ][a-zа-яё0-9]{1,20})\b/g);
      if (matches) {
        for (const m of matches) {
          const formatted = formatName(m);
          if (formatted) {
            arrestingOfficers.add(formatted.toLowerCase());
            arrestingOfficers.add(formatted.replace('_', '').toLowerCase());
            arrestingOfficers.add(formatted.replace('_', ' ').toLowerCase());
          }
        }
      }
    }
  }

  return arrestingOfficers;
}

function isValidCitizenName(candidate, arrestingOfficers) {
  if (!candidate || typeof candidate !== 'string') return false;

  const formatted = formatName(candidate);
  if (!formatted) return false;

  const parts = formatted.split('_');
  if (parts.length < 2) return false;

  const [first, last] = parts;
  if (first.length < 2 || last.length < 2) return false;
  if (formatted.length < CONFIG.MIN_NAME_LENGTH || formatted.length > CONFIG.MAX_NAME_LENGTH) return false;

  const canFirst = toCanonicalWord(first);
  const canLast = toCanonicalWord(last);
  const canFull = toCanonicalWord(formatted);

  if (CANONICAL_BLOCKED.has(canFirst) || CANONICAL_BLOCKED.has(canLast) || CANONICAL_BLOCKED.has(canFull)) {
    return false;
  }

  const lowerFull = formatted.toLowerCase();
  if (
    arrestingOfficers.has(lowerFull) ||
    arrestingOfficers.has(lowerFull.replace('_', '')) ||
    arrestingOfficers.has(lowerFull.replace('_', ' ')) ||
    arrestingOfficers.has(canFull) ||
    arrestingOfficers.has(canFull.replace('_', ''))
  ) {
    return false;
  }

  if (!/[a-zA-Zа-яА-ЯёЁ]/.test(first) || !/[a-zA-Zа-яА-ЯёЁ]/.test(last)) {
    return false;
  }

  return true;
}

function extractName(rawText, passport) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) return null;

  const arrestingOfficers = extractArrestingOfficers(rawText);
  const foundPassport = passport || extractPassport(rawText);

  // 1. Формат ответа AI ("ФИО: Name | Passport")
  const fioMatch = rawText.match(/(?:ФИО|Имя\s*и\s*фамилия|Гражданин|Досье)\s*:\s*([A-Za-zА-Яа-я0-9_\-\.\s]{3,40})(?:\s*\|\s*(\d{4,8}))?/i);
  if (fioMatch && isValidCitizenName(fioMatch[1], arrestingOfficers)) {
    return formatName(fioMatch[1]);
  }

  // 2. Карточка гражданина — контекст непосредственно над/рядом с "Паспорт #"
  const nearPassportPatterns = [
    // 1. Имя через подчеркивание перед паспортом на той же строке или несколькими строками выше
    /(?<![a-zA-Zа-яА-ЯёЁ0-9])((?:[a-zA-Zа-яА-ЯёЁ0-9]{2,25}_){1,3}[a-zA-Zа-яА-ЯёЁ0-9]{2,25})(?![a-zA-Zа-яА-ЯёЁ0-9])[\r\n\s]*(?:История\s*розыска|Список\s*судимостей)?[\r\n\s]*(?:Паспорт[7т]?|Passport|Macnopm|llacnopt|flacnopm|Поспорт|Пасnорт|nacnopt|ID)\s*[:\-#№~=]?\s*\d{4,8}/i,
    // 2. Паспорт, а затем имя через подчеркивание
    /(?:Паспорт[7т]?|Passport|Macnopm|llacnopt|flacnopm|Поспорт|Пасnорт|nacnopt|ID)\s*[:\-#№~=]?\s*\d{4,8}[\r\n\s]*(?<![a-zA-Zа-яА-ЯёЁ0-9])((?:[a-zA-Zа-яА-ЯёЁ0-9]{2,25}_){1,3}[a-zA-Zа-яА-ЯёЁ0-9]{2,25})(?![a-zA-Zа-яА-ЯёЁ0-9])/i,
    // 3. Склейка без разделителя: "Name_SurnameПаспорт"
    /(?<![a-zA-Zа-яА-ЯёЁ0-9])((?:[a-zA-Zа-яА-ЯёЁ0-9]{2,25}_){1,3}[a-zA-Zа-яА-ЯёЁ0-9]{2,25})(?:Паспорт|Passport)/i,
    // 4. Имя через пробел/дефис строго перед паспортом (без захвата заголовков)
    /(?:^|[\r\n\t])\s*(?:[CС]\d{1,3}\s+)?([A-ZА-ЯЁ][a-zа-яё0-9]{1,20}[\s\-~][A-ZА-ЯЁ][a-zа-яё0-9]{1,20})[\r\n\s]*(?:Паспорт[7т]?|Passport|Macnopm|llacnopt|flacnopm|Поспорт|Пасnорт|nacnopt|ID)\s*[:\-#№~=]?\s*\d{4,8}/i,
    // 5. Паспорт, а затем имя через пробел/дефис
    /(?:Паспорт[7т]?|Passport|Macnopm|llacnopt|flacnopm|Поспорт|Пасnорт|nacnopt|ID)\s*[:\-#№~=]?\s*\d{4,8}[\r\n\s]*([A-ZА-ЯЁ][a-zа-яё0-9]{1,20}[\s\-~][A-ZА-ЯЁ][a-zа-яё0-9]{1,20})/i
  ];

  for (const pattern of nearPassportPatterns) {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      const candidate = match[1];
      if (isValidCitizenName(candidate, arrestingOfficers)) {
        return formatName(candidate);
      }
    }
  }

  // 3. Имя рядом с кнопками "История розыска" / "Список судимостей"
  const buttonContextMatch = rawText.match(/(?<![a-zA-Zа-яА-ЯёЁ0-9])((?:[a-zA-Zа-яА-ЯёЁ0-9]{2,25}_){1,3}[a-zA-Zа-яА-ЯёЁ0-9]{2,25})(?![a-zA-Zа-яА-ЯёЁ0-9])[\s\t]*(?:История\s*розыска|Список\s*судимостей)/i) ||
                            rawText.match(/(?:История\s*розыска|Список\s*судимостей)[\s\t]*(?<![a-zA-Zа-яА-ЯёЁ0-9])((?:[a-zA-Zа-яА-ЯёЁ0-9]{2,25}_){1,3}[a-zA-Zа-яА-ЯёЁ0-9]{2,25})(?![a-zA-Zа-яА-ЯёЁ0-9])/i);
  if (buttonContextMatch && buttonContextMatch[1]) {
    const candidate = buttonContextMatch[1];
    if (isValidCitizenName(candidate, arrestingOfficers)) {
      return formatName(candidate);
    }
  }

  // 4. Firstname_Lastname ДО таблицы
  const tableStartIdx = rawText.search(/(?:ДАТА|СТАТЬЯ|ПРОВОДИЛ\s*АРЕСТ|КОММЕНТАРИЙ|\d{1,2}[:;]\d{2}\s+\d{1,2}[./-])/i);
  const cardHeaderText = tableStartIdx !== -1 ? rawText.slice(0, tableStartIdx) : rawText;

  const underscoreRegex = /(?<![a-zA-Zа-яА-ЯёЁ0-9])((?:[a-zA-Zа-яА-ЯёЁ0-9]{2,25}_){1,3}[a-zA-Zа-яА-ЯёЁ0-9]{2,25})(?![a-zA-Zа-яА-ЯёЁ0-9])/g;
  let uMatch;
  while ((uMatch = underscoreRegex.exec(cardHeaderText)) !== null) {
    const candidate = uMatch[1];
    if (isValidCitizenName(candidate, arrestingOfficers)) {
      return formatName(candidate);
    }
  }

  // 5. Окно вокруг позиции паспорта в тексте
  if (foundPassport) {
    const passPos = rawText.indexOf(foundPassport);
    if (passPos !== -1) {
      const radius = CONFIG.CONTEXT_RADIUS;
      const snippet = rawText.slice(Math.max(0, passPos - radius), Math.min(rawText.length, passPos + radius + foundPassport.length));

      const uRegexLocal = /(?<![a-zA-Zа-яА-ЯёЁ0-9])((?:[a-zA-Zа-яА-ЯёЁ0-9]{2,25}_){1,3}[a-zA-Zа-яА-ЯёЁ0-9]{2,25})(?![a-zA-Zа-яА-ЯёЁ0-9])/g;
      let mLoc;
      while ((mLoc = uRegexLocal.exec(snippet)) !== null) {
        if (isValidCitizenName(mLoc[1], arrestingOfficers)) {
          return formatName(mLoc[1]);
        }
      }

      const twoWordsRegex = /(?:^|[\s,;:.!?"'\[\]{}()])([A-ZА-ЯЁ][a-zа-яё0-9]{1,20}[\s_]+[A-ZА-ЯЁ][a-zа-яё0-9]{1,20})(?=$|[\s,;:.!?"'\[\]{}()])/g;
      let mWord;
      while ((mWord = twoWordsRegex.exec(snippet)) !== null) {
        if (isValidCitizenName(mWord[1], arrestingOfficers)) {
          return formatName(mWord[1]);
        }
      }
    }
  }

  // 6. Поиск имени в шапке карточки
  const twoWordsHeaderRegex = /(?:^|[\s,;:.!?"'\[\]{}()])([A-ZА-ЯЁ][a-zа-яё0-9]{1,20}[\s_]+[A-ZА-ЯЁ][a-zа-яё0-9]{1,20})(?=$|[\s,;:.!?"'\[\]{}()])/g;
  let mHead;
  while ((mHead = twoWordsHeaderRegex.exec(cardHeaderText)) !== null) {
    if (isValidCitizenName(mHead[1], arrestingOfficers)) {
      return formatName(mHead[1]);
    }
  }

  // 7. Глобальный поиск First_Last по всему тексту
  while ((uMatch = underscoreRegex.exec(rawText)) !== null) {
    const candidate = uMatch[1];
    if (isValidCitizenName(candidate, arrestingOfficers)) {
      return formatName(candidate);
    }
  }

  return null;
}

function extractData(rawText) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return { name: null, passport: null };
  }

  const passport = extractPassport(rawText);
  const name = extractName(rawText, passport);

  return { name, passport };
}

function normalizeDate(rawDateStr) {
  if (!rawDateStr) return '';
  const clean = rawDateStr.replace(/[^\d.]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
  const parts = clean.split('.');
  const currentYear = new Date().getFullYear().toString();

  if (parts.length >= 2) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    let year = parts[2] || currentYear;
    if (year.length < 4) {
      year = currentYear;
    }
    return `${day}.${month}.${year}`;
  }
  return rawDateStr;
}

function parseTableRecords(rawText) {
  const records = [];
  if (!rawText) return records;

  const currentYear = new Date().getFullYear().toString();
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  let lastTime = '12:00';
  let lastDate = `01.01.${currentYear}`;

  lines.forEach(line => {
    const dtMatch = line.match(/(\d{1,2}[:;]\d{2})\s+(\d{1,2}[./-]\d{1,2}(?:[./-][\d.]{1,6})?)/) ||
                    line.match(/(\d{1,2}[./-]\d{1,2}(?:[./-][\d.]{1,6})?)\s+(\d{1,2}[:;]\d{2})/);

    if (dtMatch) {
      let p1 = dtMatch[1], p2 = dtMatch[2];
      if (p1.includes(':') || p1.includes(';')) {
        lastTime = p1.replace(';', ':');
        lastDate = normalizeDate(p2);
      } else {
        lastDate = normalizeDate(p1);
        lastTime = p2.replace(';', ':');
      }
    }

    let cleanLine = line
      .replace(/(?:следственн[а-я]+\s+изолятор|федеральн[а-я]+\s+тюрьма|тюрьма|fbi|lspd|fib|sasp|lscsd|sahp)/gi, ' ')
      .replace(/\b(?:уак[- ]?са|уак|ук[- ]?са|ук|yak[- ]?sa|yak|uk)\b/gi, ' ')
      .replace(/\b\d{1,2}[:;]\d{2}(?::\d{2})?\b/g, ' ')
      .replace(/\b\d{1,2}[./-]\d{1,2}(?:[./-][\d.]{1,6})?\b/g, ' ')
      .replace(/\b(19|20)\d{2}\b/g, ' ')
      .replace(/\b\d{5,7}\b/g, ' ');

    const articleRegex = /\b\d{1,2}\.\d{1,2}(?:\.\d{1,2})?\b/g;
    const articles = [];
    let artMatch;
    while ((artMatch = articleRegex.exec(cleanLine)) !== null) {
      const code = artMatch[0];
      if (!code.startsWith('0')) {
        articles.push(code);
      }
    }

    articles.forEach(art => {
      records.push({
        time: lastTime,
        date: lastDate,
        article: art,
        officer: '',
        jail: 'Следственный изолятор'
      });
    });
  });

  return records;
}

module.exports = {
  CONFIG,
  CANONICAL_BLOCKED,
  toCanonicalWord,
  harmonizeScript,
  correctOcrLeet,
  cleanRawCandidate,
  formatName,
  extractPassport,
  extractArrestingOfficers,
  isValidCitizenName,
  extractName,
  extractData,
  normalizeDate,
  parseTableRecords
};


