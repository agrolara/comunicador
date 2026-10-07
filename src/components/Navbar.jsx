import React from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { tts } from '../services/tts';
import QuickSearch from './QuickSearch';

export default function Navbar({
  activeTab,
  onTabChange,
  highContrast = false,
  onAddToSentence,
  imageOverrides = {},
  textOverrides = {},
  customPictograms = []
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

  const handleSelectTab = (tabId) => {
    tts.playChime('pop');
    onTabChange(tabId);
  };

  return (
    <>
      {/* Top Android App Bar con Buscador Rápido de Pictogramas Integrado */}
      <header className="bg-[#ffffff] border-b border-[#c3c6d7] px-2 sm:px-4 py-2 flex items-center justify-between gap-2 shadow-2xs z-30 sticky top-0">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <img
            src="/logo.png"
            alt="DanteVoz Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl object-cover shadow-sm border border-[#004ac6]/20 bg-white"
          />
          <div>
            <h1 className="font-black text-xs sm:text-base md:text-lg text-[#111c2d] tracking-tight leading-tight flex items-center gap-1 sm:gap-1.5">
              <span>Esta es mi voz</span>
              <span className="text-[8px] sm:text-[10px] text-[#004ac6] font-black bg-[#dbe1ff] px-1.5 sm:px-2 py-0.5 rounded-full uppercase">
                Sin límites
              </span>
            </h1>
            <span className="text-[9px] sm:text-[11px] font-bold text-[#737686] hidden md:flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Hecho con amor para mi hijo y toda la comunidad no verbal ❤️ ♾️</span>
            </span>
          </div>
        </div>

        {/* Center: Buscador Rápido de Pictogramas (Replicado en todas las vistas) */}
        <QuickSearch
          onAddToSentence={onAddToSentence}
          imageOverrides={imageOverrides}
          textOverrides={textOverrides}
          customPictograms={customPictograms}
        />

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            onClick={() => handleSelectTab('therapist')}
            type="button"
            className={`
              flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl font-extrabold text-xs cursor-pointer transition-all
              ${activeTab === 'therapist' 
                ? 'bg-[#004ac6] text-white shadow-xs' 
                : 'bg-[#e7eeff] text-[#004ac6] hover:bg-[#d8e3fb]'}
            `}
            title="Panel de Fonoaudiología y Progreso"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Terapeuta</span>
          </button>

          <button
            onClick={() => handleSelectTab('guide')}
            type="button"
            className={`
              flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl font-extrabold text-xs cursor-pointer transition-all
              ${activeTab === 'guide' 
                ? 'bg-[#ba1a1a] text-white shadow-xs' 
                : 'bg-[#ffdad6] text-[#93000a] hover:bg-[#ffc5bf]'}
            `}
            title="Guía de Modelado CAA"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Guía CAA</span>
          </button>

          <button
            onClick={() => handleSelectTab('admin')}
            type="button"
            className={`
              flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl font-extrabold text-xs cursor-pointer transition-all
              ${activeTab === 'admin' 
                ? 'bg-[#312e81] text-white shadow-xs' 
                : 'bg-[#e0e7ff] text-[#3730a3] hover:bg-[#c7d2fe]'}
            `}
            title="Panel Administrador y Gestión de Clientes"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Panel Administrador</span>
          </button>
        </div>
      </header>

      {/* Bottom Android Material 3 Navigation Bar (Fluid Responsive for Mobile, Tablet & Desktop) */}
      <nav className={`
        fixed bottom-0 left-0 right-0 z-40 bg-[#ffffff] border-t-2 border-[#c3c6d7]
        px-1 sm:px-3 py-1 shadow-lg flex items-center overflow-x-auto no-scrollbar
        justify-start sm:justify-around gap-1 sm:gap-2
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
              className="flex flex-col items-center justify-center flex-shrink-0 min-w-[62px] sm:min-w-0 sm:flex-1 py-1 cursor-pointer select-none group"
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
