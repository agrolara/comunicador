import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  FolderTree,
  AlertCircle,
  CalendarCheck2,
  Users2,
  BookOpenText,
  PlusCircle,
  Sliders,
  BarChart3,
  HelpCircle,
  ShieldCheck,
  Smartphone,
  Monitor,
  RotateCcw,
  UserCheck,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  LogOut,
  X,
  CheckCircle2
} from 'lucide-react';
import { tts } from '../services/tts';
import QuickSearch from './QuickSearch';
import confetti from 'canvas-confetti';

const CLIENTS_STORAGE_KEY = 'danmax_admin_clients';
const ACTIVE_SESSION_KEY = 'danmax_active_client_session';
const DEVICE_KEY = 'danmax_device_id';

function getOrCreateDeviceId() {
  let devId = localStorage.getItem(DEVICE_KEY);
  if (!devId) {
    devId = `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    try {
      localStorage.setItem(DEVICE_KEY, devId);
    } catch (e) {}
  }
  return devId;
}

export default function Navbar({
  activeTab,
  onTabChange,
  highContrast = false,
  onAddToSentence,
  imageOverrides = {},
  textOverrides = {},
  customPictograms = [],
  sentenceItems = [],
  orientationMode = 'auto',
  onOrientationModeChange = () => {}
}) {
  const primaryTabs = [
    { id: 'main', label: 'Tablero', icon: LayoutGrid },
    { id: 'categories', label: 'Categoría Pictogramas', icon: FolderTree },
    { id: 'pain', label: 'Dolor', icon: AlertCircle },
    { id: 'routines', label: 'Rutinas', icon: CalendarCheck2 },
    { id: 'turns', label: 'Turnos', icon: Users2 },
    { id: 'stories', label: 'Historias', icon: BookOpenText },
    { id: 'editor', label: 'Editor', icon: PlusCircle },
    { id: 'settings', label: 'Ajustes', icon: Sliders }
  ];

  // Client Session State
  const [activeClientSession, setActiveClientSession] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [showClientModal, setShowClientModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSelectTab = (tabId) => {
    tts.playChime('pop');
    onTabChange(tabId);
  };

  const handleClientLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const savedClients = localStorage.getItem(CLIENTS_STORAGE_KEY);
      const clientsList = savedClients ? JSON.parse(savedClients) : [];
      
      const clientIndex = clientsList.findIndex(c => 
        (c.email || '').trim().toLowerCase() === loginEmail.trim().toLowerCase() &&
        (c.password || '') === loginPassword.trim()
      );

      if (clientIndex !== -1) {
        const found = clientsList[clientIndex];

        // 1. Check if paused
        if (found.status === 'paused') {
          setLoginError('Esta cuenta se encuentra pausada. Por favor contacta al administrador.');
          tts.playChime('pop');
          return;
        }

        // 2. Device limit tracking & registration
        const devId = getOrCreateDeviceId();
        const registeredDevices = Array.isArray(found.registeredDevices) ? [...found.registeredDevices] : [];
        const isDeviceRegistered = registeredDevices.includes(devId);

        if (!isDeviceRegistered) {
          const maxAllowed = Number(found.devicesAllowed) || 1;
          if (registeredDevices.length >= maxAllowed) {
            setLoginError(`Límite de dispositivos alcanzado: Este plan permite máximo ${maxAllowed} equipo(s). Contacta al administrador para ampliar tu cupo o reiniciar equipos.`);
            tts.playChime('pop');
            return;
          }
          // Register this new device
          registeredDevices.push(devId);
          found.registeredDevices = registeredDevices;
          found.activeDevices = registeredDevices.length;
          clientsList[clientIndex] = found;
          localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clientsList));
        }

        setActiveClientSession(found);
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(found));
        setShowClientModal(false);
        setLoginEmail('');
        setLoginPassword('');
        tts.playChime('success');
        tts.speak(`¡Bienvenido ${found.name}! Tu cuenta está registrada y activa en este equipo.`);
        try {
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.3 } });
        } catch (err) {}
      } else {
        setLoginError('Correo o contraseña incorrectos. Verifica que el administrador te haya dado de alta con estos datos.');
        tts.playChime('pop');
      }
    } catch (err) {
      setLoginError('Error al validar cuenta.');
    }
  };

  const handleClientLogout = () => {
    setActiveClientSession(null);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setShowClientModal(false);
    tts.playChime('pop');
    tts.speak('Sesión cerrada en este equipo.');
  };

  const cycleOrientation = () => {
    const next = orientationMode === 'auto' ? 'portrait' : orientationMode === 'portrait' ? 'landscape' : 'auto';
    onOrientationModeChange(next);
    tts.playChime('pop');
  };

  return (
    <>
      {/* Top Android App Bar con Buscador Rápido de Pictogramas Integrado */}
      <header className="bg-[#ffffff] border-b border-[#c3c6d7] px-2 sm:px-4 py-2 flex items-center justify-between gap-1.5 sm:gap-2 shadow-2xs z-30 sticky top-0">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <img
            src="/logo.png"
            alt="DanteVoz Logo"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl object-cover shadow-sm border border-[#004ac6]/20 bg-white"
          />
          <div>
            <h1 className="font-black text-xs sm:text-base md:text-lg text-[#111c2d] tracking-tight leading-tight flex items-center gap-1 sm:gap-1.5">
              <span>Esta es mi voz</span>
              <span className="text-[8px] sm:text-[10px] text-[#004ac6] font-black bg-[#dbe1ff] px-1.5 sm:px-2 py-0.5 rounded-full uppercase">
                Sin límites
              </span>
            </h1>
            <span className="text-[9px] sm:text-[11px] font-bold text-[#737686] hidden lg:flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Hecho con amor para mi hijo y toda la comunidad no verbal ❤️ ♾️</span>
            </span>
          </div>
        </div>

        {/* Center: Buscador Rápido de Pictogramas */}
        <QuickSearch
          onAddToSentence={onAddToSentence}
          imageOverrides={imageOverrides}
          textOverrides={textOverrides}
          customPictograms={customPictograms}
          sentenceItems={sentenceItems}
        />

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Orientation Mode Switcher (PWA / App) */}
          <button
            type="button"
            onClick={cycleOrientation}
            className={`
              flex items-center gap-1 px-2 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all border
              ${orientationMode === 'portrait'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : orientationMode === 'landscape'
                ? 'bg-violet-50 text-violet-800 border-violet-300 shadow-2xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}
            `}
            title={`Orientación de la App: ${orientationMode === 'portrait' ? 'Vertical (Retrato)' : orientationMode === 'landscape' ? 'Horizontal (Paisaje)' : 'Automático'}. Toca para cambiar.`}
          >
            {orientationMode === 'portrait' ? (
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            ) : orientationMode === 'landscape' ? (
              <Monitor className="w-3.5 h-3.5 text-violet-600" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span className="hidden xl:inline text-[10px]">
              {orientationMode === 'portrait' ? 'Vertical' : orientationMode === 'landscape' ? 'Horizontal' : 'Auto'}
            </span>
          </button>

          {/* Client Account / Iniciar Sesión o Registrarse con clave asignada */}
          <button
            type="button"
            onClick={() => {
              setShowClientModal(true);
              tts.playChime('pop');
            }}
            className={`
              flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl font-extrabold text-xs cursor-pointer transition-all border
              ${activeClientSession
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'}
            `}
            title={activeClientSession ? `Licencia Activa: ${activeClientSession.name}` : "Registro y Acceso de Clientes"}
          >
            <UserCheck className={`w-3.5 h-3.5 ${activeClientSession ? 'text-emerald-600' : 'text-slate-600'}`} />
            <span className="hidden sm:inline text-[11px]">
              {activeClientSession ? activeClientSession.name.split(' ')[0] : 'Mi Cuenta'}
            </span>
          </button>

          {/* Therapist Tab */}
          <button
            onClick={() => handleSelectTab('therapist')}
            type="button"
            className={`
              flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl font-extrabold text-xs cursor-pointer transition-all
              ${activeTab === 'therapist' 
                ? 'bg-[#004ac6] text-white shadow-xs' 
                : 'bg-[#e7eeff] text-[#004ac6] hover:bg-[#d8e3fb]'}
            `}
            title="Panel de Fonoaudiología y Progreso"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Terapeuta</span>
          </button>

          {/* Guide Tab */}
          <button
            onClick={() => handleSelectTab('guide')}
            type="button"
            className={`
              flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl font-extrabold text-xs cursor-pointer transition-all
              ${activeTab === 'guide' 
                ? 'bg-[#ba1a1a] text-white shadow-xs' 
                : 'bg-[#ffdad6] text-[#93000a] hover:bg-[#ffc5bf]'}
            `}
            title="Guía de Modelado CAA"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Guía CAA</span>
          </button>

          {/* Admin Dashboard */}
          <button
            onClick={() => handleSelectTab('admin')}
            type="button"
            className={`
              flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl font-extrabold text-xs cursor-pointer transition-all
              ${activeTab === 'admin' 
                ? 'bg-[#312e81] text-white shadow-xs' 
                : 'bg-[#e0e7ff] text-[#3730a3] hover:bg-[#c7d2fe]'}
            `}
            title="Panel Administrador y Gestión de Clientes"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Admin</span>
          </button>
        </div>
      </header>

      {/* MODAL: REGISTRO / ACCESO DE CLIENTE CON CORREO Y CLAVE REGISTRADA */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base md:text-lg">
                    {activeClientSession ? 'Mi Cuenta de Cliente' : 'Registro y Acceso de Clientes'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {activeClientSession ? 'Sesión activa en este equipo' : 'Ingresa con el correo y contraseña asignados'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowClientModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeClientSession ? (
              /* Logged In View */
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full inline-block">
                      Licencia Activa
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Equipo Autorizado</span>
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-900">{activeClientSession.name}</h4>
                  <p className="text-xs text-slate-600">
                    📧 Correo registrado: <strong className="text-slate-900">{activeClientSession.email}</strong>
                  </p>
                  <p className="text-xs text-slate-600">
                    📋 Plan: <strong className="text-slate-900">{activeClientSession.plan}</strong>
                  </p>
                  <p className="text-xs text-slate-600">
                    📱 Límite de dispositivos: <strong className="text-slate-900">{activeClientSession.devicesAllowed} autorizados ({activeClientSession.registeredDevices?.length || 1} en uso)</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Renovación de suscripción: {activeClientSession.renewalDate}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleClientLogout}
                    className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl cursor-pointer border border-rose-200 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowClientModal(false)}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer transition-all text-center"
                  >
                    Continuar Usando
                  </button>
                </div>
              </div>
            ) : (
              /* Registration / Login Form */
              <form onSubmit={handleClientLogin} className="space-y-3.5 text-xs">
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 text-slate-700 space-y-1">
                  <p className="font-bold text-indigo-950">
                    ¿Tienes una cuenta dada de alta por el administrador?
                  </p>
                  <p className="text-[11px] text-indigo-900/80 leading-relaxed font-medium">
                    Ingresa aquí con el <strong>correo</strong> y la <strong>contraseña</strong> que te asignó el administrador. Al ingresar, tu equipo quedará automáticamente registrado y vinculado a tu licencia.
                  </p>
                </div>

                <div>
                  <label className="font-black text-slate-700 block mb-1">Correo Electrónico Registrado:</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="tu-correo@ejemplo.cl"
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-black text-slate-700 block mb-1">Contraseña de Acceso Asignada:</label>
                  <div className="relative flex items-center">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Ingresa la contraseña asignada por el admin"
                      className="w-full pr-10 p-2.5 bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 rounded-xl font-bold text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showLoginPassword ? 'Ocultar' : 'Ver'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                    ⚠️ {loginError}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowClientModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black rounded-xl cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    Registrar y Entrar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bottom Android Material 3 Navigation Bar */}
      <nav className={`
        fixed bottom-0 z-40 bg-[#ffffff] border-t-2 border-[#c3c6d7]
        px-1 sm:px-3 py-1 shadow-lg flex items-center overflow-x-auto no-scrollbar
        justify-start sm:justify-around gap-1 sm:gap-2
        ${orientationMode === 'portrait' ? 'left-1/2 -translate-x-1/2 w-full max-w-[680px]' : 'left-0 right-0'}
        ${highContrast ? 'border-t-4 border-black bg-slate-50' : ''}
      `}>
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              type="button"
              className="flex flex-col items-center justify-center shrink-0 min-w-[62px] sm:min-w-0 sm:flex-1 py-1 cursor-pointer select-none group"
            >
              {/* Material 3 Active Indicator Pill */}
              <div className={`
                flex items-center justify-center px-2.5 sm:px-4 py-1 rounded-full transition-all duration-150
                ${isActive 
                  ? 'bg-[#dbe1ff] text-[#004ac6] scale-105 shadow-2xs' 
                  : 'text-[#434655] group-hover:bg-slate-100'}
              `}>
                <Icon className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className={`
                text-[9px] sm:text-[11px] mt-0.5 tracking-tight line-clamp-1 max-w-[74px] sm:max-w-none text-center leading-tight
                ${isActive ? 'font-black text-[#004ac6]' : 'font-bold text-[#737686]'}
              `}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
