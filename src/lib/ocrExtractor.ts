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
 * Инициализация Tesseract и распознавание текста с улучшенными настройками
 */
export async function recognizeAndExtract(
  imageUrl: string, 
  onProgress?: (progress: number) => void
): Promise<ExtractedData> {
  const Tesseract = (window as any).Tesseract;
  if (!Tesseract) {
    throw new Error('Tesseract.js не загружен');
  }

  // Создаем воркер (для GTA 5 RP русский + английский)
  const worker = await Tesseract.createWorker('rus+eng', 1, {
    logger: (m: any) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    }
  });

  // Улучшаем точность через ограничение символов (whitelist)
  // Разрешаем только латиницу, кириллицу, цифры и базовую пунктуацию из базы данных
  const whitelist = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789 _-.,:;#№/|';
  await worker.setParameters({
    tessedit_char_whitelist: whitelist
  });

  const result = await worker.recognize(imageUrl);
  const text = result.data.text.trim();
  
  await worker.terminate();

  return parseOcrText(text);
}

/**
 * Главная функция парсинга всего распознанного текста
 */
export function parseOcrText(rawText: string): ExtractedData {
  if (!rawText) {
    return { name: null, passport: null, records: [], rawText: '' };
  }

  const { name, passport, text: cleanedText } = extractNameAndPassport(rawText);
  const records = parseTableRecords(cleanedText);

  return { name, passport, records, rawText };
}

/**
 * 1. ИЗВЛЕЧЕНИЕ ИМЕНИ И ПАСПОРТА
 * Использует пуленепробиваемую логику очистки от приклеенных слов
 */
