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
  FileSpreadsheet,
  ArrowUpRight
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
  const [fio, setFio] = useState('');
  const [passport, setPassport] = useState('');
  const [fioWarning, setFioWarning] = useState(false);

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

  const [rows, setRows] = useState<PardonArticleRow[]>([]);
  const [rowSeq, setRowSeq] = useState(1);
  const [severityDict, setSeverityDict] = useState<Record<string, string>>({
    ...SEED_SEVERITY,
    'чистосердечное признание': 'small',
    'побег из тюрьмы': 'medium'
  });

  const [activeSideTab, setActiveSideTab] = useState<'doc' | 'treasury'>('doc');
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

  const handleImageFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedMime(file.type || 'image/png');
      setUploadedBase64(dataUrl.split(',')[1]);
      setImagePreview(dataUrl);
      setStatusMessage(`Файл «${file.name}» готов к сканированию`);
      setStatusColor('normal');
      notifyToast('Скриншот загружен! Нажмите «Распознать»', 'info');
    };
    reader.readAsDataURL(file);
  };

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

  const preprocessCanvasForOcr = (dataUrl: string, isTesseract = true): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(dataUrl); return; }
        canvas.width = Math.round(img.width * 1.5);
        canvas.height = Math.round(img.height * 1.5);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#090b10';
        ctx.fillRect(0, 0, canvas.width, Math.round(canvas.height * 0.075));
        if (isTesseract) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            let gray = 0.299 * r + 0.587 * g + 0.114 * b;
            gray = 255 - gray;
            const contrast = 128, factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            let newValue = Math.max(0, Math.min(255, factor * (gray - 128) + 128));
            data[i] = data[i + 1] = data[i + 2] = newValue;
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
      if ((window as any).Tesseract) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Не удалось загрузить OCR'));
      document.head.appendChild(script);
    });
  };

  const cleanOcrText = (text: string) => {
    return text.split('\n').map(l => l.trim()).filter(l => l && !/gta\s*5\s*rp/i.test(l) && !/database\.gov/i.test(l) && l.length > 3).join('\n');
  };

  const doTesseractOCR = async (): Promise<string | null> => {
    if (!uploadedBase64) return null;
    try { await loadTesseractScript(); } catch (e) { return null; }
    const Tesseract = (window as any).Tesseract;
    setOcrProgress(20);
    try {
      if (!tesseractWorkerRef.current) {
        tesseractWorkerRef.current = await Tesseract.createWorker('rus+eng', 1, {
          logger: (m: any) => m.status === 'recognizing text' && setOcrProgress(Math.round(35 + m.progress * 55))
        });
      }
      const preprocessedUrl = await preprocessCanvasForOcr(`data:${uploadedMime};base64,${uploadedBase64}`, true);
      const result = await tesseractWorkerRef.current.recognize(preprocessedUrl);
      setOcrProgress(100);
      const text = cleanOcrText(result.data.text);
      setManualText(text);
      setStatusMessage('Распознавание выполнено');
      setStatusColor('green');
      return text;
    } catch (err: any) {
      setStatusMessage(`Ошибка: ${err.message}`);
      setStatusColor('red');
      return null;
    }
  };

  const doGroqAnalysis = async (): Promise<string | null> => {
    if (!apiKey.trim()) { setIsSettingsOpen(true); return null; }
    if (!uploadedBase64) return null;
    setOcrProgress(40);
    const preprocessedUrl = await preprocessCanvasForOcr(`data:${uploadedMime};base64,${uploadedBase64}`, false);
    const prompt = `Ты эксперт по анализу database.gov (GTA5RP). Извлеки Имя_Фамилия, номер паспорта и список судимостей. Ответ JSON: {"name": "...", "passport": "...", "records": [{"time": "HH:MM", "date": "DD.MM.YYYY", "article": "..."}]}`;
    try {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey.trim() },
        body: JSON.stringify({
          model: 'llama-3.2-90b-vision-preview',
          response_format: { type: "json_object" },
          messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: preprocessedUrl } }] }],
          temperature: 0.1
        })
      });
      const data = await resp.json();
      const raw = data.choices?.[0]?.message?.content || '';
      setOcrProgress(100);
      return raw;
    } catch (err: any) {
      setStatusMessage(`Ошибка Groq: ${err.message}`);
      return null;
    }
  };

  const handleAnalyzeImage = async () => {
    setIsAnalyzing(true);
    let raw = currentMethod === 'tesseract' ? await doTesseractOCR() : await doGroqAnalysis();
    if (raw) {
      let rawTrimmed = raw.trim().replace(/^```json/, '').replace(/```$/, '').trim();
      setManualText(rawTrimmed);
      if (rawTrimmed.startsWith('{')) {
        try {
          const data = JSON.parse(rawTrimmed);
          if (data.name) setFio(data.name);
          if (data.passport) setPassport(data.passport);
          const newRows = (data.records || []).map((rec: any, idx: number) => {
            const article = String(rec.article).trim();
            const special = fuzzyMatchSpecial(normKey(article));
            return {
              id: `r-${rowSeq + idx}`,
              code: special ? special.display : article,
              date: normalizeDateStr(rec.date),
              time: rec.time,
              tyazhest: special ? special.tyazhest : (severityDict[normKey(article)] || 'medium')
            };
          });
          setRows(newRows);
          setRowSeq(rowSeq + newRows.length);
          notifyToast(`Найдено записей: ${newRows.length}`, 'success');
        } catch(e) { console.error(e); }
      } else {
        parseTextToRows(rawTrimmed);
      }
    }
    setIsAnalyzing(false);
  };

  const normalizeDateStr = (rawDateStr: string): string => {
    const clean = rawDateStr.replace(/[^\d.]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
    const parts = clean.split('.');
    if (parts.length >= 2) return `${parts[0].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[2] || new Date().getFullYear()}`;
    return rawDateStr;
  };

  const parseTextToRows = (rawText: string) => {
    const { name: foundName, passport: foundPass } = extractData(rawText);
    if (foundName) setFio(foundName);
    if (foundPass) setPassport(foundPass);
    const newParsedRows: PardonArticleRow[] = [];
    const lines = rawText.split('\n');
    let currentSeq = rowSeq;
    lines.forEach((line) => {
      const dtMatch = line.match(/(\d{1,2}[:;]\d{2})\s+(\d{1,2}[./-]\d{1,2})/);
      if (dtMatch) {
        const [_, time, date] = dtMatch;
        const normDate = normalizeDateStr(date);
        const tokens = line.split(/[\s\-]+/);
        tokens.forEach(t => {
           if (/^\d{1,2}\.\d{1,2}$/.test(t)) {
             newParsedRows.push({ id: `r-${currentSeq++}`, code: t, date: normDate, time, tyazhest: severityDict[normKey(t)] || 'medium' });
           }
        });
      }
    });
    setRowSeq(currentSeq);
    setRows(newParsedRows);
  };

  const handleAddManualRow = () => {
    const now = new Date();
    setRows(prev => [...prev, { 
      id: `r-${rowSeq}`, 
      code: '', 
      date: `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`, 
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, 
      tyazhest: 'medium' 
    }]);
    setRowSeq(rowSeq + 1);
  };

  const handleQuickAddArticle = (preset: { code: string; label: string; ty: string }) => {
    const now = new Date();
    setRows(prev => [...prev, {
      id: `r-${rowSeq}`,
      code: SPECIAL_ENTRIES[preset.code]?.display || preset.code,
      date: `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`,
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      tyazhest: preset.ty
    }]);
    setRowSeq(rowSeq + 1);
  };

  const handleRemoveRow = (id: string) => setRows(prev => prev.filter(r => r.id !== id));

  const handleUpdateRow = (id: string, field: keyof PardonArticleRow, value: string) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      if (field === 'code') {
        const special = fuzzyMatchSpecial(normKey(value));
        if (special) { updated.code = special.display; updated.tyazhest = special.tyazhest; }
        else updated.tyazhest = severityDict[normKey(value)] || updated.tyazhest;
      }
      return updated;
    }));
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

  let rawSum = 0;
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
        setTreasuryEntries(prev => [...prev, { 
          id: Date.now().toString(), 
          citizenName: fio.trim() || 'Неизвестный', 
          amount: finalSum, 
          date: `${dd}.${mm}.${yyyy}` 
        }]);
      }

      // 1. Update accumulated daily debt
      const newAccumulated = totalDailyDebt.toString();
      setPreviousDebt(newAccumulated);
      try {
        localStorage.setItem('pardon_daily_accumulated_debt', newAccumulated);
      } catch (e) {}

      // 2. Clear current citizen dossier and article rows for the next citizen
      setFio('');
      setPassport('');
      setRows([]);
      setImagePreview(null);
      setUploadedBase64(null);
      setManualText('');

      notifyToast('Отчёт скопирован, данные занесены в казну!', 'success');
    });
  };

  const getTreasuryDateString = () => {
    const dates = Array.from(new Set(treasuryEntries.map(e => e.date))).sort();
    return dates.length > 0 ? `${dates[0]} - ${dates[dates.length - 1]}` : '';
  };

  const totalTreasuryAll = treasuryEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const treasuryAmount80 = Math.round(totalTreasuryAll * 0.80);

  const handleCopyTreasuryReport = () => {
    const text = `Помилований на ${totalTreasuryAll.toLocaleString('ru-RU').replace(/\s/g, '.')}$ | ${getTreasuryDateString()}\nНа казне ${treasuryAmount80.toLocaleString('ru-RU').replace(/\s/g, '.')}$`;
    navigator.clipboard.writeText(text);
    notifyToast('Отчёт для казны скопирован в буфер!', 'success');
  };

  const handleClearTreasury = () => {
    if (window.confirm('Очистить весь реестр казны?')) {
      setTreasuryEntries([]);
      notifyToast('Реестр казны очищен', 'info');
    }
  };

  return (
    <div className="w-full space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-[#0E1422]/95 border border-white/15 shadow-2xl backdrop-blur-2xl text-xs font-semibold tracking-wide text-white"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="glass-card p-3.5 sm:p-4 relative overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.25)]">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black tracking-tight text-white">SA-GOV</span>
                <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">PARDON REGISTRY</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Калькуляция пошлин и реестр помилований</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow shadow-[0_0_8px_#34d399]" />
            <span className="font-medium">База данных активна</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-[11px] text-slate-400">Ctrl+V для вставки фото</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSettingsOpen(true)} className="btn-luxury-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Настройки</span>
            </button>
            <button onClick={handleResetAll} className="btn-luxury-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-300 cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Сбросить</span>
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          <section className="glass-card glass-card-hover p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-200">Досье гражданина</h2>
              </div>
              <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 text-[11px] font-bold">
                <button type="button" onClick={() => setCurrentMethod('tesseract')} className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${currentMethod === 'tesseract' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400'}`}>OCR Scan</button>
                <button type="button" onClick={() => setCurrentMethod('groq')} className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${currentMethod === 'groq' ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-black' : 'text-slate-400'}`}>
                  <Sparkles className="w-3 h-3" /> <span>AI Vision</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">Имя Фамилия</label>
                <input type="text" placeholder="Danek_Fillin" value={fio} onChange={e => setFio(e.target.value)} className="w-full luxury-input rounded-xl px-3.5 py-2.5 text-sm font-medium" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">Номер паспорта</label>
                <input type="text" placeholder="601226" value={passport} onChange={e => setPassport(e.target.value)} className="w-full luxury-input rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-emerald-300" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-400" /> <span>Суточный долг</span></label>
                  <button type="button" onClick={handleResetDailyDebt} className="text-[10px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"><span>Сброс ($0)</span></button>
                </div>
                <input type="number" min="0" placeholder="0" value={previousDebt} onChange={e => setPreviousDebt(e.target.value)} className="w-full luxury-input rounded-xl px-3.5 py-2.5 text-sm font-mono font-black text-slate-100" />
              </div>
              <div className="sm:col-span-7 flex gap-2">
                <div onClick={() => fileInputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]); }} className={`flex-1 luxury-input rounded-xl px-3 py-2.5 cursor-pointer flex items-center justify-center gap-2 transition-all ${imagePreview ? 'border-emerald-500/50 bg-emerald-500/10' : 'hover:border-white/25'}`}>
                  <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
                  <Upload className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-300 truncate">{imagePreview ? 'Снимок готов' : 'Загрузить / Вставить'}</span>
                </div>
                <button type="button" onClick={handleAnalyzeImage} disabled={isAnalyzing || !uploadedBase64} className="btn-luxury-accent px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-30">
                  {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-300" />}
                  <span>{isAnalyzing ? `${Math.round(ocrProgress)}%` : 'Распознать'}</span>
                </button>
              </div>
            </div>
            {isAnalyzing && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span>{statusMessage || 'Сканирование...'}</span>
                  <span className="font-mono font-bold text-emerald-300">{Math.round(ocrProgress)}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                  <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 h-full transition-all duration-200" style={{ width: `${ocrProgress}%` }} />
                </div>
              </div>
            )}
          </section>

          <section className="glass-card glass-card-hover p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><FileText className="w-4 h-4" /></div>
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-200">Статьи и судимости</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono font-bold text-emerald-300">{rowCalculations.length}</span>
              </div>
              <button type="button" onClick={handleAddManualRow} className="btn-luxury-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"><Plus className="w-3.5 h-3.5 text-emerald-400" /> <span>Добавить</span></button>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Быстрые теги:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ARTICLES.map(preset => (
                  <button key={preset.code} type="button" onClick={() => handleQuickAddArticle(preset)} className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.07] hover:border-emerald-500/30 text-slate-300 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"><Plus className="w-3 h-3 text-slate-500" /> <span>{preset.label}</span></button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto scrollbar-hide pt-2">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <th className="pb-2.5 px-2"></th>
                    <th className="pb-2.5 px-2">Статья</th>
                    <th className="pb-2.5 px-2">Дата</th>
                    <th className="pb-2.5 px-2">Время</th>
                    <th className="pb-2.5 px-2">Тяжесть</th>
                    <th className="pb-2.5 px-2 text-right">Пошлина</th>
                    <th className="pb-2.5 px-2 text-right">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {rowCalculations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500 text-xs">
                        <div className="max-w-xs mx-auto space-y-2 py-4"><FileSearch className="w-8 h-8 mx-auto text-slate-600 opacity-60" /> <p>Нет добавленных статей. Загрузите снимок базы данных или воспользуйтесь быстрыми тегами выше.</p></div>
                      </td>
                    </tr>
                  ) : (
                    rowCalculations.map(row => (
                      <tr key={row.id}>
                        <td className="py-2.5 px-2 w-8"><button onClick={() => handleRemoveRow(row.id)} className="p-1 rounded-lg text-slate-600 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button></td>
                        <td className="py-2.5 px-2"><input type="text" value={row.code} onChange={e => handleUpdateRow(row.id, 'code', e.target.value)} className="luxury-input rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-100 w-24" /></td>
                        <td className="py-2.5 px-2"><input type="text" value={row.date} onChange={e => handleUpdateRow(row.id, 'date', e.target.value)} className="luxury-input rounded-lg px-2 py-1 text-xs font-mono text-slate-300 w-24" /></td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-1">
                            <input type="text" value={row.time} onChange={e => handleUpdateRow(row.id, 'time', e.target.value)} className="luxury-input rounded-lg px-2 py-1 text-xs font-mono text-slate-300 w-16" />
                            <button type="button" onClick={() => setRowTimeToNow(row.id)} className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 cursor-pointer"><Clock className="w-3 h-3" /></button>
                          </div>
                        </td>
                        <td className="py-2.5 px-2"><CustomSelect value={row.tyazhest} onChange={val => handleUpdateRow(row.id, 'tyazhest', val)} options={Object.entries(LABELS).map(([k, v]) => ({ value: k, label: v }))} size="sm" /></td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-xs tabular-nums">{row.price ? `$${row.price.toLocaleString('ru-RU')}` : '—'}</td>
                        <td className="py-2.5 px-2 text-right text-[10px] font-bold text-emerald-300">{row.statusText}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          <section className="glass-hero-accent p-5 sm:p-6 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><TrendingUp className="w-4 h-4" /></div><h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-200">Финансовый расчёт</h2></div>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Живой расчёт</span>
            </div>
            <div className="space-y-3">
              <div className="glass-card-subtle p-4 rounded-2xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Сумма помилования
                    </span>
                    <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white tabular-nums mt-1">
                      ${finalSum.toLocaleString('ru-RU')}
                    </div>
                  </div>
                  <Award className="w-7 h-7 text-emerald-400/50 shrink-0" />
                </div>

                {rawSum > TOTAL_CAP && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] font-bold text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Лимит $170k применён (без лимита: ${rawSum.toLocaleString('ru-RU')})</span>
                  </div>
                )}
              </div>

              <div className="glass-card-subtle p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Итоговый суточный долг
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono tabular-nums mt-0.5">
                    ${totalDailyDebt.toLocaleString('ru-RU')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 block">Предыдущий</span>
                  <div className="text-xs font-mono font-bold text-slate-300">
                    {prevDebtNum > 0 ? `+$${prevDebtNum.toLocaleString('ru-RU')}` : '$0'}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-emerald-300 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Казна 80% (${treasurySum.toLocaleString('ru-RU')})
                  </span>
                  <span className="text-teal-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Себе 20% (${selfSum.toLocaleString('ru-RU')})
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden flex border border-white/10 p-0.5">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-l-full" style={{ width: '80%' }} />
                  <div className="bg-gradient-to-r from-teal-400 to-blue-500 h-full rounded-r-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
            <button type="button" onClick={handleCopyReport} className="btn-hero-cta w-full py-3.5 rounded-xl flex items-center justify-center gap-2.5 text-sm cursor-pointer">
              {copiedReport ? <><Check className="w-5 h-5" /> <span>Скопировано!</span></> : <><Copy className="w-5 h-5" /> <span>Скопировать и применить</span></>}
            </button>
          </section>

          <section className="glass-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setActiveSideTab('doc')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSideTab === 'doc' ? 'bg-white/10 text-white' : 'text-slate-400'}`}><FileCode2 className="w-3.5 h-3.5 text-emerald-400" /> <span>Готовый документ</span></button>
                <button type="button" onClick={() => setActiveSideTab('treasury')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSideTab === 'treasury' ? 'bg-white/10 text-white' : 'text-slate-400'}`}><History className="w-3.5 h-3.5 text-amber-400" /> <span>Журнал казны</span></button>
              </div>
            </div>
            {activeSideTab === 'doc' && (
              <div className="space-y-3">
                <div className="document-terminal p-3.5 rounded-xl font-mono text-xs text-slate-300 whitespace-pre-line leading-relaxed select-all">{reportText}</div>
                <button type="button" onClick={() => { navigator.clipboard.writeText(reportText); notifyToast('Скопировано!', 'success'); }} className="btn-luxury-ghost w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"><Copy className="w-3.5 h-3.5 text-slate-400" /> <span>Скопировать текст</span></button>
              </div>
            )}
            {activeSideTab === 'treasury' && (
              <div className="space-y-3">
                <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-hide">
                  {treasuryEntries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                      <div className="flex flex-col"><span className="text-xs font-semibold text-slate-200">{entry.citizenName}</span><span className="text-[10px] font-mono text-slate-500">{entry.date}</span></div>
                      <div className="flex items-center gap-2.5"><span className="text-xs font-mono font-bold text-emerald-400">${entry.amount.toLocaleString('ru-RU')}</span><button onClick={() => setTreasuryEntries(prev => prev.filter(e => e.id !== entry.id))} className="text-slate-600 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button></div>
                    </div>
                  ))}
                </div>
                <div className="document-terminal p-3 rounded-xl font-mono text-xs text-slate-300 whitespace-pre-line select-all">{`Помилований на ${totalTreasuryAll.toLocaleString('ru-RU').replace(/\s/g, '.')}$ | ${getTreasuryDateString()}\nНа казне ${treasuryAmount80.toLocaleString('ru-RU').replace(/\s/g, '.')}$`}</div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={handleCopyTreasuryReport} className="btn-luxury-ghost py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"><Copy className="w-3.5 h-3.5" /> <span>Отчёт казны</span></button>
                  <button type="button" onClick={handleClearTreasury} className="py-2.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> <span>Очистить</span></button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="glass-card w-full max-w-lg p-6 space-y-5 relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-emerald-400" /><h3 className="text-sm font-bold text-white uppercase tracking-wider">Настройки сервиса</h3></div>
                <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
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
                    Ключ сохраняется локально в браузере.
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

