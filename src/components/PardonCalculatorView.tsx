import React, { useState, useEffect, useRef } from 'react';
import { CustomSelect } from './CustomSelect';
import { 
  ShieldAlert, 
  Sparkles, 
  Upload, 
  FileText, 
  Check, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Copy, 
  Key, 
  Eye, 
  FileSearch, 
  HelpCircle,
  Clock,
  DollarSign,
  Building,
  UserCheck,
  AlertTriangle,
  Award
} from 'lucide-react';

export interface PardonArticleRow {
  id: string;
  code: string;
  date: string;
  time: string;
  tyazhest: string;
}

const PRICES: Record<string, number> = {
  admin: 10000,
  small: 15000,
  medium: 60000,
  heavy: 80000,
  especially: 120000
};

const LABELS: Record<string, string> = {
  admin: 'Административная ($10,000)',
  small: 'Малая тяжесть ($15,000)',
  medium: 'Средняя тяжесть ($60,000)',
  heavy: 'Тяжкая ($80,000)',
  especially: 'Особо тяжкая ($120,000)'
};

const WAIT_REQUIRED: Record<string, boolean> = {
  admin: false,
  small: false,
  medium: true,
  heavy: true,
  especially: true
};

const TOTAL_CAP = 170000;

const SEED_SEVERITY: Record<string, string> = {
  "6.1": "medium", "6.2": "heavy", "6.3": "medium", "6.4": "small", "6.5": "small", "6.6": "especially", "6.7": "especially", "6.8": "medium", "6.9": "medium", "6.10": "small",
  "7.1": "especially", "7.2": "small", "7.3": "medium", "8.1": "especially", "8.1.1": "medium", "8.2": "especially", "8.3": "small", "8.3.1": "small", "8.4": "medium", "8.5": "especially",
  "9.1": "small", "9.2": "medium", "9.3": "heavy", "9.4": "medium", "9.5": "medium", "9.6": "medium", "9.7": "small",
  "10.1": "small", "10.2": "medium", "10.3": "medium", "10.4": "heavy", "10.5": "small", "10.6": "small", "10.7": "medium", "10.7.1": "medium", "10.8": "heavy",
  "11.1": "medium", "11.2": "small", "11.3": "small", "11.4": "heavy", "11.5": "medium", "11.6": "medium", "11.7": "medium", "11.8": "medium", "11.9": "medium", "11.10": "especially", "11.11": "heavy",
  "12.1": "especially", "12.2": "especially", "12.3": "especially", "12.4": "heavy", "12.5": "medium", "12.6": "small", "12.7": "heavy", "12.7.1": "medium", "12.8": "medium", "12.9": "heavy", "12.10": "heavy", "12.10.1": "especially", "12.11": "small", "12.12": "heavy", "12.13": "especially", "12.14": "especially", "12.15": "medium",
  "13.1": "small", "13.2": "medium", "13.2.1": "especially", "13.2.2": "especially", "13.3": "admin", "13.4": "especially",
  "14.1": "especially", "14.2": "especially", "14.3": "heavy", "14.3.1": "medium", "14.4": "heavy", "14.5": "especially", "14.6": "especially",
  "15.1": "heavy", "15.1.1": "medium", "15.2": "medium", "15.3": "medium", "15.4": "medium", "15.5": "medium", "15.6": "medium", "15.7": "small",
  "16.1": "medium", "16.1.1": "small", "16.1.2": "medium", "16.2": "especially", "16.3": "small", "16.3.1": "medium", "16.4": "heavy", "16.5": "medium", "16.6": "medium", "16.7": "especially", "16.8": "especially", "16.9": "medium", "16.10": "especially", "16.11": "medium", "16.12": "heavy", "16.13": "heavy", "16.14": "especially", "16.15": "medium", "16.16": "medium", "16.17": "heavy", "16.18": "medium", "16.19": "medium", "16.20": "especially",
  "17.1": "especially", "17.2": "medium", "17.3": "small", "17.3.1": "medium", "17.3.2": "medium", "17.4": "medium", "17.4.1": "heavy", "17.5": "medium", "17.6": "medium", "17.7": "medium",
  "18.1": "small", "18.2": "small", "18.3": "medium", "18.4": "small", "18.5": "medium", "18.6": "medium", "18.7": "small", "18.8": "medium",
  "20.1": "admin", "20.2": "admin", "20.3": "admin", "20.4": "admin", "20.5": "admin", "20.6": "admin", "20.7": "admin", "20.8": "admin", "20.9": "admin", "20.10": "admin", "20.11": "admin",
  "21.1": "admin", "21.2": "admin", "21.3": "admin", "21.4": "admin", "21.5": "admin",
  "22.1": "admin", "22.2": "admin", "22.3": "admin", "22.4": "admin",
  "23.1": "admin", "23.2": "admin",
  "24.1": "admin", "24.2": "admin", "24.3": "admin",
  "25.1": "admin", "25.2": "admin", "25.3": "admin", "25.4": "admin", "25.5": "admin", "25.5.1": "admin", "25.6": "admin", "25.7": "admin", "25.8": "admin"
};

const SPECIAL_ENTRIES: Record<string, { display: string; tyazhest: string }> = {
  'чистосердечное признание': { display: 'Чистосердечное признание', tyazhest: 'small' },
  'побег из тюрьмы': { display: 'Побег из тюрьмы', tyazhest: 'medium' }
};

