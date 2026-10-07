import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  Unlock,
  Users,
  CreditCard,
  Building2,
  Sparkles,
  Bot,
  FileText,
  Target,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Copy,
  Check,
  Download,
  Calendar,
  Layers,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  School,
  HeartHandshake,
  Settings,
  Cpu,
  ChevronRight,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { aiService, DEFAULT_MODEL, DEFAULT_OPENROUTER_KEY } from '../services/ai';
import { analytics } from '../services/analytics';
import { tts } from '../services/tts';

const CLIENTS_STORAGE_KEY = 'danmax_admin_clients';
const PIN_STORAGE_KEY = 'danmax_admin_pin';
const SMART_GOALS_STORAGE_KEY = 'danmax_smart_goals';

const INITIAL_CLIENTS = [
  {
    id: 'cli-001',
    name: 'Familia Dante Lara',
    email: 'mauricio@agrolara.cl',
    type: 'family',
    plan: 'Plan Familiar Pro',
    planId: 'family_pro',
    status: 'active',
    startDate: '2026-03-01',
    renewalDate: '2026-11-01',
    devicesAllowed: 3,
    activeDevices: 2,
    beneficiaries: 'Dante Lara (6 años)',
    lastPaymentAmount: '$9.990 CLP',
    notes: 'Licencia hogar ilimitada con fotos de familia y respaldo en nube'
  },
  {
    id: 'cli-002',
    name: 'Centro Fonoaudiológico Integral - Flga. Camila Soto',
    email: 'contacto@fonoaudiologiasoto.cl',
    type: 'therapist',
    plan: 'Plan Terapéutico',
    planId: 'therapist',
    status: 'active',
    startDate: '2026-02-15',
    renewalDate: '2026-10-15',
    devicesAllowed: 15,
    activeDevices: 9,
    beneficiaries: '9 pacientes clínicos en seguimiento LME',
    lastPaymentAmount: '$29.990 CLP',
    notes: 'Uso clínico diario de métricas LME e informes fonoaudiológicos con IA'
  },
  {
    id: 'cli-003',
    name: 'Colegio San Agustín - Programa PIE',
    email: 'pie@sanagustinsantiago.cl',
    type: 'pie_school',
    plan: 'Plan Escuelas PIE',
    planId: 'pie_school',
    status: 'active',
    startDate: '2026-01-10',
    renewalDate: '2026-12-31',
    devicesAllowed: 35,
    activeDevices: 24,
    beneficiaries: '24 estudiantes con TEA y retos de comunicación',
    lastPaymentAmount: '$890.000 CLP',
    notes: 'Licencia institucional anual Decreto 170 / 83 con informes Mineduc'
  }
];