function extractNameAndPassport(rawText: string) {
  let name: string | null = null;
  let passport: string | null = null;

  let text = rawText;

  // 1.1 Отделяем даты/статьи
  text = text.replace(/(\d{1,2}[.,:]\d{1,2}(?:[.,:]\d{2,4})?)/g, ' $1 ');

  // 1.2 Отделяем знаки препинания (кроме подчеркивания)
  text = text.replace(/[:;.,!?|\\/(){}\[\]<>+="\-'`~#№]/g, ' $& ');

  // 1.3 Отделяем длинные системные слова
  const safeKeywords = [
      'фио', 'паспорт', 'фамилия', 'уровень', 'мужской', 'женский', 
      'гражданство', 'прописка', 'организация', 'должность', 
      'passport', 'surname', 'статья', 'розыск', 'штраф', 'наличные'
  ];
  const safeRegex = new RegExp(`(${safeKeywords.join('|')})`, 'gi');
  text = text.replace(safeRegex, ' $1 ');

  // 1.4 Чиним подчеркивания
  text = text.replace(/\s+_\s+|\s+_|_\s+/g, '_');
  text = text.replace(/\s+/g, ' ').trim();

  // 2. ИЗВЛЕЧЕНИЕ ПАСПОРТА
  const passportRegex = /(?:Паспорт|ID|#|№)\s*[:\-]?\s*(\d{2,8})/i;
  const passportMatch = text.match(passportRegex);
  if (passportMatch) {
    passport = passportMatch[1];
  } else {
    const rawPassportMatch = rawText.match(/(?:Паспорт|ID|#|№)[^\d]*(\d{2,8})/i);
    if (rawPassportMatch) {
      passport = rawPassportMatch[1];
    } else {
      const digitsMatch = text.match(/\b(\d{4,8})\b/);
      if (digitsMatch) {
        passport = digitsMatch[1];
      }
    }
  }

  // 3. ИЗВЛЕЧЕНИЕ ИМЕНИ (Слово_Слово)
  const arrestingOfficers = extractArrestingOfficers(rawText);
  const nameRegex = /([a-zA-Zа-яА-ЯёЁ0-9]+_[a-zA-Zа-яА-ЯёЁ0-9]+)/g;
  let matches: string[] = [];
  let match;
  
  while ((match = nameRegex.exec(text)) !== null) {
    matches.push(match[1]);
  }

  if (matches.length === 0) {
    while ((match = nameRegex.exec(rawText)) !== null) {
      matches.push(match[1]);
    }
  }

  if (matches.length > 0) {
    let validName = matches.find(m => {
      if (!/[a-zA-Zа-яА-ЯёЁ]/.test(m)) return false;
      const norm = m.toLowerCase();
      if (arrestingOfficers.has(norm)) return false;
      if (/database|gov|gta5|rp|lspd|fbi|fib|usss|sasp|redwood|jorno|vegas|police|sheriff/i.test(m)) return false;
      return true;
    }) || matches[0];
    
    name = validName;

    // 4. Ювелирная очистка
    name = name.replace(/^(?:имя|и|пол|фио|пасп)(?=[A-ZА-ЯЁ]|[a-zA-Z])/i, '');
    name = name.replace(/^(?:id|name|age|sex)(?=[A-ZА-ЯЁ]|[а-яА-ЯёЁ])/i, '');

    name = name.replace(/(?<=[a-zA-Z])(?:лет|муж|жен)$/i, '');
    name = name.replace(/(?<=[а-яА-ЯёЁ])(?:lvl|age)$/i, '');
    name = name.replace(/([a-zа-яё])(?:Лет|Муж|Жен|Lvl|Age)$/, '$1');

    name = name.replace(/\d{2,}$/, '');
    name = name.replace(/^\d{2,}/, '');

    name = name.split('_').map(part => {
      if (!part) return '';
      let lower = part.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join('_');
  }

  return { name, passport, text: rawText };
}

/**
 * Собирает имена полицейских из таблицы, чтобы случайно не принять их за гражданина
 */
function extractArrestingOfficers(rawText: string): Set<string> {
  const arrestingOfficers = new Set<string>();
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
 * 2. ИЗВЛЕЧЕНИЕ СТРОК ТАБЛИЦЫ (Дата, Время, Статья, Офицер, Изолятор)
 */
function parseTableRecords(rawText: string): ArrestRecord[] {
  const records: ArrestRecord[] = [];
  
  // Ищем все даты и время как маркеры начала строк таблицы
  const dtRegex = /(\b\d{1,2}[:;]\d{2}\s+\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b|\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\s+\d{1,2}[:;]\d{2}\b)/g;
  
  let match;
  let dtMatches = [];
  
  while ((match = dtRegex.exec(rawText)) !== null) {
    dtMatches.push({
      text: match[0],
      index: match.index
    });
  }
  
  for (let i = 0; i < dtMatches.length; i++) {
    const current = dtMatches[i];
    const next = dtMatches[i + 1];
    
    // Блок данных, принадлежащий этой записи
    const block = rawText.slice(current.index + current.text.length, next ? next.index : rawText.length);
    
    // Парсим дату и время
    let time = '';
    let date = '';
    const tMatch = current.text.match(/\d{1,2}[:;]\d{2}/);
    if (tMatch) time = tMatch[0].replace(';', ':');
    
    const dMatch = current.text.match(/\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/);
    if (dMatch) date = dMatch[0].replace(/[/,-]/g, '.');
    
    let remaining = block;
    
    // 2.1 Тюрьма / Место отбывания
    let jail = '';
    const jailMatch = remaining.match(/(?:следственн[а-я]+\s+изолятор|федеральн[а-я]+\s+тюрьма|тюрьма|fbi|lspd|fib|sasp|lscsd)/i);
    if (jailMatch) {
      jail = jailMatch[0].trim();
      remaining = remaining.replace(jailMatch[0], ' ');
    }
    
    // 2.2 Имя офицера
    let officer = '';
    // Офицер обычно состоит из двух слов с большой буквы
    const officerMatch = remaining.match(/\b([A-ZА-ЯЁ][a-zа-яё0-9]+(?:_[A-ZА-ЯЁ][a-zа-яё0-9]+|\s+[A-ZА-ЯЁ][a-zа-яё0-9]+))\b/);
    if (officerMatch) {
      officer = officerMatch[1].replace(/\s+/, '_');
      remaining = remaining.replace(officerMatch[0], ' ');
    }
    
    // 2.3 Статьи
    const articleRegex = /\b\d{1,2}\.\d{1,2}(?:\.\d{1,2})?\b/g;
    const articles = [];
    let artMatch;
    while ((artMatch = articleRegex.exec(remaining)) !== null) {
       articles.push(artMatch[0]);
    }
    
    if (articles.length === 0) {
       records.push({ time, date, article: '', officer, jail });
    } else {
       for (const art of articles) {
         records.push({ time, date, article: art, officer, jail });
       }
    }
  }
  
  return records;
}
