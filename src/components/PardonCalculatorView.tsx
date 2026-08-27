import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomSelect } from './CustomSelect';
import { extractData, extractPassport, extractName, formatName, normalizeDate } from '../lib/ocrExtractor';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Check, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Copy, 
  Eye, 
  EyeOff,
  FileSearch, 
  Clock, 
  DollarSign, 
  Building2, 
  UserCheck, 
  AlertTriangle, 
  Award, 
  ShieldCheck, 
  Zap, 
  SlidersHorizontal,
  X,
  History,
  TrendingUp,
  FileCode2,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';

export interface PardonArticleRow {
  id: string;
  code: string;
  date: string;
  time: string;
  tyazhest: string;
}

export interface TreasuryEntry {
  id: string;
  citizenName: string;
  amount: number;
  date: string;
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

const QUICK_ARTICLES = [
  { code: '12.8', label: '12.8 Оружие', ty: 'medium' },
  { code: '17.1', label: '17.1 Посягательство', ty: 'especially' },
  { code: '17.6', label: '17.6 Неподчинение', ty: 'medium' },
  { code: '15.6', label: '15.6 Халатность', ty: 'medium' },
  { code: '10.8', label: '10.8 Угон', ty: 'heavy' },
  { code: '6.6', label: '6.6 Убийство', ty: 'especially' },
  { code: 'чистосердечное признание', label: 'Чистосердечное', ty: 'small' },
  { code: 'побег из тюрьмы', label: 'Побег', ty: 'medium' }
];

export default function PardonCalculatorView() {
  // Citizen state
  const [fio, setFio] = useState('');
  const [passport, setPassport] = useState('');
  const [fioWarning, setFioWarning] = useState(false);

  // Treasury entries state
  const [treasuryEntries, setTreasuryEntries] = useState<TreasuryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('treasuryData');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      
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
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('treasuryData', JSON.stringify(treasuryEntries));
    } catch (e) {}
  }, [treasuryEntries]);

  // Accumulated Daily Debt state
  const [previousDebt, setPreviousDebt] = useState(() => {
    try {
      return localStorage.getItem('pardon_daily_accumulated_debt') || '0';
    } catch {
      return '0';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pardon_daily_accumulated_debt', previousDebt);
    } catch (e) {}
  }, [previousDebt]);

  // Rows and Articles state
  const [rows, setRows] = useState<PardonArticleRow[]>([]);
  const [rowSeq, setRowSeq] = useState(1);
  const [severityDict, setSeverityDict] = useState<Record<string, string>>({
    ...SEED_SEVERITY,
    'чистосердечное признание': 'small',
    'побег из тюрьмы': 'medium'
  });

  // OCR and AI state
  const [currentMethod, setCurrentMethod] = useState<'tesseract' | 'groq'>('tesseract');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedMime, setUploadedMime] = useState<string>('image/png');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusColor, setStatusColor] = useState<'normal' | 'green' | 'red'>('normal');
  const [manualText, setManualText] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [debugLogText, setDebugLogText] = useState('');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tesseractWorkerRef = useRef<any>(null);

  const notifyToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === msg ? null : prev));
    }, 3200);
  };

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    try { localStorage.setItem('groq_api_key', val.trim()); } catch (e) {}
  };

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
      setStatusMessage(`Файл «${file.name}» готов к сканированию.`);
      setStatusColor('normal');
      notifyToast('Скриншот загружен! Нажмите «Распознать»', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Clipboard Paste listener
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

  // Preprocessing Canvas for High-Contrast Clean OCR
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

        // Mask out top 7.5% HUD watermark overlay
        ctx.fillStyle = '#090b10';
        ctx.fillRect(0, 0, canvas.width, Math.round(canvas.height * 0.075));

        if (isTesseract) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            let gray = 0.299 * r + 0.587 * g + 0.114 * b;
            gray = 255 - gray;

            const contrast = 128;
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
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

  const cleanOcrText = (text: string) => {
    const lines = text.split('\n');
    const cleaned: string[] = [];
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
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

  // OCR Tesseract execution
  const doTesseractOCR = async (): Promise<string | null> => {
    if (!uploadedBase64) {
      setStatusMessage('Загрузите или вставьте скриншот');
      setStatusColor('red');
      return null;
    }

    try {
      await loadTesseractScript();
    } catch (e) {
      setStatusMessage('Ошибка загрузки Tesseract.js');
      setStatusColor('red');
      return null;
    }

    const Tesseract = (window as any).Tesseract;
    setOcrProgress(15);
    setStatusMessage('Инициализация движка сканирования...');

    try {
      if (!tesseractWorkerRef.current) {
        setOcrProgress(35);
        tesseractWorkerRef.current = await Tesseract.createWorker('rus+eng', 1, {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(35 + m.progress * 55));
            }
          }
        });
        await tesseractWorkerRef.current.setParameters({
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789 _-.,:;#№/|',
          tessedit_pageseg_mode: '3',
        });
      }

      setStatusMessage('Обработка контраста и скрытие оверлея...');
      const rawDataUrl = `data:${uploadedMime};base64,${uploadedBase64}`;
      const preprocessedUrl = await preprocessCanvasForOcr(rawDataUrl, true);

      setStatusMessage('Считывание текста базы данных...');
      const result = await tesseractWorkerRef.current.recognize(preprocessedUrl);
      setOcrProgress(100);

      let text = result.data.text.trim();
      if (!text) {
        setStatusMessage('Текст не распознан. Попробуйте более четкий снимок');
        setStatusColor('red');
        return null;
      }

      text = cleanOcrText(text);
      setManualText(text);
      setStatusMessage('Распознавание успешно выполнено');
      setStatusColor('green');
      return text;
    } catch (err: any) {
      console.error('Tesseract error:', err);
      setStatusMessage(`Ошибка сканирования: ${err.message || err}`);
      setStatusColor('red');
      return null;
    }
  };

  // Groq AI Vision Execution
  const doGroqAnalysis = async (): Promise<string | null> => {
    if (!apiKey.trim()) {
      setStatusMessage('Требуется ввести Groq API Key в настройках');
      setStatusColor('red');
      setIsSettingsOpen(true);
      return null;
    }
    if (!uploadedBase64) {
      setStatusMessage('Загрузите или вставьте скриншот');
      setStatusColor('red');
      return null;
    }

    setStatusMessage('Передача скриншота в Llama Vision AI...');
    setOcrProgress(40);

    const rawDataUrl = `data:${uploadedMime};base64,${uploadedBase64}`;
    const preprocessedUrl = await preprocessCanvasForOcr(rawDataUrl, false);

    const prompt = `Ты высокоточный эксперт по анализу судебных документов базы данных правонарушителей (database.gov / GTA5RP).
Внимательно изучи всё изображение базы данных. Работай медленно, думай шаг за шагом, чтобы не допустить ни единой ошибки.

КРИТИЧЕСКИЕ ПРАВИЛА ИЗВЛЕЧЕНИЯ:
1. ИМЯ И ПАСПОРТ ГРАЖДАНИНА:
   - Ищи Имя_Фамилия СТРОГО внутри карточки database.gov возле аватарки над "Паспорт #XXXXXX".
   - ЗАПРЕЩЕНО брать ники из оверлея игры (вверху справа) и имена офицеров из колонок ареста.
   - Номер паспорта находится под именем в формате "Паспорт #XXXXXX" или в поле "Номер паспорта".
   - Формат ответа имени: Имя_Фамилия.

2. СТАТЬИ И СУДИМОСТИ:
   - Извлеки время, дату и ВСЕ коды статей (например: 17.6, 12.7, 15.6, 17.1).
   - Если указано несколько статей, выведи каждую отдельной строкой.

Формат ответа СТРОГО валидный JSON без markdown блоков (\`\`\`json ... \`\`\`):
{
  "name": "Имя_Фамилия",
  "passport": "123456",
  "records": [
    {"time": "12:34", "date": "12.08.2024", "article": "17.6"}
  ]
}`;

    try {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey.trim()
        },
        body: JSON.stringify({
          model: 'llama-3.2-90b-vision-preview',
          response_format: { type: "json_object" },
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

      setOcrProgress(80);
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error?.message || `HTTP ${resp.status}`);
      }

      const raw = data.choices?.[0]?.message?.content || '';
      if (!raw.trim()) throw new Error('Пустой ответ от модели.');

      setDebugLogText(`Groq AI Vision Ответ:\n${raw}`);
      setOcrProgress(100);
      setStatusMessage('AI Vision успешно обработал снимок');
      setStatusColor('green');
      return raw;
    } catch (err: any) {
      setStatusMessage(`Ошибка Groq: ${err.message}`);
      setStatusColor('red');
      return null;
    }
  };

  const handleAnalyzeImage = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setOcrProgress(5);

    let raw: string | null = null;
    if (currentMethod === 'tesseract') {
      raw = await doTesseractOCR();
    } else {
      raw = await doGroqAnalysis();
    }

    if (!raw) {
      const fallback = currentMethod === 'tesseract' ? 'Groq Vision AI' : 'Tesseract OCR';
      setStatusMessage(`Пробую альтернативный движок (${fallback})...`);
      if (currentMethod === 'tesseract' && apiKey.trim()) {
        raw = await doGroqAnalysis();
      } else if (currentMethod === 'groq') {
        raw = await doTesseractOCR();
      }
    }

    if (raw) {
      let rawTrimmed = raw.trim();
      // In case the model still outputs markdown
      if (rawTrimmed.startsWith('```json')) {
        rawTrimmed = rawTrimmed.replace(/^```json/, '').replace(/```$/, '').trim();
      }

      setManualText(rawTrimmed);
      
      if (rawTrimmed.startsWith('{')) {
        try {
          const data = JSON.parse(rawTrimmed);
          if (data.name) setFio(data.name);
          if (data.passport) setPassport(data.passport);
          setFioWarning(!data.name || data.name.length < 4);
          
          const newRows: PardonArticleRow[] = [];
          let currentSeq = rowSeq;
          const seen = new Set<string>();
          
          (data.records || []).forEach((rec: any) => {
            const article = String(rec.article).trim();
            const date = normalizeDateStr(String(rec.date).trim());
            const time = String(rec.time).trim();
            
            const key = normKey(article) + '|' + date + '|' + time;
            if (seen.has(key)) return;
            seen.add(key);
            
            let ty = 'medium';
            const special = fuzzyMatchSpecial(normKey(article));
            if (special) {
               ty = special.tyazhest;
            } else {
               ty = severityDict[normKey(article)] || SEED_SEVERITY[article] || 'medium';
            }
            
            newRows.push({
              id: `r-${currentSeq++}`,
              code: special ? special.display : article,
              date: date,
              time: time,
              tyazhest: ty
            });
          });
          setRowSeq(currentSeq);
          setRows(newRows);
          notifyToast(`Успешно извлечено (AI)`, 'success');
          setIsAnalyzing(false);
          return;
        } catch(e) {
          console.error("JSON parse error from Groq", e);
        }
      }

      parseTextToRows(rawTrimmed);
    }

    setIsAnalyzing(false);
  };

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

  // Robust Text Parsing
  const parseTextToRows = (rawText: string) => {
    const { name: foundName, passport: foundPass } = extractData(rawText);

    if (foundName) setFio(foundName);
    if (foundPass) setPassport(foundPass);
    setFioWarning(!foundName || foundName.length < 4);

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
    notifyToast(`Найдено статей: ${newParsedRows.length}`, 'success');
  };

  // Row Manipulation
  const handleAddManualRow = () => {
    const newId = `r-${rowSeq}`;
    setRowSeq(prev => prev + 1);
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    setRows(prev => [...prev, { 
      id: newId, 
      code: '', 
      date: `${dd}.${mm}.${yyyy}`, 
      time: `${hh}:${min}`, 
      tyazhest: 'medium' 
    }]);
  };

  const handleQuickAddArticle = (preset: { code: string; label: string; ty: string }) => {
    const newId = `r-${rowSeq}`;
    setRowSeq(prev => prev + 1);
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    const displayCode = SPECIAL_ENTRIES[preset.code]?.display || preset.code;

    setRows(prev => [...prev, {
      id: newId,
      code: displayCode,
      date: `${dd}.${mm}.${yyyy}`,
      time: `${hh}:${min}`,
      tyazhest: preset.ty
    }]);
    notifyToast(`Добавлена статья ${displayCode}`, 'info');
  };

  const handleRemoveRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

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
          updated.tyazhest = severityDict[norm] || SEED_SEVERITY[value] || updated.tyazhest || 'medium';
        }
      }
      if (field === 'tyazhest' && updated.code) {
        setSeverityDict(dict => ({ ...dict, [normKey(updated.code)]: value }));
      }
      return updated;
    }));
  };

  const setRowTimeToNow = (id: string) => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      return { ...r, date: `${dd}.${mm}.${yyyy}`, time: `${hh}:${min}` };
    }));
  };

  // Calculations
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
      statusText = 'тяжесть?';
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
  const treasurySum = Math.round(totalDailyDebt * 0.80);
  const selfSum = totalDailyDebt - treasurySum;

  const reportText = `Имя Фамилия | Номер паспорта: ${fio.trim() || '—'} | ${passport.trim() || '—'}
Сумма помилования: ${finalSum.toLocaleString('ru-RU')}$
Общая сумма за сутки долга: ${totalDailyDebt.toLocaleString('ru-RU')}$
Вид снятия судимости: Помилование`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportText).then(() => {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);

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

      // Clean citizen fields
      setFio('');
      setPassport('');
      setRows([]);
      setImagePreview(null);
      setUploadedBase64(null);
      setManualText('');
      notifyToast('Отчёт скопирован, данные внесены в казну!', 'success');
    });
  };

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

  const totalTreasuryAll = treasuryEntries.reduce((sum, e) => sum + e.amount, 0);
  const treasuryAmount80 = Math.round(totalTreasuryAll * 0.80);

  const handleCopyTreasuryReport = () => {
    const dateStr = getTreasuryDateString();
    const fmtTotal = totalTreasuryAll.toLocaleString('ru-RU').replace(/\s/g, '.');
    const fmtTreasury = treasuryAmount80.toLocaleString('ru-RU').replace(/\s/g, '.');
    
    const text = `Помилований на ${fmtTotal}$ | ${dateStr}\nНа казне ${fmtTreasury}$`;
    navigator.clipboard.writeText(text);
    notifyToast('Отчёт для казны скопирован!', 'success');
  };

  const handleClearTreasury = () => {
    if (window.confirm('Очистить весь реестр казны?')) {
      setTreasuryEntries([]);
      notifyToast('Реестр казны очищен', 'info');
    }
  };

  const handleResetDailyDebt = () => {
    setPreviousDebt('0');
    try {
      localStorage.setItem('pardon_daily_accumulated_debt', '0');
    } catch (e) {}
    notifyToast('Суточный долг сброшен в $0', 'info');
  };

  const handleResetAll = () => {
    setFio('');
    setPassport('');
    setPreviousDebt('0');
    setRows([]);
    setImagePreview(null);
    setUploadedBase64(null);
    setManualText('');
    notifyToast('Все поля очищены', 'info');
  };

  return (
    <div className="w-full space-y-6">
      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0f1422]/95 border border-white/15 shadow-2xl backdrop-blur-2xl text-xs font-bold tracking-wide text-white"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP LUXURY HEADER ── */}
      <header className="glass-card p-4 sm:p-5 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Brand & Emblem */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  SA-GOV
                </h1>
                <span className="text-[10px] font-bold font-mono tracking-widest text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  PARDON REGISTRY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Калькулятор пошлин и реестр помилований штата San Andreas</p>
            </div>
          </div>

          {/* Center Info Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-medium text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow shadow-[0_0_8px_#34d399]" />
            <span>База данных активна</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-slate-300">Ctrl+V для вставки фото</span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="btn-luxury-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              title="Настройки API и OCR"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Настройки</span>
            </button>

            <button
              onClick={handleResetAll}
              className="btn-luxury-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-300 cursor-pointer"
              title="Очистить все поля"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Сбросить</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MASTER 2-COLUMN WORKSPACE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ═══════════════════════════════════════════════════════
            LEFT COLUMN: CITIZEN DOSSIER & ARTICLES REGISTRY (7/12)
            ═══════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. CITIZEN DOSSIER & SMART OCR SCANNER */}
          <section className="glass-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-200">
                  Досье гражданина
                </h2>
              </div>

              {/* Engine switcher toggle */}
              <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-white/10 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setCurrentMethod('tesseract')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    currentMethod === 'tesseract' 
                      ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  OCR Scan
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMethod('groq')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    currentMethod === 'groq' 
                      ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>AI Vision</span>
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name & Surname */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">
                  Имя Фамилия
                </label>
                <input
                  type="text"
                  placeholder="Danek_Fillin"
                  value={fio}
                  onChange={e => {
                    setFio(e.target.value);
                    setFioWarning(false);
                  }}
                  className={`w-full luxury-input rounded-xl px-3.5 py-2.5 text-sm font-medium placeholder:text-slate-600 ${
                    fioWarning ? 'border-amber-500/50 ring-2 ring-amber-500/20' : ''
                  }`}
                />
                {fioWarning && (
                  <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Проверьте формат Имя_Фамилия
                  </p>
                )}
              </div>

              {/* Passport */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">
                  Номер паспорта
                </label>
                <input
                  type="text"
                  placeholder="601226"
                  value={passport}
                  onChange={e => setPassport(e.target.value)}
                  className="w-full luxury-input rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-indigo-200 placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Daily Debt & Screenshot Area */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              
              {/* Daily Debt (5 cols) */}
              <div className="sm:col-span-5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    <span>Суточный долг</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleResetDailyDebt}
                    className="text-[10px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                    title="Сбросить в 0"
                  >
                    <span>Сброс</span>
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={previousDebt}
                  onChange={e => setPreviousDebt(e.target.value)}
                  className="w-full luxury-input rounded-xl px-3.5 py-2.5 text-sm font-mono font-black text-slate-100 placeholder:text-slate-600"
                />
              </div>

              {/* OCR Dropzone & Action Button (7 cols) */}
              <div className="sm:col-span-7 flex gap-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
                  }}
                  className={`flex-1 luxury-input rounded-xl px-3 py-2.5 cursor-pointer flex items-center justify-center gap-2 transition-all ${
                    imagePreview ? 'border-emerald-500/40 bg-emerald-500/10' : 'hover:border-white/25'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                  />
                  <Upload className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-300 truncate">
                    {imagePreview ? 'Снимок готов' : 'Загрузить / Ctrl+V'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyzeImage}
                  disabled={isAnalyzing || !uploadedBase64}
                  className="btn-luxury-accent px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                >
                  {isAnalyzing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>{isAnalyzing ? `${Math.round(ocrProgress)}%` : 'Распознать'}</span>
                </button>
              </div>
            </div>

            {/* OCR Progress bar */}
            {isAnalyzing && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span>{statusMessage || 'Сканирование...'}</span>
                  <span className="font-mono font-bold text-emerald-300">{Math.round(ocrProgress)}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 h-full transition-all duration-200" 
                    style={{ width: `${ocrProgress}%` }} 
                  />
                </div>
              </div>
            )}

            {!isAnalyzing && statusMessage && (
              <p className={`text-xs text-center font-medium ${statusColor === 'red' ? 'text-rose-400' : 'text-slate-400'}`}>
                {statusMessage}
              </p>
            )}
          </section>

          {/* 2. ARTICLES REGISTRY & QUICK SHORTCUTS */}
          <section className="glass-card p-5 sm:p-6 space-y-4">
            
            {/* Header with Title and Add Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-200">
                  Статьи и судимости
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[11px] font-mono font-bold text-slate-300">
                  {rowCalculations.length}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddManualRow}
                className="btn-luxury-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Добавить статью</span>
              </button>
            </div>

            {/* Quick Article Preset Tags */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                Быстрое добавление:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ARTICLES.map(preset => (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => handleQuickAddArticle(preset)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/20 text-slate-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3 h-3 text-slate-500" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Articles Table */}
            <div className="overflow-x-auto scrollbar-hide pt-2">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <th className="pb-2.5 px-2 w-8"></th>
                    <th className="pb-2.5 px-2">Статья</th>
                    <th className="pb-2.5 px-2">Дата</th>
                    <th className="pb-2.5 px-2">Время</th>
                    <th className="pb-2.5 px-2 min-w-[150px]">Тяжесть</th>
                    <th className="pb-2.5 px-2 text-right">Пошлина</th>
                    <th className="pb-2.5 px-2 text-right">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {rowCalculations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 text-xs italic">
                        <div className="max-w-xs mx-auto space-y-2">
                          <FileSearch className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                          <p>Нет добавленных статей. Загрузите скриншот или воспользуйтесь быстрыми тегами выше.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rowCalculations.map(row => (
                      <tr 
                        key={row.id} 
                        className={`transition-colors duration-150 ${row.isBlocked ? 'bg-white/[0.01]' : 'hover:bg-white/[0.02]'}`}
                      >
                        {/* Delete */}
                        <td className="py-2.5 px-2 text-center w-8">
                          <button
                            onClick={() => handleRemoveRow(row.id)}
                            className="p-1 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Удалить строку"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>

                        {/* Article code */}
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={row.code}
                            onChange={e => handleUpdateRow(row.id, 'code', e.target.value)}
                            placeholder="12.8"
                            className="luxury-input rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-100 w-full max-w-[100px] placeholder:text-slate-600"
                          />
                        </td>

                        {/* Date */}
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={row.date}
                            onChange={e => handleUpdateRow(row.id, 'date', e.target.value)}
                            placeholder="ДД.ММ.ГГГГ"
                            className="luxury-input rounded-lg px-2 py-1 text-xs font-mono text-slate-300 w-full max-w-[95px] placeholder:text-slate-600"
                          />
                        </td>

                        {/* Time with Quick 'Now' */}
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={row.time}
                              onChange={e => handleUpdateRow(row.id, 'time', e.target.value)}
                              placeholder="ЧЧ:ММ"
                              className="luxury-input rounded-lg px-2 py-1 text-xs font-mono text-slate-300 w-full max-w-[65px] placeholder:text-slate-600"
                            />
                            <button
                              type="button"
                              onClick={() => setRowTimeToNow(row.id)}
                              className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 cursor-pointer"
                              title="Текущее время"
                            >
                              <Clock className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Severity Select */}
                        <td className="py-2.5 px-2">
                          <CustomSelect
                            value={row.tyazhest}
                            onChange={val => handleUpdateRow(row.id, 'tyazhest', val)}
                            options={[
                              { value: '', label: '— выбрать —' },
                              ...Object.entries(LABELS).map(([k, v]) => ({ value: k, label: v }))
                            ]}
                            size="sm"
                          />
                        </td>

                        {/* Price */}
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-xs text-slate-100 tabular-nums">
                          {row.price ? `$${row.price.toLocaleString('ru-RU')}` : '—'}
                        </td>

                        {/* Status Badge */}
                        <td className="py-2.5 px-2 text-right whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            row.isBlocked 
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' 
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                          }`}>
                            {row.isBlocked ? <Clock className="w-2.5 h-2.5" /> : <Check className="w-2.5 h-2.5" />}
                            <span>{row.statusText}</span>
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

        {/* ═══════════════════════════════════════════════════════
            RIGHT COLUMN: FINANCIAL HERO & OUTPUT COMMAND (5/12)
            ═══════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">

          {/* 1. FINANCIAL SUMMARY HERO CARD */}
          <section className="glass-card p-5 sm:p-6 space-y-5 relative overflow-hidden border-emerald-500/20 shadow-[0_0_40px_rgba(99,102,241,0.08)]">
            
            {/* Top glowing ambient line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-200">
                  Финансовый расчёт
                </h2>
              </div>
              
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-400 border border-white/10">
                Калькуляция
              </span>
            </div>

            {/* HERO STAT TILES */}
            <div className="space-y-3">
              
              {/* Pardon Sum (Main Highlight) */}
              <div className="glass-card-subtle p-4 rounded-2xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Сумма помилования
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight tabular-nums mt-1">
                      ${finalSum.toLocaleString('ru-RU')}
                    </div>
                  </div>
                  <Award className="w-6 h-6 text-emerald-400/60 shrink-0" />
                </div>

                {rawSum > TOTAL_CAP && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] font-bold text-amber-300">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Лимит $170k применён (без лимита: ${rawSum.toLocaleString('ru-RU')})</span>
                  </div>
                )}
              </div>

              {/* Total Daily Debt */}
              <div className="glass-card-subtle p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Итоговый суточный долг
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono tracking-tight tabular-nums mt-0.5">
                    ${totalDailyDebt.toLocaleString('ru-RU')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 block">Предыдущий</span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {prevDebtNum > 0 ? `+$${prevDebtNum.toLocaleString('ru-RU')}` : '$0'}
                  </span>
                </div>
              </div>

              {/* Split Bar & 2 Sub-tiles (80% / 20%) */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-emerald-300 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Казна 80% (${treasurySum.toLocaleString('ru-RU')})
                  </span>
                  <span className="text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Себе 20% (${selfSum.toLocaleString('ru-RU')})
                  </span>
                </div>
                
                {/* Visual Ratio Bar */}
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex border border-white/5">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full" style={{ width: '80%' }} />
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>

            {/* DOCUMENT TERMINAL / OFFICIAL REPORT */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span className="uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
                  Готовый документ
                </span>
                <span className="text-[10px] font-mono text-emerald-400">готово к отправке</span>
              </div>

              <div className="document-terminal p-3.5 rounded-xl font-mono text-xs text-slate-300 whitespace-pre-line leading-relaxed select-all">
                {reportText}
              </div>
            </div>

            {/* MASTER GRAND CTA BUTTON */}
            <button
              type="button"
              onClick={handleCopyReport}
              className="btn-hero-cta w-full py-3.5 px-5 rounded-xl flex items-center justify-center gap-2.5 text-sm cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.25)]"
            >
              {copiedReport ? (
                <>
                  <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                  <span>Скопировано и применено!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Скопировать и применить</span>
                </>
              )}
            </button>
          </section>

          {/* 2. TREASURY JOURNAL CARD */}
          <section className="glass-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <History className="w-4 h-4" />
                </div>
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-200">
                  Журнал казны
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[11px] font-mono font-bold text-slate-300">
                {treasuryEntries.length} записей
              </span>
            </div>

            {/* Scrollable entries */}
            <div className="space-y-1.5 max-h-44 overflow-y-auto scrollbar-hide pr-1">
              {treasuryEntries.length === 0 ? (
                <div className="text-xs text-slate-500 italic text-center py-4">
                  Реестр казны пуст
                </div>
              ) : (
                treasuryEntries.map(entry => (
                  <div 
                    key={entry.id}
                    className="flex items-center justify-between px-3 py-2 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/[0.05] transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-200">{entry.citizenName}</span>
                      <span className="text-[10px] font-mono text-slate-500">{entry.date}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                        ${entry.amount.toLocaleString('ru-RU')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTreasuryEntries(prev => prev.filter(e => e.id !== entry.id))}
                        className="text-slate-600 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Treasury Preview & Copy */}
            <div className="document-terminal p-3 rounded-xl font-mono text-xs text-slate-300 whitespace-pre-line leading-relaxed select-all">
              {`Помилований на ${totalTreasuryAll.toLocaleString('ru-RU').replace(/\s/g, '.')}$ | ${getTreasuryDateString()}\nНа казне ${treasuryAmount85.toLocaleString('ru-RU').replace(/\s/g, '.')}$`}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyTreasuryReport}
                className="btn-luxury-ghost py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Отчёт казны</span>
              </button>

              <button
                type="button"
                onClick={handleClearTreasury}
                className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Очистить</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* ── SETTINGS & DEBUG MODAL ── */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="glass-card w-full max-w-lg p-6 space-y-5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Настройки сервиса
                  </h3>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Groq API Key */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Groq Cloud API Key (Llama 3.2 Vision)
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="gsk_..."
                      value={apiKey}
                      onChange={e => handleApiKeyChange(e.target.value)}
                      className="w-full luxury-input rounded-xl px-3.5 py-2.5 font-mono text-slate-200 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Ключ сохраняется локально в вашем браузере.
                  </p>
                </div>

                {/* Manual Text Parser */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Сырой текст для ручного разбора
                  </label>
                  <textarea
                    rows={4}
                    value={manualText}
                    onChange={e => setManualText(e.target.value)}
                    className="w-full luxury-input rounded-xl p-3 font-mono text-xs text-slate-300 leading-relaxed"
                    placeholder="Вставьте сырой текст базы данных..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      parseTextToRows(manualText);
                      setIsSettingsOpen(false);
                    }}
                    className="btn-luxury-accent w-full py-2.5 rounded-xl font-bold cursor-pointer"
                  >
                    Разобрать текст
                  </button>
                </div>

                {/* Debug Output */}
                {debugLogText && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Логи ответа AI:
                    </span>
                    <div className="p-2.5 rounded-xl bg-black/60 font-mono text-[10px] text-slate-400 max-h-32 overflow-y-auto">
                      {debugLogText}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
