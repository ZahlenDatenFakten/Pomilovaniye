import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Award,
  ChevronDown,
  Shield,
  Zap,
  Sliders
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

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const notifyToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message: msg, type });
    if ((window as any).triggerToast) {
      (window as any).triggerToast(msg, type);
    }
    setTimeout(() => {
      setToast(prev => (prev?.message === msg ? null : prev));
    }, 3500);
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

  // Groq Vision AI Engine (Explicit prompt for 100% article & citizen extraction accuracy)
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
   - Имя гражданина написано возле аватарки персонажа прямо над надписью "Паспорт #XXXXXX" (например: Danek_Fillin, Dazai_Has, Misha_Navarov).
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
          model: 'llama-3.2-90b-vision-preview',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: preprocessedUrl } }
            ]
          }],
          temperature: 0.1,
          max_tokens: 1500
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error?.message || `HTTP ${resp.status}`);
      }

      const raw = data.choices?.[0]?.message?.content || '';
      if (!raw.trim()) throw new Error('Пустой ответ от модели.');

      setDebugLogText(`Groq ответ:\n${raw.substring(0, 1500)}`);
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
        const m = l.match(/\b([A-ZА-ЯЁa-zа-яё0-9]{1,15}[_\s]+[A-ZА-ЯЁa-zа-яё0-9]{1,20})\b/g);
        if (m) m.forEach(off => arrestingOfficers.add(off.toLowerCase().replace(/[\s\.]+/, '_')));
      }
    });

    // 2. EXTRACT PASSPORT NUMBER
    let foundPass = '';
    const passHeaderMatch = rawText.match(/Паспорт\s*#?\s*(\d{4,8})/i) || rawText.match(/\b(\d{5,7})\b/);
    if (passHeaderMatch) {
      foundPass = passHeaderMatch[1].trim();
    }

    // Helper for validating candidate names
    const isCitizenName = (candidate: string): boolean => {
      if (!candidate) return false;
      const clean = candidate.trim().replace(/[\s\.]+/, '_');
      if (clean.length < 4) return false;
      if (!/[a-zA-Zа-яА-ЯёЁ]/.test(clean)) return false;
      const norm = clean.toLowerCase();
      if (arrestingOfficers.has(norm)) return false;
      if (/(?:^|_)(?:database|gov|gta5|rp|lspd|fbi|fib|usss|sasp|redwood|jorno|vegas|police|sheriff|следственный|изолятор|паспорт|гражданин|досье)(?:_|$)/i.test(norm)) return false;
      return true;
    };

    // Helper for formatting name with OCR corrections
    const formatCandidate = (raw: string): string => {
      if (!raw) return '';
      let clean = raw.trim().replace(/[\s\.]+/g, '_');
      // Strip common prefixes / suffixes
      clean = clean.replace(/^(?:ФИО|Имя|Паспорт|Пол|ID|Name|Passport)(?=[A-ZА-ЯЁ])/g, '');
      clean = clean.replace(/^(?:фио|имя|паспорт|пол)(?=[A-Za-z])/i, '');
      clean = clean.replace(/^(?:id|name|passport)(?=[А-Яа-яЁё])/i, '');
      clean = clean.replace(/(?<=[a-zA-Z])(?:лет|муж|жен)$/i, '');
      clean = clean.replace(/(?<=[а-яА-ЯёЁ])(?:lvl|age)$/i, '');
      clean = clean.replace(/([a-zа-яё])(?:Лет|Муж|Жен|Lvl|Age)$/, '$1');
      clean = clean.replace(/\d{2,}$/, '');
      clean = clean.replace(/^\d{2,}/, '');

      const parts = clean.split('_').filter(Boolean);
      const mainParts = parts.length > 2 ? [parts[0], parts[1]] : parts;
      
      return mainParts.map(part => {
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
    };

    // 3. MULTI-TIER STRATEGIES TO EXTRACT CITIZEN NAME
    let foundName = '';

    // Strategy A: Explicit line from Groq Prompt / Format ("ФИО: Имя_Фамилия | Паспорт")
    const fioFormatMatch = rawText.match(/ФИО:\s*([A-Za-zА-Яа-я0-9_\-\.\s]{3,40})(?:\s*\|\s*(\d{4,8}))?/i);
    if (fioFormatMatch) {
      const cand = fioFormatMatch[1].trim();
      if (isCitizenName(cand)) {
        foundName = formatCandidate(cand);
        if (!foundPass && fioFormatMatch[2]) foundPass = fioFormatMatch[2].trim();
      }
    }

    // Strategy B: Name adjacent to "Паспорт #" in dossier card (Right above, below, or glued)
    if (!foundName) {
      const nearPassPatterns = [
        // Name directly before "Паспорт #123456"
        /([A-ZА-Яa-zа-я0-9]{2,20}[_\s]+[A-ZА-Яa-zа-я0-9]{2,20})[\r\n\s]*Паспорт\s*#?\s*(\d{4,8})/i,
        // "Паспорт #123456" directly before Name
        /Паспорт\s*#?\s*(\d{4,8})[\r\n\s]*([A-ZА-Яa-zа-я0-9]{2,20}[_\s]+[A-ZА-Яa-zа-я0-9]{2,20})/i,
        // Glued: "Misha_NavarovПаспорт #590831"
        /([A-ZА-Яa-zа-я0-9]{2,20}_[A-ZА-Яa-zа-я0-9]{2,20})Паспорт/i
      ];

      for (const pattern of nearPassPatterns) {
        const m = rawText.match(pattern);
        if (m) {
          const candidate = (m[1] && isNaN(Number(m[1]))) ? m[1] : m[2];
          if (candidate && isCitizenName(candidate)) {
            foundName = formatCandidate(candidate);
            const passCand = (m[1] && !isNaN(Number(m[1]))) ? m[1] : m[2];
            if (!foundPass && passCand && !isNaN(Number(passCand))) foundPass = passCand;
            break;
          }
        }
      }
    }

    // Strategy C: Contextual window around Passport position (within 350 chars)
    if (!foundName && foundPass) {
      const passPos = rawText.indexOf(foundPass);
      if (passPos !== -1) {
        const focusSnippet = rawText.slice(Math.max(0, passPos - 350), Math.min(rawText.length, passPos + 350));
        const nameRegex = /([A-ZА-Яa-zа-я0-9]{2,20}[_\s]+[A-ZА-Яa-zа-я0-9]{2,20})/g;
        let m;
        while ((m = nameRegex.exec(focusSnippet)) !== null) {
          if (isCitizenName(m[1])) {
            foundName = formatCandidate(m[1]);
            break;
          }
        }
      }
    }

    // Strategy D: Global pattern search with fuzzy word separation
    if (!foundName) {
      let text = rawText
        .replace(/(\d{1,2}[.,:]\d{1,2}(?:[.,:]\d{2,4})?)/g, ' $1 ')
        .replace(/[:;.,!?|\\/(){}\[\]<>+="\-'`~#№]/g, ' $& ')
        .replace(/(фио|паспорт|фамилия|уровень|мужской|женский|гражданство|прописка|организация|должность|passport|surname|статья|розыск|штраф|наличные)/gi, ' $1 ')
        .replace(/\s+/g, ' ')
        .trim();

      const globalRegex = /([a-zA-Zа-яА-ЯёЁ0-9]{2,20}(?:_[a-zA-Zа-яА-ЯёЁ0-9]{2,20}|\s+[a-zA-Zа-яА-ЯёЁ0-9]{2,20}))/g;
      let m;
      while ((m = globalRegex.exec(text)) !== null) {
        if (isCitizenName(m[1])) {
          foundName = formatCandidate(m[1]);
          break;
        }
      }
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
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* FLOATING GLASS TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.94 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-2xl glass-panel shadow-2xl border border-white/20 text-sm font-semibold tracking-wide backdrop-blur-2xl"
          >
            {toast.type === 'success' && <Check className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Award className="w-5 h-5 text-amber-400 shrink-0" />}
            <span className="text-white">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXECUTIVE GLASS HEADER */}
      <header className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle accent light in header */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4.5 relative z-10">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10 shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400/90">
                Офис Губернатора • Штат Сан-Андреас
              </span>
              <span className="text-zinc-600 text-xs">•</span>
              <span className="text-xs text-zinc-400 font-medium">SA-GOV Pardon Office</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Калькулятор Пошлины Помилования
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto justify-between md:justify-end">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Лимит: $170,000 / 24ч</span>
          </div>

          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 transition-all text-xs font-bold cursor-pointer active:scale-95 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Очистить всё</span>
          </button>
        </div>
      </header>

      {/* TOP WORKSPACE: 2 BALANCED GLASS COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMN 1: CONVICT INFORMATION & DAILY DEBT */}
        <section className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-7 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-white/[0.07] pb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 block mb-0.5">
                  Анкетные данные
                </span>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4.5 h-4.5 text-amber-400" />
                  Данные Осуждённого
                </h2>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">Шаг 1 из 3</span>
            </div>

            <div className="space-y-4">
              {/* CITIZEN NAME */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Имя Фамилия <span className="text-zinc-500 font-normal">(Латиница, формат: Name_Surname)</span>
                </label>
                <input
                  type="text"
                  placeholder="Например: Kazil_Navalny"
                  value={fio}
                  onChange={e => {
                    setFio(e.target.value);
                    setFioWarning(false);
                  }}
                  className={`w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-semibold transition-all ${
                    fioWarning ? 'border-amber-500/80 ring-2 ring-amber-500/20' : ''
                  }`}
                />
                {fioWarning && (
                  <p className="text-[11px] text-amber-400 mt-1.5 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Имя распознано неуверенно — проверьте вручную
                  </p>
                )}
              </div>

              {/* PASSPORT NUMBER */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Номер паспорта
                </label>
                <input
                  type="text"
                  placeholder="Например: 601226"
                  value={passport}
                  onChange={e => setPassport(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-mono text-white font-semibold"
                />
              </div>

              {/* DAILY DEBT BLOCK */}
              <div className="glass-panel-subtle rounded-2xl p-4.5 space-y-3 border border-white/10">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-zinc-200">
                    Накопленный суточный долг ($)
                  </label>
                  <button
                    type="button"
                    onClick={handleResetDailyDebt}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 shrink-0"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-400" />
                    <span>Сбросить в $0</span>
                  </button>
                </div>

                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={previousDebt}
                  onChange={e => setPreviousDebt(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-mono text-amber-300 font-bold"
                />
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Сумма текущего помилования автоматически прибавится к этому значению.
                </p>
              </div>
            </div>
          </div>

          {/* LIVE SUMMARY MINI-CARD */}
          <div className="mt-4 pt-4 border-t border-white/[0.07] flex items-center justify-between text-xs">
            <span className="text-zinc-400">Итого долг за сутки:</span>
            <span className="text-base font-extrabold font-mono text-white">
              ${totalDailyDebt.toLocaleString('ru-RU')}
            </span>
          </div>
        </section>

        {/* COLUMN 2: DATABASE SCANNER & OCR */}
        <section className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-7 space-y-6">
          <div className="border-b border-white/[0.07] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 block mb-0.5">
                Автоматизация
              </span>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileSearch className="w-4.5 h-4.5 text-amber-400" />
                Сканер Базы Данных (OCR / AI)
              </h2>
            </div>

            {/* METHOD SWITCHER TABS */}
            <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setCurrentMethod('tesseract')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentMethod === 'tesseract'
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>Локальный OCR</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentMethod('groq')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentMethod === 'groq'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Groq Vision AI</span>
              </button>
            </div>
          </div>

          {/* DROPZONE */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
            }}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              imagePreview 
                ? 'border-amber-500/50 bg-amber-500/5' 
                : 'border-white/15 hover:border-amber-500/40 bg-black/30 hover:bg-black/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
            />
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-3 text-amber-400">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white">
              {imagePreview ? '✅ Скриншот загружен и готов' : 'Нажмите для выбора файла или перетащите скриншот'}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Быстрая вставка из буфера обмена: нажмите <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 font-mono text-[11px] text-zinc-300">Ctrl + V</kbd>
            </p>
          </div>

          {/* IMAGE PREVIEW */}
          {imagePreview && (
            <div className="relative rounded-2xl overflow-hidden border border-white/15 max-h-40 bg-black/50 flex items-center justify-center p-2">
              <img src={imagePreview} alt="Screenshot Preview" className="max-h-36 object-contain rounded-lg" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImagePreview(null);
                  setUploadedBase64(null);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-rose-900/80 text-zinc-300 hover:text-white border border-white/20 transition-all cursor-pointer"
                title="Удалить скриншот"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* PROGRESS BAR */}
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-zinc-400">
                <span>Сканирование базы данных...</span>
                <span>{Math.round(ocrProgress)}%</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-white/10">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-300 shadow-lg shadow-amber-500/50" 
                  style={{ width: `${ocrProgress}%` }} 
                />
              </div>
            </div>
          )}

          {/* SCAN ACTION BUTTON */}
          <button
            onClick={handleAnalyzeImage}
            disabled={isAnalyzing || !uploadedBase64}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>{isAnalyzing ? 'Идёт анализ скриншота...' : '⚡ Распознать судимости со скриншота'}</span>
          </button>

          {statusMessage && (
            <p className={`text-xs text-center font-medium ${statusColor === 'red' ? 'text-rose-400' : 'text-emerald-400'}`}>
              {statusMessage}
            </p>
          )}

          {/* ACCORDION: MANUAL TEXT & API SETTINGS */}
          <div className="space-y-3 pt-2">
            {/* MANUAL ENTRY */}
            <details className="glass-panel-subtle rounded-2xl p-4 border border-white/10 group">
              <summary className="text-xs font-bold text-zinc-300 cursor-pointer flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  Ручной ввод текста / списка статей
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pt-3 space-y-3">
                <textarea
                  rows={3}
                  value={manualText}
                  onChange={e => setManualText(e.target.value)}
                  className="w-full glass-input rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-none"
                  placeholder="Вставьте сырой скопированный текст из базы данных..."
                />
                <button
                  type="button"
                  onClick={() => parseTextToRows(manualText)}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 transition-all cursor-pointer"
                >
                  Разобрать текст на статьи
                </button>
              </div>
            </details>

            {/* GROQ API SETTINGS */}
            <details className="glass-panel-subtle rounded-2xl p-4 border border-white/10 group">
              <summary className="text-xs font-bold text-zinc-300 cursor-pointer flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-zinc-400" />
                  Настройки Groq API Key <span className="text-zinc-500 font-normal">(для режима Vision AI)</span>
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pt-3 space-y-2">
                <input
                  type="text"
                  placeholder="gsk_..."
                  value={apiKey}
                  onChange={e => handleApiKeyChange(e.target.value)}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                />
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Бесплатный ключ с сайта <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">console.groq.com</a>. Сохраняется локально в браузере.
                </p>
              </div>
            </details>
          </div>
        </section>
      </div>

      {/* ARTICLES TABLE SECTION */}
      <section className="glass-panel rounded-3xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 block mb-0.5">
              Справочник и расчёт
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                Инкриминируемые статьи
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-bold text-zinc-300">
                {rowCalculations.length} {rowCalculations.length === 1 ? 'статья' : 'статей'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Правило 24 часов блокирует неоплачиваемые статьи средней и высокой тяжести до истечения срока.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddManualRow}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Добавить статью</span>
          </button>
        </div>

        {/* RESPONSIVE TABLE */}
        <div className="overflow-x-auto min-h-[220px]">
          <table className="w-full text-left text-xs border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider font-bold">
                <th className="pb-3 px-3 w-10 text-center"></th>
                <th className="pb-3 px-3">Статья</th>
                <th className="pb-3 px-3">Дата получения</th>
                <th className="pb-3 px-3">Время</th>
                <th className="pb-3 px-3 min-w-[180px]">Тяжесть статьи</th>
                <th className="pb-3 px-3 text-right">Пошлина</th>
                <th className="pb-3 px-3 text-right">Статус (24ч)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rowCalculations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 text-sm italic">
                    Статьи не добавлены. Загрузите скриншот базы данных или нажмите «Добавить статью».
                  </td>
                </tr>
              ) : (
                rowCalculations.map(row => (
                  <tr 
                    key={row.id} 
                    className={`transition-colors ${
                      row.isBlocked ? 'bg-white/[0.01]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* DELETE */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleRemoveRow(row.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Удалить статью"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                    {/* CODE */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={row.code}
                        onChange={e => handleUpdateRow(row.id, 'code', e.target.value)}
                        placeholder="напр. 12.8"
                        className="glass-input rounded-lg px-3 py-1.5 text-xs text-white font-mono font-bold w-36"
                      />
                    </td>

                    {/* DATE */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={row.date}
                        onChange={e => handleUpdateRow(row.id, 'date', e.target.value)}
                        placeholder="ДД.ММ.ГГГГ"
                        className="glass-input rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono w-28"
                      />
                    </td>

                    {/* TIME */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={row.time}
                        onChange={e => handleUpdateRow(row.id, 'time', e.target.value)}
                        placeholder="ЧЧ:ММ"
                        className="glass-input rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono w-20"
                      />
                    </td>

                    {/* SEVERITY */}
                    <td className="py-3 px-3">
                      <CustomSelect
                        value={row.tyazhest}
                        onChange={val => handleUpdateRow(row.id, 'tyazhest', val)}
                        options={[
                          { value: '', label: '-- выберите тяжесть --' },
                          ...Object.entries(LABELS).map(([k, v]) => ({ value: k, label: v }))
                        ]}
                        size="sm"
                      />
                    </td>

                    {/* PRICE */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-sm text-white">
                      {row.price ? `$${row.price.toLocaleString('ru-RU')}` : '—'}
                    </td>

                    {/* STATUS BADGE */}
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                        row.isBlocked 
                          ? 'bg-amber-500/10 border-amber-500/25 text-amber-300' 
                          : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                      }`}>
                        {row.isBlocked ? <Clock className="w-3 h-3 text-amber-400" /> : <Check className="w-3 h-3 text-emerald-400" />}
                        {row.statusText}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* FINANCIAL SUMMARY & REPORT SECTION */}
      <section className="glass-panel rounded-3xl p-6 sm:p-7 space-y-6">
        <div className="border-b border-white/[0.07] pb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 block mb-0.5">
            Итоговые расчёты
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            Финансовый итог и Распределение средств
          </h2>
        </div>

        {/* 4 STAT METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
          {/* CURRENT PARDON */}
          <div className="glass-panel-subtle rounded-2xl p-5 border border-white/10 space-y-1.5 relative overflow-hidden glass-card-hover">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Текущее помилование
            </span>
            <div className="text-2xl font-extrabold text-white font-mono">
              ${finalSum.toLocaleString('ru-RU')}
            </div>
            {prevDebtNum + rawSum > TOTAL_CAP && (
              <p className="text-[10px] text-amber-400 font-bold mt-1">
                ⚠ Превышен суточный лимит $170,000 — сумма срезана.
              </p>
            )}
          </div>

          {/* TOTAL DAILY DEBT */}
          <div className="glass-panel-subtle rounded-2xl p-5 border border-white/10 space-y-1.5 glass-card-hover">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Итоговый суточный долг
            </span>
            <div className="text-2xl font-extrabold text-amber-300 font-mono">
              ${totalDailyDebt.toLocaleString('ru-RU')}
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">
              Предыдущий (${prevDebtNum.toLocaleString('ru-RU')}) + Текущий (${finalSum.toLocaleString('ru-RU')})
            </p>
          </div>

          {/* TREASURY */}
          <div className="glass-panel-subtle rounded-2xl p-5 border border-white/10 flex items-center justify-between glass-card-hover">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                В казну Штата (85%)
              </span>
              <div className="text-xl font-extrabold text-white font-mono">
                ${treasurySum.toLocaleString('ru-RU')}
              </div>
              <span className="text-[10px] text-zinc-500 font-mono block">85% от общего суточного долга</span>
            </div>
            <Building className="w-8 h-8 text-zinc-600 shrink-0" />
          </div>

          {/* OFFICER FEE */}
          <div className="glass-panel-subtle rounded-2xl p-5 border border-white/10 flex items-center justify-between glass-card-hover">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Сотруднику / Себе (15%)
              </span>
              <div className="text-xl font-extrabold text-amber-300 font-mono">
                ${selfSum.toLocaleString('ru-RU')}
              </div>
              <span className="text-[10px] text-zinc-500 font-mono block">15% от общего суточного долга</span>
            </div>
            <Award className="w-8 h-8 text-amber-500/40 shrink-0" />
          </div>
        </div>

        {/* REPORT PREVIEW & BIG ACTION BUTTON */}
        <div className="glass-panel-subtle rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Сформированный отчёт для гос. реестра
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">Готов к копированию</span>
          </div>

          <div className="glass-input rounded-xl p-4.5 text-xs sm:text-sm font-mono text-zinc-200 whitespace-pre-line leading-relaxed border border-white/10 shadow-inner">
            {reportText}
          </div>

          <button
            type="button"
            onClick={handleCopyReport}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-extrabold text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
          >
            {copiedReport ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            <span>{copiedReport ? '✓ Отчёт успешно скопирован в буфер!' : '📋 Скопировать отчёт и применить'}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
