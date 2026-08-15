import React, { useState, useEffect } from 'react';
import { CustomSelect } from './CustomSelect';
import html2canvas from 'html2canvas';
import { 
  FileText, 
  Plus, 
  Trash2, 
  PenTool, 
  Sparkles, 
  Building2, 
  FileCheck,
  ChevronRight,
  Upload,
  ImageIcon,
  Loader2,
  Download,
  ShieldAlert,
  Check,
  Settings,
  Bookmark,
  Save,
  Layers,
  Edit3,
  Calendar,
  Hash,
  MapPin,
  Award
} from 'lucide-react';
import PardonCalculatorView from './PardonCalculatorView';

export interface DecreeData {
  id: string;
  governorRoleHeader?: string;
  governorNameHeader: string;
  decreeNumber: string;
  decreeDate: string;
  location: string;
  decreeTitle: string;
  preamble: string;
  resolutionHeader: string;
  items: string[];
  closingClause: string;
  governorRoleFooter: string;
  emblemUrl: string;
  sealUrl: string;
  signatureUrl: string;
  createdAt?: string;
}

export interface DecreeTemplatePreset {
  id: string;
  title: string;
  decreeTitle: string;
  preamble: string;
  resolutionHeader: string;
  items: string[];
  closingClause: string;
  createdBy?: string;
}

interface GovernorDecreeViewProps {
  user?: any;
}

// Role IDs for Governor's Office Documentation
export const GOVERNOR_ROLE_IDS = [
  '1527281334135947285', // Губернатор
  '1527281335272472656', // Вице-Губернатор
  '1527281336044486837'  // Глава Администрации / Руководство Офиса Губернатора
];

export const GOVERNOR_ROLE_NAMES = [
  'Губернатор',
  'Вице-Губернатор',
  'Зам. Губернатора',
  'Заместитель Губернатора',
  'Глава Администрации Губернатора',
  'Глава Администрации',
  'Советник Губернатора',
  'Офис Губернатора',
  'Администратор'
];

export const checkGovernorOfficeAccess = (user?: any) => {
  if (!user) return true;
  if (user.role === 'Администратор' || user.role === 'god') return true;
  if (GOVERNOR_ROLE_NAMES.includes(user.role)) return true;

  const userRoles: string[] = Array.isArray(user.discord_roles)
    ? user.discord_roles
    : typeof user.discord_roles === 'string'
      ? JSON.parse(user.discord_roles || '[]')
      : [];

  return GOVERNOR_ROLE_IDS.some(id => userRoles.includes(id));
};

export const getUserGovernorRoleTitle = (user?: any): string => {
  if (!user) return 'ГУБЕРНАТОР';
  
  const userRoles: string[] = Array.isArray(user.discord_roles)
    ? user.discord_roles
    : typeof user.discord_roles === 'string'
      ? JSON.parse(user.discord_roles || '[]')
      : [];

  if (userRoles.includes('1527281334135947285') || user.role === 'Губернатор') return 'ГУБЕРНАТОР';
  if (userRoles.includes('1527281335272472656') || user.role === 'Вице-Губернатор') return 'ВИЦЕ-ГУБЕРНАТОР';
  if (userRoles.includes('1527281336044486837') || user.role === 'Глава Администрации' || user.role === 'Советник Губернатора') return 'ГЛАВА АДМИНИСТРАЦИИ ГУБЕРНАТОРА';

  return 'ГУБЕРНАТОР';
};

export const getUserGovernorRoleTitleHeader = (user?: any): string => {
  if (!user) return 'GOVERNOR OF THE STATE OF SAN-ANDREAS';
  
  const userRoles: string[] = Array.isArray(user.discord_roles)
    ? user.discord_roles
    : typeof user.discord_roles === 'string'
      ? JSON.parse(user.discord_roles || '[]')
      : [];

  if (userRoles.includes('1527281334135947285') || user.role === 'Губернатор') {
    return 'GOVERNOR OF THE STATE OF SAN-ANDREAS';
  }
  if (userRoles.includes('1527281335272472656') || user.role === 'Вице-Губернатор') {
    return 'VICE-GOVERNOR OF THE STATE OF SAN-ANDREAS';
  }
  if (userRoles.includes('1527281336044486837') || user.role === 'Глава Администрации' || user.role === 'Советник Губернатора') {
    return 'HEAD OF ADMINISTRATION OF THE STATE OF SAN-ANDREAS';
  }

  return 'GOVERNOR OF THE STATE OF SAN-ANDREAS';
};

const DEFAULT_DECREE: DecreeData = {
  id: 'decree-figma-10-4',
  governorNameHeader: 'FRIEDRICH ENGELMANN',
  decreeNumber: '473',
  decreeDate: '22/07/2026',
  location: 'Капитолий, город Лос-Сантос',
  decreeTitle: 'О КАДРОВЫХ КОРРЕКТИРОВКАХ',
  preamble: 'Я, Friedrich Engelmann, действующий Губернатор штата Сан-Андреас, руководствуясь действующей Конституцией, а также и другими нормативно-правовыми актами штата Сан-Андреас,',
  resolutionHeader: 'НАСТОЯЩИМ УКАЗЫВАЮ:',
  items: [
    'Назначить гражданина Dmitro Champion | 438367 на должность Командира Delta и присвоить звание Полковник.'
  ],
  closingClause: 'ДОПОЛНИТЕЛЬНО УКАЗЫВАЕТСЯ, что настоящий указ вступает в законную силу с момента его публикации.',
  governorRoleFooter: 'FRIEDRICH ENGELMANN,  ГУБЕРНАТОР',
  emblemUrl: '/governor/governor_emblem.png',
  sealUrl: '/governor/governor_seal.png',
  signatureUrl: '/governor/governor_signature.png',
  createdAt: new Date().toISOString()
};

