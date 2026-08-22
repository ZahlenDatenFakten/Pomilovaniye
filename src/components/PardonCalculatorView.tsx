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
  Sliders,
  Settings
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

export interface TreasuryEntry {
  id: string;
  citizenName: string;
  amount: number;
  date: string;
}

export default function PardonCalculatorView() {
  const [fio, setFio] = useState('');
  const [passport, setPassport] = useState('');
  const [fioWarning, setFioWarning] = useState(false);

  const [treasuryEntries, setTreasuryEntries] = useState<TreasuryEntry[]>(() => {
    const saved = localStorage.getItem('treasuryData');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
    
    // Backfill from legacy accumulated debt if treasury is empty
    const legacyDebtStr = localStorage.getItem('pardon_daily_accumulated_debt');
    if (legacyDebtStr) {
      const legacyDebt = parseInt(legacyDebtStr, 10);
      if (!isNaN(legacyDebt) && legacyDebt > 0) {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        return [{
          id: 'legacy-backfill',
          citizenName: 'Прошлые помилования (Синхронизация)',
          amount: legacyDebt,
          date: `${dd}.${mm}.${yyyy}`
        }];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('treasuryData', JSON.stringify(treasuryEntries));
  }, [treasuryEntries]);

  const [previousDebt, setPreviousDebt] = useState(() => {
    try {
      return localStorage.getItem('pardon_daily_accumulated_debt') || '0';
    } catch {
      return '0';
    }
  });

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


  const getTreasuryDateString = () => {
    const dates = Array.from(new Set(treasuryEntries.map(e => e.date)));
    if (dates.length === 0) return '';
    if (dates.length === 1) return dates[0];
    const sorted = dates.sort((a,b) => {
      const [d1,m1,y1] = a.split('.');
      const [d2,m2,y2] = b.split('.');
      return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
    });
    return `${sorted[0]} - ${sorted[sorted.length - 1]}`;
  };

  const handleCopyTreasuryReport = () => {
    const totalAmount = treasuryEntries.reduce((sum, e) => sum + e.amount, 0);
    const treasuryAmount = totalAmount * 0.85;
    const dateStr = getTreasuryDateString();
    
    const fmtTotal = totalAmount.toLocaleString('ru-RU').replace(/\s/g, '.');
    const fmtTreasury = treasuryAmount.toLocaleString('ru-RU').replace(/\s/g, '.');
    
    const text = `Помилований на ${fmtTotal}$ | ${dateStr}\nНа казне ${fmtTreasury}$`;
    navigator.clipboard.writeText(text);
    notifyToast('Итоговый отчет скопирован!', 'success');
  };

  const handleClearTreasury = () => {
    if (window.confirm('Вы уверены, что хотите очистить отчет для казны?')) {
      setTreasuryEntries([]);
      notifyToast('Казна очищена', 'success');
    }
  };

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
    const BLOCKED_WORDS = new Set([
      'database', 'gov', 'gta5', 'gta', 'rp', 'lspd', 'fbi', 'fib', 'usss', 'sasp', 'shpd', 'lscsd',
      'redwood', 'jorno', 'vegas', 'police', 'sheriff', 'government', 'san', 'andreas',
      'следственный', 'изолятор', 'паспорт', 'гражданин', 'досье', 'база', 'данных',
      'правонарушителей', 'новости', 'правительство', 'правительства', 'сан', 'андреас',
      'статья', 'статьи', 'дата', 'время', 'проводил', 'арест', 'напарник',
      'розыск', 'штраф', 'наличные', 'тюрьма', 'организация', 'должность',
      'прописка', 'гражданство', 'уровень', 'мужской', 'женский', 'пол',
      'фио', 'фамилия', 'имя', 'отчество', 'surname', 'passport', 'name',
      'номер', 'телефон', 'адрес', 'дело', 'судимость', 'судимости',
      'одобрено', 'отказ', 'помилование', 'помилования', 'калькулятор',
      'реестр', 'снятие', 'вид', 'тяжесть', 'пошлина', 'сумма',
      'кнопка', 'добавить', 'удалить', 'очистить', 'копировать', 'отчет', 'отчёт',
      'казна', 'казне', 'итог', 'итоговый', 'финансовый', 'распределение',
      'текущее', 'долг', 'лимит', 'применить',
      'id', 'lvl', 'age', 'level'
    ]);

    const isCitizenName = (candidate: string): boolean => {
      if (!candidate) return false;
      const clean = candidate.trim().replace(/[\s\.]+/g, '_');
      if (clean.length < 4) return false;
      if (!/[a-zA-Zа-яА-ЯёЁ]/.test(clean)) return false;

      // Must have exactly 2 parts (Имя_Фамилия)
      const parts = clean.split('_').filter(Boolean);
      if (parts.length < 2) return false;

      // Check EVERY part against the blocklist individually
      for (const part of parts) {
        const normPart = part.toLowerCase();
        if (BLOCKED_WORDS.has(normPart)) return false;
        // Reject parts that are pure digits
        if (/^\d+$/.test(part)) return false;
        // Reject parts shorter than 2 characters
        if (part.length < 2) return false;
        // Reject parts that look like article codes (e.g. "12", "17.1")
        if (/^\d+[.,]\d+$/.test(part)) return false;
      }

      const norm = clean.toLowerCase();
      if (arrestingOfficers.has(norm)) return false;
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

      // Add to Treasury
      if (finalSum > 0) {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        const dateStr = `${dd}.${mm}.${yyyy}`;
        
        const newEntry: TreasuryEntry = {
          id: Date.now().toString(),
          citizenName: fio.trim() || 'Неизвестный',
          amount: finalSum,
          date: dateStr
        };
        setTreasuryEntries(prev => [...prev, newEntry]);
      }

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
    <div className="flex h-screen w-full bg-black text-zinc-300 overflow-hidden font-sans selection:bg-white/20">
      
      {/* ── TOAST NOTIFICATIONS ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-lg bg-zinc-900 border border-white/10 shadow-2xl text-xs sm:text-sm font-medium text-white"
          >
            {toast.type === 'success' && <Check className="w-4 h-4 text-white shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Award className="w-4 h-4 text-zinc-400 shrink-0" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LEFT SIDEBAR: TREASURY ── */}
      <aside className="w-72 xl:w-80 flex-shrink-0 border-r border-white/10 bg-[#09090b] flex flex-col z-20">
        {/* App Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-md bg-white text-black flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-tight">Помилования</h1>
            <p className="text-[10px] text-zinc-500 font-mono">SA-GOV TERMINAL</p>
          </div>
        </div>

        {/* Treasury Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 pb-2 flex items-center justify-between">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4" />
              Казна
            </h2>
            <span className="text-[10px] font-mono bg-white/10 text-white px-2 py-0.5 rounded">
              {treasuryEntries.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2 space-y-2 scrollbar-hide">
            {treasuryEntries.length === 0 ? (
              <div className="text-xs text-zinc-600 italic text-center py-8">История пуста</div>
            ) : (
              treasuryEntries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-md border border-white/[0.04] hover:border-white/10 transition-colors group">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-200">{entry.citizenName}</span>
                    <span className="text-[10px] text-zinc-600 font-mono">{entry.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-white tabular-nums">${entry.amount.toLocaleString('ru-RU')}</span>
                    <button onClick={() => setTreasuryEntries(prev => prev.filter(e => e.id !== entry.id))} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Treasury Footer Controls */}
          <div className="p-6 border-t border-white/10 space-y-4">
            <div className="text-xs text-zinc-500 font-mono whitespace-pre-line leading-relaxed p-3 bg-black rounded-md border border-white/5 select-all">
              {`Помилований на ${treasuryEntries.reduce((sum, e) => sum + e.amount, 0).toLocaleString('ru-RU').replace(/\s/g, '.')}$ | ${getTreasuryDateString()}\nНа казне ${(treasuryEntries.reduce((sum, e) => sum + e.amount, 0) * 0.85).toLocaleString('ru-RU').replace(/\s/g, '.')}$`}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyTreasuryReport}
                className="btn-secondary w-full py-2 px-3 rounded-md text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Скопировать
              </button>
              <button
                type="button"
                onClick={handleClearTreasury}
                className="btn-danger w-full py-2 px-3 rounded-md border border-red-500/20 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Очистить
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-black">
        
        {/* Top Actions Bar */}
        <div className="h-16 px-8 flex items-center justify-end gap-4 border-b border-white/10 bg-[#09090b]/50">
           <details className="relative group text-xs">
              <summary className="text-zinc-400 hover:text-white cursor-pointer flex items-center gap-1.5 font-medium list-none">
                <Settings className="w-4 h-4" />
                Настройки
              </summary>
              <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl p-4 z-50">
                <div className="space-y-3">
                  <textarea
                    rows={3}
                    value={manualText}
                    onChange={e => setManualText(e.target.value)}
                    className="w-full app-input rounded-md p-2.5 font-mono text-xs text-zinc-300 resize-none"
                    placeholder="Вставьте сырой текст для парсинга..."
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => parseTextToRows(manualText)}
                      className="btn-secondary px-3 py-2 rounded-md font-medium cursor-pointer"
                    >
                      Разобрать
                    </button>
                    <input
                      type="text"
                      placeholder="Groq API (gsk_...)"
                      value={apiKey}
                      onChange={e => handleApiKeyChange(e.target.value)}
                      className="flex-1 app-input rounded-md px-3 py-2 font-mono"
                    />
                  </div>
                </div>
              </div>
            </details>

            <button
              onClick={handleResetAll}
              className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer text-zinc-400"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Очистить всё
            </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 pb-40 scrollbar-hide space-y-10">
          
          {/* SECTION 1: CITIZEN INPUTS */}
          <section className="max-w-4xl mx-auto space-y-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Данные гражданина</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" /> Имя Фамилия
                </label>
                <input
                  type="text"
                  placeholder="Name_Surname"
                  value={fio}
                  onChange={e => { setFio(e.target.value); setFioWarning(false); }}
                  className={`w-full app-input rounded-md px-4 py-3 text-sm font-medium ${fioWarning ? 'border-red-500/50' : ''}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Паспорт
                </label>
                <input
                  type="text"
                  placeholder="601226"
                  value={passport}
                  onChange={e => setPassport(e.target.value)}
                  className="w-full app-input rounded-md px-4 py-3 text-sm font-mono font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Долг за сутки
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={previousDebt}
                  onChange={e => setPreviousDebt(e.target.value)}
                  className="w-full app-input rounded-md px-4 py-3 text-sm font-mono font-medium text-white"
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: OCR SCANNER */}
          <section className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Скриншот базы</h3>
              <div className="flex bg-zinc-900 rounded-md p-0.5 border border-white/5">
                <button
                  type="button"
                  onClick={() => setCurrentMethod('tesseract')}
                  className={`px-3 py-1 text-[11px] font-medium rounded cursor-pointer ${currentMethod === 'tesseract' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
                >
                  OCR
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMethod('groq')}
                  className={`px-3 py-1 text-[11px] font-medium rounded cursor-pointer ${currentMethod === 'groq' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
                >
                  AI
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
                }}
                className={`flex-1 border border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                  imagePreview ? 'border-zinc-500 bg-zinc-900' : 'border-zinc-700 bg-black hover:border-zinc-500 hover:bg-zinc-900/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                />
                <Upload className="w-6 h-6 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-400">
                  {imagePreview ? 'Изображение загружено. Нажмите для замены.' : 'Вставьте изображение (Ctrl+V) или перетащите'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAnalyzeImage}
                disabled={isAnalyzing || !uploadedBase64}
                className="sm:w-32 py-4 rounded-lg btn-primary flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <FileSearch className="w-5 h-5" />
                <span className="text-xs">{isAnalyzing ? 'Анализ...' : 'Распознать'}</span>
              </button>
            </div>

            {/* OCR PROGRESS */}
            {isAnalyzing && (
              <div className="space-y-1.5 max-w-md mx-auto pt-2">
                <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                  <span>Обработка</span>
                  <span className="font-mono">{Math.round(ocrProgress)}%</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                  <div className="bg-white h-full transition-all duration-200" style={{ width: `${ocrProgress}%` }} />
                </div>
              </div>
            )}

            {statusMessage && (
              <p className={`text-xs text-center font-medium pt-2 ${statusColor === 'red' ? 'text-red-400' : 'text-zinc-500'}`}>
                {statusMessage}
              </p>
            )}
          </section>

          {/* SECTION 3: ARTICLES TABLE */}
          <section className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                Статьи в судимости
                <span className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono text-[10px]">{rowCalculations.length}</span>
              </h3>
              <button
                type="button"
                onClick={handleAddManualRow}
                className="btn-secondary px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Добавить
              </button>
            </div>

            <div className="w-full overflow-x-auto border border-white/10 rounded-lg bg-[#09090b]">
              <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 bg-black/50 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4 w-10"></th>
                    <th className="py-3 px-4">Ст.</th>
                    <th className="py-3 px-4">Дата</th>
                    <th className="py-3 px-4">Время</th>
                    <th className="py-3 px-4 w-48">Тяжесть</th>
                    <th className="py-3 px-4 text-right">Сумма</th>
                    <th className="py-3 px-4 text-right">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rowCalculations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-600 text-sm">Нет данных</td>
                    </tr>
                  ) : (
                    rowCalculations.map(row => (
                      <tr key={row.id} className={`${row.isBlocked ? 'opacity-40' : 'hover:bg-white/[0.02]'} transition-colors`}>
                        <td className="py-2 px-4 text-center">
                          <button onClick={() => handleRemoveRow(row.id)} className="text-zinc-600 hover:text-white cursor-pointer p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="py-2 px-4">
                          <input type="text" value={row.code} onChange={e => handleUpdateRow(row.id, 'code', e.target.value)} className="app-input rounded px-2 py-1.5 w-16 text-xs font-mono" placeholder="1.1" />
                        </td>
                        <td className="py-2 px-4">
                          <input type="text" value={row.date} onChange={e => handleUpdateRow(row.id, 'date', e.target.value)} className="app-input rounded px-2 py-1.5 w-24 text-xs font-mono" placeholder="ДД.ММ.ГГГГ" />
                        </td>
                        <td className="py-2 px-4">
                          <input type="text" value={row.time} onChange={e => handleUpdateRow(row.id, 'time', e.target.value)} className="app-input rounded px-2 py-1.5 w-16 text-xs font-mono" placeholder="ЧЧ:ММ" />
                        </td>
                        <td className="py-2 px-4">
                          <CustomSelect
                            value={row.tyazhest}
                            onChange={val => handleUpdateRow(row.id, 'tyazhest', val)}
                            options={[{ value: '', label: 'Выбрать' }, ...Object.entries(LABELS).map(([k, v]) => ({ value: k, label: v }))]}
                            size="sm"
                          />
                        </td>
                        <td className="py-2 px-4 text-right font-mono font-medium text-white tabular-nums">
                          {row.price ? `$${row.price.toLocaleString('ru-RU')}` : '—'}
                        </td>
                        <td className="py-2 px-4 text-right">
                          <span className="text-[11px] font-medium text-zinc-500 uppercase">{row.statusText}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ── FLOATING BOTTOM ACTION BAR ── */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#09090b]/90 backdrop-blur-md border-t border-white/10 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Financial Breakdown */}
            <div className="flex items-center gap-8 text-sm">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Помилование</span>
                <span className="font-mono text-xl text-white font-semibold tabular-nums">${finalSum.toLocaleString('ru-RU')}</span>
                {rawSum > TOTAL_CAP && <span className="ml-2 text-[10px] text-black bg-white px-1 py-0.5 rounded uppercase font-bold">Лимит</span>}
              </div>
              <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
              <div className="space-y-0.5 hidden sm:block">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Итог долг</span>
                <span className="font-mono text-base text-zinc-300 tabular-nums">${totalDailyDebt.toLocaleString('ru-RU')}</span>
              </div>
              <div className="w-px h-8 bg-white/10 hidden md:block"></div>
              <div className="space-y-0.5 hidden md:block">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">В казну (85%)</span>
                <span className="font-mono text-base text-zinc-400 tabular-nums">${treasurySum.toLocaleString('ru-RU')}</span>
              </div>
              <div className="w-px h-8 bg-white/10 hidden md:block"></div>
              <div className="space-y-0.5 hidden md:block">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Себе (15%)</span>
                <span className="font-mono text-base text-zinc-400 tabular-nums">${selfSum.toLocaleString('ru-RU')}</span>
              </div>
            </div>

            {/* Main Action */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Report Preview Tooltip Trigger */}
              <div className="hidden lg:block relative group">
                <button className="text-zinc-500 hover:text-white transition-colors cursor-help">
                  <FileText className="w-5 h-5" />
                </button>
                <div className="absolute bottom-full right-0 mb-4 w-80 bg-zinc-900 border border-white/10 p-4 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  <span className="text-[10px] uppercase text-zinc-500 mb-2 block font-bold">Предпросмотр отчета</span>
                  <div className="text-xs font-mono text-zinc-300 whitespace-pre-line">{reportText}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyReport}
                className="btn-primary w-full md:w-auto py-3 px-8 rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {copiedReport ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedReport ? 'Скопировано!' : 'Скопировать и применить'}
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
