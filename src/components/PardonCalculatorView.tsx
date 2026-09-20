import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomSelect } from './CustomSelect';
import { InAppConfirmModal } from './InAppConfirmModal';
import { copyToClipboard } from '../lib/clipboard';
import { extractData } from '../lib/ocrExtractor';
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
  Undo2,
  Info,
  Scale,
  Landmark,
  User,
  Hash
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

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  variant: 'danger' | 'warning' | 'info' | 'emerald';
  badge?: string;
  onConfirm: () => void;
}

interface TextCopyModalState {
  isOpen: boolean;
  title: string;
  text: string;
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
  const [mainTab, setMainTab] = useState<'calculator' | 'treasury'>('calculator');

  // Citizen Form
  const [fio, setFio] = useState('');
  const [passport, setPassport] = useState('');

  // Daily Debt
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

  // Articles
  const [rows, setRows] = useState<PardonArticleRow[]>([]);
  const [rowSeq, setRowSeq] = useState(1);
  const [severityDict] = useState<Record<string, string>>({
    ...SEED_SEVERITY,
    'чистосердечное признание': 'small',
    'побег из тюрьмы': 'medium'
  });

  // Treasury Log
  const [treasuryEntries, setTreasuryEntries] = useState<TreasuryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('treasuryData');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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

