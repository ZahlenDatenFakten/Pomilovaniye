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
  admin: 'Административная ($10k)',
  small: 'Малая ($15k)',
  medium: 'Средняя ($60k)',
  heavy: 'Тяжкая ($80k)',
  especially: 'Особо тяжкая ($120k)'
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
        await tesseractWorkerRef.current.setParameters({
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789 _-.,:;#№/|',
          tessedit_pageseg_mode: '3',
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
Внимательно изучи всё изображение базы данных. Работай медленно, думай шаг за шагом, чтобы не допустить ни единой ошибки.

КРИТИЧЕСКИЕ ПРАВИЛА ИЗВЛЕЧЕНИЯ:
1. ИМЯ И ПАСПОРТ ГРАЖДАНИНА (Кому делается помилование):
   - Ищи Имя_Фамилия СТРОГО внутри темно-синей карточки базы данных database.gov.
   - Имя гражданина написано возле аватарки персонажа прямо над надписью "Паспорт #XXXXXX" (например: Danek_Fillin, Dazai_Has, Misha_Navarov).
   - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО брать имя из верхнего правого угла экрана (оверлей игры с ником игрока/губернатора, например Правительство_Сан), а также из колонок "ПРОВОДИЛ АРЕСТ"!
   - Номер паспорта находится под именем в формате "Паспорт #XXXXXX" или в поле "Номер паспорта" слева.
   - Формат ответа имени: Имя_Фамилия (через подчеркивание).

2. ВСЕ СТАТЬИ И СУДИМОСТИ:
   - Внимательно просмотри КАЖДУЮ строку таблицы (колонки "ДАТА", "СТАТЬЯ", "ПРОВОДИЛ АРЕСТ").
   - Извлеки время, дату и ВСЕ коды статей (например: 17.6, 12.7, 15.6, 17.1).
   - Обрати внимание, статьи могут быть написаны через запятую (12,1) или тире. Воспринимай их как точки (12.1).
   - Если в одной ячейке или строке указано несколько статей (например '15.6, 17.1, 12.8'), выведи КАЖДУЮ статью отдельной строкой.
   - НЕ пропускай ни одной статьи! Ошибки недопустимы.

Верни результат СТРОГО в следующем формате без кавычек и без дополнительных комментариев (никаких рассуждений в финальном ответе):
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

      // Имитация глубокого анализа для визуального комфорта
      await new Promise(resolve => setTimeout(resolve, 1500));

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

  // Normalize date from GTA5RP database.gov (e.g. 18.08.20... / 18.08.2... -> 18.08.2026)
  const normalizeDateStr = (rawDateStr: string): string => {
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
  };

  // Ultra-robust Text Parsing Algorithm (Extracts citizen name & all articles cleanly)
  const parseTextToRows = (rawText: string) => {
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
      if (/(?:^|_)(?:database|gov|gta5|rp|lspd|fbi|fib|usss|sasp|redwood|jorno|vegas|police|sheriff|следственный|изолятор|паспорт|гражданин|досье|база|данных|правонарушителей|новости|правительство|правительства|сан|андреас|government|san|andreas)(?:_|$)/i.test(norm)) return false;
      return true;
    };

    // Helper for formatting name with OCR corrections
    const formatCandidate = (raw: string): string => {
      if (!raw) return '';
      let clean = raw.trim().replace(/[\s\.]+/g, '_');
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
        /([A-ZА-Яa-zа-я0-9]{2,20}[_\s]+[A-ZА-Яa-zа-я0-9]{2,20})[\r\n\s]*Паспорт\s*#?\s*(\d{4,8})/i,
        /Паспорт\s*#?\s*(\d{4,8})[\r\n\s]*([A-ZА-Яa-zа-я0-9]{2,20}[_\s]+[A-ZА-Яa-zа-я0-9]{2,20})/i,
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

    // Strategy D: Global pattern search
    if (!foundName) {
      const globalRegex = /([a-zA-Zа-яА-ЯёЁ0-9]{2,20}(?:_[a-zA-Zа-яА-ЯёЁ0-9]{2,20}|\s+[a-zA-Zа-яА-ЯёЁ0-9]{2,20}))/g;
      let m;
      while ((m = globalRegex.exec(rawText)) !== null) {
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
    const currentYear = new Date().getFullYear().toString();
    let lastDate = `01.01.${currentYear}`;
    let lastTime = '12:00';

    lines.forEach((line) => {
      if (foundName && line.includes(foundName) && line.length < 50) return;
      if (/Паспорт/.test(line) && line.length < 50) return;

      // Extract date and time if present in line (supporting truncated 18.08.20... / 18.08.2...)
      const dtMatch = line.match(/(\d{1,2}[:;]\d{2})\s+(\d{1,2}[./-]\d{1,2}(?:[./-][\d.]{1,6})?)/) ||
                      line.match(/(\d{1,2}[./-]\d{1,2}(?:[./-][\d.]{1,6})?)\s+(\d{1,2}[:;]\d{2})/);

      if (dtMatch) {
        let p1 = dtMatch[1], p2 = dtMatch[2];
        if (p1.includes(':') || p1.includes(';')) {
          lastTime = p1.replace(';', ':');
          lastDate = normalizeDateStr(p2);
        } else {
          lastDate = normalizeDateStr(p1);
          lastTime = p2.replace(';', ':');
        }
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

      // Clean out junk text and extract all article numbers using robust token logic
      let cleanLine = line;
      if (dtMatch) {
        cleanLine = line.replace(dtMatch[0], ' ');
      }
      cleanLine = cleanLine.replace(/[a-zA-Zа-яА-ЯёЁ]+/g, ' ');
      cleanLine = cleanLine.replace(/[,/]/g, '.');

      const tokens = cleanLine.split(/[\s\-]+/).map(t => t.replace(/^\.+|\.+$/g, ''));
      const articles: string[] = [];

      for (let t of tokens) {
        if (!t) continue;
        if (/^\d{1,2}\.\d{1,2}$/.test(t)) {
          articles.push(t);
        } else if (/^\d{1,2}\.\d{1,2}\.\d{1,2}$/.test(t)) {
          articles.push(t);
        } else if (/^(\d{1,2}\.\d{1,2})\.(\d{1,2}\.\d{1,2})$/.test(t)) {
          const m = t.match(/^(\d{1,2}\.\d{1,2})\.(\d{1,2}\.\d{1,2})$/);
          if (m) { articles.push(m[1]); articles.push(m[2]); }
        } else {
          const m = t.match(/\d{1,2}\.\d{1,2}/g);
          if (m) articles.push(...m);
        }
      }

      articles.forEach(code => {
        if (code.startsWith('0')) return;

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
  const finalSum = Math.min(rawSum, TOTAL_CAP);
  const totalDailyDebt = prevDebtNum + finalSum;
  const treasurySum = Math.round(totalDailyDebt * 0.85);
  const selfSum = totalDailyDebt - treasurySum;

  // Report Generator
  const reportText = `Имя Фамилия | Номер паспорта: ${fio.trim() || '—'} | ${passport.trim() || '—'}\nСумма помилования: ${finalSum.toLocaleString('ru-RU')}$\nОбщая сумма за сутки долга: ${totalDailyDebt.toLocaleString('ru-RU')}$\nВид снятия судимости: Помилование`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportText).then(() => {
      setCopiedReport(true);

      const newAccumulated = totalDailyDebt.toString();
      setPreviousDebt(newAccumulated);
      try {
        localStorage.setItem('pardon_daily_accumulated_debt', newAccumulated);
      } catch (e) {}

      setFio('');
      setPassport('');
      setRows([]);
      setImagePreview(null);
      setUploadedBase64(null);
      setManualText('');
      setShowOcrPreview(false);
      setShowDebug(false);
      notifyToast('Все поля калькулятора очищены', 'info');
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
    <div className="space-y-6 pb-16">
      {/* FLOATING GLASS TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-full bg-[#101015]/95 border border-white/20 shadow-2xl backdrop-blur-2xl text-sm font-semibold tracking-wide text-white"
          >
            {toast.type === 'success' && <Check className="w-4.5 h-4.5 text-white shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-4.5 h-4.5 text-zinc-400 shrink-0" />}
            {toast.type === 'info' && <Award className="w-4.5 h-4.5 text-zinc-300 shrink-0" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPACT EXECUTIVE HEADER WITH GRADIENT ACCENTS */}
      <header className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-wrap items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-lg shadow-white/10">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Помилования
              </h1>
              <span className="text-zinc-600 text-base">•</span>
              <span className="text-xs sm:text-sm font-bold text-zinc-400 font-mono tracking-wider px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10">SA-GOV</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-medium">Калькулятор пошлины и реестр снятия судимостей</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/[0.05] border border-white/15 text-zinc-200 text-xs sm:text-sm font-mono font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-sm shadow-white" />
            <span>Лимит: $170,000 / 24ч</span>
          </div>

          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 hover:text-white border border-white/15 hover:border-white/25 transition-all text-xs sm:text-sm font-bold cursor-pointer active:scale-95 shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-zinc-400" />
            <span>Очистить всё</span>
          </button>
        </div>
      </header>

      {/* MAIN TWO-COLUMN EXPANSIVE WORKSPACE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT COLUMN: CITIZEN INPUTS & SCANNER & CONVICTIONS TABLE ── */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* CARD 1: CITIZEN & OCR SCANNER */}
          <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            {/* ROW 1: CITIZEN NAME & PASSPORT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                  Имя Фамилия <span className="text-zinc-500 font-normal font-mono lowercase">(Name_Surname)</span>
                </label>
                <input
                  type="text"
                  placeholder="Kazil_Navalny"
                  value={fio}
                  onChange={e => {
                    setFio(e.target.value);
                    setFioWarning(false);
                  }}
                  className={`w-full glass-input rounded-2xl px-4.5 py-3 sm:py-3.5 text-base text-white font-medium ${
                    fioWarning ? 'border-zinc-400 ring-2 ring-zinc-400/25' : ''
                  }`}
                />
                {fioWarning && (
                  <p className="text-xs text-zinc-300 mt-2 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-4 h-4 text-zinc-400 shrink-0" /> Проверьте корректность имени (формат: Имя_Фамилия)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                  Номер паспорта
                </label>
                <input
                  type="text"
                  placeholder="601226"
                  value={passport}
                  onChange={e => setPassport(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4.5 py-3 sm:py-3.5 text-base font-mono text-white font-bold"
                />
              </div>
            </div>

            {/* ROW 2: DAILY DEBT & OCR DROPZONE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-white/[0.08]">
              {/* Daily debt block */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-bold text-zinc-300 uppercase tracking-wider">
                    Суточный долг ($)
                  </label>
                  <button
                    type="button"
                    onClick={handleResetDailyDebt}
                    className="text-xs text-zinc-400 hover:text-white font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Сброс в $0</span>
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={previousDebt}
                  onChange={e => setPreviousDebt(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4.5 py-3 sm:py-3.5 text-base font-mono text-zinc-100 font-extrabold"
                />
              </div>

              {/* Compact OCR Trigger / Dropzone */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-zinc-400" />
                    Скриншот базы
                  </label>
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/15 text-xs">
                    <button
                      type="button"
                      onClick={() => setCurrentMethod('tesseract')}
                      className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${currentMethod === 'tesseract' ? 'bg-white/25 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                    >
                      OCR
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentMethod('groq')}
                      className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${currentMethod === 'groq' ? 'bg-white/25 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                    >
                      AI
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
                    }}
                    className={`flex-1 glass-input rounded-2xl px-4 py-3 text-center cursor-pointer transition-all flex items-center justify-center gap-2.5 ${
                      imagePreview ? 'border-white/40 bg-white/[0.08]' : 'hover:border-white/30'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                    />
                    <Upload className="w-4.5 h-4.5 text-zinc-300 shrink-0" />
                    <span className="text-xs sm:text-sm text-zinc-200 truncate font-semibold">
                      {imagePreview ? 'Скриншот готов' : 'Скриншот (Ctrl+V)'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyzeImage}
                    disabled={isAnalyzing || !uploadedBase64}
                    className="px-5 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-lg shadow-white/10 active:scale-95"
                  >
                    {isAnalyzing ? '...' : 'Распознать'}
                  </button>
                </div>
              </div>
            </div>

            {/* OCR PROGRESS */}
            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm text-zinc-300 font-medium">
                  <span>Сканирование базы данных...</span>
                  <span className="font-mono font-bold">{Math.round(ocrProgress)}%</span>
                </div>
                <div className="w-full bg-black/60 rounded-full h-2.5 overflow-hidden border border-white/15">
                  <div 
                    className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 h-full transition-all duration-200 shadow-md shadow-white/25" 
                    style={{ width: `${ocrProgress}%` }} 
                  />
                </div>
              </div>
            )}

            {statusMessage && (
              <p className={`text-xs sm:text-sm text-center font-semibold ${statusColor === 'red' ? 'text-rose-400' : 'text-zinc-200'}`}>
                {statusMessage}
              </p>
            )}

            {/* COLLAPSIBLE ADVANCED SETTINGS */}
            <details className="text-xs sm:text-sm group border-t border-white/[0.08] pt-4">
              <summary className="text-xs sm:text-sm text-zinc-400 hover:text-white cursor-pointer flex items-center justify-between py-1 font-bold">
                <span>Ручной ввод текста / Groq API ключ</span>
                <ChevronDown className="w-4.5 h-4.5 text-zinc-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pt-4 space-y-3.5">
                <textarea
                  rows={3}
                  value={manualText}
                  onChange={e => setManualText(e.target.value)}
                  className="w-full glass-input rounded-2xl p-4 text-xs sm:text-sm font-mono text-zinc-200 leading-relaxed"
                  placeholder="Вставьте сырой текст для парсинга..."
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => parseTextToRows(manualText)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer border border-white/10"
                  >
                    Разобрать текст
                  </button>
                  <input
                    type="text"
                    placeholder="Groq API Key (gsk_...)"
                    value={apiKey}
                    onChange={e => handleApiKeyChange(e.target.value)}
                    className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono text-zinc-300"
                  />
                </div>
              </div>
            </details>
          </section>

          {/* CARD 2: CONVICTION ARTICLES TABLE */}
          <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                  Статьи в судимости
                </h2>
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs sm:text-sm font-mono text-zinc-200 font-extrabold border border-white/10">
                  {rowCalculations.length}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddManualRow}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer border border-white/15 active:scale-95 shadow-sm"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Добавить статью</span>
              </button>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto min-h-[200px]">
              <table className="w-full text-left text-sm sm:text-base border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-white/15 text-zinc-400 uppercase tracking-wider text-xs font-bold">
                    <th className="pb-3.5 px-3 w-10 text-center"></th>
                    <th className="pb-3.5 px-3">Статья</th>
                    <th className="pb-3.5 px-3">Дата</th>
                    <th className="pb-3.5 px-3">Время</th>
                    <th className="pb-3.5 px-3 min-w-[190px]">Тяжесть</th>
                    <th className="pb-3.5 px-3 text-right">Пошлина</th>
                    <th className="pb-3.5 px-3 text-right">Статус</th>
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
                        className={`transition-colors ${row.isBlocked ? 'bg-white/[0.01]' : 'hover:bg-white/[0.03]'}`}
                      >
                        {/* DELETE */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => handleRemoveRow(row.id)}
                            className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Удалить"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>

                        {/* CODE */}
                        <td className="py-3.5 px-3">
                          <input
                            type="text"
                            value={row.code}
                            onChange={e => handleUpdateRow(row.id, 'code', e.target.value)}
                            placeholder="12.8"
                            className="glass-input rounded-xl px-3.5 py-2 text-sm sm:text-base text-white font-mono font-bold w-36"
                          />
                        </td>

                        {/* DATE */}
                        <td className="py-3.5 px-3">
                          <input
                            type="text"
                            value={row.date}
                            onChange={e => handleUpdateRow(row.id, 'date', e.target.value)}
                            placeholder="ДД.ММ.ГГГГ"
                            className="glass-input rounded-xl px-3.5 py-2 text-sm sm:text-base text-zinc-200 font-mono w-32"
                          />
                        </td>

                        {/* TIME */}
                        <td className="py-3.5 px-3">
                          <input
                            type="text"
                            value={row.time}
                            onChange={e => handleUpdateRow(row.id, 'time', e.target.value)}
                            placeholder="ЧЧ:ММ"
                            className="glass-input rounded-xl px-3.5 py-2 text-sm sm:text-base text-zinc-200 font-mono w-24"
                          />
                        </td>

                        {/* SEVERITY */}
                        <td className="py-3.5 px-3">
                          <CustomSelect
                            value={row.tyazhest}
                            onChange={val => handleUpdateRow(row.id, 'tyazhest', val)}
                            options={[
                              { value: '', label: '-- выберите --' },
                              ...Object.entries(LABELS).map(([k, v]) => ({ value: k, label: v }))
                            ]}
                            size="md"
                          />
                        </td>

                        {/* PRICE */}
                        <td className="py-3.5 px-3 text-right font-mono font-extrabold text-base sm:text-lg text-white">
                          {row.price ? `$${row.price.toLocaleString('ru-RU')}` : '—'}
                        </td>

                        {/* STATUS */}
                        <td className="py-3.5 px-3 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                            row.isBlocked 
                              ? 'bg-zinc-800/70 border-white/10 text-zinc-400' 
                              : 'bg-white/10 border-white/25 text-white shadow-sm'
                          }`}>
                            {row.isBlocked ? <Clock className="w-3.5 h-3.5 text-zinc-400" /> : <Check className="w-3.5 h-3.5 text-white" />}
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
        </div>

        {/* ── RIGHT COLUMN: STICKY EXPANSIVE FINANCIAL SUMMARY & REPORT ── */}
        <div className="xl:col-span-5 xl:sticky xl:top-8 space-y-6">
          <section className="glass-panel rounded-3xl p-7 sm:p-8 space-y-6 border border-white/15 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                  Финансовый итог
                </h2>
              </div>
              <span className="text-xs sm:text-sm font-mono text-zinc-400 font-medium">Распределение</span>
            </div>

            {/* 4 STAT TILES (2x2 GRID) */}
            <div className="grid grid-cols-2 gap-4">
              {/* CURRENT PARDON */}
              <div className="glass-panel-subtle rounded-2xl p-5 border border-white/10 space-y-2 glass-card-hover">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Текущее помилование
                </span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-mono tracking-tight">
                  ${finalSum.toLocaleString('ru-RU')}
                </div>
                {rawSum > TOTAL_CAP && (
                  <p className="text-[11px] text-amber-400/90 font-bold mt-2 bg-amber-500/10 inline-block px-2 py-1 rounded">
                    Применён лимит $170k на одно дело
                  </p>
                )}
              </div>

              {/* TOTAL DAILY DEBT */}
              <div className="glass-panel-subtle rounded-2xl p-5 border border-white/10 space-y-2 glass-card-hover">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Итоговый долг
                </span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-mono tracking-tight">
                  ${totalDailyDebt.toLocaleString('ru-RU')}
                </div>
                <p className="text-xs text-zinc-500 font-mono">
                  {prevDebtNum > 0 ? `+${prevDebtNum.toLocaleString('ru-RU')}$ нач.` : 'С нуля'}
                </p>
              </div>

              {/* TREASURY */}
              <div className="glass-panel-subtle rounded-2xl p-5 border border-white/10 space-y-2 glass-card-hover">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    В казну (85%)
                  </span>
                  <Building className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-mono">
                  ${treasurySum.toLocaleString('ru-RU')}
                </div>
              </div>

              {/* OFFICER FEE */}
              <div className="glass-panel-subtle rounded-2xl p-5 border border-white/10 space-y-2 glass-card-hover">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Себе (15%)
                  </span>
                  <Award className="w-4 h-4 text-zinc-300" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-mono">
                  ${selfSum.toLocaleString('ru-RU')}
                </div>
              </div>
            </div>

            {/* REPORT LIVE PREVIEW */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-zinc-300 uppercase tracking-wider">
                  Отчёт для реестра
                </span>
                <span className="text-xs text-zinc-500 font-mono">Готов к отправке</span>
              </div>

              <div className="glass-input rounded-2xl p-4.5 text-xs sm:text-sm font-mono text-zinc-200 whitespace-pre-line leading-relaxed border border-white/15 select-all shadow-inner">
                {reportText}
              </div>
            </div>

            {/* BIG ACTION BUTTON (ALWAYS ACCESSIBLE AT EYE LEVEL) */}
            <button
              type="button"
              onClick={handleCopyReport}
              className="w-full h-16 py-4.5 px-8 rounded-2xl bg-gradient-to-b from-zinc-200 to-zinc-400 hover:from-white hover:to-zinc-300 text-black border-t border-white/50 font-extrabold text-base sm:text-lg shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-98"
            >
              {copiedReport ? <Check className="w-6 h-6 text-black" /> : <Copy className="w-6 h-6 text-black" />}
              <span>{copiedReport ? '✓ Отчёт скопирован!' : 'Скопировать отчёт и применить'}</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
