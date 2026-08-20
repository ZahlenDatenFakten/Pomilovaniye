const CONFIG = {
  CONTEXT_RADIUS: 180,
  MIN_NAME_LENGTH: 4,
  MAX_NAME_LENGTH: 40,
  STOP_WORDS: [
    'фио', 'паспорт', 'фамилия', 'уровень', 'мужской', 'женский',
    'гражданство', 'прописка', 'организация', 'должность',
    'passport', 'surname', 'статья', 'розыск', 'штраф', 'наличные',
    'следственный', 'изолятор', 'тюрьма'
  ]
};

function formatName(rawName) {
  if (!rawName) return '';

  const rawParts = rawName.split('_').filter(Boolean);
  const parts = rawParts.length > 2 ? [rawParts[0], rawParts[1]] : rawParts;

  return parts.map(part => {
    if (!part) return '';

    const isCyrillic = /[а-яА-ЯёЁ]/.test(part);
    let corrected = part;

    if (isCyrillic) {
      corrected = corrected
        .replace(/0/g, 'о')
        .replace(/1/g, 'и')
        .replace(/3/g, 'е')
        .replace(/4/g, 'а')
        .replace(/6/g, 'б')
        .replace(/8/g, 'в');
    } else {
      corrected = corrected
        .replace(/0/g, 'o')
        .replace(/1/g, 'i')
        .replace(/3/g, 'e')
        .replace(/4/g, 'a')
        .replace(/5/g, 's')
        .replace(/7/g, 't')
        .replace(/8/g, 'b');
    }

    const lower = corrected.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join('_');
}

function extractPassport(text) {
  if (!text) return null;

  const markerMatch = text.match(/(?:Паспорт|ID|#|№)\s*[:\-#№]?\s*(\d{4,8})/i);
  if (markerMatch) return markerMatch[1];

  const rawMatch = text.match(/(?:Паспорт|ID|#|№)[^\d\n]{0,10}(\d{4,8})/i);
  if (rawMatch) return rawMatch[1];

  const sixDigitMatch = text.match(/(?:^|[^\d])(\d{6})(?=[^\d]|$)/);
  if (sixDigitMatch) return sixDigitMatch[1];

  const genericMatch = text.match(/(?:^|[^\d])(\d{5,7})(?=[^\d]|$)/);
  if (genericMatch) return genericMatch[1];

  return null;
}

function extractArrestingOfficers(rawText) {
  const arrestingOfficers = new Set();
  if (!rawText) return arrestingOfficers;

  const lines = rawText.split('\n');
  lines.forEach(l => {
    if (/проводил\s*арест|напарник|lspd|fib|usss|shpd|lscsd|sasp/i.test(l)) {
      const m = l.match(/\b([A-Z][a-z0-9]{1,15}[_\s]+[A-Z][a-z0-9]{1,20})\b/g);
      if (m) m.forEach(off => arrestingOfficers.add(off.toLowerCase().replace(/\s+/, '_')));
    }
  });
  return arrestingOfficers;
}

function extractName(rawText, passport) {
  if (!rawText) return null;

  let text = rawText;

  text = text.replace(/(\d{1,2}[.,:]\d{1,2}(?:[.,:]\d{2,4})?)/g, ' $1 ');
  text = text.replace(/[:;.,!?|\\/(){}\[\]<>+="\-'`~#№]/g, ' $& ');

  const safeRegex = new RegExp(`(${CONFIG.STOP_WORDS.join('|')})`, 'gi');
  text = text.replace(safeRegex, ' $1 ');
  text = text.replace(/\s+_\s+|\s+_|_\s+/g, '_');
  text = text.replace(/\s+/g, ' ').trim();

  const arrestingOfficers = extractArrestingOfficers(rawText);
  const createRegex = () => /([a-zA-Zа-яА-ЯёЁ0-9]+(?:_[a-zA-Zа-яА-ЯёЁ0-9]+)+)/g;

  let matches = [];
  let match;

  if (passport) {
    const passIdx = text.indexOf(passport);
    if (passIdx !== -1) {
      const radius = CONFIG.CONTEXT_RADIUS;
      const start = Math.max(0, passIdx - radius);
      const end = Math.min(text.length, passIdx + passport.length + radius);
      const contextChunk = text.slice(start, end);

      const regex = createRegex();
      while ((match = regex.exec(contextChunk)) !== null) {
        matches.push(match[1]);
      }
    }
  }

  if (matches.length === 0) {
    const regex = createRegex();
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }
  }

  if (matches.length === 0) {
    const regex = createRegex();
    while ((match = regex.exec(rawText)) !== null) {
      matches.push(match[1]);
    }
  }

  if (matches.length === 0) return null;

  let validName = matches.find(m => {
    if (!/[a-zA-Zа-яА-ЯёЁ]/.test(m)) return false;
    const norm = m.toLowerCase();
    if (arrestingOfficers.has(norm)) return false;
    // Strip watermarks and game overlay headers
    if (/(?:^|_)(?:database|gov|gta5|rp|lspd|fbi|fib|usss|sasp|redwood|jorno|vegas|police|sheriff|следственный|изолятор|база|данных|правонарушителей|новости)(?:_|$)/i.test(m)) return false;
    return true;
  });

  if (!validName) return null;

  // Очистка приклеенных приставок
  validName = validName.replace(/^(?:ФИО|Имя|Паспорт|Пол|ID|Name|Passport)(?=[A-ZА-ЯЁ])/, '');
  validName = validName.replace(/^(?:фио|имя|паспорт|пол)(?=[A-Za-z])/i, '');
  validName = validName.replace(/^(?:id|name|passport)(?=[А-Яа-яЁё])/i, '');

  // Очистка приклеенных суффиксов
  validName = validName.replace(/(?<=[a-zA-Z])(?:лет|муж|жен)$/i, '');
  validName = validName.replace(/(?<=[а-яА-ЯёЁ])(?:lvl|age)$/i, '');
  validName = validName.replace(/([a-zа-яё])(?:Лет|Муж|Жен|Lvl|Age)$/, '$1');

  validName = validName.replace(/\d{2,}$/, '');
  validName = validName.replace(/^\d{2,}/, '');

  return formatName(validName);
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
      .replace(/(?:следственн[а-я]+\s+изолятор|федеральн[а-я]+\s+тюрьма|тюрьма|fbi|lspd|fib|sasp|lscsd)/gi, ' ')
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
  formatName,
  extractPassport,
  extractName,
  extractData,
  normalizeDate,
  parseTableRecords
};