  // Scan & OCR
  const [currentMethod, setCurrentMethod] = useState<'tesseract' | 'groq'>('tesseract');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedMime, setUploadedMime] = useState<string>('image/png');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // In-app Notifications & Dialogs
  const [toast, setToast] = useState<ToastState | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);
  const [textCopyModal, setTextCopyModal] = useState<TextCopyModalState | null>(null);
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tesseractWorkerRef = useRef<any>(null);

  const notifyToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToast({ id, message: msg, type });
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 2800);
  }, []);

  const notifyToastWithUndo = useCallback((msg: string, onUndo: () => void) => {
    const id = Date.now().toString();
    setToast({
      id,
      message: msg,
      type: 'info',
      action: {
        label: 'Отменить',
        onClick: () => {
          onUndo();
          setToast(null);
        }
      }
    });
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 4500);
  }, []);

  const normKey = (str: string) => String(str || '').trim().toLowerCase();

  const hoursSince = (dateStr: string, timeStr: string): number | null => {
    if (!dateStr || !timeStr) return null;
    const [d, mo, y] = dateStr.split('.').map(Number);
    const [h, mi] = timeStr.split(':').map(Number);
    if (!d || !mo || !y || isNaN(h) || isNaN(mi)) return null;
    const dt = new Date(y, mo - 1, d, h, mi);
    if (isNaN(dt.getTime())) return null;
    return (Date.now() - dt.getTime()) / 36e5;
  };

  const fuzzyMatchSpecial = (normCode: string) => {
    for (const key in SPECIAL_ENTRIES) {
      const keyNorm = normKey(key);
      if (normCode === keyNorm || normCode.includes(keyNorm) || keyNorm.startsWith(normCode)) {
        return SPECIAL_ENTRIES[key];
      }
    }
    return null;
  };

  const handleImageFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      notifyToast('Поддерживаются только изображения (PNG, JPG, WEBP)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedFileName(file.name);
      setUploadedMime(file.type || 'image/png');
      setUploadedBase64(dataUrl.split(',')[1]);
      setImagePreview(dataUrl);
      setStatusMessage(`Готов: ${file.name}`);
      notifyToast('Снимок прикреплен! Нажмите «Распознать»', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setUploadedFileName('');
    setUploadedBase64(null);
    setStatusMessage(null);
  };

  // Global Drag & Drop + Paste
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

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types?.includes('Files')) setIsGlobalDragging(true);
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.relatedTarget === null) setIsGlobalDragging(false);
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsGlobalDragging(false);
      if (e.dataTransfer?.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDrop);
    };
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
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, Math.round(canvas.height * 0.075));
        if (isTesseract) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
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
      return text;
    } catch (err: any) {
      setStatusMessage(`Ошибка: ${err.message}`);
      return null;
    }
  };

  const doGroqAnalysis = async (): Promise<string | null> => {
    if (!apiKey.trim()) { 
      setIsSettingsOpen(true); 
      notifyToast('Укажите Groq API Key в настройках', 'error');
      return null; 
    }
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
      notifyToast(`Ошибка Groq: ${err.message}`, 'error');
      return null;
    }
  };

  const handleAnalyzeImage = async () => {
    setIsAnalyzing(true);
    const raw = currentMethod === 'tesseract' ? await doTesseractOCR() : await doGroqAnalysis();
    if (raw) {
      const rawTrimmed = raw.trim().replace(/^```json/, '').replace(/```$/, '').trim();
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
          notifyToast(`Извлечено ${newRows.length} статей!`, 'success');
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
    notifyToast(`Разобрано ${newParsedRows.length} статей!`, 'success');
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

  const handleRemoveRow = (id: string) => {
    const target = rows.find(r => r.id === id);
    if (!target) return;
    setRows(prev => prev.filter(r => r.id !== id));
    notifyToastWithUndo(`Статья ${target.code || 'без номера'} удалена`, () => {
      setRows(prev => [...prev, target]);
    });
  };

  const setRowTimeToNow = (id: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
    setRows(prev => prev.map(r => r.id === id ? { ...r, time: timeStr, date: r.date || dateStr } : r));
    notifyToast('Установлено текущее время', 'info');
  };

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

  // Modals
  const handlePromptResetDailyDebt = () => {
    const debtVal = Number(previousDebt) || 0;
    if (debtVal <= 0) {
      notifyToast('Суточный долг уже $0', 'info');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Сбросить суточный долг?',
      description: `Накопленный долг в размере $${debtVal.toLocaleString('ru-RU')} будет сброшен в $0.`,
      confirmText: 'Сбросить в $0',
      variant: 'warning',
      badge: `Текущий долг: $${debtVal.toLocaleString('ru-RU')}`,
      onConfirm: () => {
        setPreviousDebt('0');
        try { localStorage.setItem('pardon_daily_accumulated_debt', '0'); } catch (e) {}
        setConfirmModal(null);
        notifyToast('Суточный долг обнулен', 'info');
      }
    });
  };

  const handlePromptResetAll = () => {
    if (!fio && !passport && rows.length === 0 && !imagePreview) {
      notifyToast('Форма уже пуста', 'info');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Очистить форму?',
      description: 'Все введенные данные гражданина, прикрепленный снимок и добавленные статьи будут очищены.',
      confirmText: 'Очистить',
      variant: 'warning',
      badge: `${rows.length} статей в форме`,
      onConfirm: () => {
        setFio('');
        setPassport('');
        setRows([]);
        setImagePreview(null);
        setUploadedFileName('');
        setUploadedBase64(null);
        setManualText('');
        setConfirmModal(null);
        notifyToast('Форма очищена', 'info');
      }
    });
  };

  // Calculations
  const { rowCalculations, rawSum } = useMemo(() => {
    let sum = 0;
    const calcs = rows.map(row => {
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
        sum += price;
      }

      return { ...row, price, statusText, isBlocked };
    });
    return { rowCalculations: calcs, rawSum: sum };
  }, [rows]);

  const prevDebtNum = useMemo(() => Math.max(0, Number(previousDebt) || 0), [previousDebt]);
  const finalSum = useMemo(() => Math.min(rawSum, TOTAL_CAP), [rawSum]);
  const totalDailyDebt = useMemo(() => prevDebtNum + finalSum, [prevDebtNum, finalSum]);
  const treasurySum = useMemo(() => Math.round(totalDailyDebt * 0.80), [totalDailyDebt]);
  const selfSum = useMemo(() => totalDailyDebt - treasurySum, [totalDailyDebt, treasurySum]);

  const reportText = useMemo(() => {
    return `Имя Фамилия | Номер паспорта: ${fio.trim() || '—'} | ${passport.trim() || '—'}
Сумма помилования: ${finalSum.toLocaleString('ru-RU')}$
Общая сумма за сутки долга: ${totalDailyDebt.toLocaleString('ru-RU')}$
Вид снятия судимости: Помилование`;
  }, [fio, passport, finalSum, totalDailyDebt]);

  const totalTreasuryAll = useMemo(() => {
    return treasuryEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [treasuryEntries]);

  const treasuryAmount80 = useMemo(() => {
    return Math.round(totalTreasuryAll * 0.80);
  }, [totalTreasuryAll]);

  const treasuryDateString = useMemo(() => {
    const dates = Array.from(new Set(treasuryEntries.map(e => e.date))).sort();
    return dates.length > 0 ? `${dates[0]} - ${dates[dates.length - 1]}` : '';
  }, [treasuryEntries]);

  const treasuryReportText = useMemo(() => {
    return `Помилований на ${totalTreasuryAll.toLocaleString('ru-RU').replace(/\s/g, '.')}$ | ${treasuryDateString}\nНа казне ${treasuryAmount80.toLocaleString('ru-RU').replace(/\s/g, '.')}$`;
  }, [totalTreasuryAll, treasuryDateString, treasuryAmount80]);

  // Main Action: Copy report & record into treasury
  const handleCopyReportAndRecord = async () => {
    const ok = await copyToClipboard(reportText);
    if (!ok) {
      setTextCopyModal({
        isOpen: true,
        title: 'Готовый отчёт',
        text: reportText
      });
      return;
    }

    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2400);

    if (finalSum > 0) {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      setTreasuryEntries(prev => [{
        id: Date.now().toString(),
        citizenName: fio.trim() || 'Неизвестный',
        amount: finalSum,
        date: `${dd}.${mm}.${now.getFullYear()}`
      }, ...prev]);
    }

    const newAccumulated = totalDailyDebt.toString();
    setPreviousDebt(newAccumulated);
    try { localStorage.setItem('pardon_daily_accumulated_debt', newAccumulated); } catch (e) {}

    // Reset current citizen form
    setFio('');
    setPassport('');
    setRows([]);
    setImagePreview(null);
    setUploadedFileName('');
    setUploadedBase64(null);
    setManualText('');

    notifyToast('Отчёт скопирован, сумма занесена в казну!', 'success');
  };

  const handleCopyOnlyText = async () => {
    const ok = await copyToClipboard(reportText);
    if (ok) notifyToast('Текст отчёта скопирован!', 'success');
    else setTextCopyModal({ isOpen: true, title: 'Готовый отчёт', text: reportText });
  };

  const handleCopyTreasuryReport = async () => {
    const ok = await copyToClipboard(treasuryReportText);
    if (ok) notifyToast('Отчёт для казны скопирован!', 'success');
    else setTextCopyModal({ isOpen: true, title: 'Отчёт для казны', text: treasuryReportText });
  };

  const handlePromptClearTreasury = () => {
    if (treasuryEntries.length === 0) {
      notifyToast('Реестр казны уже пуст', 'info');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Очистить реестр казны?',
      description: `Будут удалены все ${treasuryEntries.length} записей на общую сумму $${totalTreasuryAll.toLocaleString('ru-RU')}.`,
      confirmText: 'Очистить казну',
      variant: 'danger',
      badge: `${treasuryEntries.length} записей ($${totalTreasuryAll.toLocaleString('ru-RU')})`,
      onConfirm: () => {
        setTreasuryEntries([]);
        setConfirmModal(null);
        notifyToast('Реестр казны очищен', 'info');
      }
    });
  };

  const handleRemoveTreasuryEntry = (id: string) => {
    const target = treasuryEntries.find(e => e.id === id);
    if (!target) return;
    setTreasuryEntries(prev => prev.filter(e => e.id !== id));
    notifyToastWithUndo(`Запись «${target.citizenName}» удалена`, () => {
      setTreasuryEntries(prev => [target, ...prev]);
    });
  };

  return (
    <div className="w-full space-y-3">
      {/* GLOBAL DRAG OVERLAY */}
      <AnimatePresence>
        {isGlobalDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-500 m-3 rounded-2xl pointer-events-none"
          >
            <Upload className="w-10 h-10 text-emerald-400 mb-2 animate-bounce" />
            <h3 className="text-base font-bold text-white tracking-tight">Отпустите скриншот базы данных</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Файл автоматически подготовится к распознаванию</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST SYSTEM */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[99990] flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#111114] border border-zinc-800 shadow-2xl shadow-black text-xs font-medium text-white"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-zinc-300 shrink-0" />}
            <span className="text-zinc-200">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={toast.action.onClick}
                className="ml-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer active:scale-95"
              >
                <Undo2 className="w-3 h-3" />
                <span>{toast.action.label}</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* IN-APP CONFIRM MODAL */}
      {confirmModal && (
        <InAppConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          description={confirmModal.description}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          variant={confirmModal.variant}
          badge={confirmModal.badge}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* TEXT COPY MODAL */}
      <AnimatePresence>
        {textCopyModal && textCopyModal.isOpen && (
          <div className="fixed inset-0 z-[99995] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTextCopyModal(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0A0A0C] border border-zinc-800 rounded-xl p-5 shadow-2xl z-10 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">{textCopyModal.title}</h3>
                <button onClick={() => setTextCopyModal(null)} className="text-zinc-400 hover:text-white p-1 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                readOnly
                rows={6}
                value={textCopyModal.text}
                onClick={e => (e.target as HTMLTextAreaElement).select()}
                className="w-full dark-input p-3 font-mono text-xs text-zinc-200 resize-none select-all"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTextCopyModal(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-zinc-300 hover:text-white cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOP APPLICATION BAR */}
      <header className="dark-panel px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">SA-GOV</span>
              <span className="text-[10px] font-mono font-medium text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                PARDON REGISTRY
              </span>
            </div>
          </div>
        </div>

        {/* Task navigation tabs (Icon + Label, strictly no emoji) */}
        <nav className="flex items-center p-0.5 rounded-lg bg-[#050507] border border-zinc-800 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMainTab('calculator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              mainTab === 'calculator'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Оформление гражданина</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('treasury')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              mainTab === 'treasury'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Реестр казны</span>
            {treasuryEntries.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                {treasuryEntries.length}
              </span>
            )}
          </button>
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="btn-dark-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium"
            title="Настройки сервиса"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Настройки</span>
          </button>

          <button
            type="button"
            onClick={handlePromptResetAll}
            className="btn-dark-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-rose-400"
            title="Очистить форму"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Очистить</span>
          </button>
        </div>
      </header>

      {/* TAB 1: PARDON WORKSPACE */}
      {mainTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          
          {/* LEFT SIDE (7 COLS): DOSSIER + ARTICLES */}
          <div className="lg:col-span-7 space-y-3">
            
            {/* DOSSIER & SCAN BAR */}
            <section className="dark-panel p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <h2 className="text-xs font-bold text-white tracking-wide">
                  Досье гражданина
                </h2>
                <span className="text-[11px] text-zinc-400">
                  Ctrl+V для вставки снимка
                </span>
              </div>

              {/* Input row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-5">
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                    Имя Фамилия
                  </label>
                  <input
                    type="text"
                    placeholder="Danek_Fillin"
                    value={fio}
                    onChange={e => setFio(e.target.value)}
                    className="w-full dark-input px-3 py-1.5 text-xs font-medium"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                    Номер паспорта
                  </label>
                  <input
                    type="text"
                    placeholder="601226"
                    value={passport}
                    onChange={e => setPassport(e.target.value)}
                    className="w-full dark-input px-3 py-1.5 text-xs font-mono font-bold text-emerald-400"
                  />
                </div>

                <div className="sm:col-span-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-zinc-300 block">
                      Суточный долг
                    </label>
                    <button
                      type="button"
                      onClick={handlePromptResetDailyDebt}
                      className="text-[10px] font-mono text-zinc-400 hover:text-white cursor-pointer"
                      title="Сбросить долг в $0"
                    >
                      Сброс ($0)
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={previousDebt}
                    onChange={e => setPreviousDebt(e.target.value)}
                    className="w-full dark-input px-3 py-1.5 text-xs font-mono font-bold text-white"
                  />
                </div>
              </div>

              {/* Integrated Image Drop / OCR Bar */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                />

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-2.5 rounded-lg border border-dashed border-zinc-800 hover:border-zinc-700 bg-[#050507] flex items-center justify-between cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400">
                        <Upload className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs text-zinc-300 group-hover:text-white">
                        Загрузить или вставить скриншот базы данных
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      Ctrl+V
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.03] space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-xs font-semibold text-emerald-300 truncate max-w-[200px]">
                          {uploadedFileName || 'Скриншот прикреплен'}
                        </span>
                        <button
                          type="button"
                          onClick={handleClearImage}
                          className="text-zinc-400 hover:text-rose-400 p-0.5 cursor-pointer"
                          title="Удалить снимок"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center p-0.5 rounded bg-black border border-zinc-800 text-[10px] font-semibold">
                          <button
                            type="button"
                            onClick={() => setCurrentMethod('tesseract')}
                            className={`px-2 py-0.5 rounded cursor-pointer ${
                              currentMethod === 'tesseract' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                            }`}
                          >
                            OCR
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentMethod('groq')}
                            className={`px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 ${
                              currentMethod === 'groq' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400'
                            }`}
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>AI</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleAnalyzeImage}
                          disabled={isAnalyzing}
                          className="btn-emerald-cta px-3 py-1 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          {isAnalyzing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                          <span>{isAnalyzing ? `${Math.round(ocrProgress)}%` : 'Распознать'}</span>
                        </button>
                      </div>
                    </div>

                    {isAnalyzing && (
                      <div className="w-full bg-black rounded-full h-1 overflow-hidden border border-zinc-800">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-100"
                          style={{ width: `${ocrProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* ARTICLES & OFFENSES */}
            <section className="dark-panel p-3.5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold text-white tracking-wide">
                    Статьи и судимости
                  </h2>
                  <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-300">
                    {rowCalculations.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddManualRow}
                  className="btn-dark-ghost flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Добавить статью</span>
                </button>
              </div>

              {/* Quick Article Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-zinc-400 font-mono mr-0.5">Быстрые:</span>
                {QUICK_ARTICLES.map(preset => (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => handleQuickAddArticle(preset)}
                    className="px-2 py-0.5 rounded bg-[#0D0D10] hover:bg-[#16161C] border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-[11px] font-medium transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    <Plus className="w-2.5 h-2.5 text-zinc-400" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>

              {/* Articles Table */}
              <div className="overflow-x-auto scrollbar-hide pt-0.5">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800/80 text-zinc-400 uppercase tracking-wider text-[9px] font-bold">
                      <th className="pb-1.5 px-1.5 w-6"></th>
                      <th className="pb-1.5 px-1.5">Статья</th>
                      <th className="pb-1.5 px-1.5">Дата</th>
                      <th className="pb-1.5 px-1.5">Время</th>
                      <th className="pb-1.5 px-1.5">Тяжесть</th>
                      <th className="pb-1.5 px-1.5 text-right">Пошлина</th>
                      <th className="pb-1.5 px-1.5 text-right">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {rowCalculations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-7 text-center text-zinc-400 text-xs">
                          <FileSearch className="w-6 h-6 mx-auto text-zinc-400 mb-1" />
                          <p className="text-zinc-300 font-medium">Статьи не добавлены</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Выберите статью из быстрых кнопок или прикрепите снимок
                          </p>
                        </td>
                      </tr>
                    ) : (
                      rowCalculations.map(row => (
                        <tr key={row.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="py-1 px-1 w-6">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(row.id)}
                              className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 cursor-pointer"
                              title="Удалить"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                          <td className="py-1 px-1.5">
                            <input
                              type="text"
                              value={row.code}
                              onChange={e => handleUpdateRow(row.id, 'code', e.target.value)}
                              className="dark-input px-2 py-1 text-xs font-mono font-bold text-white w-24"
                            />
                          </td>
                          <td className="py-1 px-1.5">
                            <input
                              type="text"
                              value={row.date}
                              onChange={e => handleUpdateRow(row.id, 'date', e.target.value)}
                              className="dark-input px-2 py-1 text-xs font-mono text-zinc-200 w-24"
                            />
                          </td>
                          <td className="py-1 px-1.5">
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={row.time}
                                onChange={e => handleUpdateRow(row.id, 'time', e.target.value)}
                                className="dark-input px-2 py-1 text-xs font-mono text-zinc-200 w-16"
                              />
                              <button
                                type="button"
                                onClick={() => setRowTimeToNow(row.id)}
                                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                                title="Поставить текущее время"
                              >
                                <Clock className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="py-1 px-1.5">
                            <CustomSelect
                              value={row.tyazhest}
                              onChange={val => handleUpdateRow(row.id, 'tyazhest', val)}
                              options={Object.entries(LABELS).map(([k, v]) => ({ value: k, label: v }))}
                              size="sm"
                            />
                          </td>
                          <td className="py-1 px-1.5 text-right font-mono font-bold text-xs tabular-nums text-zinc-100">
                            {row.price ? `$${row.price.toLocaleString('ru-RU')}` : '—'}
                          </td>
                          <td className="py-1 px-1.5 text-right text-[10px] font-bold">
                            <span
                              className={`px-2 py-0.5 rounded ${
                                row.isBlocked
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
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

          {/* RIGHT SIDE (5 COLS): FINANCIAL HUB & OUTPUT */}
          <div className="lg:col-span-5 space-y-3 lg:sticky lg:top-4">
            
            {/* FINANCIAL ACTION PANEL */}
            <section className="dark-panel-hero p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <h2 className="text-xs font-bold text-white tracking-wide">
                  Расчёт и выдача
                </h2>
                <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/10">
                  Готово к выдаче
                </span>
              </div>

              {/* Large Fee Display */}
              <div className="p-3.5 rounded-lg bg-[#060608] border border-zinc-800 space-y-0.5">
                <span className="text-[11px] font-medium text-zinc-300 block">
                  К оплате гражданином:
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white tabular-nums">
                  ${finalSum.toLocaleString('ru-RU')}
                </div>

                {rawSum > TOTAL_CAP && (
                  <div className="pt-1">
                    <span className="inline-block px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400">
                      Лимит $170 000 применен (без лимита: ${rawSum.toLocaleString('ru-RU')})
                    </span>
                  </div>
                )}
              </div>

              {/* 80 / 20 Split */}
              <div className="p-3 rounded-lg bg-[#060608] border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>В казну (80%):</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ${treasurySum.toLocaleString('ru-RU')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Сотруднику (20%):</span>
                  </span>
                  <span className="font-mono font-bold text-zinc-200 text-sm">
                    ${selfSum.toLocaleString('ru-RU')}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden flex border border-zinc-800">
                  <div className="bg-emerald-500 h-full rounded-l-full" style={{ width: '80%' }} />
                  <div className="bg-zinc-500 h-full rounded-r-full" style={{ width: '20%' }} />
                </div>

                <div className="pt-1 flex justify-between text-[11px] text-zinc-300 border-t border-zinc-800/80">
                  <span>Суточный долг за смену:</span>
                  <span className="font-mono font-bold text-white">${totalDailyDebt.toLocaleString('ru-RU')}</span>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleCopyReportAndRecord}
                className="btn-emerald-cta w-full py-3 px-4 flex items-center justify-center gap-2 text-xs font-bold text-black cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                {copiedReport ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Отчёт скопирован и внесён в казну!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Скопировать отчёт и внести в казну</span>
                  </>
                )}
              </button>

              {/* Preview */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-300">
                  <span>Текст готового отчёта:</span>
                  <button
                    type="button"
                    onClick={handleCopyOnlyText}
                    className="text-zinc-400 hover:text-emerald-400 cursor-pointer flex items-center gap-1 text-[11px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Копировать только текст</span>
                  </button>
                </div>
                <div className="dark-terminal p-2.5 rounded-lg font-mono text-[11px] text-zinc-300 whitespace-pre-line leading-relaxed select-all">
                  {reportText}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* TAB 2: TREASURY LEDGER */}
      {mainTab === 'treasury' && (
        <div className="dark-panel p-4 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-2.5 gap-2">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Реестр казны за текущую смену
              </h2>
              <p className="text-[11px] text-zinc-400">
                История помилований и сводный отчёт
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyTreasuryReport}
                className="btn-dark-ghost px-3 py-1.5 text-xs font-medium flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Скопировать отчёт казны</span>
              </button>
              <button
                type="button"
                onClick={handlePromptClearTreasury}
                className="px-3 py-1.5 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Очистить реестр</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-lg bg-[#060608] border border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-300 block">Помиловано граждан</span>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">
                {treasuryEntries.length}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#060608] border border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-300 block">Общая сумма</span>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">
                ${totalTreasuryAll.toLocaleString('ru-RU')}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#060608] border border-emerald-500/20">
              <span className="text-[11px] font-medium text-emerald-400 block">К сдаче в казну (80%)</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                ${treasuryAmount80.toLocaleString('ru-RU')}
              </div>
            </div>
          </div>

          {/* Shift Report Terminal */}
          <div className="p-3 rounded-lg bg-[#060608] border border-zinc-800 space-y-1">
            <span className="text-[11px] font-medium text-zinc-300 block">Отчёт для рапорта:</span>
            <div className="font-mono text-xs text-zinc-200 whitespace-pre-line select-all">
              {treasuryReportText}
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto scrollbar-hide pt-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[9px] font-bold">
                  <th className="pb-1.5 px-2">Гражданин</th>
                  <th className="pb-1.5 px-2">Дата</th>
                  <th className="pb-1.5 px-2 text-right">Сумма помилования</th>
                  <th className="pb-1.5 px-2 text-right">В казну (80%)</th>
                  <th className="pb-1.5 px-2 text-right w-16">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {treasuryEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-7 text-center text-zinc-400 text-xs">
                      Реестр пуст. Оформите гражданина во вкладке «Оформление гражданина».
                    </td>
                  </tr>
                ) : (
                  treasuryEntries.map(entry => (
                    <tr key={entry.id} className="hover:bg-zinc-900/40">
                      <td className="py-2 px-2 font-bold text-white">{entry.citizenName}</td>
                      <td className="py-2 px-2 font-mono text-zinc-400">{entry.date}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-zinc-200">
                        ${entry.amount.toLocaleString('ru-RU')}
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-emerald-400">
                        ${Math.round(entry.amount * 0.8).toLocaleString('ru-RU')}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveTreasuryEntry(entry.id)}
                          className="p-1 rounded text-zinc-400 hover:text-rose-400 cursor-pointer"
                          title="Удалить запись"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0A0A0C] border border-zinc-800 rounded-xl p-4 space-y-3 z-10"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Настройки сервиса</h3>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-zinc-400 hover:text-white cursor-pointer p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-300 block">
                    Groq Cloud API Key (Llama 3.2 Vision)
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="gsk_..."
                      value={apiKey}
                      onChange={e => {
                        setApiKey(e.target.value);
                        try { localStorage.setItem('groq_api_key', e.target.value.trim()); } catch (err) {}
                      }}
                      className="w-full dark-input px-3 py-1.5 font-mono text-zinc-200 pr-8 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-300 block">
                    Сырой текст для ручного разбора
                  </label>
                  <textarea
                    rows={4}
                    value={manualText}
                    onChange={e => setManualText(e.target.value)}
                    className="w-full dark-input p-2.5 font-mono text-xs text-zinc-300 resize-none"
                    placeholder="Вставьте сырой текст базы данных..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      parseTextToRows(manualText);
                      setIsSettingsOpen(false);
                    }}
                    className="btn-dark-accent w-full py-1.5 rounded-md font-medium cursor-pointer mt-1 text-xs"
                  >
                    Разобрать текст
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