// Built-in Standard Decree Templates
const BUILTIN_TEMPLATES: DecreeTemplatePreset[] = [
  {
    id: 'tpl-cadre-appoint',
    title: 'Кадровое назначение',
    decreeTitle: 'О КАДРОВЫХ КОРРЕКТИРОВКАХ',
    preamble: 'Я, Friedrich Engelmann, действующий Губернатор штата Сан-Андреас, руководствуясь действующей Конституцией, а также и другими нормативно-правовыми актами штата Сан-Андреас,',
    resolutionHeader: 'НАСТОЯЩИМ УКАЗЫВАЮ:',
    items: [
      'Назначить гражданина [Имя Фамилия | Паспорт] на должность [Наименование должности] с предоставлением всех соответствующих полномочий.'
    ],
    closingClause: 'ДОПОЛНИТЕЛЬНО УКАЗЫВАЕТСЯ, что настоящий указ вступает в законную силу с момента его публикации.'
  },
  {
    id: 'tpl-cadre-dismiss',
    title: 'Освобождение от должности',
    decreeTitle: 'О КАДРОВЫХ ИЗМЕНЕНИЯХ',
    preamble: 'Я, Friedrich Engelmann, действующий Губернатор штата Сан-Андреас, руководствуясь действующим законодательством и Конституцией штата Сан-Андреас,',
    resolutionHeader: 'НАСТОЯЩИМ УКАЗЫВАЮ:',
    items: [
      'Освободить гражданина [Имя Фамилия | Паспорт] от занимаемой должности [Наименование должности] по собственному желанию / в связи с утратой доверия.',
      'Прекратить все служебные и государственные полномочия указанного лица с момента издания настоящего указа.'
    ],
    closingClause: 'ДОПОЛНИТЕЛЬНО УКАЗЫВАЕТСЯ, что настоящий указ вступает в законную силу с момента его публикации.'
  },
  {
    id: 'tpl-discipline',
    title: 'Дисциплинарное взыскание',
    decreeTitle: 'О НАЛОЖЕНИИ ДИСЦИПЛИНАРНОГО ВЗЫСКАНИЯ',
    preamble: 'Я, Friedrich Engelmann, действующий Губернатор штата Сан-Андреас, на основании проведенной прокурорской проверки и внутренних регламентов Правительства,',
    resolutionHeader: 'НАСТОЯЩИМ УКАЗЫВАЮ:',
    items: [
      'Объявить строгий выговор сотруднику [Имя Фамилия | Паспорт] за неисполнение должностных обязанностей.',
      'Обязать указанного сотрудника отработать дисциплинарное взыскание в течение 72 часов.'
    ],
    closingClause: 'ДОПОЛНИТЕЛЬНО УКАЗЫВАЕТСЯ, что настоящий указ вступает в законную силу с момента его публикации.'
  },
  {
    id: 'tpl-awards',
    title: 'Государственные награды и премии',
    decreeTitle: 'О НАГРАЖДЕНИИ И ПРЕМИРОВАНИИ',
    preamble: 'Я, Friedrich Engelmann, действующий Губернатор штата Сан-Андреас, за выдающиеся заслуги перед штатом и высокое профессиональное мастерство,',
    resolutionHeader: 'НАСТОЯЩИМ УКАЗЫВАЮ:',
    items: [
      'Наградить государственного служащего [Имя Фамилия | Паспорт] медалью «За службу штату Сан-Андреас».',
      'Выплатить единовременную денежную премию в размере $100,000 за счет государственного бюджета.'
    ],
    closingClause: 'ДОПОЛНИТЕЛЬНО УКАЗЫВАЕТСЯ, что настоящий указ вступает в законную силу с момента его публикации.'
  }
];

