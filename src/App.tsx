import React, { useState } from 'react';
import {
  Play,
  Pause,
  Gauge,
  Calculator,
  Compass,
  Award,
  BookOpen,
} from 'lucide-react';
import { Module1Series } from './components/Module1Series';
import { Module2Parallel } from './components/Module2Parallel';
import { Module3Mixed } from './components/Module3Mixed';
import { Module4Engineering } from './components/Module4Engineering';
import { GuideAndValidationModal } from './components/GuideAndValidationModal';

type ModuleId = 'mod1' | 'mod2' | 'mod3' | 'mod4';

const MODULES: {
  id: ModuleId;
  shortNav: string;
  number: string;
  title: string;
  level: string;
}[] = [
  {
    id: 'mod1',
    shortNav: '01. Serie',
    number: '01',
    title: 'Circuitos Resistivos en Serie',
    level: 'Nivel 1 · Base',
  },
  {
    id: 'mod2',
    shortNav: '02. Paralelo',
    number: '02',
    title: 'Circuitos Resistivos en Paralelo',
    level: 'Nivel 2 · Intermedio',
  },
  {
    id: 'mod3',
    shortNav: '03. Mixtos',
    number: '03',
    title: 'Circuitos Resistivos Mixtos',
    level: 'Nivel 3 · Avanzado',
  },
  {
    id: 'mod4',
    shortNav: '04. Ingeniería de Red',
    number: '04',
    title: 'Desafío: Alimentación DC de Red',
    level: 'Nivel 4 · Integrador',
  },
];

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('mod1');
  const [isChallengeMode, setIsChallengeMode] = useState<boolean>(false);
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(true);
  const [showMath, setShowMath] = useState<boolean>(true);
  const [showMultimeter, setShowMultimeter] = useState<boolean>(true);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Top Bar Contract: 3 zonas estrictas separadas por gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zona 1: Marca en una línea */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveModule('mod1');
          }}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          UTPL · Laboratorio de Circuitos DC
        </a>

        {/* Zona 2: 4 enlaces de navegación de una sola línea */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          {MODULES.map((m) => {
            const active = activeModule === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveModule(m.id)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                  active
                    ? 'text-slate-900 font-semibold border-sky-600'
                    : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {m.shortNav}
              </button>
            );
          })}
        </nav>

        {/* Zona 3: 1 acción principal */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Guía y Validación
          </button>
        </div>
      </header>

      {/* Barra de Contexto Académico, Progresión de Módulos y Herramientas Globales */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4">
        <div className="max-w-[1440px] mx-auto space-y-4">
          {/* Información institucional sin píldoras estáticas */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-800">
                Laboratorio Virtual de Circuitos DC: Análisis, Simulación y Decisiones Técnicas
              </span>
              <span aria-hidden="true">·</span>
              <span>Universidad Técnica Particular de Loja (UTPL)</span>
              <span aria-hidden="true">·</span>
              <span>Redes y Analítica de Datos (3.er Ciclo)</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-sky-700 font-medium">Semana 1</span>
            </div>

            {/* Selector global: Modo Exploración Libre vs Modo Desafío Guiado */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setIsChallengeMode(false)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  !isChallengeMode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-sky-700" />
                Modo Exploración Libre
              </button>
              <button
                type="button"
                onClick={() => setIsChallengeMode(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isChallengeMode
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Modo Desafío Guiado
              </button>
            </div>
          </div>

          {/* Pestañas de progresión pedagógica para los 4 módulos + Barra de instrumentos */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-1">
            {/* Pestañas de los 4 módulos con progresión recomendada */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
              {MODULES.map((m) => {
                const active = activeModule === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveModule(m.id)}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50/80 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className={active ? 'text-sky-300 font-semibold' : 'text-sky-700'}>
                        MÓDULO {m.number}
                      </span>
                      <span className={active ? 'text-slate-300' : 'text-slate-400'}>
                        {m.level}
                      </span>
                    </div>
                    <div className="text-xs font-semibold truncate mt-0.5">{m.title}</div>
                  </button>
                );
              })}
            </div>

            {/* Controles globales de instrumentos, ecuaciones y animaciones */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowMultimeter((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  showMultimeter
                    ? 'bg-sky-50 border-sky-300 text-sky-900'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
                {showMultimeter ? 'Ocultar Multímetro' : 'Mostrar Multímetro'}
              </button>

              <button
                type="button"
                onClick={() => setShowMath((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  showMath
                    ? 'bg-sky-50 border-sky-300 text-sky-900'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                {showMath ? 'Ocultar Cálculos' : 'Mostrar Cálculos'}
              </button>

              <button
                type="button"
                onClick={() => setAnimationsEnabled((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  animationsEnabled
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {animationsEnabled ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                {animationsEnabled ? 'Pausar Animación' : 'Activar Animación'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Área Principal del Laboratorio (Aprovechamiento completo de pantalla 1440px) */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-6">
        {activeModule === 'mod1' && (
          <Module1Series
            animationsEnabled={animationsEnabled}
            showMath={showMath}
            onToggleMath={() => setShowMath((p) => !p)}
            showMultimeter={showMultimeter}
            isChallengeMode={isChallengeMode}
            onActivateChallengeMode={() => setIsChallengeMode(true)}
          />
        )}

        {activeModule === 'mod2' && (
          <Module2Parallel
            animationsEnabled={animationsEnabled}
            showMath={showMath}
            onToggleMath={() => setShowMath((p) => !p)}
            showMultimeter={showMultimeter}
            isChallengeMode={isChallengeMode}
            onActivateChallengeMode={() => setIsChallengeMode(true)}
          />
        )}

        {activeModule === 'mod3' && (
          <Module3Mixed
            animationsEnabled={animationsEnabled}
            showMath={showMath}
            onToggleMath={() => setShowMath((p) => !p)}
            showMultimeter={showMultimeter}
            isChallengeMode={isChallengeMode}
            onActivateChallengeMode={() => setIsChallengeMode(true)}
          />
        )}

        {activeModule === 'mod4' && (
          <Module4Engineering
            animationsEnabled={animationsEnabled}
            showMath={showMath}
            onToggleMath={() => setShowMath((p) => !p)}
            showMultimeter={showMultimeter}
            isChallengeMode={isChallengeMode}
            onActivateChallengeMode={() => setIsChallengeMode(true)}
          />
        )}
      </main>

      {/* Pie de página sobrio e institucional */}
      <footer className="bg-white border-t border-slate-200 px-4 sm:px-8 py-4 mt-8">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Universidad Técnica Particular de Loja (UTPL) · Asignatura: Circuitos Eléctricos · Carrera de Redes y Analítica de Datos (Modalidad en Línea)
          </div>
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="inline-flex items-center gap-1.5 text-sky-700 hover:text-sky-900 font-medium cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Abrir Guía Teórica, Simulador de Resistividad y Casos de Prueba (1–6)
          </button>
        </div>
      </footer>

      {/* Modal de Guía Académica, Resistividad y Pruebas de Validación */}
      <GuideAndValidationModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
