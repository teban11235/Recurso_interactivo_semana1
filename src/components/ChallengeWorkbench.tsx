import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, Lightbulb, ArrowRight, RotateCcw, AlertCircle } from 'lucide-react';
import {
  PhysicalMagnitudeType,
  validateStudentNumericAnswer,
  AnswerValidationResult,
} from '../engine/circuitEngine';
import { MathFormula } from './MathDevelopment';

export interface PredictionActivity {
  id: string;
  title: string;
  question: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
  actionInstruction: string;
  onExecuteAction?: () => void;
  actionButtonLabel?: string;
  physicalExplanation: string;
  formulaSupportLatex?: string;
}

export interface NumericChallengeItem {
  id: string;
  title: string;
  prompt: string;
  magnitudeType: PhysicalMagnitudeType;
  expectedValueSI: number;
  availableUnits: string[];
  defaultUnit: string;
  hints: [string, string]; // Ayudas progresivas (Nivel 1 y Nivel 2)
  procedureLatex: string;
  physicalExplanation: string;
  commonMistakesSI?: {
    valueSI: number;
    message: string;
    category: AnswerValidationResult['errorCategory'];
  }[];
}

interface PredictionPanelProps {
  activities: PredictionActivity[];
}

export const PredictionActivitiesPanel: React.FC<PredictionPanelProps> = ({ activities }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<Record<string, string>>({});
  const [lockedPrediction, setLockedPrediction] = useState<Record<string, boolean>>({});
  const [actionExecuted, setActionExecuted] = useState<Record<string, boolean>>({});

  const current = activities[activeIdx] ?? activities[0];
  if (!current) return null;

  const chosen = selectedOption[current.id] ?? '';
  const isLocked = !!lockedPrediction[current.id];
  const isExecuted = !!actionExecuted[current.id];
  const isCorrect = chosen === current.correctOptionId;

  const handleLockPrediction = () => {
    if (!chosen) return;
    setLockedPrediction((prev) => ({ ...prev, [current.id]: true }));
  };

  const handleExecuteExperiment = () => {
    if (current.onExecuteAction) {
      current.onExecuteAction();
    }
    setActionExecuted((prev) => ({ ...prev, [current.id]: true }));
  };

  const handleResetActivity = () => {
    setSelectedOption((prev) => ({ ...prev, [current.id]: '' }));
    setLockedPrediction((prev) => ({ ...prev, [current.id]: false }));
    setActionExecuted((prev) => ({ ...prev, [current.id]: false }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <p className="text-xs font-mono text-slate-500">
            PREDICCIÓN Y COMPROBACIÓN EXPERIMENTAL
          </p>
          <h3 className="text-base font-semibold text-slate-900">
            Hipótesis Previa a la Simulación ({activeIdx + 1} de {activities.length})
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          {activities.map((act, idx) => (
            <button
              key={act.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                idx === activeIdx
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Actividad {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs font-medium text-sky-800 bg-sky-50 border border-sky-200 rounded-lg px-3.5 py-2.5">
          {current.title}
        </div>

        <p className="text-sm font-medium text-slate-900 leading-relaxed">
          {current.question}
        </p>

        {/* Opciones de predicción */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {current.options.map((opt) => {
            const active = chosen === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isLocked}
                onClick={() => setSelectedOption((prev) => ({ ...prev, [current.id]: opt.id }))}
                className={`p-3 text-left text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  active
                    ? 'border-sky-600 bg-sky-50/80 text-sky-950'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                } ${isLocked ? 'opacity-90 cursor-default' : ''}`}
              >
                <span className="font-mono text-[11px] text-slate-400 block mb-0.5">
                  PREDICCIÓN
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Paso 1: Registrar predicción (no revela aún el resultado) */}
        {!isLocked && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Registre primero su hipótesis antes de ejecutar el cambio en el circuito.
            </span>
            <button
              type="button"
              disabled={!chosen}
              onClick={handleLockPrediction}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              1. Registrar predicción
            </button>
          </div>
        )}

        {/* Paso 2: Ejecutar modificación y comprobar */}
        {isLocked && !isExecuted && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-amber-950 space-y-0.5">
              <p className="font-semibold">Predicción registrada en bitácora.</p>
              <p>{current.actionInstruction}</p>
            </div>
            <button
              type="button"
              onClick={handleExecuteExperiment}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              2. {current.actionButtonLabel ?? 'Aplicar cambio y comprobar comportamiento'}
            </button>
          </div>
        )}

        {/* Paso 3: Retroalimentación física detallada tras comprobar */}
        {isLocked && isExecuted && (
          <div
            className={`rounded-lg border p-4 space-y-2.5 text-xs ${
              isCorrect
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/90 border-amber-300 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-sm">
                {isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                )}
                <span>
                  {isCorrect
                    ? 'Comprobación Experimental: Su predicción coincide con la respuesta física del circuito'
                    : 'Comprobación Experimental: Contraste su hipótesis con el comportamiento observado'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetActivity}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reintentar
              </button>
            </div>

            <p className="leading-relaxed">{current.physicalExplanation}</p>

            {current.formulaSupportLatex && (
              <div className="bg-white/90 border border-slate-200 rounded p-2.5">
                <MathFormula latex={current.formulaSupportLatex} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface GuidedNumericChallengeProps {
  challenges: NumericChallengeItem[];
  isChallengeMode: boolean;
  onActivateChallengeMode: () => void;
}

export const GuidedNumericChallengePanel: React.FC<GuidedNumericChallengeProps> = ({
  challenges,
  isChallengeMode,
  onActivateChallengeMode,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(challenges[0]?.defaultUnit ?? 'mA');
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);
  const [showFullProcedure, setShowFullProcedure] = useState(false);
  const [validation, setValidation] = useState<AnswerValidationResult | null>(null);
  const [attempts, setAttempts] = useState(0);

  const challenge = challenges[currentIndex] ?? challenges[0];

  const selectChallenge = (index: number) => {
    const target = challenges[index];
    if (!target) return;
    setCurrentIndex(index);
    setInputValue('');
    setSelectedUnit(target.defaultUnit);
    setHintLevel(0);
    setShowFullProcedure(false);
    setValidation(null);
    setAttempts(0);
  };

  if (!challenge) return null;

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateStudentNumericAnswer(
      inputValue,
      selectedUnit,
      challenge.expectedValueSI,
      challenge.magnitudeType,
      0.025,
      challenge.commonMistakesSI
    );
    setValidation(res);
    setAttempts((prev) => prev + 1);
  };

  const handleRequestHint = () => {
    setHintLevel((prev) => (prev < 2 ? ((prev + 1) as 1 | 2) : 2));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <p className="text-xs font-mono text-slate-500">
            VERIFICACIÓN DE CÁLCULO Y UNIDADES · TOLERANCIA ±2,5 %
          </p>
          <h3 className="text-base font-semibold text-slate-900">
            Desafíos Técnicos Guiados ({currentIndex + 1} de {challenges.length})
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {!isChallengeMode && (
            <button
              type="button"
              onClick={onActivateChallengeMode}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-sky-300 bg-sky-50 text-sky-900 hover:bg-sky-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Ocultar soluciones en paneles (Modo Desafío)
            </button>
          )}
          {challenges.map((c, idx) => (
            <button
              key={c.id}
              type="button"
              onClick={() => selectChallenge(idx)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                idx === currentIndex
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Desafío {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">{challenge.title}</span>
          <span className="text-xs font-mono text-slate-500">
            Calculado dinámicamente con los parámetros actuales
          </span>
        </div>

        <p className="text-sm text-slate-800 leading-relaxed">{challenge.prompt}</p>

        <form onSubmit={handleCheckAnswer} className="flex flex-wrap items-end gap-3 pt-1">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Su respuesta numérica
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ej: 6 o 0,006"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>

          <div className="w-28">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Unidad
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
            >
              {challenge.availableUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-700 text-white hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer h-[38px]"
          >
            Comprobar respuesta
          </button>

          <button
            type="button"
            onClick={handleRequestHint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer h-[38px]"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            Mostrar pista ({hintLevel}/2)
          </button>

          {(validation?.isCorrect || attempts >= 2) && (
            <button
              type="button"
              onClick={() => setShowFullProcedure((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer h-[38px]"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showFullProcedure ? 'Ocultar procedimiento' : 'Ver procedimiento matemático'}
            </button>
          )}

          {currentIndex < challenges.length - 1 && (
            <button
              type="button"
              onClick={() => selectChallenge(currentIndex + 1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer h-[38px]"
            >
              Siguiente desafío
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Pistas progresivas */}
        {hintLevel >= 1 && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-950 space-y-1.5">
            <div>
              <span className="font-semibold">Pista 1 (Relación física): </span>
              {challenge.hints[0]}
            </div>
            {hintLevel >= 2 && (
              <div className="pt-1 border-t border-amber-200/80">
                <span className="font-semibold">Pista 2 (Planteamiento): </span>
                {challenge.hints[1]}
              </div>
            )}
          </div>
        )}

        {/* Resultado de validación */}
        {validation && (
          <div
            className={`rounded-lg border p-3.5 text-xs space-y-2 ${
              validation.isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div className="font-semibold flex items-center gap-2">
              {validation.isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              )}
              <span>
                {validation.isCorrect
                  ? 'Respuesta verificada correctamente'
                  : 'Revisión técnica sugerida'}
              </span>
            </div>
            <p className="leading-relaxed">{validation.feedbackMessage}</p>
            {validation.isCorrect && (
              <p className="leading-relaxed text-emerald-900 border-t border-emerald-200/80 pt-2">
                <span className="font-semibold">Fundamento físico: </span>
                {challenge.physicalExplanation}
              </p>
            )}
          </div>
        )}

        {/* Procedimiento matemático completo */}
        {showFullProcedure && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-2">
            <span className="font-mono text-[11px] text-slate-500 block">
              RESOLUCIÓN MATEMÁTICA COMPLETA CON VALORES ACTUALES
            </span>
            <MathFormula latex={challenge.procedureLatex} block />
            <p className="text-slate-700 leading-relaxed">{challenge.physicalExplanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};