export default function GovernorDecreeView({ user }: GovernorDecreeViewProps) {
  const hasAccess = checkGovernorOfficeAccess(user);
  const isAdmin = user?.role === 'Администратор' || user?.role === 'god';

  const [activeTab, setActiveTab] = useState<'preview' | 'editor' | 'pardon'>('preview');
  const [currentDecree, setCurrentDecree] = useState<DecreeData>(DEFAULT_DECREE);

  // Decree Templates state
  const [templates, setTemplates] = useState<DecreeTemplatePreset[]>(BUILTIN_TEMPLATES);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

  const [copiedPNG, setCopiedPNG] = useState(false);
  const [isGeneratingPNG, setIsGeneratingPNG] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const triggerToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    if ((window as any).triggerToast) {
      (window as any).triggerToast(msg, type);
    }
  };

  // Auto-sync user's name and role headers/footers from Discord profile settings
  useEffect(() => {
    if (user?.full_name) {
      const formattedName = user.full_name.toUpperCase();
      const roleTitleFooter = getUserGovernorRoleTitle(user);
      const roleTitleHeader = getUserGovernorRoleTitleHeader(user);
      const autoFooter = `${formattedName},  ${roleTitleFooter}`;

      setCurrentDecree(prev => ({
        ...prev,
        governorNameHeader: formattedName,
        governorRoleHeader: prev.governorRoleHeader || roleTitleHeader,
        governorRoleFooter: prev.governorRoleFooter === DEFAULT_DECREE.governorRoleFooter ? autoFooter : prev.governorRoleFooter
      }));
    }
  }, [user]);

  // Compute safe image sources with fallback to default static assets
  const emblemSrc = (currentDecree.emblemUrl && !currentDecree.emblemUrl.startsWith('data:text/html'))
    ? currentDecree.emblemUrl
    : '/governor/governor_emblem.png';

  const sealSrc = (currentDecree.sealUrl && !currentDecree.sealUrl.startsWith('data:text/html'))
    ? currentDecree.sealUrl
    : '/governor/governor_seal.png';

  const signatureSrc = (currentDecree.signatureUrl && !currentDecree.signatureUrl.startsWith('data:text/html'))
    ? currentDecree.signatureUrl
    : (user?.signature_url || '/governor/governor_signature.png');

  // Fetch custom templates from API / localStorage
  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/governor/templates');
      if (res.ok) {
        const customTpls = await res.json();
        if (Array.isArray(customTpls) && customTpls.length > 0) {
          setTemplates([...BUILTIN_TEMPLATES, ...customTpls]);
          return;
        }
      }
    } catch (e) {}

    try {
      const stored = localStorage.getItem('governor_custom_templates_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setTemplates([...BUILTIN_TEMPLATES, ...parsed]);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Save decree to API / local state
  const handleSaveDecree = async () => {
    const govName = (currentDecree.governorNameHeader || user?.full_name || 'FRIEDRICH ENGELMANN').toUpperCase();
    const roleTitle = getUserGovernorRoleTitle(user);
    const payload = {
      ...currentDecree,
      governorNameHeader: govName,
      governorRoleFooter: currentDecree.governorRoleFooter || `${govName},  ${roleTitle}`
    };

    try {
      const res = await fetch('/api/governor/decrees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSavedSuccess(true);
        triggerToast('Указ успешно сохранен!', 'success');
        setTimeout(() => setSavedSuccess(false), 3000);
        return;
      }
    } catch (e) {}

    setSavedSuccess(true);
    triggerToast('Параметры указа применены!', 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Create new blank decree
  const handleCreateNew = () => {
    const todayStr = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const govName = (user?.full_name || 'FRIEDRICH ENGELMANN').toUpperCase();
    const roleTitle = getUserGovernorRoleTitle(user);
    const newDoc: DecreeData = {
      id: `decree-${Date.now()}`,
      governorNameHeader: govName,
      decreeNumber: '474',
      decreeDate: todayStr,
      location: 'Капитолий, город Лос-Сантос',
      decreeTitle: 'О КАДРОВЫХ КОРРЕКТИРОВКАХ',
      preamble: `Я, ${user?.full_name || 'Friedrich Engelmann'}, действующий Губернатор штата Сан-Андреас, руководствуясь действующей Конституцией, а также и другими нормативно-правовыми актами штата Сан-Андреас,`,
      resolutionHeader: 'НАСТОЯЩИМ УКАЗЫВАЮ:',
      items: ['Назначить гражданина [Имя Фамилия | Паспорт] на должность [Наименование должности].'],
      closingClause: 'ДОПОЛНИТЕЛЬНО УКАЗЫВАЕТСЯ, что настоящий указ вступает в законную силу с момента его публикации.',
      governorRoleFooter: `${govName},  ${roleTitle}`,
      emblemUrl: '/governor/governor_emblem.png',
      sealUrl: '/governor/governor_seal.png',
      signatureUrl: user?.signature_url || '/governor/governor_signature.png',
      createdAt: new Date().toISOString()
    };
    setCurrentDecree(newDoc);
    setActiveTab('editor');
  };

  // Apply template preset
  const handleApplyTemplate = (tpl: any) => {
    if (!tpl) return;
    const govName = user?.full_name || 'Friedrich Engelmann';
    const rawPreamble = tpl.preamble || '';
    const updatedPreamble = rawPreamble.replace(/Friedrich Engelmann/gi, govName);

    const decreeTitle = tpl.decreeTitle || tpl.decree_title || '';
    const resolutionHeader = tpl.resolutionHeader || tpl.resolution_header || '';
    const closingClause = tpl.closingClause || tpl.closing_clause || '';
    const rawItems = tpl.items;
    let itemsArr: string[] = [];
    if (Array.isArray(rawItems)) {
      itemsArr = [...rawItems];
    } else if (typeof rawItems === 'string') {
      try { itemsArr = JSON.parse(rawItems) || []; } catch (e) { itemsArr = []; }
    }

    setCurrentDecree(prev => ({
      ...prev,
      decreeTitle,
      preamble: updatedPreamble,
      resolutionHeader,
      items: itemsArr,
      closingClause
    }));

    triggerToast(`Шаблон «${tpl.title}» применён!`, 'success');
  };

  // Save current text as a new reusable template
  const handleSaveCurrentAsTemplate = async () => {
    if (!newTemplateTitle.trim()) return;
    setIsSavingTemplate(true);

    const newTpl: DecreeTemplatePreset = {
      id: `tpl-custom-${Date.now()}`,
      title: newTemplateTitle.trim(),
      decreeTitle: currentDecree.decreeTitle || '',
      preamble: currentDecree.preamble || '',
      resolutionHeader: currentDecree.resolutionHeader || '',
      items: Array.isArray(currentDecree.items) ? [...currentDecree.items] : [],
      closingClause: currentDecree.closingClause || '',
      createdBy: user?.full_name || 'Губернатор'
    };

    try {
      const res = await fetch('/api/governor/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTpl)
      });
      if (res.ok) {
        await fetchTemplates();
        setNewTemplateTitle('');
        setShowSaveTemplateModal(false);
        triggerToast(`Новый шаблон «${newTpl.title}» успешно сохранён!`, 'success');
        setIsSavingTemplate(false);
        return;
      }
    } catch (e) {}

    // Fallback to local storage
    const customOnly = templates.filter(t => t.id.startsWith('tpl-custom-'));
    const updatedCustom = [...customOnly, newTpl];
    try {
      localStorage.setItem('governor_custom_templates_v1', JSON.stringify(updatedCustom));
    } catch (e) {}

    setTemplates([...BUILTIN_TEMPLATES, ...updatedCustom]);
    setNewTemplateTitle('');
    setShowSaveTemplateModal(false);
    triggerToast(`Новый шаблон «${newTpl.title}» сохранён локально!`, 'success');
    setIsSavingTemplate(false);
  };

  // Delete custom template
  const handleDeleteTemplate = async (tplId: string) => {
    if (tplId.startsWith('tpl-cadre-') || tplId === 'tpl-discipline' || tplId === 'tpl-awards') return;
    try {
      await fetch(`/api/governor/templates/${tplId}`, { method: 'DELETE' });
    } catch (e) {}

    const updated = templates.filter(t => t.id !== tplId);
    setTemplates(updated);

    const customOnly = updated.filter(t => t.id.startsWith('tpl-custom-'));
    try {
      localStorage.setItem('governor_custom_templates_v1', JSON.stringify(customOnly));
    } catch (e) {}
  };

  // DYNAMIC PNG RASTERIZER ENGINE (AUTO-EXPANDS TO CAPTURE FULL DECREE HEIGHT PERFECTLY)
  const generateExactPngBlob = async (element: HTMLElement): Promise<Blob | null> => {
    if (document.fonts) {
      await document.fonts.ready;
    }

    const sheetWidth = element.offsetWidth || 773;
    const sheetHeight = Math.max(element.offsetHeight || 991, 991);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        width: sheetWidth,
        height: sheetHeight,
        windowWidth: sheetWidth,
        windowHeight: sheetHeight,
        logging: false,
        imageTimeout: 0,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const underlineLines = clonedDoc.querySelectorAll<HTMLElement>('.date-num-underline');
          underlineLines.forEach((line) => {
            line.style.marginTop = '8px';
          });
        }
      });

      return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    } catch (e) {
      console.error('html2canvas error:', e);
      return null;
    }
  };

  // PNG COPY ACTION (STRICTLY CLIPBOARD ONLY - NO AUTO-DOWNLOAD)
  const handleCopyPNG = async () => {
    const container = document.getElementById('governor-decree-sheet');
    if (!container) return;
    setIsGeneratingPNG(true);

    try {
      const blob = await generateExactPngBlob(container);

      let copied = false;
      if (blob && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          copied = true;
        } catch (e) {
          console.warn('Clipboard write failed:', e);
        }
      }

      if (copied) {
        setCopiedPNG(true);
        triggerToast('Указ успешно скопирован в буфер обмена!', 'success');
        setTimeout(() => setCopiedPNG(false), 3000);
      } else {
        triggerToast('Не удалось скопировать в буфер обмена. Нажмите «Скачать документ».', 'error');
      }
    } catch (err) {
      console.error('PNG Copy Error:', err);
      triggerToast('Ошибка при подготовке указа', 'error');
    } finally {
      setIsGeneratingPNG(false);
    }
  };

  // Direct PNG Download
  const handleDownloadPNG = async () => {
    const container = document.getElementById('governor-decree-sheet');
    if (!container) return;
    setIsGeneratingPNG(true);
    try {
      const blob = await generateExactPngBlob(container);
      if (blob) {
        const link = document.createElement('a');
        link.download = `decree_${currentDecree.decreeNumber || '473'}.png`;
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error('Download PNG failed:', e);
    } finally {
      setIsGeneratingPNG(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: 'emblemUrl' | 'sealUrl' | 'signatureUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCurrentDecree(prev => ({
            ...prev,
            [key]: event.target?.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to render "Я, Friedrich Engelmann," in bold
  const renderPreambleWithBoldName = (text?: string) => {
    if (!text) return null;
    const match = text.match(/^(Я,\s*[^,]+,)(.*)$/s);
    if (match) {
      return (
        <>
          <span className="font-bold">{match[1]}</span>
          {match[2]}
        </>
      );
    }
    return text;
  };

  // Helper to render "ДОПОЛНИТЕЛЬНО УКАЗЫВАЕТСЯ," in BOLD UPPERCASE and the remainder in REGULAR LOWERCASE
  const renderClosingClause = (text?: string) => {
    if (!text) return null;
    const match = text.match(/^(ДОПОЛНИТЕЛЬНО УКАЗЫВАЕТСЯ,\s*)(.*)$/i);
    if (match) {
      return (
        <>
          <span className="font-bold uppercase">{match[1]}</span>
          <span className="font-normal normal-case">{match[2].toLowerCase()}</span>
        </>
      );
    }
    return <span className="font-normal normal-case">{text}</span>;
  };

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-[#0F0F12] border border-rose-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Доступ ограничен</h2>
        <p className="text-sm text-white/60 leading-relaxed max-w-md mx-auto">
          Доступ к документообороту «Офис Губернатора» предоставляется только авторизованным лицам с соответствующей государственной ролью:
        </p>
        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-amber-300 space-y-1.5 max-w-md mx-auto text-left shadow-inner">
          <div>• Губернатор (ID: 1527281334135947285)</div>
          <div>• Вице-Губернатор (ID: 1527281335272472656)</div>
          <div>• Руководство Офиса Губернатора (ID: 1527281336044486837)</div>
        </div>
        <p className="text-xs text-white/40 pt-2">Ваша текущая роль: <span className="text-white font-semibold">{user?.role || 'Неизвестно'}</span></p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans w-full pb-12">
      {/* EXECUTIVE TOP NAVIGATION HEADER BAR */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 shadow-2xl shadow-black/40 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-indigo-400 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Офис Губернатора
              </span>
              <span className="text-zinc-600 text-xs">•</span>
              <span className="text-xs text-zinc-400 font-medium">Штат San Andreas</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Документооборот и Издание Указов
            </h1>
          </div>
        </div>

        {/* Segmented Tab Navigation Switches */}
        <div className="flex items-center gap-2 bg-[#0C0D12] p-1.5 rounded-xl border border-white/[0.08] relative z-10 self-stretch md:self-auto justify-center">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 border border-indigo-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-300" />
            Просмотр бланка
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 border border-indigo-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Settings className="w-4 h-4 text-indigo-300" />
            Конструктор и Шаблоны
          </button>
        </div>
      </div>



      {/* TAB 1: PREVIEW WORKBENCH */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {/* Top Executive Action Bar */}
          <div className="max-w-[1280px] mx-auto bg-white/[0.02] border border-white/[0.07] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl backdrop-blur-xl">
            {/* Left: Quick Template Selector */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-indigo-400 shrink-0">
                <Bookmark className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-[220px]">
                <CustomSelect
                  label="Шаблон указа"
                  value=""
                  placeholder="-- Выбрать готовый указ --"
                  onChange={val => {
                    const selected = templates.find(t => t.id === val);
                    if (selected) handleApplyTemplate(selected);
                  }}
                  options={templates.map(t => ({ value: t.id, label: t.title }))}
                  size="sm"
                />
              </div>
            </div>

            {/* Right: Export PNG Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleCopyPNG}
                disabled={isGeneratingPNG}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-indigo-500/20 border border-indigo-500/30 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPNG ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : copiedPNG ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                {isGeneratingPNG ? 'Подготовка...' : copiedPNG ? 'Скопировано!' : 'Скопировать указ'}
              </button>

              <button
                onClick={handleDownloadPNG}
                disabled={isGeneratingPNG}
                title="Скачать документ"
                className="p-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white rounded-xl border border-white/[0.08] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-400" />
              </button>
            </div>
          </div>

          {/* TWO-COLUMN DESKTOP WORKBENCH */}
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: EXECUTIVE FELT DESK PEDESTAL (lg:col-span-7 xl:col-span-8) */}
            <div className="lg:col-span-7 xl:col-span-8 bg-gradient-to-b from-[#14141B] via-[#0F0F16] to-[#0A0A0E] border border-white/10 rounded-3xl p-4 sm:p-8 shadow-2xl relative flex flex-col items-center justify-center overflow-hidden">
              {/* Background ambient lighting */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

              {/* DYNAMIC SEMANTIC HTML ARTICLE (SHEET CANVAS WITH AUTO-EXPANDING HEIGHT) */}
              <article 
                id="governor-decree-sheet"
                className="w-[773px] min-w-[773px] max-w-[773px] min-h-[991px] bg-[#FFFFFF] text-[#000000] relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(217,119,6,0.1)] selection:bg-amber-100 select-text flex flex-col justify-between"
                style={{
                  boxSizing: 'border-box',
                  fontFamily: '"Times New Roman", Times, Georgia, serif',
                  WebkitFontSmoothing: 'antialiased'
                }}
              >
                {/* Outer Border (Dynamic stretch: 5px solid #111111) */}
                <div 
                  className="absolute border-[5px] border-[#111111] pointer-events-none z-30" 
                  style={{ left: '4px', top: '1px', right: '4px', bottom: '1px' }}
                />

                {/* Inner Border (Dynamic stretch: 1.5px solid #1A1A26) */}
                <div 
                  className="absolute border-[1.5px] border-[#1A1A26] pointer-events-none z-30" 
                  style={{ left: '12px', top: '9px', right: '12px', bottom: '9px' }}
                />

                {/* HEADER SECTION */}
                <header className="relative w-full px-[64px] pt-[45px] z-10 flex flex-col items-center">
                  {/* 1. Header Title (Supports Multi-line / Enter for long names) */}
                  <h1 
                    className="text-[18px] leading-[26px] font-light uppercase text-center text-[#000000] tracking-normal w-full whitespace-pre-line flex flex-col items-center justify-center"
                    style={{ 
                      fontFamily: '"Perpetua Titling MT", "Perpetua", "Times New Roman", Times, serif',
                      fontWeight: 300
                    }}
                  >
                    <span className="block">{currentDecree.governorRoleHeader || getUserGovernorRoleTitleHeader(user)},</span>
                    <span className="block font-normal mt-0.5">{currentDecree.governorNameHeader}</span>
                  </h1>

                  {/* 2. Separator Line */}
                  <div className="w-[644px] bg-[rgba(0,0,0,0.3)] h-[1px] my-[8px]" />

                  {/* 3. Emblem Image */}
                  <img 
                    src={emblemSrc} 
                    alt="State Emblem" 
                    className="w-[130px] h-[130px] object-contain my-[10px]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/governor/governor_emblem.png';
                    }}
                  />

                  {/* 4. Left Office Title & Subtitle / Right Decree Label & Location */}
                  <div className="w-[644px] flex items-start justify-between mt-[6px]">
                    {/* Left Block */}
                    <div className="w-[300px]">
                      <div className="font-bold text-[14px] leading-[18px] text-[rgba(0,0,0,0.88)] uppercase">
                        OFFICE OF THE GOVERNOR
                      </div>
                      <div className="text-[13px] leading-[18px] text-[#000000] italic mt-[2px]">
                        for the State of San Andreas
                      </div>

                      {/* DATE & NUMBER WITH LOWERED UNDERLINES IN PNG */}
                      <div className="mt-[8px] flex items-end">
                        {/* Date Block */}
                        <div className="flex flex-col items-center" style={{ width: '111px' }}>
                          <div 
                            style={{ 
                              color: '#3355AA', 
                              fontSize: '18px', 
                              lineHeight: '18px', 
                              fontFamily: 'Metal, Cinzel, "Playfair Display", serif', 
                              fontWeight: 400,
                              height: '18px',
                              textAlign: 'center'
                            }}
                          >
                            {currentDecree.decreeDate}
                          </div>
                          <div className="date-num-underline" style={{ width: '111px', height: '1px', backgroundColor: '#000000', marginTop: '6px' }} />
                        </div>

                        {/* Symbol № */}
                        <span style={{ margin: '0 6px', fontSize: '13px', color: '#000000', fontWeight: 400, paddingBottom: '2px' }}>№</span>

                        {/* Number Block */}
                        <div className="flex flex-col items-center" style={{ width: '41px' }}>
                          <div 
                            style={{ 
                              color: '#3355AA', 
                              fontSize: '18px', 
                              lineHeight: '18px', 
                              fontFamily: 'Metal, Cinzel, "Playfair Display", serif', 
                              fontWeight: 400,
                              height: '18px',
                              textAlign: 'center'
                            }}
                          >
                            {currentDecree.decreeNumber}
                          </div>
                          <div className="date-num-underline" style={{ width: '41px', height: '1px', backgroundColor: '#000000', marginTop: '6px' }} />
                        </div>
                      </div>
                    </div>

                    {/* Right Block */}
                    <div className="w-[308px] text-right">
                      <div className="font-bold text-[14px] leading-[18px] text-[rgba(0,0,0,0.88)] uppercase">
                        УКАЗ ГУБЕРНАТОРА 
                      </div>
                      <div className="text-[13px] leading-[18px] text-[#000000] mt-[26px]">
                        {currentDecree.location}
                      </div>
                    </div>
                  </div>
                </header>

                {/* MAIN CONTENT AREA */}
                <main className="relative w-full px-[64px] pt-[28px] pb-[32px] flex-1 z-10 flex flex-col justify-start space-y-4">
                  {/* 11. Main Decree Title */}
                  <h2 className="text-[19px] leading-[24px] font-bold uppercase text-center text-[#000000] w-full mb-[12px]">
                    {currentDecree.decreeTitle}
                  </h2>

                  {/* 12. Preamble ("Я, Friedrich Engelmann," IN BOLD!) */}
                  <p className="text-[14px] leading-[19px] text-[#000000] text-justify w-full mb-[16px]">
                    {renderPreambleWithBoldName(currentDecree.preamble)}
                  </p>

                  {/* 13. Resolution Header */}
                  <div className="text-[14px] leading-[18px] font-bold uppercase text-[#000000] pt-1">
                    {currentDecree.resolutionHeader}
                  </div>

                  {/* 14. Resolution Body / Items List */}
                  <div className="text-[14px] leading-[21px] text-[rgba(0,0,0,0.88)] space-y-2.5 w-full">
                    {currentDecree.items.map((item, idx) => (
                      <div key={idx} className="flex items-start text-justify">
                        <span className="font-serif mr-2 shrink-0 font-medium">{idx + 1}.</span>
                        <span className="text-[#000000]">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* 15. Concluding Clause */}
                  <div className="text-[14px] leading-[18px] text-[#000000] text-justify pt-6 pb-2">
                    {renderClosingClause(currentDecree.closingClause)}
                  </div>
                </main>

                {/* FOOTER AREA (AUTO-EXPANDING PAGE FOR PERFECT LARGE SIGNATURE FIT) */}
                <footer className="relative w-full px-[64px] pb-[54px] pt-[20px] z-10 flex flex-col items-center shrink-0">
                  {/* 16. Signatory Name */}
                  <div 
                    className="text-[14px] leading-[22px] text-[#000000] text-center uppercase font-serif font-normal z-10 w-[310px]"
                    style={{ fontFamily: '"Times New Roman", Times, Georgia, serif' }}
                  >
                    {currentDecree.governorRoleFooter}
                  </div>

                  {/* 17. Signature Line (310px wide) */}
                  <div className="w-[310px] h-[1px] bg-[rgba(0,0,0,0.88)] mt-[2px] mb-[0px] z-10" />

                  {/* 18 & 19. Large Signature & Seal Wrapper */}
                  <div className="relative w-[644px] h-[120px] flex items-center justify-center pointer-events-none">
                    {/* Expressive Large Signature Container (330px x 115px) positioned neatly below line */}
                    <div className="w-[330px] max-w-[330px] h-[115px] max-h-[115px] flex items-center justify-center pointer-events-none z-20 mt-[4px]">
                      <img 
                        src={signatureSrc} 
                        alt="Signature" 
                        className="max-w-[330px] max-h-[115px] w-auto h-auto object-contain mix-blend-multiply pointer-events-none z-20"
                        style={{ objectPosition: 'center center' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/governor/governor_signature.png';
                        }}
                      />
                    </div>

                    {/* Gold Embossed Seal Stamp */}
                    <img 
                      src={sealSrc} 
                      alt="Official Seal" 
                      className="absolute right-[0px] top-[-35px] w-[165px] h-[157px] object-contain mix-blend-multiply pointer-events-none z-10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/governor/governor_seal.png';
                      }}
                    />
                  </div>
                </footer>
              </article>
            </div>

            {/* RIGHT COLUMN: QUICK EXECUTIVE CONTROLLER (lg:col-span-5 xl:col-span-4) */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              {/* Card 1: Реквизиты указа */}
              <div className="bg-[#121218]/90 border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    Параметры указа
                  </h3>
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/20 font-bold">
                    Офис Губернатора
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-white/50 block mb-1.5 flex items-center gap-1.5">
                      <Edit3 className="w-3 h-3 text-amber-400" /> Имя и Фамилия
                    </label>
                    <input
                      type="text"
                      value={currentDecree.governorNameHeader}
                      onChange={e => setCurrentDecree({ ...currentDecree, governorNameHeader: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase text-white/50 block mb-1.5 flex items-center gap-1.5">
                        <Hash className="w-3 h-3 text-amber-400" /> Номер №
                      </label>
                      <input
                        type="text"
                        value={currentDecree.decreeNumber}
                        onChange={e => setCurrentDecree({ ...currentDecree, decreeNumber: e.target.value })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs font-semibold text-amber-300 focus:border-amber-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold uppercase text-white/50 block mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-amber-400" /> Дата
                      </label>
                      <input
                        type="text"
                        value={currentDecree.decreeDate}
                        onChange={e => setCurrentDecree({ ...currentDecree, decreeDate: e.target.value })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-white/50 block mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-amber-400" /> Место издания
                    </label>
                    <input
                      type="text"
                      value={currentDecree.location}
                      onChange={e => setCurrentDecree({ ...currentDecree, location: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-white/50 block mb-1.5">Заголовок указа</label>
                    <input
                      type="text"
                      value={currentDecree.decreeTitle}
                      onChange={e => setCurrentDecree({ ...currentDecree, decreeTitle: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    onClick={handleSaveDecree}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 hover:from-amber-300 hover:to-yellow-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <FileCheck className="w-4 h-4" />
                    {savedSuccess ? 'Применено!' : 'Применить изменения'}
                  </button>

                  <button
                    onClick={() => setActiveTab('editor')}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/80 font-bold text-xs rounded-xl border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2 hover:border-amber-500/30"
                  >
                    <Settings className="w-4 h-4 text-amber-400" />
                    Открыть полный конструктор
                  </button>
                </div>
              </div>

              {/* Card 2: Быстрый запуск шаблонов */}
              <div className="bg-[#121218]/90 border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    Быстрые шаблоны
                  </h3>
                  <span className="text-[10px] text-white/40">{templates.length} доступно</span>
                </div>

                <div className="space-y-2">
                  {templates.slice(0, 4).map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => handleApplyTemplate(tpl)}
                      className="w-full text-left p-3 rounded-xl bg-white/[0.03] hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 transition-all group cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">{tpl.title}</div>
                        <div className="text-[10px] text-white/40 line-clamp-1">{tpl.decreeTitle}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-amber-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL CONSTRUCTION & TEMPLATES SUITE */}
      {activeTab === 'editor' && (
        <div className="max-w-[1240px] mx-auto space-y-8">
          {/* Top Bar inside Construction Suite */}
          <div className="bg-[#121218]/90 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl backdrop-blur-xl">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Settings className="w-6 h-6 text-amber-400" />
                Конструктор и Настройки бланка
              </h2>
              <p className="text-xs text-white/50 mt-1">
                Управление библиотекой шаблонов, сказаниями указа и графическими ассетами
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSaveTemplateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-xl text-xs font-bold border border-amber-500/40 transition-all cursor-pointer shadow-lg"
              >
                <Save className="w-4 h-4 text-amber-400" />
                Сохранить текущий указ как новый шаблон
              </button>

              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/15 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Очистить бланк
              </button>
            </div>
          </div>

          {/* CARD 1: TEMPLATE LIBRARY GRID */}
          <div className="bg-[#121218]/90 border border-white/10 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-amber-400" />
                  Государственные шаблоны текстов
                </h3>
                <p className="text-xs text-white/50 mt-0.5">Выбор пресета мгновенно заполняет заголовок, преамбулу и пункты бланка</p>
              </div>
              <span className="text-xs font-mono bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/60">
                Шаблонов: {templates.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map(tpl => (
                <div
                  key={tpl.id}
                  onClick={() => handleApplyTemplate(tpl)}
                  className="p-4 rounded-2xl bg-black/40 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between group cursor-pointer space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">{tpl.title}</span>
                      {tpl.id.startsWith('tpl-custom-') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(tpl.id);
                          }}
                          className="p-1 text-white/30 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Удалить шаблон"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-amber-400/80 line-clamp-1">{tpl.decreeTitle}</p>
                    <p className="text-[11px] text-white/50 line-clamp-2 italic font-serif leading-relaxed">{tpl.preamble}</p>
                  </div>
                  <span className="text-xs text-amber-300 font-bold pt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Применить шаблон <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 2: TEXT & ITEMS BUILDER */}
          <div className="bg-[#121218]/90 border border-white/10 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-amber-300 flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-amber-400" />
                Содержание и Сказания Указа
              </h3>
              <p className="text-xs text-white/50 mt-0.5">Редактирование вводной части, списка распоряжений и заключения</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-white/70 block mb-1.5">Имя и Фамилия Губернатора (В шапке)</label>
                <input
                  type="text"
                  value={currentDecree.governorNameHeader}
                  onChange={e => setCurrentDecree({ ...currentDecree, governorNameHeader: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1.5">Номер указа №</label>
                <input
                  type="text"
                  value={currentDecree.decreeNumber}
                  onChange={e => setCurrentDecree({ ...currentDecree, decreeNumber: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-amber-300 font-mono font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1.5">Дата издания (ДД/ММ/ГГГГ)</label>
                <input
                  type="text"
                  value={currentDecree.decreeDate}
                  onChange={e => setCurrentDecree({ ...currentDecree, decreeDate: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1.5">Место издания</label>
                <input
                  type="text"
                  value={currentDecree.location}
                  onChange={e => setCurrentDecree({ ...currentDecree, location: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white/70 block mb-1.5">Заголовок указа (По центру)</label>
              <input
                type="text"
                value={currentDecree.decreeTitle}
                onChange={e => setCurrentDecree({ ...currentDecree, decreeTitle: e.target.value })}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/70 block mb-1.5">Преамбула (Вводная часть)</label>
              <textarea
                rows={3}
                value={currentDecree.preamble}
                onChange={e => setCurrentDecree({ ...currentDecree, preamble: e.target.value })}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none resize-y leading-relaxed font-serif"
              />
            </div>

            {/* Resolution items */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <label className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                  Пункты распоряжения (НАСТОЯЩИМ УКАЗЫВАЮ:)
                </label>
                <button
                  onClick={() => setCurrentDecree(prev => ({ ...prev, items: [...prev.items, ''] }))}
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Добавить пункт
                </button>
              </div>

              {currentDecree.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-sm font-extrabold text-amber-400 pt-3 w-6 text-right font-mono">{idx + 1}.</span>
                  <textarea
                    rows={2}
                    value={item}
                    onChange={e => {
                      const updated = [...currentDecree.items];
                      updated[idx] = e.target.value;
                      setCurrentDecree({ ...currentDecree, items: updated });
                    }}
                    placeholder={`Текст пункта ${idx + 1}...`}
                    className="flex-1 bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none resize-y"
                  />
                  {currentDecree.items.length > 1 && (
                    <button
                      onClick={() => setCurrentDecree(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))}
                      className="p-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-white/70 block mb-1.5">Заключительное положение</label>
              <input
                type="text"
                value={currentDecree.closingClause}
                onChange={e => setCurrentDecree({ ...currentDecree, closingClause: e.target.value })}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/70 block mb-1.5">Подпись и Должность внизу</label>
              <input
                type="text"
                value={currentDecree.governorRoleFooter}
                onChange={e => setCurrentDecree({ ...currentDecree, governorRoleFooter: e.target.value })}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* CARD 3: GRAPHICS & SIGNATURE ASSETS */}
          <div className="bg-[#121218]/90 border border-white/10 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-amber-300 flex items-center gap-2.5">
                <PenTool className="w-5 h-5 text-amber-400" />
                Личная Роспись и Графические Ассеты
              </h3>
              <p className="text-xs text-white/50 mt-0.5">Управление файлами личной подписи, герба и золотой печати</p>
            </div>

            <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-5 space-y-4 bg-amber-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-amber-400" />
                    Изображение личной подписи (PNG / SVG)
                  </h4>
                  <p className="text-xs text-white/50 mt-0.5">Загруженный файл автоматически подставляется в футер указа</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                <div className="w-36 h-16 bg-white/5 rounded-xl border border-white/10 p-2 flex items-center justify-center">
                  <img 
                    src={currentDecree.signatureUrl || '/governor/governor_signature.png'} 
                    alt="Signature" 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
                <label className="cursor-pointer bg-gradient-to-r from-amber-500/30 to-yellow-500/20 hover:from-amber-500/40 hover:to-yellow-500/30 text-amber-200 text-xs py-3 px-5 rounded-xl font-bold border border-amber-500/40 transition-all flex items-center gap-2 shadow-lg">
                  <Upload className="w-4 h-4 text-amber-400" />
                  Загрузить новую подпись (PNG / SVG)
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'signatureUrl')} />
                </label>
              </div>
            </div>

            {/* Admin Graphics Uploads */}
            {isAdmin && (
              <div className="border-t border-white/10 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-white/50" />
                    Настройки графических ассетов бланка (Администратор)
                  </h4>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">Доступ Администрации</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
                    <label className="text-xs font-bold text-white/70 block">Герб штата (130×130)</label>
                    <div className="flex items-center gap-4">
                      <img src={emblemSrc} alt="Emblem" className="w-12 h-12 object-contain bg-white/5 rounded-xl border border-white/10 p-1" onError={(e) => { (e.target as HTMLImageElement).src = '/governor/governor_emblem.png'; }} />
                      <label className="flex-1 cursor-pointer bg-white/10 hover:bg-white/20 text-white text-xs py-2.5 px-3 rounded-xl text-center font-bold border border-white/15 transition-colors flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        Загрузить Герб
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'emblemUrl')} />
                      </label>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
                    <label className="text-xs font-bold text-white/70 block">Золотая печать (165×157)</label>
                    <div className="flex items-center gap-4">
                      <img src={sealSrc} alt="Seal" className="w-12 h-12 object-contain bg-white/5 rounded-xl border border-white/10 p-1" onError={(e) => { (e.target as HTMLImageElement).src = '/governor/governor_seal.png'; }} />
                      <label className="flex-1 cursor-pointer bg-white/10 hover:bg-white/20 text-white text-xs py-2.5 px-3 rounded-xl text-center font-bold border border-white/15 transition-colors flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        Загрузить Печать
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'sealUrl')} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-4 border-t border-white/10 pt-6">
              <button
                onClick={() => setActiveTab('preview')}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/15 transition-colors cursor-pointer"
              >
                Предпросмотр бланка
              </button>
              <button
                onClick={() => {
                  handleSaveDecree();
                  setActiveTab('preview');
                }}
                className="px-8 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 hover:from-amber-300 hover:to-yellow-500 text-black font-extrabold text-xs rounded-xl transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <FileCheck className="w-4 h-4" />
                Сохранить и Открыть Бланк
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVE TEMPLATE MODAL */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121218] border border-amber-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-amber-300 font-bold text-lg">
              <Bookmark className="w-5 h-5 text-amber-400" />
              Сохранить указ как новый шаблон
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Введите название нового шаблона. Текущие преамбула, заголовок и список распоряжений будут сохранены в библиотеку шаблонов.
            </p>
            <input
              type="text"
              placeholder="Например: Указ о назначениях в ОГП"
              value={newTemplateTitle}
              onChange={e => setNewTemplateTitle(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none"
              autoFocus
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSaveTemplateModal(false)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveCurrentAsTemplate}
                disabled={!newTemplateTitle.trim() || isSavingTemplate}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black text-xs font-extrabold rounded-xl shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSavingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Сохранить шаблон
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
