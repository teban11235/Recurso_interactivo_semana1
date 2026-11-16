import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  ArrowLeftRight,
  GitMerge,
  Zap,
  Sliders,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import {
  solveSeriesCircuit,
  formatResistance,
  formatCurrent,
  formatPower,
  formatConductance,
} from '../engine/circuitEngine';
import { MathDevelopmentPanel, MathProcedureStep, MathFormula } from './MathDevelopment';
import { VirtualMultimeter } from './VirtualMultimeter';
import {
  PredictionActivitiesPanel,
  PredictionActivity,
  GuidedNumericChallengePanel,
  NumericChallengeItem,
} from './ChallengeWorkbench';

interface Module1SeriesProps {
  animationsEnabled: boolean;
  showMath: boolean;
  onToggleMath: () => void;
  showMultimeter: boolean;
  isChallengeMode: boolean;
  onActivateChallengeMode: () => void;
}

export const Module1Series: React.FC<Module1SeriesProps> = ({
  animationsEnabled,
  showMath,
  onToggleMath,
  showMultimeter,
  isChallengeMode,
  onActivateChallengeMode,
}) => {
  // Valores iniciales requeridos: Vs = 12 V, R1 = 1 kΩ, R2 = 2 kΩ, R3 = 3 kΩ
  const [vs, setVs] = useState<number>(12);
  const [r1K, setR1K] = useState<number>(1);
  const [r2K, setR2K] = useState<number>(2);
  const [r3K, setR3K] = useState<number>(3);
  const [mainSwitchClosed, setMainSwitchClosed] = useState<boolean>(true);
  const [currentRefInverted, setCurrentRefInverted] = useState<boolean>(false);
  const [polarityInverted, setPolarityInverted] = useState<boolean>(false);
  const [isEquivalentView, setIsEquivalentView] = useState<boolean>(false);

  // Parámetros complementarios Semana 1: Tiempo de operación (s) para Carga (Q) y Energía (E)
  const [operationSeconds, setOperationSeconds] = useState<number>(60);

  const circuit = useMemo(
    () =>
      solveSeriesCircuit({
        vs,
        r1: r1K * 1000,
        r2: r2K * 1000,
        r3: r3K * 1000,
        mainSwitchClosed,
        currentRefInverted,
        polarityInverted,
      }),
    [vs, r1K, r2K, r3K, mainSwitchClosed, currentRefInverted, polarityInverted]
  );

  const handleReset = () => {
    setVs(12);
    setR1K(1);
    setR2K(2);
    setR3K(3);
    setMainSwitchClosed(true);
    setCurrentRefInverted(false);
    setPolarityInverted(false);
    setIsEquivalentView(false);
    setOperationSeconds(60);
  };

  // Duración de animación proporcionalmente inversa a la corriente (en mA)
  const currentMa = circuit.currentPhys * 1000;
  const flowDurationSec =
    currentMa <= 0.01 ? 0 : Math.max(0.35, Math.min(3.2, 2.4 / Math.max(currentMa, 0.2)));

  // Cálculos de Carga (Q = I * t) y Energía (E = P * t)
  const chargeCoulombs = circuit.currentPhys * operationSeconds;
  const energyJoules = circuit.pSourceDelivered * operationSeconds;

  // Actividades de predicción (Sección 5)
  const predictionActivities: PredictionActivity[] = useMemo(
    () => [
      {
        id: 'pred_series_r2_increase',
        title: 'Efecto del aumento de R2 sobre la corriente total',
        question:
          'Si aumenta únicamente la resistencia R2 y mantiene constante la tensión de alimentación, ¿qué ocurrirá con la corriente total del circuito?',
        options: [
          { id: 'increase', label: 'Aumentará' },
          { id: 'decrease', label: 'Disminuirá' },
          { id: 'constant', label: 'Permanecerá constante' },
        ],
        correctOptionId: 'decrease',
        actionInstruction:
          'Presione el botón para incrementar R2 (por ejemplo, a 5 kΩ) o modifique el control deslizante de R2 y observe la corriente resultante.',
        actionButtonLabel: 'Incrementar R2 a 5 kΩ y comprobar',
        onExecuteAction: () => {
          setMainSwitchClosed(true);
          setR2K(5);
        },
        physicalExplanation:
          'Al aumentar R2 en una asociación en serie, la resistencia equivalente total (Req = R1 + R2 + R3) se incrementa. Manteniendo constante la tensión de alimentación Vs, la Ley de Ohm establece que la corriente total I = Vs / Req disminuye en toda la trayectoria cerrada.',
        formulaSupportLatex:
          'R_{\\text{eq}} \\uparrow \\;=\\; R_1 + R_2\\uparrow + R_3 \\quad\\Longrightarrow\\quad I \\downarrow \\;=\\; \\frac{V_s}{R_{\\text{eq}}\\uparrow}',
      },
      {
        id: 'pred_series_v_distribution',
        title: 'Distribución de caída de tensión en serie (Divisor de tensión)',
        question:
          'En el circuito en serie con R1 < R2 < R3, ¿cuál de los tres resistores experimenta la mayor caída de tensión y disipa mayor potencia?',
        options: [
          { id: 'r1', label: 'El resistor de menor valor (R1)' },
          { id: 'r3', label: 'El resistor de mayor valor (R3)' },
          { id: 'equal', label: 'Los tres tienen idéntica caída de tensión' },
        ],
        correctOptionId: 'r3',
        actionInstruction:
          'Restablezca los valores de referencia (R1 = 1 kΩ, R2 = 2 kΩ, R3 = 3 kΩ) y compare V1, V2 y V3.',
        actionButtonLabel: 'Aplicar R1=1kΩ, R2=2kΩ, R3=3kΩ y verificar',
        onExecuteAction: () => {
          setVs(12);
          setR1K(1);
          setR2K(2);
          setR3K(3);
          setMainSwitchClosed(true);
        },
        physicalExplanation:
          'Como la corriente I es idéntica para todos los elementos conectados en serie, la caída de tensión Vk = I · Rk y la potencia disipada Pk = I² · Rk son directamente proporcionales al valor óhmico de cada resistor. Por tanto, el resistor de mayor resistencia (R3) presenta la mayor caída de tensión y disipa la mayor potencia.',
        formulaSupportLatex:
          'V_k = I \\cdot R_k = V_s \\cdot \\frac{R_k}{R_{\\text{eq}}}, \\qquad P_k = I^2 \\cdot R_k',
      },
      {
        id: 'pred_series_equivalent_substitution',
        title: 'Invarianza de corriente ante reducción a resistencia equivalente',
        question:
          'Si usted sustituye los tres resistores R1, R2 y R3 por su única resistencia equivalente Req = R1 + R2 + R3 conectada a la misma fuente, ¿qué ocurre con la corriente entregada por la fuente?',
        options: [
          { id: 'triples', label: 'Se reduce a la tercera parte' },
          { id: 'unchanged', label: 'No cambia (permanece exactamente igual)' },
          { id: 'increases', label: 'Aumenta porque hay un solo resistor' },
        ],
        correctOptionId: 'unchanged',
        actionInstruction:
          'Conmute el esquema a la vista de Circuito Equivalente (Req) y compruebe el valor de corriente y potencia en los terminales de la fuente.',
        actionButtonLabel: 'Conmutar a Circuito Equivalente (Req)',
        onExecuteAction: () => {
          setIsEquivalentView(true);
        },
        physicalExplanation:
          'Por definición física, una resistencia equivalente Req produce en los terminales de la fuente exactamente la misma relación tensión-corriente y la misma disipación total de potencia que la red resistiva original.',
        formulaSupportLatex:
          'I_{\\text{original}} = \\frac{V_s}{R_1 + R_2 + R_3} = \\frac{V_s}{R_{\\text{eq}}} = I_{\\text{equivalente}}',
      },
    ],
    []
  );

  // Desafíos numéricos guiados dinámicos
  const numericChallenges: NumericChallengeItem[] = useMemo(
    () => [
      {
        id: 'chal_series_req',
        title: 'Cálculo de Resistencia Equivalente en Serie',
        prompt: `Con los valores actuales del circuito (R1 = ${r1K} kΩ, R2 = ${r2K} kΩ, R3 = ${r3K} kΩ), determine la resistencia equivalente total Req vista por la fuente.`,
        magnitudeType: 'resistance',
        expectedValueSI: circuit.req,
        availableUnits: ['kΩ', 'Ω'],
        defaultUnit: 'kΩ',
        hints: [
          'En una conexión en serie existe un único camino para la corriente, por lo que las oposiciones al paso de corriente se acumulan.',
          'Sume directamente R1 + R2 + R3 cuidando que todas estén expresadas en la misma unidad (kΩ o Ω).',
        ],
        procedureLatex: `R_{\\text{eq}} = R_1 + R_2 + R_3 = ${r1K}\\text{ k}\\Omega + ${r2K}\\text{ k}\\Omega + ${r3K}\\text{ k}\\Omega = ${(
          circuit.req / 1000
        ).toFixed(2)}\\text{ k}\\Omega = ${circuit.req.toFixed(0)}\\text{ }\\Omega`,
        physicalExplanation:
          'La resistencia equivalente de resistores en serie es igual a la suma algebraica de sus resistencias individuales y siempre es mayor que cualquiera de las resistencias que la componen.',
      },
      {
        id: 'chal_series_current',
        title: 'Determinación de la Corriente Total mediante la Ley de Ohm',
        prompt: `Para una tensión de fuente Vs = ${vs} V y la asociación actual (R1 = ${r1K} kΩ, R2 = ${r2K} kΩ, R3 = ${r3K} kΩ con interruptor cerrado), calcule la corriente total que circula por el lazo.`,
        magnitudeType: 'current',
        expectedValueSI: vs / circuit.req,
        availableUnits: ['mA', 'A'],
        defaultUnit: 'mA',
        hints: [
          'Aplique la Ley de Ohm utilizando la tensión de la fuente Vs y la resistencia equivalente total Req.',
          `Divida Vs (${vs} V) entre Req (${(circuit.req / 1000).toFixed(2)} kΩ). Recuerde que dividir voltios (V) entre kiloohmios (kΩ) entrega directamente miliamperios (mA).`,
        ],
        procedureLatex: `I = \\frac{V_s}{R_{\\text{eq}}} = \\frac{${vs}\\text{ V}}{${(
          circuit.req / 1000
        ).toFixed(2)}\\text{ k}\\Omega} = ${((vs / circuit.req) * 1000).toFixed(3)}\\text{ mA} = ${(
          vs / circuit.req
        ).toFixed(5)}\\text{ A}`,
        physicalExplanation:
          'En régimen estacionario DC, la conservación de la carga exige que la misma corriente atraviese la fuente y cada uno de los resistores conectados en serie.',
      },
      {
        id: 'chal_series_v3_power',
        title: 'Cálculo de Potencia Total Entregada por la Fuente',
        prompt: `Calcule la potencia eléctrica total entregada por la fuente de ${vs} V al conjunto resistivo en serie actual.`,
        magnitudeType: 'power',
        expectedValueSI: (vs * vs) / circuit.req,
        availableUnits: ['mW', 'W'],
        defaultUnit: 'mW',
        hints: [
          'La potencia entregada por la fuente puede obtenerse como el producto P = Vs · I o bien P = Vs² / Req.',
          `Multiplique ${vs} V por la corriente en mA para obtener el resultado en mW (o en A para obtener W).`,
        ],
        procedureLatex: `P_{\\text{total}} = V_s \\cdot I = ${vs}\\text{ V} \\times ${(
          (vs / circuit.req) *
          1000
        ).toFixed(3)}\\text{ mA} = ${(((vs * vs) / circuit.req) * 1000).toFixed(2)}\\text{ mW}`,
        physicalExplanation:
          'Por conservación de la energía, la potencia total entregada por la fuente es exactamente igual a la suma de las potencias disipadas en forma de calor (efecto Joule) en R1, R2 y R3.',
      },
    ],
    [vs, r1K, r2K, r3K, circuit.req]
  );

  // Procedimiento matemático en 6 pasos (Sección 12)
  const mathProcedures: MathProcedureStep[] = useMemo(
    () => [
      {
        title: 'Resistencia Equivalente en Serie y Conductancia',
        generalEquation: 'R_{\\text{eq}} = R_1 + R_2 + R_3, \\qquad G_{\\text{eq}} = \\frac{1}{R_{\\text{eq}}}',
        variablesIdentification: `R1 = ${r1K.toFixed(2)} kΩ, R2 = ${r2K.toFixed(2)} kΩ, R3 = ${r3K.toFixed(2)} kΩ`,
        numericalSubstitution: `R_{\\text{eq}} = ${r1K.toFixed(2)}\\text{ k}\\Omega + ${r2K.toFixed(
          2
        )}\\text{ k}\\Omega + ${r3K.toFixed(2)}\\text{ k}\\Omega`,
        operationDetail: `R_{\\text{eq}} = ${(circuit.req / 1000).toFixed(
          2
        )}\\text{ k}\\Omega = ${circuit.req.toFixed(0)}\\text{ }\\Omega`,
        resultWithUnits: `R_{\\text{eq}} = ${(circuit.req / 1000).toFixed(
          2
        )}\\text{ k}\\Omega \\;\\; (${formatConductance(circuit.geq).full})`,
        physicalInterpretation:
          'Los tres resistores ofrecen una oposición acumulativa al paso de la carga eléctrica en la trayectoria única.',
      },
      {
        title: 'Corriente Total del Circuito (Ley de Ohm)',
        generalEquation: 'I = \\frac{V_s}{R_{\\text{eq}}}',
        variablesIdentification: `Vs = ${vs.toFixed(2)} V, Req = ${(circuit.req / 1000).toFixed(
          2
        )} kΩ (${circuit.isOpenCircuit ? 'Interruptor Abierto' : 'Interruptor Cerrado'})`,
        numericalSubstitution: circuit.isOpenCircuit
          ? 'I = 0\\text{ A (Circuito abierto: trayectoria interrumpida)}'
          : `I = \\frac{${vs.toFixed(2)}\\text{ V}}{${circuit.req.toFixed(0)}\\text{ }\\Omega}`,
        operationDetail: circuit.isOpenCircuit
          ? 'I = 0\\text{ mA}'
          : `I = ${circuit.currentPhys.toFixed(5)}\\text{ A} = ${(
              circuit.currentPhys * 1000
            ).toFixed(3)}\\text{ mA}`,
        resultWithUnits: `I_{\\text{ref}} = ${(circuit.currentRef * 1000).toFixed(2)}\\text{ mA}`,
        physicalInterpretation:
          'La corriente eléctrica es idéntica en cualquier sección transversal de la trayectoria en serie.',
      },
      {
        title: 'Caídas de Tensión en cada Resistor',
        generalEquation: 'V_k = I \\cdot R_k \\quad (k = 1, 2, 3)',
        variablesIdentification: `I = ${(circuit.currentPhys * 1000).toFixed(
          2
        )} mA; R1 = ${r1K} kΩ, R2 = ${r2K} kΩ, R3 = ${r3K} kΩ`,
        numericalSubstitution: `V_1 = ${(circuit.currentPhys * 1000).toFixed(
          2
        )}\\text{ mA}\\cdot ${r1K}\\text{ k}\\Omega,\\; V_2 = ${(
          circuit.currentPhys * 1000
        ).toFixed(2)}\\text{ mA}\\cdot ${r2K}\\text{ k}\\Omega,\\; V_3 = ${(
          circuit.currentPhys * 1000
        ).toFixed(2)}\\text{ mA}\\cdot ${r3K}\\text{ k}\\Omega`,
        operationDetail: `V_1 + V_2 + V_3 = ${circuit.v1Phys.toFixed(2)} + ${circuit.v2Phys.toFixed(
          2
        )} + ${circuit.v3Phys.toFixed(2)} = ${(
          circuit.v1Phys +
          circuit.v2Phys +
          circuit.v3Phys
        ).toFixed(2)}\\text{ V}`,
        resultWithUnits: `V_1 = ${circuit.v1Measured.toFixed(2)}\\text{ V},\\; V_2 = ${circuit.v2Measured.toFixed(
          2
        )}\\text{ V},\\; V_3 = ${circuit.v3Measured.toFixed(2)}\\text{ V}`,
        physicalInterpretation:
          'La suma de las caídas de tensión en los resistores iguala la tensión entregada por la fuente cuando el circuito está cerrado.',
      },
      {
        title: 'Potencia Disipada y Balance Energético (Convención Pasiva)',
        generalEquation:
          'P_k = V_k \\cdot I = I^2 \\cdot R_k, \\qquad P_{\\text{fuente,pasiva}} + \\sum_{k=1}^{3} P_k = 0',
        variablesIdentification: `P1, P2, P3 absorbidas (> 0); P_fuente,pasiva = -Vs · I`,
        numericalSubstitution: `P_1 = ${(circuit.p1 * 1000).toFixed(2)}\\text{ mW},\\; P_2 = ${(
          circuit.p2 * 1000
        ).toFixed(2)}\\text{ mW},\\; P_3 = ${(circuit.p3 * 1000).toFixed(2)}\\text{ mW}`,
        operationDetail: `\\sum P = ${(circuit.pSourcePassive * 1000).toFixed(2)}\\text{ mW} + ${(
          circuit.pTotalDissipated * 1000
        ).toFixed(2)}\\text{ mW} = 0.00\\text{ mW}`,
        resultWithUnits: `P_{\\text{total}} = ${(circuit.pSourceDelivered * 1000).toFixed(
          2
        )}\\text{ mW}`,
        physicalInterpretation:
          'Bajo la convención pasiva de signos, la potencia negativa en la fuente indica entrega neta de energía, igual a la suma de potencias positivas absorbidas por los resistores.',
      },
    ],
    [vs, r1K, r2K, r3K, circuit]
  );

  return (
    <div className="space-y-6">
      {/* A. Explicación del objetivo del módulo */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-4xl">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-700">
            <span>MÓDULO 01 · NIVEL FUNDAMENTAL</span>
            <span aria-hidden="true">·</span>
            <span>ASOCIACIÓN EN SERIE, LEY DE OHM Y DIVISIÓN DE TENSIÓN</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Circuitos Resistivos en Serie en Corriente Directa
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Analice experimentalmente una trayectoria cerrada única donde tres resistores comparten la misma corriente eléctrica. Compruebe cómo se distribuye la tensión de la fuente en proporción a cada resistencia, verifique el balance de potencia y compare el circuito original con su circuito equivalente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsEquivalentView((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isEquivalentView
                ? 'bg-sky-700 text-white border-sky-700'
                : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <GitMerge className="w-4 h-4" />
            {isEquivalentView
              ? 'Ver Circuito Original (R1, R2, R3)'
              : 'Reducir a Circuito Equivalente (Req)'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer valores (12 V · 1k, 2k, 3k)
          </button>
        </div>
      </section>

      {/* Zona Principal: Circuito Esquemático Interactivo (Izquierda/Centro) + Controles de Parámetros (Derecha) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* B. Circuito Esquemático Interactivo SVG (8 columnas en XL) */}
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-semibold text-slate-800">
                {isEquivalentView
                  ? 'ESQUEMA ELÉCTRICO REDUCIDO (CIRCUITO EQUIVALENTE Req)'
                  : 'ESQUEMA ELÉCTRICO INTERACTIVO (TRAYECTORIA ÚNICA EN SERIE)'}
              </span>
              <span className="text-xs font-mono text-slate-500">
                {mainSwitchClosed ? '● Trayectoria Cerrada' : '▲ Circuito Abierto (I = 0 mA)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMainSwitchClosed((prev) => !prev)}
                className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mainSwitchClosed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                Interruptor S1: {mainSwitchClosed ? 'Cerrado (ON)' : 'Abierto (OFF)'}
              </button>
            </div>
          </div>

          {/* Lienzo SVG del Circuito en Serie */}
          <div className="p-4 sm:p-6 bg-[#F8FAFC] flex flex-col items-center justify-center">
            <svg
              viewBox="0 0 760 400"
              className="w-full max-w-[740px] h-auto select-none"
              role="img"
              aria-label="Esquema eléctrico interactivo de circuito resistivo en serie"
            >
              <defs>
                {/* Patrón de cuadrícula técnica sutil */}
                <pattern id="grid-series" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="0.7"
                  />
                </pattern>
              </defs>

              <rect width="760" height="400" rx="12" fill="url(#grid-series)" />

              {!isEquivalentView ? (
                <>
                  {/* Trazado de conductores del lazo original */}
                  <g stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round">
                    {/* Conductor izquierdo (Fuente) */}
                    <line x1="120" y1="80" x2="120" y2="165" />
                    <line x1="120" y1="235" x2="120" y2="320" />

                    {/* Conductor superior: Nodo A -> Interruptor S1 -> R1 -> Nodo B */}
                    <line x1="120" y1="80" x2="205" y2="80" />
                    {/* Interruptor S1 entre x=205 y x=255 */}
                    {mainSwitchClosed ? (
                      <line x1="205" y1="80" x2="255" y2="80" stroke="#059669" strokeWidth="3.5" />
                    ) : (
                      <line x1="205" y1="80" x2="248" y2="54" stroke="#D97706" strokeWidth="3.5" />
                    )}
                    <line x1="255" y1="80" x2="340" y2="80" />

                    {/* R1 en z=340 a 460 (zig-zag de ingeniería) */}
                    <polyline
                      points="340,80 350,64 370,96 390,64 410,96 430,64 450,96 460,80"
                      stroke="#0F172A"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                    <line x1="460" y1="80" x2="620" y2="80" />

                    {/* Conductor derecho: Nodo B -> R2 -> Nodo C */}
                    <line x1="620" y1="80" x2="620" y2="140" />
                    <polyline
                      points="620,140 636,150 604,170 636,190 604,210 636,230 604,250 620,260"
                      stroke="#0F172A"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                    <line x1="620" y1="260" x2="620" y2="320" />

                    {/* Conductor inferior: Nodo C -> R3 -> Nodo D */}
                    <line x1="620" y1="320" x2="460" y2="320" />
                    <polyline
                      points="460,320 450,304 430,336 410,304 390,336 370,304 350,336 340,320"
                      stroke="#0F172A"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                    <line x1="340" y1="320" x2="120" y2="320" />
                  </g>

                  {/* Animación de partículas de corriente convencional (solo si hay corriente y animación activa) */}
                  {animationsEnabled && mainSwitchClosed && circuit.currentPhys > 0 && (
                    <rect
                      x="120"
                      y="80"
                      width="500"
                      height="240"
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="4"
                      strokeDasharray="6 18"
                      strokeLinecap="round"
                      className={
                        currentRefInverted
                          ? 'animate-current-reverse'
                          : 'animate-current-forward'
                      }
                      style={{ '--flow-duration': `${flowDurationSec}s` } as React.CSSProperties}
                    />
                  )}

                  {/* Terminales del interruptor S1 */}
                  <circle cx="205" cy="80" r="4.5" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
                  <circle cx="255" cy="80" r="4.5" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
                  <text
                    x="230"
                    y="45"
                    textAnchor="middle"
                    className="fill-slate-700 font-mono text-[11px] font-semibold"
                  >
                    S1 ({mainSwitchClosed ? 'CERRADO' : 'ABIERTO'})
                  </text>

                  {/* Etiquetas y valores de R1 (Superior) */}
                  <g>
                    <rect
                      x="332"
                      y="12"
                      width="136"
                      height="42"
                      rx="6"
                      fill="#FFFFFF"
                      stroke="#CBD5E1"
                      strokeWidth="1.2"
                    />
                    <text
                      x="400"
                      y="29"
                      textAnchor="middle"
                      className="fill-slate-900 font-mono text-xs font-bold"
                    >
                      R1 = {r1K.toFixed(1)} kΩ
                    </text>
                    <text
                      x="400"
                      y="45"
                      textAnchor="middle"
                      className="fill-sky-700 font-mono text-[11px] font-medium"
                    >
                      {isChallengeMode
                        ? 'V1 = ? · P1 = ?'
                        : `V1 = ${circuit.v1Measured.toFixed(2)} V · P1 = ${(
                            circuit.p1 * 1000
                          ).toFixed(1)} mW`}
                    </text>
                    {/* Marcas de polaridad sobre R1 */}
                    <text x="325" y="72" className="fill-rose-600 font-mono text-xs font-bold">
                      {polarityInverted ? '−' : '+'}
                    </text>
                    <text x="470" y="72" className="fill-slate-600 font-mono text-xs font-bold">
                      {polarityInverted ? '+' : '−'}
                    </text>
                  </g>

                  {/* Etiquetas y valores de R2 (Derecha) */}
                  <g>
                    <rect
                      x="462"
                      y="175"
                      width="136"
                      height="46"
                      rx="6"
                      fill="#FFFFFF"
                      stroke="#CBD5E1"
                      strokeWidth="1.2"
                    />
                    <text
                      x="530"
                      y="194"
                      textAnchor="middle"
                      className="fill-slate-900 font-mono text-xs font-bold"
                    >
                      R2 = {r2K.toFixed(1)} kΩ
                    </text>
                    <text
                      x="530"
                      y="211"
                      textAnchor="middle"
                      className="fill-sky-700 font-mono text-[11px] font-medium"
                    >
                      {isChallengeMode
                        ? 'V2 = ? · P2 = ?'
                        : `V2 = ${circuit.v2Measured.toFixed(2)} V · P2 = ${(
                            circuit.p2 * 1000
                          ).toFixed(1)} mW`}
                    </text>
                    {/* Marcas de polaridad sobre R2 */}
                    <text x="642" y="138" className="fill-rose-600 font-mono text-xs font-bold">
                      {polarityInverted ? '−' : '+'}
                    </text>
                    <text x="642" y="272" className="fill-slate-600 font-mono text-xs font-bold">
                      {polarityInverted ? '+' : '−'}
                    </text>
                  </g>

                  {/* Etiquetas y valores de R3 (Inferior) */}
                  <g>
                    <rect
                      x="332"
                      y="344"
                      width="136"
                      height="44"
                      rx="6"
                      fill="#FFFFFF"
                      stroke="#CBD5E1"
                      strokeWidth="1.2"
                    />
                    <text
                      x="400"
                      y="362"
                      textAnchor="middle"
                      className="fill-slate-900 font-mono text-xs font-bold"
                    >
                      R3 = {r3K.toFixed(1)} kΩ
                    </text>
                    <text
                      x="400"
                      y="379"
                      textAnchor="middle"
                      className="fill-sky-700 font-mono text-[11px] font-medium"
                    >
                      {isChallengeMode
                        ? 'V3 = ? · P3 = ?'
                        : `V3 = ${circuit.v3Measured.toFixed(2)} V · P3 = ${(
                            circuit.p3 * 1000
                          ).toFixed(1)} mW`}
                    </text>
                    {/* Marcas de polaridad sobre R3 (la corriente entra por la derecha y sale por la izquierda) */}
                    <text x="470" y="312" className="fill-rose-600 font-mono text-xs font-bold">
                      {polarityInverted ? '−' : '+'}
                    </text>
                    <text x="325" y="312" className="fill-slate-600 font-mono text-xs font-bold">
                      {polarityInverted ? '+' : '−'}
                    </text>
                  </g>

                  {/* Nodos A, B, C, D */}
                  <g>
                    <circle cx="120" cy="80" r="5" fill="#0284C7" />
                    <text x="95" y="72" className="fill-slate-800 font-mono text-xs font-bold">
                      Nodo A
                    </text>

                    <circle cx="620" cy="80" r="5" fill="#0284C7" />
                    <text x="630" y="75" className="fill-slate-800 font-mono text-xs font-bold">
                      Nodo B
                    </text>

                    <circle cx="620" cy="320" r="5" fill="#0284C7" />
                    <text x="630" y="332" className="fill-slate-800 font-mono text-xs font-bold">
                      Nodo C
                    </text>

                    <circle cx="120" cy="320" r="5" fill="#0F172A" />
                    <text x="80" y="340" className="fill-slate-800 font-mono text-xs font-bold">
                      Nodo D (0 V)
                    </text>
                  </g>
                </>
              ) : (
                /* VISTA DE CIRCUITO EQUIVALENTE REDUCIDO (Vs conectada a una única Req) */
                <>
                  <g stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round">
                    <line x1="120" y1="80" x2="120" y2="165" />
                    <line x1="120" y1="235" x2="120" y2="320" />
                    <line x1="120" y1="80" x2="520" y2="80" />
                    <line x1="520" y1="80" x2="520" y2="140" />
                    <polyline
                      points="520,140 538,150 502,170 538,190 502,210 538,230 502,250 520,260"
                      stroke="#0284C7"
                      strokeWidth="3.5"
                      strokeLinejoin="round"
                    />
                    <line x1="520" y1="260" x2="520" y2="320" />
                    <line x1="520" y1="320" x2="120" y2="320" />
                  </g>

                  {animationsEnabled && mainSwitchClosed && circuit.currentPhys > 0 && (
                    <rect
                      x="120"
                      y="80"
                      width="400"
                      height="240"
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="4"
                      strokeDasharray="6 18"
                      className={
                        currentRefInverted
                          ? 'animate-current-reverse'
                          : 'animate-current-forward'
                      }
                      style={{ '--flow-duration': `${flowDurationSec}s` } as React.CSSProperties}
                    />
                  )}

                  <rect
                    x="555"
                    y="150"
                    width="180"
                    height="96"
                    rx="8"
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth="1.5"
                  />
                  <text
                    x="645"
                    y="174"
                    textAnchor="middle"
                    className="fill-sky-900 font-mono text-xs font-bold"
                  >
                    RESISTENCIA EQUIVALENTE
                  </text>
                  <text
                    x="645"
                    y="196"
                    textAnchor="middle"
                    className="fill-slate-900 font-mono text-sm font-bold"
                  >
                    Req = {(circuit.req / 1000).toFixed(2)} kΩ
                  </text>
                  <text
                    x="645"
                    y="215"
                    textAnchor="middle"
                    className="fill-slate-600 font-mono text-[11px]"
                  >
                    R1 + R2 + R3 = {r1K}+{r2K}+{r3K} kΩ
                  </text>
                  <text
                    x="645"
                    y="233"
                    textAnchor="middle"
                    className="fill-emerald-700 font-mono text-[11px] font-semibold"
                  >
                    I = {(circuit.currentRef * 1000).toFixed(2)} mA (Invariante)
                  </text>
                </>
              )}

              {/* Símbolo de Fuente de Tensión Independiente DC (Común a ambas vistas) */}
              <g>
                <circle
                  cx="120"
                  cy="200"
                  r="34"
                  fill="#FFFFFF"
                  stroke="#0F172A"
                  strokeWidth="3"
                />
                {/* Signo + y - dentro de la fuente */}
                <text
                  x="120"
                  y="188"
                  textAnchor="middle"
                  className="fill-rose-600 font-mono text-base font-bold"
                >
                  +
                </text>
                <text
                  x="120"
                  y="222"
                  textAnchor="middle"
                  className="fill-slate-700 font-mono text-base font-bold"
                >
                  −
                </text>
                <rect
                  x="16"
                  y="172"
                  width="62"
                  height="54"
                  rx="6"
                  fill="#0F172A"
                />
                <text
                  x="47"
                  y="194"
                  textAnchor="middle"
                  className="fill-slate-300 font-mono text-[10px]"
                >
                  FUENTE DC
                </text>
                <text
                  x="47"
                  y="214"
                  textAnchor="middle"
                  className="fill-white font-mono text-xs font-bold"
                >
                  {vs.toFixed(1)} V
                </text>
              </g>

              {/* Indicador central de Corriente de Lazo y Sentido de Referencia */}
              <g>
                <rect
                  x="220"
                  y="165"
                  width="210"
                  height="70"
                  rx="8"
                  fill="#FFFFFF"
                  stroke="#E2E8F0"
                  strokeWidth="1.5"
                />
                <text
                  x="325"
                  y="186"
                  textAnchor="middle"
                  className="fill-slate-500 font-mono text-[10px]"
                >
                  CORRIENTE EN LA TRAYECTORIA
                </text>
                <text
                  x="325"
                  y="208"
                  textAnchor="middle"
                  className="fill-amber-600 font-mono text-sm font-bold"
                >
                  {isChallengeMode
                    ? 'I = [Modo Desafío]'
                    : `I = ${(circuit.currentRef * 1000).toFixed(2)} mA`}
                </text>
                <text
                  x="325"
                  y="225"
                  textAnchor="middle"
                  className="fill-slate-600 font-mono text-[10px]"
                >
                  Sentido ref.: {currentRefInverted ? 'Antihorario (↺)' : 'Horario Convencional (↻)'}
                </text>
              </g>
            </svg>

            <div className="w-full flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 text-xs text-slate-500">
              <span>
                <strong>Nota física sobre la animación:</strong> Las partículas representan el sentido convencional de la corriente eléctrica (flujo de carga positiva equivalente) y su intensidad relativa, no la velocidad microscópica de deriva de los electrones libres.
              </span>
            </div>
          </div>
        </div>

        {/* C. Controles de Parámetros Eléctricos (4 columnas en XL) */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-700" />
              <h3 className="text-sm font-semibold text-slate-900">
                Parámetros Eléctricos del Circuito
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">DC Estacionario</span>
          </div>

          {/* Control de Fuente DC */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="s1-vs" className="font-medium text-slate-700">
                Tensión de Alimentación (Vs)
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="s1-vs"
                  type="number"
                  min={0}
                  max={48}
                  step={0.5}
                  value={vs}
                  onChange={(e) => setVs(Math.max(0, Math.min(48, Number(e.target.value) || 0)))}
                  className="w-16 text-right font-mono text-xs font-semibold border border-slate-300 rounded px-1.5 py-1 text-slate-900"
                />
                <span className="font-mono text-xs text-slate-500">V</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={48}
              step={0.5}
              value={vs}
              onChange={(e) => setVs(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>0 V</span>
              <span>12 V (Inicial)</span>
              <span>48 V</span>
            </div>
          </div>

          {/* Controles R1, R2, R3 */}
          {[
            { id: 'r1', label: 'Resistencia R1', val: r1K, setter: setR1K, init: '1,0 kΩ' },
            { id: 'r2', label: 'Resistencia R2', val: r2K, setter: setR2K, init: '2,0 kΩ' },
            { id: 'r3', label: 'Resistencia R3', val: r3K, setter: setR3K, init: '3,0 kΩ' },
          ].map((item) => (
            <div key={item.id} className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor={`s1-${item.id}`} className="font-medium text-slate-700">
                  {item.label}
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id={`s1-${item.id}`}
                    type="number"
                    min={0.1}
                    max={20}
                    step={0.1}
                    value={item.val}
                    onChange={(e) =>
                      item.setter(Math.max(0.1, Math.min(20, Number(e.target.value) || 0.1)))
                    }
                    className="w-16 text-right font-mono text-xs font-semibold border border-slate-300 rounded px-1.5 py-1 text-slate-900"
                  />
                  <span className="font-mono text-xs text-slate-500">kΩ</span>
                </div>
              </div>
              <input
                type="range"
                min={0.1}
                max={20}
                step={0.1}
                value={item.val}
                onChange={(e) => item.setter(Number(e.target.value))}
                className="w-full accent-slate-800 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>0,1 kΩ</span>
                <span>Inicial: {item.init}</span>
                <span>20 kΩ</span>
              </div>
            </div>
          ))}

          {/* Referencias de corriente y polaridad */}
          <div className="pt-3 border-t border-slate-200 space-y-2.5">
            <span className="block text-xs font-semibold text-slate-800">
              Referencias de Medición y Signo Algebraico
            </span>

            <button
              type="button"
              onClick={() => setCurrentRefInverted((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span>Sentido de referencia de corriente:</span>
              <span className="font-mono font-semibold text-sky-800">
                {currentRefInverted ? 'Antihorario (−I)' : 'Horario (+I)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPolarityInverted((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span>Polaridad de referencia de tensión:</span>
              <span className="font-mono font-semibold text-sky-800">
                {polarityInverted ? 'Invertida (− a +)' : 'Directa (+ a −)'}
              </span>
            </button>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Observe que invertir una referencia modifica el signo algebraico de la lectura sin alterar el fenómeno físico en el circuito.
            </p>
          </div>
        </div>
      </div>

      {/* D. Panel de Mediciones, Resultados y Visualización Proporcional */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <p className="text-xs font-mono text-slate-500">
              TELEMETRÍA DE MAGNITUDES ELÉCTRICAS Y BALANCE DE POTENCIA
            </p>
            <h3 className="text-base font-semibold text-slate-900">
              Panel de Mediciones y Distribución Energética en Tiempo Real
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Balance algebraico ΣP = {circuit.powerBalanceSum.toFixed(2)} mW</span>
          </div>
        </div>

        {/* KPIs principales con jerarquía numérica */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="block text-[11px] font-mono text-slate-500 uppercase">
              Resistencia Eq.
            </span>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                {isChallengeMode ? '—' : formatResistance(circuit.req).value}
              </span>
              <span className="text-xs font-mono text-slate-500 ml-1.5">
                {formatResistance(circuit.req).unit}
              </span>
            </div>
            <span className="block text-[11px] font-mono text-slate-500 mt-1">
              Geq = {isChallengeMode ? '—' : formatConductance(circuit.geq).full}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="block text-[11px] font-mono text-slate-500 uppercase">
              Corriente Total (I)
            </span>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-mono font-bold text-amber-600 tabular-nums">
                {isChallengeMode ? '—' : formatCurrent(circuit.currentRef, true).value}
              </span>
              <span className="text-xs font-mono text-slate-500 ml-1.5">
                {formatCurrent(circuit.currentRef, true).unit}
              </span>
            </div>
            <span className="block text-[11px] font-mono text-slate-500 mt-1">
              {(circuit.currentPhys).toFixed(4)} A (SI)
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="block text-[11px] font-mono text-slate-500 uppercase">
              Tensión V1 (en R1)
            </span>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-mono font-bold text-sky-700 tabular-nums">
                {isChallengeMode ? '—' : circuit.v1Measured.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-500 ml-1.5">V</span>
            </div>
            <span className="block text-[11px] font-mono text-slate-500 mt-1">
              P1 = {isChallengeMode ? '—' : formatPower(circuit.p1, true).full}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="block text-[11px] font-mono text-slate-500 uppercase">
              Tensión V2 (en R2)
            </span>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-mono font-bold text-sky-700 tabular-nums">
                {isChallengeMode ? '—' : circuit.v2Measured.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-500 ml-1.5">V</span>
            </div>
            <span className="block text-[11px] font-mono text-slate-500 mt-1">
              P2 = {isChallengeMode ? '—' : formatPower(circuit.p2, true).full}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="block text-[11px] font-mono text-slate-500 uppercase">
              Tensión V3 (en R3)
            </span>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-mono font-bold text-sky-700 tabular-nums">
                {isChallengeMode ? '—' : circuit.v3Measured.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-500 ml-1.5">V</span>
            </div>
            <span className="block text-[11px] font-mono text-slate-500 mt-1">
              P3 = {isChallengeMode ? '—' : formatPower(circuit.p3, true).full}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="block text-[11px] font-mono text-slate-500 uppercase">
              Potencia Total
            </span>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-mono font-bold text-emerald-700 tabular-nums">
                {isChallengeMode ? '—' : formatPower(circuit.pSourceDelivered, true).value}
              </span>
              <span className="text-xs font-mono text-slate-500 ml-1.5">
                {formatPower(circuit.pSourceDelivered, true).unit}
              </span>
            </div>
            <span className="block text-[11px] font-mono text-slate-500 mt-1">
              P_fuente(pasiva) = {(circuit.pSourcePassive * 1000).toFixed(1)} mW
            </span>
          </div>
        </div>

        {/* Gráficos Dinámicos: Barras Proporcionales de Potencia y Tensión + Curva V-I */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          {/* Barras proporcionales de potencia y tensión por componente */}
          <div className="lg:col-span-7 border border-slate-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase font-mono text-slate-700">
                Distribución Proporcional de Potencia y Tensión por Resistor
              </h4>
              <span className="text-xs font-mono text-slate-500">
                Ptotal = {(circuit.pTotalDissipated * 1000).toFixed(2)} mW
              </span>
            </div>

            <div className="space-y-3">
              {[
                { label: 'R1', r: r1K, v: circuit.v1Phys, p: circuit.p1 * 1000 },
                { label: 'R2', r: r2K, v: circuit.v2Phys, p: circuit.p2 * 1000 },
                { label: 'R3', r: r3K, v: circuit.v3Phys, p: circuit.p3 * 1000 },
              ].map((item) => {
                const totalP = Math.max(circuit.pTotalDissipated * 1000, 1e-6);
                const pct = circuit.pTotalDissipated > 0 ? (item.p / totalP) * 100 : 0;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-slate-800">
                        {item.label} ({item.r.toFixed(1)} kΩ)
                      </span>
                      <span className="text-slate-600">
                        V = {item.v.toFixed(2)} V · P = {item.p.toFixed(2)} mW ({pct.toFixed(1)} %)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-sky-600 transition-all duration-150"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bloque interactivo de Carga (Q) y Energía (E) en función del tiempo (Semana 1 Contenidos 1 y 3) */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium text-slate-700">
                  Acumulación de Carga (<MathFormula latex="Q = I \cdot t" />) y Energía (<MathFormula latex="E = P \cdot t" />) durante:
                </span>
                <select
                  value={operationSeconds}
                  onChange={(e) => setOperationSeconds(Number(e.target.value))}
                  className="border border-slate-300 rounded px-2 py-1 font-mono text-xs bg-white text-slate-900"
                >
                  <option value={10}>10 s</option>
                  <option value={60}>60 s (1 min)</option>
                  <option value={300}>300 s (5 min)</option>
                  <option value={3600}>3600 s (1 h)</option>
                </select>
              </div>
              <div className="font-mono text-slate-800 space-x-3">
                <span>
                  Q = <strong>{(chargeCoulombs * 1000).toFixed(2)} mC</strong>
                </span>
                <span>·</span>
                <span>
                  E = <strong>{(energyJoules * 1000).toFixed(2)} mJ</strong> ({energyJoules.toFixed(3)} J)
                </span>
              </div>
            </div>
          </div>

          {/* Gráfico dinámico Corriente vs Tensión (Pendiente = Conductancia equivalente) */}
          <div className="lg:col-span-5 border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase font-mono text-slate-700">
                Recta de Carga: Corriente frente a Tensión
              </h4>
              <span className="text-[11px] font-mono text-slate-500">
                Pendiente = 1 / Req
              </span>
            </div>

            <svg viewBox="0 0 320 155" className="w-full h-auto">
              {/* Ejes */}
              <line x1="42" y1="15" x2="42" y2="128" stroke="#94A3B8" strokeWidth="1.2" />
              <line x1="42" y1="128" x2="300" y2="128" stroke="#94A3B8" strokeWidth="1.2" />

              {/* Etiquetas de ejes */}
              <text x="170" y="148" textAnchor="middle" className="fill-slate-500 font-mono text-[10px]">
                Tensión de Fuente Vs (0 V a 48 V)
              </text>
              <text
                x="14"
                y="72"
                textAnchor="middle"
                transform="rotate(-90 14 72)"
                className="fill-slate-500 font-mono text-[10px]"
              >
                I (mA)
              </text>

              {/* Recta de la Ley de Ohm para la Req actual (escala máxima Y = max(10 mA, I(48V))) */}
              {(() => {
                const maxIMa = Math.max(10, (48 / circuit.req) * 1000);
                const xAt48 = 295;
                const iAt48Ma = mainSwitchClosed ? (48 / circuit.req) * 1000 : 0;
                const yAt48 = 128 - (iAt48Ma / maxIMa) * 105;

                const curX = 42 + (vs / 48) * (295 - 42);
                const curY = 128 - (currentMa / maxIMa) * 105;

                return (
                  <>
                    <line
                      x1="42"
                      y1="128"
                      x2={xAt48}
                      y2={yAt48}
                      stroke="#0284C7"
                      strokeWidth="2.2"
                    />
                    <line
                      x1={curX}
                      y1="128"
                      x2={curX}
                      y2={curY}
                      stroke="#CBD5E1"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1="42"
                      y1={curY}
                      x2={curX}
                      y2={curY}
                      stroke="#CBD5E1"
                      strokeDasharray="3 3"
                    />
                    <circle cx={curX} cy={curY} r="5" fill="#D97706" stroke="#FFFFFF" strokeWidth="1.5" />
                    <text
                      x={Math.min(245, curX + 8)}
                      y={Math.max(25, curY - 6)}
                      className="fill-slate-800 font-mono text-[10px] font-semibold"
                    >
                      ({vs.toFixed(1)} V, {currentMa.toFixed(2)} mA)
                    </text>
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      </section>

      {/* Instrumento de Medición Virtual Reutilizable */}
      {showMultimeter && (
        <VirtualMultimeter
          nodes={circuit.nodes}
          branches={circuit.branches}
          preferMilliAmps={true}
          moduleName="Módulo 1: Circuitos en Serie"
        />
      )}

      {/* F y G. Actividades de Predicción y Modo Desafío Guiado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PredictionActivitiesPanel activities={predictionActivities} />
        <GuidedNumericChallengePanel
          challenges={numericChallenges}
          isChallengeMode={isChallengeMode}
          onActivateChallengeMode={onActivateChallengeMode}
        />
      </div>

      {/* E. Desarrollo Matemático Paso a Paso */}
      <MathDevelopmentPanel
        isOpen={showMath}
        onToggle={onToggleMath}
        moduleTitle="Asociación de Resistores en Serie"
        procedures={mathProcedures}
      />

      {/* H. Conclusiones e Interpretación Física */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <BookOpen className="w-4 h-4 text-sky-700 shrink-0" />
          <h3>Conclusiones e Interpretación Física — Circuitos en Serie</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-semibold text-slate-900 block mb-1">
              1. Unicidad de la corriente eléctrica
            </span>
            En una trayectoria cerrada sin ramificaciones, la misma intensidad de corriente atraviesa todos los componentes (<MathFormula latex="I = I_1 = I_2 = I_3" />). Si el circuito se abre en cualquier punto, la corriente se anula en todos los elementos simultáneamente.
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-semibold text-slate-900 block mb-1">
              2. División proporcional de tensión
            </span>
            La tensión de la fuente se reparte entre los resistores en proporción directa a sus valores óhmicos (<MathFormula latex="V_k = V_s \cdot (R_k / R_{\text{eq}})" />). El resistor de mayor resistencia absorbe la mayor caída de tensión y disipa la mayor potencia térmica.
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-semibold text-slate-900 block mb-1">
              3. Equivalencia energética en terminales
            </span>
            La resistencia equivalente (<MathFormula latex="R_{\text{eq}} = \sum R_k" />) permite representar toda la cadena de resistores mediante un único elemento que demanda exactamente la misma corriente y potencia a la fuente.
          </div>
        </div>
      </section>
    </div>
  );
};
