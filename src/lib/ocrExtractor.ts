/**
 * ═══════════════════════════════════════════════════════════════════════
 *  OCR EXTRACTOR — Ядро извлечения данных из базы GTA 5 RP
 * ═══════════════════════════════════════════════════════════════════════
 */

export const CONFIG = {
  CONTEXT_RADIUS: 180,
  MIN_NAME_LENGTH: 4,
  MAX_NAME_LENGTH: 40,
  STOP_WORDS: [
    'фио', 'паспорт', 'фамилия', 'уровень', 'мужской', 'женский',
    'гражданство', 'прописка', 'организация', 'должность',
    'passport', 'surname', 'статья', 'розыск', 'штраф', 'наличные',
    'следственный', 'изолятор', 'тюрьма', 'правительство', 'сан', 'андреас', 'government', 'san', 'andreas'
  ]
};

export interface ArrestRecord {
  time: string;
  date: string;
  article: string;
  officer: string;
  jail: string;
}

export interface ExtractedData {
  name: string | null;
  passport: string | null;
  records: ArrestRecord[];
  rawText: string;
}

/**
 * OCR-коррекция опечаток (0→O, 1→I, 3→E/Е, 4→A...) и приведение к Title_Case
 */
export function formatName(rawName: string): string {
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

/**
 * Извлечение номера паспорта (с маркерами и без)
 */
export function extractPassport(text: string): string | null {
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

/**
 * Извлечение имен офицеров, чтобы исключить их из поиска гражданина
 */
export function extractArrestingOfficers(rawText: string): Set<string> {
  const arrestingOfficers = new Set<string>();
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

/**
 * Извлечение Имени_Фамилии
 */
export function extractName(rawText: string, passport?: string | null): string | null {
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

  let matches: string[] = [];
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
    if (/(?:^|_)(?:database|gov|gta5|rp|lspd|fbi|fib|usss|sasp|redwood|jorno|vegas|police|sheriff|следственный|изолятор|база|данных|правонарушителей|новости|правительство|правительства|сан|андреас|government|san|andreas)(?:_|$)/i.test(norm)) return false;
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

/**
 * Базовое извлечение только Имени и Паспорта
 */
export function extractData(rawText: string): { name: string | null; passport: string | null } {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return { name: null, passport: null };
  }

  const passport = extractPassport(rawText);
  const name = extractName(rawText, passport);

  return { name, passport };
}

/**
 * Нормализация даты из GTA5RP database.gov (включая обрезанные даты 18.08.20... / 18.08.2... / 18.08)
 */
export function normalizeDate(rawDateStr: string): string {
  if (!rawDateStr) return '';
  const clean = rawDateStr.replace(/[^\d.]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
  const parts = clean.split('.');
  const currentYear = new Date().getFullYear().toString();

  if (parts.length >= 2) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    let year = parts[2] || currentYear;
    if (year.length < 4) {
      if (year.startsWith('20') || year.startsWith('2')) {
        year = currentYear;
      } else {
        year = currentYear;
      }
    }
    return `${day}.${month}.${year}`;
  }
  return rawDateStr;
}

/**
 * Извлечение строк таблицы (Дата, Время, Статья, Офицер, Изолятор)
 */
export function parseTableRecords(rawText: string): ArrestRecord[] {
  const records: ArrestRecord[] = [];
  if (!rawText) return records;

  const currentYear = new Date().getFullYear().toString();
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  let lastTime = '12:00';
  let lastDate = `01.01.${currentYear}`;

  lines.forEach(line => {
    // Check if line contains date & time (e.g. 17:21 18.08.20... or 09:22 18.08.2026)
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

    // Clean out junk text like "уак-са", "уак", "следственный изолятор"
    let cleanLine = line
      .replace(/(?:следственн[а-я]+\s+изолятор|федеральн[а-я]+\s+тюрьма|тюрьма|fbi|lspd|fib|sasp|lscsd)/gi, ' ')
      .replace(/\b(?:уак[- ]?са|уак|ук[- ]?са|ук|yak[- ]?sa|yak|uk)\b/gi, ' ')
      .replace(/\b\d{1,2}[:;]\d{2}(?::\d{2})?\b/g, ' ')
      .replace(/\b\d{1,2}[./-]\d{1,2}(?:[./-][\d.]{1,6})?\b/g, ' ');

    // Extract all articles from line (e.g. 12.1 12.8, 25,5, 17.1)
    const articleRegex = /\b\d{1,2}[.,-]\d{1,2}(?:[.,-]\d{1,2})?\b/g;
    const articles: string[] = [];
    let artMatch;
    while ((artMatch = articleRegex.exec(cleanLine)) !== null) {
      const code = artMatch[0].replace(/,/g, '.').replace(/-/g, '.');
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

/**
 * Полный парсинг всего текста
 */
export function parseOcrText(rawText: string): ExtractedData {
  if (!rawText) {
    return { name: null, passport: null, records: [], rawText: '' };
  }

  const { name, passport } = extractData(rawText);
  const records = parseTableRecords(rawText);

  return { name, passport, records, rawText };
}

/**
 * Асинхронная обертка для распознавания изображения через Tesseract.js
 */
export async function recognizeAndExtract(
  imageUrl: string,
  onProgress?: (progress: number) => void
): Promise<ExtractedData> {
  const Tesseract = (window as any).Tesseract;
  if (!Tesseract) {
    throw new Error('Tesseract.js не загружен');
  }

  const worker = await Tesseract.createWorker('rus+eng', 1, {
    logger: (m: any) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    }
  });

  const whitelist = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789 _-.,:;#№/|';
  await worker.setParameters({
    tessedit_char_whitelist: whitelist
  });

  const result = await worker.recognize(imageUrl);
  const text = result.data.text.trim();

  await worker.terminate();

  return parseOcrText(text);
}