export default function PardonCalculatorView() {
  const [fio, setFio] = useState('');
  const [passport, setPassport] = useState('');
  const [previousDebt, setPreviousDebt] = useState(() => {
    try {
      return localStorage.getItem('pardon_daily_accumulated_debt') || '0';
    } catch {
      return '0';
    }
  });
  const [fioWarning, setFioWarning] = useState(false);

  const [rows, setRows] = useState<PardonArticleRow[]>([]);
  const [rowSeq, setRowSeq] = useState(1);
  const [severityDict, setSeverityDict] = useState<Record<string, string>>({
    ...SEED_SEVERITY,
    'чистосердечное признание': 'small',
    'побег из тюрьмы': 'medium'
  });

  // Sync previousDebt with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pardon_daily_accumulated_debt', previousDebt);
    } catch (e) {}
  }, [previousDebt]);

  const handleResetDailyDebt = () => {
    setPreviousDebt('0');
    try {
      localStorage.setItem('pardon_daily_accumulated_debt', '0');
    } catch (e) {}
    notifyToast('Накопленный суточный долг сброшен в $0', 'success');
  };

  const notifyToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if ((window as any).triggerToast) {
      (window as any).triggerToast(msg, type);
    }
  };

  // OCR & Image state
  const [currentMethod, setCurrentMethod] = useState<'tesseract' | 'groq'>('tesseract');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq_api_key') || '');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedMime, setUploadedMime] = useState<string>('image/png');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusColor, setStatusColor] = useState<'normal' | 'green' | 'red'>('normal');
  const [lastOcrText, setLastOcrText] = useState('');
  const [showOcrPreview, setShowOcrPreview] = useState(false);
  const [manualText, setManualText] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);
  const [debugLogText, setDebugLogText] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tesseractWorkerRef = useRef<any>(null);

  // Sync API Key to LocalStorage
  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    try { localStorage.setItem('groq_api_key', val.trim()); } catch (e) {}
  };

  // Dynamically load Tesseract.js script if not present
  const loadTesseractScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Tesseract) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Не удалось загрузить OCR библиотеку'));
      document.head.appendChild(script);
    });
  };

  // Helper functions
  const normKey = (str: string) => String(str || '').trim().toLowerCase();

  const hoursSince = (dateStr: string, timeStr: string): number | null => {
    if (!dateStr || !timeStr) return null;
    const [d, mo, y] = dateStr.split('.').map(Number);
    const [h, mi] = timeStr.split(':').map(Number);
    if (!d || !mo || !y || isNaN(h) || isNaN(mi)) return null;
    const dt = new Date(y, mo - 1, d, h, mi);
    if (isNaN(dt.getTime())) return null;
    const diffMs = Date.now() - dt.getTime();
    return diffMs / 36e5;
  };

  const fuzzyMatchSpecial = (normCode: string) => {
    for (const key in SPECIAL_ENTRIES) {
      const keyNorm = normKey(key);
      if (normCode === keyNorm) return SPECIAL_ENTRIES[key];
      if (normCode.includes(keyNorm)) return SPECIAL_ENTRIES[key];
      if (keyNorm.startsWith(normCode) || normCode.startsWith(keyNorm)) return SPECIAL_ENTRIES[key];
      const keyWords = keyNorm.split(/\s+/);
      const codeWords = normCode.split(/\s+/);
      if (keyWords.length > 0 && codeWords.length > 0) {
        let matchCount = 0;
        for (let i = 0; i < Math.min(keyWords.length, codeWords.length); i++) {
          if (keyWords[i].startsWith(codeWords[i]) || codeWords[i].startsWith(keyWords[i])) {
            matchCount++;
          }
        }
        if (matchCount >= keyWords.length - 1 && matchCount > 0) {
          return SPECIAL_ENTRIES[key];
        }
      }
    }
    return null;
  };

  // Image Upload Handling
  const handleImageFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedMime(file.type || 'image/png');
      setUploadedBase64(dataUrl.split(',')[1]);
      setImagePreview(dataUrl);
      setStatusMessage(`Файл «${file.name}» загружен. Нажмите «Проанализировать скриншот».`);
      setStatusColor('normal');
    };
    reader.readAsDataURL(file);
  };

  // Listen for Clipboard Ctrl+V Paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Cleaning OCR raw output
  const cleanOcrText = (text: string) => {
    const lines = text.split('\n');
    const cleaned: string[] = [];
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      // Filter out HUD watermarks and overlay texts (GTA5 RP, REDWOOD, ID overlay, etc.)
      if (/gta\s*5\s*rp/i.test(line)) continue;
      if (/\b(redwood|alta|strawberry|downtown|hawick|sunrise|rockford|eclipse|richman)\b/i.test(line) && /id\s*\d+/i.test(line)) continue;
      if (/^\d{2}:\d{2}\s*\[/.test(line)) continue;
      if (/^\d{1,2}:\d{2}\s*\|/.test(line)) continue;
      if (/database\.gov/i.test(line) && line.length < 30) continue;
      if (/БАЗА\s*ПРАВОНАРУШИТЕЛЕЙ/i.test(line)) continue;
      if (/ГОСУДАРСТВЕННЫЕ\s*НОВОСТИ/i.test(line)) continue;
      if (/История\s*розыска/i.test(line)) continue;
      if (/Список\s*судимостей/i.test(line)) continue;
      if (/Поиск/i.test(line) && line.length < 20) continue;
      if (/SMARTGI/i.test(line)) continue;
      if (/Rec\s*from/i.test(line)) continue;
      if (/^\d+\s*\$/.test(line)) continue;
      if (/^\d+\s*=/.test(line)) continue;
      if (/^[\d\s\|\\/:]+$/.test(line)) continue;
      if (line.length < 3) continue;
      cleaned.push(line);
    }
    return cleaned.join('\n');
  };

  // Image Preprocessing Helper for High-Contrast Clean OCR & HUD Masking
  const preprocessCanvasForOcr = (dataUrl: string, isTesseract = true): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        canvas.width = Math.round(img.width * 1.5);
        canvas.height = Math.round(img.height * 1.5);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Mask out top 7.5% HUD overlay (completely removes player watermark "Jorno Vegas ID 581" at top right)
        ctx.fillStyle = '#090b10';
        ctx.fillRect(0, 0, canvas.width, Math.round(canvas.height * 0.075));

        if (isTesseract) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Grayscale
            let gray = 0.299 * r + 0.587 * g + 0.114 * b;
            
            // Invert colors: white text becomes black, dark background becomes white. OCR heavily prefers black-on-white.
            gray = 255 - gray;

            // Apply proper mathematical contrast boost (0-255 scale)
            const contrast = 128;
            let factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            let newValue = factor * (gray - 128) + 128;
            newValue = Math.max(0, Math.min(255, newValue));

            data[i] = newValue;
            data[i + 1] = newValue;
            data[i + 2] = newValue;
          }

          ctx.putImageData(imgData, 0, 0);
        }
        
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Tesseract OCR Engine
  const doTesseractOCR = async (): Promise<string | null> => {
    if (!uploadedBase64) {
      setStatusMessage('Загрузите или вставьте скриншот для анализа');
      setStatusColor('red');
      return null;
    }

    try {
      await loadTesseractScript();
    } catch (e) {
      setStatusMessage('Ошибка загрузки библиотеки Tesseract.js. Проверьте интернет-соединение');
      setStatusColor('red');
      return null;
    }

    const Tesseract = (window as any).Tesseract;
    setOcrProgress(10);
    setStatusMessage('Инициализация движка сканирования...');

    try {
      if (!tesseractWorkerRef.current) {
        setOcrProgress(30);
        tesseractWorkerRef.current = await Tesseract.createWorker('rus+eng', 1, {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(30 + m.progress * 60));
            }
          }
        });
      }

      setStatusMessage('Обработка изображения и скрытие игрового оверлея...');
      const rawDataUrl = `data:${uploadedMime};base64,${uploadedBase64}`;
      const preprocessedUrl = await preprocessCanvasForOcr(rawDataUrl, true);

      setStatusMessage('Распознавание текста со скриншота...');
      const result = await tesseractWorkerRef.current.recognize(preprocessedUrl);
      setOcrProgress(100);

      let text = result.data.text.trim();
      if (!text) {
        setStatusMessage('Текст не распознан. Попробуйте более четкий скриншот');
        setStatusColor('red');
        return null;
      }

      text = cleanOcrText(text);
      setLastOcrText(text);
      setShowOcrPreview(true);
      setManualText(text);
      setStatusMessage('Распознавание завершено. Проверьте результат.');
      setStatusColor('green');
      return text;
    } catch (err: any) {
      console.error('Tesseract error:', err);
      setStatusMessage(`Ошибка сканирования: ${err.message || err}`);
      setStatusColor('red');
      return null;
    }
  };

  // Groq Vision AI Engine (Highly explicit prompt for 100% article & citizen extraction accuracy)
  const doGroqAnalysis = async (): Promise<string | null> => {
    if (!apiKey.trim()) {
      setStatusMessage('Введите API-ключ Groq в настройках');
      setStatusColor('red');
      return null;
    }
    if (!uploadedBase64) {
      setStatusMessage('Загрузите или вставьте скриншот');
      setStatusColor('red');
      return null;
    }

    setStatusMessage('Подготовка скриншота и анализ через AI Vision...');

    const rawDataUrl = `data:${uploadedMime};base64,${uploadedBase64}`;
    const preprocessedUrl = await preprocessCanvasForOcr(rawDataUrl, false);

    const prompt = `Ты высокоточный эксперт по анализу судебных документов базы данных правонарушителей (database.gov / GTA5RP).
Внимательно изучи всё изображение базы данных.

КРИТИЧЕСКИЕ ПРАВИЛА ИЗВЛЕЧЕНИЯ:
1. ИМЯ И ПАСПОРТ ГРАЖДАНИНА (Кому делается помилование):
   - Ищи Имя_Фамилия СТРОГО внутри темно-синей карточки базы данных database.gov.
   - Имя гражданина написано возле аватарки персонажа прямо над надписью "Паспорт #XXXXXX" (например: Danek_Fillin, Dazai_Has).
   - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО брать имя из верхнего правого угла экрана (оверлей игры с ником игрока/губернатора), а также из колонок "ПРОВОДИЛ АРЕСТ"!
   - Номер паспорта находится под именем в формате "Паспорт #XXXXXX" или в поле "Номер паспорта" слева.
   - Формат ответа имени: Имя_Фамилия (через подчеркивание).

2. ВСЕ СТАТЬИ И СУДИМОСТИ:
   - Внимательно просмотри КАЖДУЮ строку таблицы (колонки "ДАТА", "СТАТЬЯ", "ПРОВОДИЛ АРЕСТ").
   - Извлеки время, дату и ВСЕ коды статей (например: 17.6, 12.7, 15.6, 17.1).
   - Если в одной ячейке или строке указано несколько статей (например '15.6, 17.1, 12.8'), выведи КАЖДУЮ статью отдельной строкой.
   - НЕ пропускай ни одной статьи!

Верни результат СТРОГО в следующем формате без кавычек и без дополнительных комментариев:
ФИО: Имя_Фамилия | номер_паспорта
ЧЧ:ММ ДД.ММ.ГГГГ\tкод_статьи
ЧЧ:ММ ДД.ММ.ГГГГ\tкод_статьи`;

    try {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey.trim()
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.6-27b',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: preprocessedUrl } }
            ]
          }],
          temperature: 0.1,
          max_tokens: 1024
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error?.message || `HTTP ${resp.status}`);
      }

      const raw = data.choices?.[0]?.message?.content || '';
      if (!raw.trim()) throw new Error('Пустой ответ от модели.');

      setDebugLogText(`Groq ответ:\n${raw.substring(0, 800)}`);
      setShowDebug(true);
      return raw;
    } catch (err: any) {
      setStatusMessage(`Ошибка Groq: ${err.message}`);
      setStatusColor('red');
      return null;
    }
  };

  // Main Analyze Executor
  const handleAnalyzeImage = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setShowOcrPreview(false);

    let raw: string | null = null;
    if (currentMethod === 'tesseract') {
      raw = await doTesseractOCR();
    } else {
      raw = await doGroqAnalysis();
    }

    if (!raw) {
      const fallback = currentMethod === 'tesseract' ? 'Groq Vision' : 'Tesseract';
      setStatusMessage(`Пробую резервный метод (${fallback})...`);
      if (currentMethod === 'tesseract') {
        raw = await doGroqAnalysis();
      } else {
        raw = await doTesseractOCR();
      }
    }

    if (raw) {
      setManualText(raw.trim());
      parseTextToRows(raw.trim());
    }

    setIsAnalyzing(false);
  };

  // Ultra-robust Text Parsing Algorithm (Extracts citizen name & all articles cleanly)
  const parseTextToRows = (rawText: string) => {
    const debugLog: string[] = [];
    debugLog.push('=== НАЧАЛО ПАРСИНГА ===');

    // 1. EXTRACT ARRESTING OFFICERS TO AVOID ACCIDENTALLY PICKING THEM AS CITIZEN NAME
    const arrestingOfficers = new Set<string>();
    const linesForOfficers = rawText.split('\n');
    linesForOfficers.forEach(l => {
      if (/проводил\s*арест|напарник|lspd|fib|usss|shpd|lscsd|sasp/i.test(l)) {
        const m = l.match(/\b([A-Z][a-z0-9]{1,15}[_\s]+[A-Z][a-z0-9]{1,20})\b/g);
        if (m) m.forEach(off => arrestingOfficers.add(off.toLowerCase().replace(/\s+/, '_')));
      }
    });

    // 2. EXTRACT PASSPORT NUMBER
    let foundPass = '';
    const passHeaderMatch = rawText.match(/Паспорт\s*#?\s*(\d{4,8})/i) || rawText.match(/\b(\d{5,7})\b/);
    if (passHeaderMatch) {
      foundPass = passHeaderMatch[1].trim();
    }

    // PRE-PROCESS TEXT: Tesseract often misses spaces. Inject spaces around keywords so regex doesn't fail due to glued words.
    rawText = rawText.replace(/Паспорт/ig, ' Паспорт ');
    rawText = rawText.replace(/ФИО:/ig, 'ФИО: ');

    // 3. EXTRACT TARGET CITIZEN NAME
    let foundName = '';

    // Strategy A: Explicit line from Groq Prompt
    // Updated regex to include spaces, dots, and numbers (in case of OCR substitutions like O->0)
    const fioFormatMatch = rawText.match(/ФИО:\s*([A-Za-zА-Яа-я0-9_\-\.\s]{3,40})(?:\s*\|\s*(\d{4,8}))?/i);
    if (fioFormatMatch) {
      foundName = fioFormatMatch[1].trim();
      if (!foundPass && fioFormatMatch[2]) foundPass = fioFormatMatch[2].trim();
    }

    // Strategy B: Name adjacent to "Паспорт #" inside profile card
    if (!foundName) {
      const nearPassMatch = rawText.match(/([A-ZА-Яa-zа-я0-9]{2,20}[_\s]+[A-ZА-Яa-zа-я0-9]{2,20})[\r\n\s]*Паспорт\s*#?\s*(\d{4,8})/i) ||
                            rawText.match(/Паспорт\s*#?\s*(\d{4,8})[\r\n\s]*([A-ZА-Яa-zа-я0-9]{2,20}[_\s]+[A-ZА-Яa-zа-я0-9]{2,20})/i);
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

      const nameRegex = /(?:^|[^A-ZА-Яa-zа-я_\-])([A-ZА-Яa-zа-я]{2,20}[_\s]+[A-ZА-Яa-zа-я]{2,20})(?=$|[^A-ZА-Яa-zа-я_\-])/gi;
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

    // Format foundName nicely with proper Capitalization and Underscore
    if (foundName) {
      // Normalize to First_Last format securely
      foundName = foundName.replace(/[\s\.]+/g, '_');
      let parts = foundName.split('_');
      let first = parts[0] || '';
      let last = parts[1] || '';
      
      // Capitalize properly
      if (first) first = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
      if (last) last = last.charAt(0).toUpperCase() + last.slice(1).toLowerCase();
      
      foundName = last ? `${first}_${last}` : first;
    }

    if (foundName) setFio(foundName);
    if (foundPass) setPassport(foundPass);
    setFioWarning(!foundName || foundName.length < 5);

    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

    const newParsedRows: PardonArticleRow[] = [];
    const seen = new Set<string>();
    let currentSeq = rowSeq;
    let lastDate = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    let lastTime = '12:00';

    lines.forEach((line) => {
      if (foundName && line.includes(foundName) && line.length < 50) return;
      if (/Паспорт/.test(line) && line.length < 50) return;

      // Extract date and time if present in line
      const dateMatch = line.match(/(\d{1,2}[:;.-]\d{2})\s+(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/) ||
                        line.match(/(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\s+(\d{1,2}[:;.-]\d{2})/);

      if (dateMatch) {
        let p1 = dateMatch[1], p2 = dateMatch[2];
        if (p1.includes(':') || p1.includes(';') || p1.length <= 5) {
          lastTime = p1.replace(';', ':');
          lastDate = p2.replace(/[/]/g, '.');
        } else {
          lastDate = p1.replace(/[/]/g, '.');
          lastTime = p2.replace(';', ':');
        }
      } else {
        const standaloneDate = line.match(/\b(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\b/);
        if (standaloneDate) lastDate = standaloneDate[1].replace(/[/]/g, '.');

        const standaloneTime = line.match(/\b(\d{1,2}[:;]\d{2}(?::\d{2})?)\b/);
        if (standaloneTime) lastTime = standaloneTime[1].replace(';', ':');
      }

      // Check for special entries first
      const normLine = normKey(line);
      const specialMatch = fuzzyMatchSpecial(normLine);
      if (specialMatch) {
        const key = normKey(specialMatch.display) + '|' + lastDate + '|' + lastTime;
        if (!seen.has(key)) {
          seen.add(key);
          newParsedRows.push({
            id: `r-${currentSeq++}`,
            code: specialMatch.display,
            date: lastDate,
            time: lastTime,
            tyazhest: specialMatch.tyazhest
          });
        }
        return;
      }

      // STRIP OUT DATES, TIMES, PASSPORT NUMBERS AND 4-DIGIT YEARS SO THEY ARE NEVER PARSED AS ARTICLES
      const sanitizedLine = line
        .replace(/\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/g, ' ') // Strip full dates (e.g. 04.08.2026, 29.07.2026)
        .replace(/\b\d{1,2}[:;]\d{2}(?::\d{2})?\b/g, ' ')     // Strip times (e.g. 14:32, 08:45)
        .replace(/\b(19|20)\d{2}\b/g, ' ')                    // Strip 4-digit years (e.g. 2026)
        .replace(/\b\d{5,7}\b/g, ' ');                         // Strip passport numbers (e.g. 437811)

      // Extract all article numbers (e.g. 15.6, 12.8, 17.1, 15.1.1)
      const articleMatches = sanitizedLine.match(/\b\d{1,2}[.,-]\d{1,2}(?:[.,-]\d{1,2})?\b/g) || [];
      articleMatches.forEach(rawCode => {
        const code = rawCode.replace(/[,]/g, '.').replace(/[-]/g, '.');
        if (!/\./.test(code)) return;

        // Reject if first part has leading zero (e.g. 04.08, 08.45, 05.08) because UK/UAK articles never start with 0
        if (/^0\d/.test(code)) return;

        const key = normKey(code) + '|' + lastDate + '|' + lastTime;
        if (seen.has(key)) return;
        seen.add(key);

        const ty = severityDict[normKey(code)] || SEED_SEVERITY[code] || 'medium';
        newParsedRows.push({
          id: `r-${currentSeq++}`,
          code,
          date: lastDate,
          time: lastTime,
          tyazhest: ty
        });
      });
    });

    setRowSeq(currentSeq);
    setRows(newParsedRows);
    notifyToast(`Распознавание завершено. Найдено статей: ${newParsedRows.length}`, 'success');
  };

  // Add Manual Row
  const handleAddManualRow = () => {
    const newId = `r-${rowSeq}`;
    setRowSeq(prev => prev + 1);
    setRows(prev => [...prev, { id: newId, code: '', date: '', time: '', tyazhest: '' }]);
  };

  // Remove Row
  const handleRemoveRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // Update Row
  const handleUpdateRow = (id: string, field: keyof PardonArticleRow, value: string) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      if (field === 'code') {
        const norm = normKey(value);
        const special = fuzzyMatchSpecial(norm);
        if (special) {
          updated.code = special.display;
          updated.tyazhest = special.tyazhest;
        } else {
          updated.tyazhest = severityDict[norm] || SEED_SEVERITY[value] || updated.tyazhest || '';
        }
      }
      if (field === 'tyazhest' && updated.code) {
        setSeverityDict(dict => ({ ...dict, [normKey(updated.code)]: value }));
      }
      return updated;
    }));
  };

  // Calculate Totals & Fees
  let rawSum = 0;
  let countOk = 0;

  const rowCalculations = rows.map(row => {
    let price = 0;
    let statusText = 'учтено';
    let isBlocked = false;

    if (row.tyazhest && PRICES[row.tyazhest]) {
      price = PRICES[row.tyazhest];
      if (WAIT_REQUIRED[row.tyazhest]) {
        const hrs = hoursSince(row.date, row.time);
        if (hrs === null) {
          statusText = 'нет даты';
          isBlocked = true;
          price = 0;
        } else if (hrs < 24) {
          const waitHrs = Math.ceil(24 - hrs);
          statusText = `ждать ${waitHrs}ч`;
          isBlocked = true;
          price = 0;
        }
      }
    } else {
      statusText = 'укажите тяжесть';
      isBlocked = true;
      price = 0;
    }

    if (!isBlocked) {
      rawSum += price;
      countOk++;
    }

    return { ...row, price, statusText, isBlocked };
  });

  const prevDebtNum = Math.max(0, Number(previousDebt) || 0);
  // Each individual pardon has its own independent limit of $170,000
  const finalSum = Math.min(rawSum, TOTAL_CAP);
  const totalDailyDebt = prevDebtNum + finalSum;
  const treasurySum = Math.round(totalDailyDebt * 0.85);
  const selfSum = totalDailyDebt - treasurySum;

  // Report Generator
  const reportText = `Имя Фамилия | Номер паспорта: ${fio.trim() || '—'} | ${passport.trim() || '—'}\nСумма помилования: ${finalSum.toLocaleString('ru-RU')}$\nОбщая сумма за сутки долга: ${totalDailyDebt.toLocaleString('ru-RU')}$\nВид снятия судимости: Помилование`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportText).then(() => {
      setCopiedReport(true);

      // ── Stack accumulative daily debt & persist to localStorage ──
      const newAccumulated = totalDailyDebt.toString();
      setPreviousDebt(newAccumulated);
      try {
        localStorage.setItem('pardon_daily_accumulated_debt', newAccumulated);
      } catch (e) {}

      // ── Auto-clear current person's fields for next report ──
      setFio('');
      setPassport('');
      setRows([]);
      setImagePreview(null);
      setUploadedBase64(null);
      setManualText('');
      setShowOcrPreview(false);
      setShowDebug(false);
      notifyToast('Отчёт скопирован! Суточный долг обновлён!', 'success');

      setTimeout(() => setCopiedReport(false), 3000);
    });
  };

  const handleResetAll = () => {
    setFio('');
    setPassport('');
    setPreviousDebt('0');
    setRows([]);
    setImagePreview(null);
    setUploadedBase64(null);
    setManualText('');
    setShowOcrPreview(false);
    setShowDebug(false);
    notifyToast('Все поля калькулятора очищены', 'info');
  };

  return (
    <div className="w-full space-y-8 font-sans pb-12">
      {/* EXECUTIVE HEADER */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 shadow-2xl shadow-black/40 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-indigo-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Офис Губернатора
              </span>
              <span className="text-zinc-600 text-xs">•</span>
              <span className="text-xs text-zinc-400 font-medium">SA-GOV State Pardon Office</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Указ о Помиловании — Калькулятор Пошлины
            </h1>
          </div>
        </div>

        <button
          onClick={handleResetAll}
          className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white rounded-xl text-xs font-semibold border border-white/[0.08] transition-all cursor-pointer shadow-lg active:scale-95"
        >
          <RefreshCw className="w-4 h-4 text-indigo-400" />
          Очистить всё
        </button>
      </div>

      {/* TWO COLUMN CARDS: CONVICT & SCANNER */}
      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 items-start">
        {/* CARD 1: CONVICT INFORMATION */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 space-y-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="border-b border-white/[0.06] pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-0.5">
              Анкетные данные
            </span>
            <h2 className="text-base font-bold text-white flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              Данные Осуждённого
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Ввод персональных данных для формирования указа</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1.5">Имя Фамилия (Латиница)</label>
              <input
                type="text"
                placeholder="Например: Kazil_Navalny"
                value={fio}
                onChange={e => {
                  setFio(e.target.value);
                  setFioWarning(false);
                }}
                className={`w-full bg-black/60 border rounded-xl px-4 py-2.5 text-sm text-white font-semibold focus:outline-none transition-colors ${
                  fioWarning ? 'border-rose-500 focus:border-rose-400' : 'border-white/[0.08] focus:border-indigo-500/50'
                }`}
              />
              {fioWarning && (
                <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Имя распознано неуверенно — проверьте вручную
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-white/70 block mb-1.5">Номер паспорта</label>
              <input
                type="text"
                placeholder="601226"
                value={passport}
                onChange={e => setPassport(e.target.value)}
                className="w-full bg-black/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm font-mono text-indigo-300 font-bold focus:border-indigo-500/50 focus:outline-none"
              />
            </div>

            <div className="bg-[#0C0D12] border border-white/[0.08] rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-white/80">Начальный / Накопленный суточный долг ($)</label>
                <button
                  type="button"
                  onClick={handleResetDailyDebt}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                >
                  <RefreshCw className="w-3 h-3 text-rose-400" />
                  <span>Сбросить в $0</span>
                </button>
              </div>

              <input
                type="number"
                min="0"
                placeholder="0"
                value={previousDebt}
                onChange={e => setPreviousDebt(e.target.value)}
                className="w-full bg-black/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm font-mono text-indigo-300 font-bold focus:border-indigo-500/50 focus:outline-none"
              />
              <p className="text-[11px] text-white/40 leading-relaxed">
                Вы можете вручную ввести любую начальную сумму. Новое помилование прибавится к ней.
              </p>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                <span>Общая сумма за сутки долга:</span>
                <span className="text-base font-mono font-extrabold text-emerald-400">{totalDailyDebt.toLocaleString('ru-RU')}$</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono">
                Накопленное ({prevDebtNum.toLocaleString('ru-RU')}$) + Текущее ({finalSum.toLocaleString('ru-RU')}$) = {totalDailyDebt.toLocaleString('ru-RU')}$
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-indigo-500/15 text-[11px]">
                <div className="bg-black/40 rounded-xl p-2 text-center border border-white/5">
                  <span className="text-white/50 text-[10px] uppercase font-bold block">🏛 В казну (85%)</span>
                  <span className="text-white font-mono font-bold">{treasurySum.toLocaleString('ru-RU')}$</span>
                </div>
                <div className="bg-black/40 rounded-xl p-2 text-center border border-white/5">
                  <span className="text-white/50 text-[10px] uppercase font-bold block">👑 Себе (15%)</span>
                  <span className="text-indigo-300 font-mono font-bold">{selfSum.toLocaleString('ru-RU')}$</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: SCREENSHOT SCANNER & OCR */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 space-y-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                <FileSearch className="w-5 h-5 text-indigo-400" />
                Анализ Скриншота базы данных
              </h2>
              <p className="text-xs text-white/50 mt-0.5">Автоматическое распознавание ФИО, паспорта и судимостей</p>
            </div>

            {/* API Settings toggle */}
            <div className="relative group">
              <button className="p-2 text-white/50 hover:text-indigo-300 hover:bg-white/5 rounded-xl transition-colors">
                <Key className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* API Key Modal / Expandable */}
          <details className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
            <summary className="text-xs font-bold text-white/70 cursor-pointer flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" /> Настройки Groq Vision API
            </summary>
            <div className="pt-2 space-y-2">
              <input
                type="text"
                placeholder="Вставьте API-ключ (console.groq.com/keys)"
                value={apiKey}
                onChange={e => handleApiKeyChange(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs font-mono text-indigo-300 focus:border-indigo-500/50 focus:outline-none"
              />
              <p className="text-[11px] text-white/40">
                Бесплатный ключ сохраняется локально в вашем браузере.
              </p>
            </div>
          </details>

          {/* Method Switcher Tabs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentMethod('tesseract')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                currentMethod === 'tesseract'
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 shadow-lg shadow-indigo-500/10'
                  : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <FileSearch className="w-4 h-4 text-emerald-400" />
              Tesseract.js (Локальный OCR)
            </button>

            <button
              onClick={() => setCurrentMethod('groq')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                currentMethod === 'groq'
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 shadow-lg shadow-indigo-500/10'
                  : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Groq Vision AI
            </button>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              imagePreview ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/15 hover:border-indigo-500/50 bg-black/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
            />
            <Upload className={`w-8 h-8 mx-auto mb-2 ${imagePreview ? 'text-emerald-400' : 'text-indigo-400/80'}`} />
            <p className="text-xs font-bold text-white">
              {imagePreview ? '✅ Скриншот загружен' : 'Нажмите для выбора файла или перетащите скриншот сюда'}
            </p>
            <p className="text-[11px] text-white/40 mt-1">
              Также можно вставить из буфера обмена (Ctrl + V)
            </p>
          </div>

          {/* Image Preview Thumbnail */}
          {imagePreview && (
            <div className="relative rounded-2xl overflow-hidden border border-white/15 max-h-48 bg-black/60 flex items-center justify-center">
              <img src={imagePreview} alt="Screenshot Preview" className="max-h-48 object-contain" />
            </div>
          )}

          {/* Progress Bar */}
          {isAnalyzing && (
            <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-white/10">
              <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleAnalyzeImage}
              disabled={isAnalyzing || !uploadedBase64}
              className="w-full sm:flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <FileSearch className="w-4 h-4" />
              {isAnalyzing ? 'Анализ скриншота...' : 'Проанализировать скриншот'}
            </button>
          </div>

          {/* Manual Text Input / Edit Fallback */}
          <details className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
            <summary className="text-xs font-bold text-white/70 cursor-pointer">
              Вставить или отредактировать текст вручную
            </summary>
            <div className="pt-2 space-y-3">
              <textarea
                rows={4}
                placeholder="Вставьте текст или список статей..."
                value={manualText}
                onChange={e => setManualText(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-xs font-mono text-white focus:border-indigo-500/50 focus:outline-none leading-relaxed"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={() => parseTextToRows(manualText)}
                  className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-500/30 transition-all cursor-pointer"
                >
                  Разобрать текст
                </button>

                <button
                  onClick={handleAddManualRow}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/15 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" /> Добавить статью вручную
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* ARTICLES IN CONVICTION TABLE CARD */}
      <div className="bg-[#121218]/90 border border-white/10 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-indigo-400" />
              Статьи в судимости
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              Тяжесть определяется по справочнику. Правило 24 часов блокирует неоплачиваемые статьи средней и высокой тяжести.
            </p>
          </div>

          <button
            onClick={handleAddManualRow}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-500/30 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" /> Добавить статью
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[240px] pb-12">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-3 w-10 text-center"></th>
                <th className="pb-3 px-3">Статья</th>
                <th className="pb-3 px-3">Дата получения</th>
                <th className="pb-3 px-3">Время</th>
                <th className="pb-3 px-3">Тяжесть статьи</th>
                <th className="pb-3 px-3">Пошлина</th>
                <th className="pb-3 px-3">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rowCalculations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/30 italic">
                    Статьи не добавлены. Загрузите скриншот или нажмите «Добавить статью».
                  </td>
                </tr>
              ) : (
                rowCalculations.map(row => (
                  <tr key={row.id} className={row.isBlocked ? 'bg-rose-500/[0.04]' : 'hover:bg-white/[0.02]'}>
                    {/* Delete */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleRemoveRow(row.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Удалить статью"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Article Code */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={row.code}
                        onChange={e => handleUpdateRow(row.id, 'code', e.target.value)}
                        placeholder="Статья (напр. 12.8)"
                        className="bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold w-36 focus:border-indigo-500/50 focus:outline-none"
                      />
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={row.date}
                        onChange={e => handleUpdateRow(row.id, 'date', e.target.value)}
                        placeholder="ДД.ММ.ГГГГ"
                        className="bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white w-28 focus:border-indigo-500/50 focus:outline-none"
                      />
                    </td>

                    {/* Time */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={row.time}
                        onChange={e => handleUpdateRow(row.id, 'time', e.target.value)}
                        placeholder="ЧЧ:ММ"
                        className="bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono w-20 focus:border-indigo-500/50 focus:outline-none"
                      />
                    </td>

                    {/* Severity Select */}
                    <td className="py-3 px-3 min-w-[140px]">
                      <CustomSelect
                        value={row.tyazhest}
                        onChange={val => handleUpdateRow(row.id, 'tyazhest', val)}
                        options={[
                          { value: '', label: '-- выберите --' },
                          ...Object.entries(LABELS).map(([k, v]) => ({ value: k, label: v }))
                        ]}
                        size="sm"
                      />
                    </td>

                    {/* Fee Price */}
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {row.price ? `${row.price.toLocaleString('ru-RU')}$` : '—'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        row.isBlocked 
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' 
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {row.statusText}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUMMARY & REPORT CARD */}
      <div className="bg-[#121218]/90 border border-white/10 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="border-b border-white/10 pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <DollarSign className="w-5 h-5 text-indigo-400" />
            Расчёт пошлины и Финансовый итог
          </h2>
          <p className="text-xs text-white/50 mt-0.5">Распределение средств между Казной и Пошлиной</p>
        </div>

        {/* 4 Main Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-1">
            <span className="text-[11px] uppercase font-bold text-white/40">Сумма пошлин (сырая)</span>
            <div className="text-2xl font-extrabold text-white font-mono">{rawSum.toLocaleString('ru-RU')}$</div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 space-y-1 relative overflow-hidden shadow-xl">
            <span className="text-[11px] uppercase font-extrabold text-indigo-300">Текущее помилование</span>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">{finalSum.toLocaleString('ru-RU')}$</div>
            {prevDebtNum + rawSum > TOTAL_CAP && (
              <p className="text-[10px] text-rose-300 font-bold mt-1">
                ⚠ Превышен лимит $170k за 24ч — сумма срезана.
              </p>
            )}
          </div>

          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 space-y-1 shadow-xl">
            <span className="text-[11px] uppercase font-extrabold text-zinc-300">Общая сумма за сутки долга</span>
            <div className="text-2xl font-extrabold text-indigo-300 font-mono">{totalDailyDebt.toLocaleString('ru-RU')}$</div>
            <p className="text-[10px] text-zinc-500 font-mono font-bold">Прошлое + Нынешнее</p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-1">
            <span className="text-[11px] uppercase font-bold text-white/40">Учтено статей</span>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">{countOk}</div>
          </div>
        </div>

        {/* Split: Treasury vs Fee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs font-bold text-white/50 uppercase tracking-wider block">В казну (85% от суточного долга)</span>
              <span className="text-xl font-extrabold text-white font-mono mt-1 block">{treasurySum.toLocaleString('ru-RU')}$</span>
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">85% исчисляется от общей суммы долга за сутки (${totalDailyDebt.toLocaleString('ru-RU')})</span>
            </div>
            <Building className="w-8 h-8 text-indigo-400/40" />
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs font-bold text-white/50 uppercase tracking-wider block">Себе (15% от суточного долга)</span>
              <span className="text-xl font-extrabold text-indigo-300 font-mono mt-1 block">{selfSum.toLocaleString('ru-RU')}$</span>
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">15% исчисляется от общей суммы долга за сутки (${totalDailyDebt.toLocaleString('ru-RU')})</span>
            </div>
            <Award className="w-8 h-8 text-indigo-400/40" />
          </div>
        </div>

        {/* Report Text Output */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider block">
            Сформированный отчёт по обращению
          </label>
          <div className="bg-black/60 border border-white/15 rounded-2xl p-4 text-xs font-mono text-zinc-200 whitespace-pre-line leading-relaxed shadow-inner">
            {reportText}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyReport}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 text-white font-extrabold text-xs rounded-xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {copiedReport ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedReport ? 'Отчёт скопирован!' : 'Скопировать отчёт'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