export default function AdminDashboardView() {
  // Authentication PIN state
  const [adminPin, setAdminPin] = useState(() => localStorage.getItem(PIN_STORAGE_KEY) || '1234');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('danmax_admin_auth') === 'true';
  });
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Sub-tab Navigation
  const [activeTab, setActiveTab] = useState('clients'); // 'clients', 'plans', 'copilot', 'settings'

  // Clients & Subscriptions State
  const [clients, setClients] = useState(() => {
    try {
      const saved = localStorage.getItem(CLIENTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CLIENTS;
  });

  // Client Filter
  const [clientFilter, setClientFilter] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedClientForPayment, setSelectedClientForPayment] = useState(null);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // New Client Form Data
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    type: 'family',
    planId: 'family_pro',
    status: 'active',
    devicesAllowed: 3,
    beneficiaries: '',
    notes: ''
  });

  // AI Copilot States
  const [aiReportForm, setAiReportForm] = useState({
    studentName: 'Dante',
    birthYear: '2020',
    therapistName: 'Mauricio Lara / Equipo Fonoaudiológico',
    centerName: 'Fundación Sin Barreras / Consulta CAA',
    extraNotes: 'Dante muestra mayor iniciativa con pictograma NO ante sobrecarga de ruido.'
  });
  const [aiReportResult, setAiReportResult] = useState('');
  const [aiReportLoading, setAiReportLoading] = useState(false);

  const [aiStrategiesResult, setAiStrategiesResult] = useState('');
  const [aiStrategiesLoading, setAiStrategiesLoading] = useState(false);

  const [aiSmartGoalsResult, setAiSmartGoalsResult] = useState('');
  const [aiSmartGoalsLoading, setAiSmartGoalsLoading] = useState(false);
  const [smartGoalFocus, setSmartGoalFocus] = useState('Rechazo funcional y autorregulación');

  const [aiConnectionStatus, setAiConnectionStatus] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);

  // Settings State
  const [newPinValue, setNewPinValue] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState(() => aiService.getApiKey());
  const [apiKeySavedSuccess, setApiKeySavedSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Save clients to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
    } catch (e) {}
  }, [clients]);

  // PIN Verification
  const handlePinSubmit = (e) => {
    if (e) e.preventDefault();
    if (enteredPin === adminPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('danmax_admin_auth', 'true');
      setPinError('');
      setEnteredPin('');
      tts.playChime('success');
    } else {
      setPinError('Código PIN incorrecto. Intenta de nuevo.');
      tts.playChime('pop');
    }
  };

  const handleQuickDemoPin = () => {
    if (adminPin === '1234') {
      setEnteredPin('1234');
      setIsAuthenticated(true);
      sessionStorage.setItem('danmax_admin_auth', 'true');
      tts.playChime('success');
    } else {
      setEnteredPin('1234');
      setPinError('El PIN predeterminado (1234) ya no es válido porque se configuró un PIN personalizado.');
      tts.playChime('pop');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('danmax_admin_auth');
    tts.playChime('pop');
  };

  const handleSaveNewPin = (e) => {
    e.preventDefault();
    if (newPinValue.length < 4) {
      alert('El nuevo PIN debe tener al menos 4 dígitos');
      return;
    }
    setAdminPin(newPinValue);
    localStorage.setItem(PIN_STORAGE_KEY, newPinValue);
    setNewPinValue('');
    tts.playChime('success');
    alert('¡Nuevo PIN de Administrador guardado exitosamente!');
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    aiService.setApiKey(apiKeyInput.trim());
    setApiKeySavedSuccess(true);
    tts.playChime('success');
    setTimeout(() => setApiKeySavedSuccess(false), 3000);
  };

  const handleTestAiConnection = async () => {
    setTestingConnection(true);
    setAiConnectionStatus(null);
    tts.playChime('pop');
    try {
      const res = await aiService.testConnection();
      setAiConnectionStatus(res);
      if (res.success) {
        tts.playChime('success');
      }
    } catch (err) {
      setAiConnectionStatus({ success: false, error: err.message });
    } finally {
      setTestingConnection(false);
    }
  };

  // Add Client
  const handleAddClientSubmit = (e) => {
    e.preventDefault();
    if (!newClient.name.trim()) return;

    const planNames = {
      family_pro: 'Plan Familiar Pro',
      therapist: 'Plan Terapéutico',
      pie_school: 'Plan Escuelas PIE'
    };

    const amounts = {
      family_pro: '$9.990 CLP',
      therapist: '$29.990 CLP',
      pie_school: '$890.000 CLP'
    };

    const created = {
      id: `cli-${Date.now().toString().slice(-4)}`,
      name: newClient.name.trim(),
      email: newClient.email.trim() || 'cliente@ejemplo.cl',
      type: newClient.type,
      plan: planNames[newClient.planId] || 'Plan Familiar Pro',
      planId: newClient.planId,
      status: newClient.status,
      startDate: new Date().toISOString().slice(0, 10),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      devicesAllowed: Number(newClient.devicesAllowed) || 3,
      activeDevices: 1,
      beneficiaries: newClient.beneficiaries || 'Estudiantes / Familiares registrados',
      lastPaymentAmount: amounts[newClient.planId] || '$9.990 CLP',
      notes: newClient.notes || 'Alta registrada desde Panel Administrador'
    };

    setClients([created, ...clients]);
    setShowAddModal(false);
    setNewClient({
      name: '',
      email: '',
      type: 'family',
      planId: 'family_pro',
      status: 'active',
      devicesAllowed: 3,
      beneficiaries: '',
      notes: ''
    });
    tts.playChime('success');
  };

  const handleDeleteClient = (id) => {
    if (window.confirm('¿Seguro que deseas dar de baja este cliente?')) {
      setClients(clients.filter(c => c.id !== id));
      tts.playChime('pop');
    }
  };

  const handleToggleStatus = (id) => {
    setClients(clients.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'active' ? 'paused' : 'active';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
    tts.playChime('pop');
  };

  // Payment Simulator
  const handleOpenPaymentSimulator = (client) => {
    setSelectedClientForPayment(client);
    setPaymentSuccessData(null);
    setShowPaymentModal(true);
    tts.playChime('pop');
  };

  const handleSimulatePaymentApproval = (method = 'Webpay Plus') => {
    if (!selectedClientForPayment) return;

    // Extend renewal by 30 days (from existing future renewalDate, or from now)
    const curRenewalTime = new Date(selectedClientForPayment.renewalDate).getTime();
    const nowTime = Date.now();
    const baseTime = (!isNaN(curRenewalTime) && curRenewalTime > nowTime) ? curRenewalTime : nowTime;
    const nextDate = new Date(baseTime + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const authCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;

    const updated = clients.map(c => {
      if (c.id === selectedClientForPayment.id) {
        return {
          ...c,
          status: 'active',
          renewalDate: nextDate
        };
      }
      return c;
    });

    setClients(updated);

    const successReceipt = {
      client: selectedClientForPayment,
      authCode,
      method,
      amount: selectedClientForPayment.lastPaymentAmount,
      date: new Date().toLocaleString('es-CL'),
      nextRenewal: nextDate
    };

    setPaymentSuccessData(successReceipt);
    tts.playChime('success');

    try {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.3 }
      });
    } catch (e) {}
  };

  // AI Copilot Actions
  const handleGenerateReportAI = async () => {
    setAiReportLoading(true);
    setAiReportResult('');
    tts.playChime('pop');

    try {
      const stats = analytics.getStats();
      const promptLevel = localStorage.getItem('danmax_current_prompt_level') || '3';

      const reportText = await aiService.generateClinicalReport({
        stats,
        promptLevel,
        patientName: aiReportForm.studentName,
        birthDate: aiReportForm.birthYear,
        therapistName: aiReportForm.therapistName,
        centerName: aiReportForm.centerName,
        extraNotes: aiReportForm.extraNotes
      });

      setAiReportResult(reportText);
      tts.playChime('success');
    } catch (err) {
      setAiReportResult(`❌ Error al conectar con OpenRouter (Llama 3.3-70B): ${err.message}`);
    } finally {
      setAiReportLoading(false);
    }
  };

  const handleGenerateStrategiesAI = async () => {
    setAiStrategiesLoading(true);
    setAiStrategiesResult('');
    tts.playChime('pop');

    try {
      const stats = analytics.getStats();
      const result = await aiService.generateModelingStrategies({
        stats,
        topWords: stats.topWords || [],
        userProfile: aiReportForm.studentName || 'Dante'
      });

      setAiStrategiesResult(result);
      tts.playChime('success');
    } catch (err) {
      setAiStrategiesResult(`❌ Error: ${err.message}`);
    } finally {
      setAiStrategiesLoading(false);
    }
  };

  const handleGenerateSmartGoalsAI = async () => {
    setAiSmartGoalsLoading(true);
    setAiSmartGoalsResult('');
    tts.playChime('pop');

    try {
      const stats = analytics.getStats();
      let currentGoals = [];
      try {
        const saved = localStorage.getItem(SMART_GOALS_STORAGE_KEY);
        if (saved) currentGoals = JSON.parse(saved);
      } catch (e) {}

      const result = await aiService.generateSmartGoalsPIE({
        stats,
        currentGoals,
        studentName: aiReportForm.studentName || 'Dante',
        focusArea: smartGoalFocus
      });

      setAiSmartGoalsResult(result);
      tts.playChime('success');
    } catch (err) {
      setAiSmartGoalsResult(`❌ Error: ${err.message}`);
    } finally {
      setAiSmartGoalsLoading(false);
    }
  };

  // Quick Adopt AI Goal into Live Therapist Board
  const handleAdoptGoalDirectly = (goalText, targetCount = 5) => {
    try {
      let existing = [];
      const saved = localStorage.getItem(SMART_GOALS_STORAGE_KEY);
      if (saved) existing = JSON.parse(saved);

      const newGoal = {
        id: Date.now(),
        text: goalText,
        target: targetCount,
        current: 0,
        completed: false
      };

      const updated = [...existing, newGoal];
      localStorage.setItem(SMART_GOALS_STORAGE_KEY, JSON.stringify(updated));
      tts.playChime('success');
      alert(`¡Objetivo adoptado con éxito!\n"${goalText}"\nAhora está activo en el Panel del Terapeuta.`);
    } catch (e) {
      alert('Error al guardar objetivo: ' + e.message);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      tts.playChime('success');
      setTimeout(() => setCopiedText(false), 2500);
    });
  };

  // Filter clients
  const filteredClients = clients.filter(c => {
    if (clientFilter === 'all') return true;
    if (clientFilter === 'family') return c.type === 'family';
    if (clientFilter === 'therapist') return c.type === 'therapist';
    if (clientFilter === 'pie_school') return c.type === 'pie_school';
    if (clientFilter === 'active') return c.status === 'active';
    return true;
  });

  // KPI Calculations
  const activeClientsCount = clients.filter(c => c.status === 'active').length;
  const totalBeneficiaries = clients.reduce((acc, c) => acc + (Number(c.devicesAllowed) || 1), 0);
  const calculatedMRR = clients
    .filter(c => c.status === 'active')
    .reduce((acc, c) => {
      if (c.planId === 'family_pro') return acc + 9990;
      if (c.planId === 'therapist') return acc + 29990;
      if (c.planId === 'pie_school') return acc + 89990;
      const numeric = parseInt((c.lastPaymentAmount || '').replace(/[^0-9]/g, ''), 10);
      return acc + (isNaN(numeric) ? 0 : numeric);
    }, 0);

  // ----------------------------------------------------
  // PIN LOCK VIEW (If not authenticated)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800">
              Panel Administrador
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
              Ingresa el código PIN de acceso rápido para gestionar clientes, pasarela de pago y Copiloto IA.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="flex justify-center">
              <input
                type="password"
                maxLength={8}
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError('');
                }}
                placeholder="••••"
                className="text-center tracking-widest text-3xl font-black py-3 px-4 w-48 border-2 border-indigo-200 rounded-2xl focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100 bg-slate-50"
                autoFocus
              />
            </div>

            {pinError && (
              <p className="text-xs text-rose-600 font-bold flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>{pinError}</span>
              </p>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-sm rounded-2xl cursor-pointer shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Desbloquear Administración</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDemoPin}
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl cursor-pointer transition-all border border-indigo-200"
              >
                🔑 Entrar con PIN por defecto (1234)
              </button>
            </div>
          </form>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium">
              Protección de seguridad para Mauricio Lara & Centro CAA
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD VIEW
  // ----------------------------------------------------
  return (
    <div className="p-3 md:p-6 max-w-6xl mx-auto space-y-6 pb-36 sm:pb-40 md:pb-48">
      {/* Top Banner with Badges & Sub-tab Selector */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-5 md:p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-xs rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
              <Shield className="w-7 h-7 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-black">Panel Administrador & Clientes</h2>
                <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Modo Pro Activo</span>
                </span>
              </div>
              <p className="text-xs md:text-sm text-indigo-200 font-medium">
                Gestión comercial de licencias, facturación, pasarela de pagos y Copiloto IA Clínico
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleLogout}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-rose-500/40 text-white rounded-xl font-bold text-xs cursor-pointer transition-all border border-white/15"
              title="Bloquear panel"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Bloquear</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-white/10">
          {[
            { id: 'clients', label: 'Clientes y Suscripciones', icon: Users },
            { id: 'plans', label: 'Catálogo de Planes', icon: Layers },
            { id: 'copilot', label: 'Copiloto IA Clínico (Llama 3.3)', icon: Bot },
            { id: 'settings', label: 'Seguridad & API Key', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  tts.playChime('pop');
                }}
                type="button"
                className={`
                  flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer whitespace-nowrap transition-all
                  ${isTabActive 
                    ? 'bg-white text-indigo-950 shadow-xs scale-102' 
                    : 'bg-white/10 text-indigo-100 hover:bg-white/20'}
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CLIENTS & SUBSCRIPTIONS (GESTIÓN & SIMULADOR DE PASARELA) */}
      {/* ========================================================================= */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 md:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider">MRR Estimado</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-slate-800">${calculatedMRR.toLocaleString('es-CL')}</div>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">CLP mensual recurrente</span>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 md:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider">Clientes Activos</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-slate-800">{activeClientsCount}</div>
              <span className="text-[10px] text-indigo-600 font-bold block mt-1">Suscripciones vigentes</span>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 md:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider">Beneficiarios</span>
                <HeartHandshake className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-slate-800">{totalBeneficiaries}</div>
              <span className="text-[10px] text-purple-600 font-bold block mt-1">Alumnos / Pacientes con voz</span>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 md:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider">Estado Pasarela</span>
                <CreditCard className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl md:text-2xl font-black text-emerald-600">Conectada</div>
              <span className="text-[10px] text-slate-400 font-bold block mt-1">Webpay / Stripe simulados</span>
            </div>
          </div>

          {/* Client Table Action Bar */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 md:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-black text-slate-800 text-base">Clientes y Licencias Registradas</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Administra altas, estado de licencias y prueba la simulación de cobro.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Filter Selector */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'family', label: 'Familias' },
                    { id: 'therapist', label: 'Terapeutas' },
                    { id: 'pie_school', label: 'Escuelas PIE' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setClientFilter(f.id)}
                      type="button"
                      className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${clientFilter === f.id ? 'bg-white text-indigo-900 font-black shadow-xs' : 'hover:text-slate-900'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  type="button"
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Cliente</span>
                </button>
              </div>
            </div>

            {/* Clients List */}
            <div className="space-y-3">
              {filteredClients.map((client) => {
                const isActive = client.status === 'active';
                return (
                  <div
                    key={client.id}
                    className="p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 transition-all bg-[#fafbff] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-900 text-sm">{client.name}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          client.type === 'pie_school' ? 'bg-purple-100 text-purple-800' :
                          client.type === 'therapist' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {client.plan}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isActive ? 'Activa' : 'Pausada'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 font-medium">
                        ✉️ {client.email} &bull; 👥 {client.beneficiaries}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold pt-1">
                        <span>Dispositivos: {client.activeDevices}/{client.devicesAllowed}</span>
                        <span>&bull;</span>
                        <span>Renovación: {client.renewalDate}</span>
                        <span>&bull;</span>
                        <span className="text-indigo-600 font-black">Monto: {client.lastPaymentAmount}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                      <button
                        onClick={() => handleOpenPaymentSimulator(client)}
                        type="button"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all"
                        title="Simular pasarela de pago y renovación"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Simular Cobro</span>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(client.id)}
                        type="button"
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-all"
                        title={isActive ? 'Pausar licencia' : 'Activar licencia'}
                      >
                        {isActive ? 'Pausar' : 'Activar'}
                      </button>

                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        type="button"
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg cursor-pointer transition-all"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PLANS CATALOG (DETALLES COMERCIALES DE LOS 3 MODELOS) */}
      {/* ========================================================================= */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h3 className="text-xl md:text-2xl font-black text-slate-800">
              Estructura de Planes Comerciales CAA
            </h3>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              Modelos de monetización y licenciamiento sustentable para hogares, terapeutas e instituciones educativas PIE
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Plan Familiar Pro */}
            <div className="bg-white border-2 border-emerald-300 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                    Hogares & Cuidadores
                  </span>
                  <HeartHandshake className="w-5 h-5 text-emerald-600" />
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-900">Plan Familiar Pro</h4>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-emerald-600">$9.990</span>
                    <span className="text-xs font-bold text-slate-500">CLP / mes</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
                    o $89.900 anual (2 meses gratis)
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Para padres y familias que necesitan máxima personalización para su hijo sin barreras tecnológicas.
                </p>

                <ul className="space-y-2 text-xs text-slate-700 font-medium pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Hasta 3 dispositivos sincronizados (tablet + teléfonos)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Carga ilimitada de fotos reales (cámara y galería)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Motor Edge-TTS neuronal en español chileno</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Copia de seguridad automática en la nube</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tableros de dolor anatómico y rutinas visuales</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewClient({ ...newClient, planId: 'family_pro', type: 'family', devicesAllowed: 3 });
                  setShowAddModal(true);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all text-center"
              >
                Dar de Alta Suscriptor Familiar
              </button>
            </div>

            {/* 2. Plan Terapéutico */}
            <div className="bg-white border-2 border-indigo-400 rounded-3xl p-5 md:p-6 shadow-md flex flex-col justify-between space-y-4 ring-2 ring-indigo-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full">
                    Profesionales SLP
                  </span>
                  <span className="text-[10px] font-black uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    Más Popular
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-900">Plan Terapéutico</h4>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-indigo-600">$29.990</span>
                    <span className="text-xs font-bold text-slate-500">CLP / mes</span>
                  </div>
                  <span className="text-[11px] text-indigo-700 font-bold block mt-0.5">
                    o $279.900 anual (descuento profesional)
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Para fonoaudiólogos, terapeutas ocupacionales y neurólogos con cartera de pacientes.
                </p>

                <ul className="space-y-2 text-xs text-slate-700 font-medium pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Multi-paciente (hasta 15 perfiles clínicos activos)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Métricas en vivo de LME / MLU y amplitud léxica</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Jerarquía de apoyos (Prompting) y desvanecimiento</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Informes clínicos descargables en PDF y JSON</span>
                  </li>
                  <li className="flex items-center gap-2 font-bold text-indigo-900">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Copiloto IA Clínico (Llama 3.3-70B) incluido</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewClient({ ...newClient, planId: 'therapist', type: 'therapist', devicesAllowed: 15 });
                  setShowAddModal(true);
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all text-center"
              >
                Dar de Alta Terapeuta
              </button>
            </div>

            {/* 3. Plan Escuelas PIE */}
            <div className="bg-white border-2 border-purple-300 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full">
                    Instituciones PIE
                  </span>
                  <School className="w-5 h-5 text-purple-600" />
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-900">Plan Escuelas PIE</h4>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-purple-600">$89.990</span>
                    <span className="text-xs font-bold text-slate-500">CLP / mes</span>
                  </div>
                  <span className="text-[11px] text-purple-700 font-bold block mt-0.5">
                    o $890.000 anual (Factura Mineduc)
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Para colegios y fundaciones bajo el decreto de inclusión escolar chileno (Decreto 170 / Decreto 83).
                </p>

                <ul className="space-y-2 text-xs text-slate-700 font-medium pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Licencia institucional (hasta 50 estudiantes simultáneos)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Fichas curriculares para educadoras diferenciales</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Informes semestrales alineados con estándares Mineduc</span>
                  </li>
                  <li className="flex items-center gap-2 font-bold text-purple-900">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Asistente IA para formulación de metas SMART PIE</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Capacitación docente remota y soporte prioritario</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewClient({ ...newClient, planId: 'pie_school', type: 'pie_school', devicesAllowed: 50 });
                  setShowAddModal(true);
                }}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all text-center"
              >
                Dar de Alta Colegio PIE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AI CLINICAL COPILOT (META LLAMA 3.3-70B) */}
      {/* ========================================================================= */}
      {activeTab === 'copilot' && (
        <div className="space-y-6">
          {/* Engine Status Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 md:p-5 rounded-3xl border border-indigo-500/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0 border border-indigo-400/30">
                <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm md:text-base">Motor Clínico: Meta LLaMA 3.3 (70B Instruct)</h4>
                  <span className="text-[10px] font-black uppercase bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    OpenRouter Oficial
                  </span>
                </div>
                <p className="text-xs text-indigo-200">
                  Modelado avanzado de lenguaje para informes fonoaudiológicos y adecuaciones curriculares PIE
                </p>
              </div>
            </div>

            <button
              onClick={handleTestAiConnection}
              disabled={testingConnection}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs cursor-pointer transition-all shrink-0 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'Verificando...' : 'Probar Latencia'}</span>
            </button>
          </div>

          {aiConnectionStatus && (
            <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between ${
              aiConnectionStatus.success ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              <span>
                {aiConnectionStatus.success 
                  ? `✓ Conexión exitosa con OpenRouter Llama 3.3 (70B) • Latencia: ${aiConnectionStatus.latency}ms` 
                  : `✕ Fallo de conexión: ${aiConnectionStatus.error}`}
              </span>
              <button onClick={() => setAiConnectionStatus(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
          )}

          {/* Module 1: Fonoaudiological Progress Report Generator */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-base">
                    1. Generador de Informes de Avance Fonoaudiológico
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Toma los datos reales de uso (LME, funciones pragmáticas y desvanecimiento de apoyos) y redacta en segundos un informe formal para el neurólogo, fonoaudiólogo o colegio.
                  </p>
                </div>
              </div>
            </div>

            {/* Custom patient params */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Nombre Paciente:</label>
                <input
                  type="text"
                  value={aiReportForm.studentName}
                  onChange={(e) => setAiReportForm({ ...aiReportForm, studentName: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Año Nacimiento / Edad:</label>
                <input
                  type="text"
                  value={aiReportForm.birthYear}
                  onChange={(e) => setAiReportForm({ ...aiReportForm, birthYear: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Profesional Evaluador:</label>
                <input
                  type="text"
                  value={aiReportForm.therapistName}
                  onChange={(e) => setAiReportForm({ ...aiReportForm, therapistName: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Institución / Centro:</label>
                <input
                  type="text"
                  value={aiReportForm.centerName}
                  onChange={(e) => setAiReportForm({ ...aiReportForm, centerName: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-medium">
                💡 Incluye automáticamente el cálculo de LME, desglose pragmático y nivel de prompting actual guardado en el comunicador.
              </span>

              <button
                onClick={handleGenerateReportAI}
                disabled={aiReportLoading}
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${aiReportLoading ? 'animate-spin' : ''}`} />
                <span>{aiReportLoading ? 'Redactando con Llama 3.3...' : 'Generar Informe Clínico con IA'}</span>
              </button>
            </div>

            {aiReportResult && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-teal-900 uppercase tracking-wider">
                    Informe Generado con Meta LLaMA 3.3 (70B):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyToClipboard(aiReportResult)}
                      type="button"
                      className="flex items-center gap-1 px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold border border-teal-200 cursor-pointer"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText ? 'Copiado' : 'Copiar Texto'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-2 border-teal-200 rounded-2xl max-h-96 overflow-y-auto text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed select-all">
                  {aiReportResult}
                </div>
              </div>
            )}
          </div>

          {/* Module 2: AAC Modeling Strategies Recommender */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-base">
                    2. Recomendador de Estrategias de Modelado CAA (ALS)
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Genera actividades personalizadas y guiones de interacción basados en las palabras que el usuario utiliza con más y menos frecuencia.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateStrategiesAI}
                disabled={aiStrategiesLoading}
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${aiStrategiesLoading ? 'animate-spin' : ''}`} />
                <span>{aiStrategiesLoading ? 'Generando Guiones...' : 'Sugerir Estrategias con IA'}</span>
              </button>
            </div>

            {aiStrategiesResult && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 uppercase tracking-wider">
                    Estrategias y Guiones Recomendados:
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(aiStrategiesResult)}
                    type="button"
                    className="flex items-center gap-1 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold border border-amber-200 cursor-pointer"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? 'Copiado' : 'Copiar Guiones'}</span>
                  </button>
                </div>

                <div className="p-4 bg-amber-50/50 border-2 border-amber-200 rounded-2xl max-h-96 overflow-y-auto text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {aiStrategiesResult}
                </div>
              </div>
            )}
          </div>

          {/* Module 3: SMART Goals Assistant for School PIE Programs */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-base">
                    3. Asistente de Objetivos SMART para Planes PIE (Escuela)
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Propone metas medibles para los informes de evaluación semestral del Programa de Integración Escolar (Decreto 170 / 83).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={smartGoalFocus}
                  onChange={(e) => setSmartGoalFocus(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-purple-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Rechazo funcional y autorregulación">Foco: Rechazo funcional (NO/PARAR)</option>
                  <option value="Combinación sintáctica LME (2+ palabras)">Foco: Combinación LME (2+ palabras)</option>
                  <option value="Iniciación comunicativa en transiciones escolares">Foco: Iniciación en el aula escolar</option>
                  <option value="Autonomía y desvanecimiento de apoyos">Foco: Desvanecimiento hacia Pausa Expectante</option>
                </select>

                <button
                  onClick={handleGenerateSmartGoalsAI}
                  disabled={aiSmartGoalsLoading}
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${aiSmartGoalsLoading ? 'animate-spin' : ''}`} />
                  <span>{aiSmartGoalsLoading ? 'Diseñando Metas...' : 'Proponer Metas SMART con IA'}</span>
                </button>
              </div>
            </div>

            {aiSmartGoalsResult && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-900 uppercase tracking-wider">
                    Metas SMART Generadas para Informe PIE:
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(aiSmartGoalsResult)}
                    type="button"
                    className="flex items-center gap-1 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg text-xs font-bold border border-purple-200 cursor-pointer"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? 'Copiado' : 'Copiar Todo'}</span>
                  </button>
                </div>

                <div className="p-4 bg-purple-50/50 border-2 border-purple-200 rounded-2xl max-h-96 overflow-y-auto text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {aiSmartGoalsResult}
                </div>

                <div className="p-3 bg-purple-100/60 rounded-2xl border border-purple-200 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <span className="font-bold text-purple-900">
                    💡 ¿Quieres agregar metas rápidamente al panel en vivo del niño?
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleAdoptGoalDirectly('Expresar rechazo funcional ("NO" o "PARAR") antes de desregulación', 5)}
                      className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-800 font-black rounded-lg border border-purple-300 shadow-2xs cursor-pointer"
                    >
                      + Adoptar Meta: Rechazo Funcional
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdoptGoalDirectly('Combinar 2 palabras en barra sintáctica en actividades de aula', 10)}
                      className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-800 font-black rounded-lg border border-purple-300 shadow-2xs cursor-pointer"
                    >
                      + Adoptar Meta: Combinar 2 Palabras
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SETTINGS & SECURITY (PIN, OPENROUTER KEY & BACKUP) */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* PIN Management */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
            <h4 className="font-black text-slate-800 text-base flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              <span>Cambio de Código PIN de Administrador</span>
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              El PIN protege la vista de cobros y administración. PIN actual: <strong>{adminPin}</strong>.
            </p>

            <form onSubmit={handleSaveNewPin} className="flex items-center gap-3 max-w-sm">
              <input
                type="password"
                maxLength={8}
                value={newPinValue}
                onChange={(e) => setNewPinValue(e.target.value)}
                placeholder="Nuevo PIN (ej. 4 dígitos)"
                className="flex-1 p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer shadow-xs"
              >
                Actualizar PIN
              </button>
            </form>
          </div>

          {/* OpenRouter API Key Configuration */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
            <h4 className="font-black text-slate-800 text-base flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <span>Configuración de API Key de OpenRouter</span>
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Conexión para Meta LLaMA 3.3 (70B Instruct). Puedes reemplazar la llave o validar su operatividad.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <div className="relative flex items-center">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full pr-10 p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showApiKey ? 'Ocultar llave' : 'Mostrar llave'}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-medium">
                  {apiKeySavedSuccess ? '✓ Llave guardada en almacenamiento local' : 'Llave oficial de Mauricio Lara configurada'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestAiConnection}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Probar Conexión
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer shadow-xs"
                  >
                    Guardar Llave
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ALTA DE NUEVO CLIENTE */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 max-w-lg w-full p-5 md:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base md:text-lg">
                Dar de Alta Nuevo Cliente / Licencia
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo o Institución:</label>
                <input
                  type="text"
                  required
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Ej: Familia González / Escuela Los Andes"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email de Contacto:</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="cliente@ejemplo.cl"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Cliente:</label>
                  <select
                    value={newClient.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const defaults = {
                        family: { planId: 'family_pro', devicesAllowed: 3 },
                        therapist: { planId: 'therapist', devicesAllowed: 15 },
                        pie_school: { planId: 'pie_school', devicesAllowed: 35 }
                      };
                      setNewClient({
                        ...newClient,
                        type: newType,
                        planId: defaults[newType]?.planId || 'family_pro',
                        devicesAllowed: defaults[newType]?.devicesAllowed || 3
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="family">Hogar / Familia</option>
                    <option value="therapist">Fonoaudiólogo / SLP</option>
                    <option value="pie_school">Escuela PIE / Mineduc</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plan Asignado:</label>
                  <select
                    value={newClient.planId}
                    onChange={(e) => {
                      const newPlanId = e.target.value;
                      const defaults = {
                        family_pro: { type: 'family', devicesAllowed: 3 },
                        therapist: { type: 'therapist', devicesAllowed: 15 },
                        pie_school: { type: 'pie_school', devicesAllowed: 35 }
                      };
                      setNewClient({
                        ...newClient,
                        planId: newPlanId,
                        type: defaults[newPlanId]?.type || 'family',
                        devicesAllowed: defaults[newPlanId]?.devicesAllowed || 3
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="family_pro">Plan Familiar Pro ($9.990)</option>
                    <option value="therapist">Plan Terapéutico ($29.990)</option>
                    <option value="pie_school">Plan Escuelas PIE ($890.000)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Límite Dispositivos/Alumnos:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newClient.devicesAllowed}
                    onChange={(e) => setNewClient({ ...newClient, devicesAllowed: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estado Inicial:</label>
                  <select
                    value={newClient.status}
                    onChange={(e) => setNewClient({ ...newClient, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="active">Activa (Vigente)</option>
                    <option value="trial">En Prueba (14 días)</option>
                    <option value="paused">Pausada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Beneficiarios / Notas:</label>
                <input
                  type="text"
                  value={newClient.beneficiaries}
                  onChange={(e) => setNewClient({ ...newClient, beneficiaries: e.target.value })}
                  placeholder="Ej: Mateo (5 años) - Uso en hogar y escuela"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-xs cursor-pointer"
                >
                  Guardar y Activar Licencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SIMULADOR DE PASARELA DE PAGO (WEBPAY PLUS / STRIPE) */}
      {/* ========================================================================= */}
      {showPaymentModal && selectedClientForPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 max-w-md w-full p-5 md:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">
                  Simulador de Pasarela de Pago
                </h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {!paymentSuccessData ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Cliente:</span>
                    <span className="font-black text-slate-800">{selectedClientForPayment.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Plan:</span>
                    <span className="font-bold text-indigo-700">{selectedClientForPayment.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Fecha Renovación Actual:</span>
                    <span className="font-bold text-slate-700">{selectedClientForPayment.renewalDate}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 text-sm">
                    <span className="font-black text-slate-800">Total a Cobrar:</span>
                    <span className="font-black text-emerald-600 text-base">{selectedClientForPayment.lastPaymentAmount}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-600 block">
                    Selecciona método de simulación:
                  </span>

                  <button
                    onClick={() => handleSimulatePaymentApproval('Webpay Plus (Transbank)')}
                    type="button"
                    className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs flex items-center justify-between active:scale-98 transition-all"
                  >
                    <span>Simular Pago Webpay Plus (Tarjetas Chile)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSimulatePaymentApproval('Stripe Checkout')}
                    type="button"
                    className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs flex items-center justify-between active:scale-98 transition-all"
                  >
                    <span>Simular Pago Stripe (Internacional USD)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSimulatePaymentApproval('Transferencia Bancaria')}
                    type="button"
                    className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs flex items-center justify-between active:scale-98 transition-all"
                  >
                    <span>Simular Transferencia Directa / Factura</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-base font-black text-emerald-900">
                    ¡Transacción Aprobada Exitosamente!
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    La licencia ha sido renovada por 30 días adicionales.
                  </p>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-slate-700 space-y-1 text-left font-mono">
                  <div><strong>Código Auth:</strong> {paymentSuccessData.authCode}</div>
                  <div><strong>Medio de Pago:</strong> {paymentSuccessData.method}</div>
                  <div><strong>Monto Procesado:</strong> {paymentSuccessData.amount}</div>
                  <div><strong>Nueva Fecha Renovación:</strong> {paymentSuccessData.nextRenewal}</div>
                </div>

                <button
                  onClick={() => setShowPaymentModal(false)}
                  type="button"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs"
                >
                  Cerrar Comprobante
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
