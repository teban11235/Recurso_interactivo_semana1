import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  GitMerge,
  Sliders,
  CheckCircle2,
  BookOpen,
  AlertTriangle,
  PlusCircle,
} from 'lucide-react';
import {
  solveParallelCircuit,
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

interface Module2ParallelProps {
  animationsEnabled: boolean;
  showMath: boolean;
  onToggleMath: () => void;
  showMultimeter: boolean;
  isChallengeMode: boolean;
  onActivateChallengeMode: () => void;
}

export const Module2Parallel: React.FC<Module2ParallelProps> = ({
  animationsEnabled,
  showMath,
  onToggleMath,
  showMultimeter,
  isChallengeMode,
  onActivateChallengeMode,
}) => {
  // Valores iniciales: Vs = 12 V, R1 = 6 kΩ, R2 = 3 kΩ, R3 = 2 kΩ
  const [vs, setVs] = useState<number>(12);
  const [r1K, setR1K] = useState<number>(6);
  const [r2K, setR2K] = useState<number>(3);
  const [r3K, setR3K] = useState<number>(2);
  const [r4K, setR4K] = useState<number>(4);

  const [sw1, setSw1] = useState<boolean>(true);
  const [sw2, setSw2] = useState<boolean>(true);
  const [sw3, setSw3] = useState<boolean>(true);
  const [sw4, setSw4] = useState<boolean>(false); // Rama 4 adicional para experimentar nuevas ramas en paralelo

  const [refInv1, setRefInv1] = useState<boolean>(false);
  const [refInv2, setRefInv2] = useState<boolean>(false);
  const [refInv3, setRefInv3] = useState<boolean>(false);
  const [refInv4, setRefInv4] = useState<boolean>(false);

  const [polarityInverted, setPolarityInverted] = useState<boolean>(false);
  const [isEquivalentView, setIsEquivalentView] = useState<boolean>(false);

  const circuit = useMemo(
    () =>
      solveParallelCircuit({
        vs,
        polarityInverted,
        branches: [
          { id: 'b1', label: 'R1', r: r1K * 1000, closed: sw1, currentRefInverted: refInv1 },
          { id: 'b2', label: 'R2', r: r2K * 1000, closed: sw2, currentRefInverted: refInv2 },
          { id: 'b3', label: 'R3', r: r3K * 1000, closed: sw3, currentRefInverted: refInv3 },
          ...(sw4
            ? [{ id: 'b4', label: 'R4 (Extra)', r: r4K * 1000, closed: sw4, currentRefInverted: refInv4 }]
            : []),
        ],
      }),
    [vs, r1K, r2K, r3K, r4K, sw1, sw2, sw3, sw4, refInv1, refInv2, refInv3, refInv4, polarityInverted]
  );

  const handleReset = () => {
    setVs(12);
    setR1K(6);
    setR2K(3);
    setR3K(2);
    setR4K(4);
    setSw1(true);
    setSw2(true);
    setSw3(true);
    setSw4(false);
    setRefInv1(false);
    setRefInv2(false);
    setRefInv3(false);
    setRefInv4(false);
    setPolarityInverted(false);
    setIsEquivalentView(false);
  };

  const b1 = circuit.branchResults[0];
  const b2 = circuit.branchResults[1];
  const b3 = circuit.branchResults[2];
  const b4 = circuit.branchResults[3];

  const getFlowDuration = (amps: number) => {
    const ma = amps * 1000;
    if (ma <= 0.01) return 0;
    return Math.max(0.28, Math.min(3.0, 3.2 / Math.max(ma, 0.4)));
  };

  // Actividades de predicción (Sección 6)
  const predictionActivities: PredictionActivity[] = useMemo(
    () => [
      {
        id: 'pred_parallel_add_branch',
        title: 'Efecto sobre la resistencia equivalente al conectar una nueva rama en paralelo',
        question:
          '¿Qué ocurrirá con la resistencia equivalente total vista por la fuente si usted conecta una nueva rama resistiva (R4) en paralelo con las existentes?',
        options: [
          { id: 'increase', label: 'Aumentará porque se suma otra resistencia' },
          { id: 'decrease', label: 'Disminuirá por debajo de la menor resistencia conectada' },
          { id: 'constant', label: 'Permanecerá constante' },
        ],
        correctOptionId: 'decrease',
        actionInstruction:
          'Active la cuarta rama en paralelo (R4 = 4 kΩ) y observe cómo cambian Geq y Req.',
        actionButtonLabel: 'Conectar nueva rama R4 (4 kΩ) en paralelo',
        onExecuteAction: () => {
          setSw1(true);
          setSw2(true);
          setSw3(true);
          setSw4(true);
        },
        physicalExplanation:
          'Al conectar una nueva rama en paralelo se habilita un camino conductivo adicional para la corriente. Esto incrementa la conductancia equivalente (Geq = G1 + G2 + G3 + G4) y, en consecuencia, disminuye la resistencia equivalente (Req = 1 / Geq).',
        formulaSupportLatex:
          'G_{\\text{eq}} \\uparrow \\;=\\; \\sum G_k \\quad\\Longrightarrow\\quad R_{\\text{eq}} \\downarrow \\;=\\; \\frac{1}{G_{\\text{eq}}\\uparrow}',
      },
      {
        id: 'pred_parallel_total_current',
        title: 'Efecto sobre la corriente total demandada a la fuente',
        question:
          'Al conectar esa nueva rama resistiva en paralelo manteniendo una fuente de tensión ideal constante, ¿qué ocurrirá con la corriente total suministrada por la fuente?',
        options: [
          { id: 'increase', label: 'Aumentará al sumarse la corriente de la nueva rama' },
          { id: 'decrease', label: 'Disminuirá porque se reparte entre más ramas' },
          { id: 'constant', label: 'Permanecerá constante' },
        ],
        correctOptionId: 'increase',
        actionInstruction:
          'Compare la corriente total antes (12 mA) y después de conectar la rama R4.',
        actionButtonLabel: 'Conectar R4 y observar Itotal',
        onExecuteAction: () => {
          setSw1(true);
          setSw2(true);
          setSw3(true);
          setSw4(true);
        },
        physicalExplanation:
          'Cada rama conectada en paralelo a la fuente ideal recibe la tensión total Vs y demanda su propia corriente Ik = Vs / Rk. Por conservación de carga en el nodo superior, la fuente debe suministrar la suma de todas las corrientes de rama (Itotal = ΣIk).',
        formulaSupportLatex:
          'I_{\\text{total}} \\uparrow \\;=\\; I_1 + I_2 + I_3 + I_4',
      },
      {
        id: 'pred_parallel_independence',
        title: 'Independencia entre ramas ante una fuente de tensión ideal',
        question:
          'Si la fuente mantiene una tensión ideal constante de 12 V y usted abre el interruptor de la rama R3, ¿cambiará la corriente que circula por las ramas R1 y R2?',
        options: [
          { id: 'increase_others', label: 'Sí, aumentará la corriente en R1 y R2' },
          { id: 'no_change', label: 'No, las corrientes de R1 y R2 permanecerán inalteradas' },
          { id: 'zero_all', label: 'Se anulará la corriente en todas las ramas' },
        ],
        correctOptionId: 'no_change',
        actionInstruction:
          'Abra el interruptor S3 (desconectando R3) y verifique los valores de I1 e I2.',
        actionButtonLabel: 'Abrir interruptor S3 y comprobar I1 e I2',
        onExecuteAction: () => {
          setSw1(true);
          setSw2(true);
          setSw3(false);
          setSw4(false);
        },
        physicalExplanation:
          'Como las ramas R1 y R2 continúan conectadas directamente al mismo par de nodos de la fuente ideal de 12 V, la tensión aplicada sobre R1 y R2 no cambia. Por la Ley de Ohm (I1 = Vs/R1 e I2 = Vs/R2), sus corrientes individuales permanecen constantes aunque cambie la corriente total de la fuente.',
        formulaSupportLatex:
          'I_1 = \\frac{V_s}{R_1} = \\text{cte}, \\qquad I_2 = \\frac{V_s}{R_2} = \\text{cte}',
      },
    ],
    []
  );

  // Desafíos numéricos guiados con detección de error típico (sumar resistencias en paralelo)
  const numericChallenges: NumericChallengeItem[] = useMemo(() => {
    const naiveSeriesSumSI =
      (sw1 ? r1K * 1000 : 0) +
      (sw2 ? r2K * 1000 : 0) +
      (sw3 ? r3K * 1000 : 0) +
      (sw4 ? r4K * 1000 : 0);

    return [
      {
        id: 'chal_par_req',
        title: 'Cálculo de Resistencia Equivalente en Paralelo',
        prompt: `Con las ramas activas actuales, calcule la resistencia equivalente Req entre el nodo superior A y el nodo inferior B.`,
        magnitudeType: 'resistance',
        expectedValueSI: circuit.req ?? 0,
        availableUnits: ['kΩ', 'Ω'],
        defaultUnit: 'kΩ',
        hints: [
          'Recuerde que en paralelo no se suman las resistencias directamente; se suman las conductancias (los inversos de cada resistencia).',
          'Aplique 1/Req = 1/R1 + 1/R2 + 1/R3 para las ramas cerradas y luego invierta el resultado para obtener Req.',
        ],
        procedureLatex:
          circuit.req !== null
            ? `\\frac{1}{R_{\\text{eq}}} = \\sum \\frac{1}{R_k} = ${(circuit.geq * 1000).toFixed(
                3
              )}\\text{ mS} \\quad\\Longrightarrow\\quad R_{\\text{eq}} = \\frac{1}{G_{\\text{eq}}} = ${(
                circuit.req / 1000
              ).toFixed(3)}\\text{ k}\\Omega`
            : 'R_{\\text{eq}} = \\infty\\text{ (Circuito abierto)}',
        physicalExplanation:
          'En una asociación en paralelo la resistencia equivalente siempre es menor que la menor de las resistencias conectadas, ya que la corriente dispone de múltiples trayectorias simultáneas.',
        commonMistakesSI: [
          {
            valueSI: naiveSeriesSumSI,
            category: 'parallel_sum_mistake',
            message:
              'Ha sumado directamente las resistencias como si estuvieran en serie (R1 + R2 + R3). En paralelo debe sumar las conductancias: 1/Req = 1/R1 + 1/R2 + 1/R3.',
          },
          {
            valueSI: circuit.geq * 1000, // si introduce Geq sin invertir
            category: 'calculation_error',
            message:
              'Ha calculado correctamente la suma de inversos (conductancia equivalente Geq), pero olvidó realizar la inversión final Req = 1 / Geq.',
          },
        ],
      },
      {
        id: 'chal_par_itotal',
        title: 'Determinación de la Corriente Total Suministrada',
        prompt: `Para Vs = ${vs} V y el estado actual de los interruptores, determine la corriente total Itotal entregada por la fuente.`,
        magnitudeType: 'current',
        expectedValueSI: circuit.iTotalPhys,
        availableUnits: ['mA', 'A'],
        defaultUnit: 'mA',
        hints: [
          'La tensión en todas las ramas cerradas es igual a la tensión de la fuente Vs.',
          'Puede calcular la corriente de cada rama cerrada (Ik = Vs / Rk) y sumarlas, o bien dividir Vs entre Req.',
        ],
        procedureLatex: `I_{\\text{total}} = \\sum I_k = V_s \\cdot G_{\\text{eq}} = ${(
          circuit.iTotalPhys * 1000
        ).toFixed(2)}\\text{ mA}`,
        physicalExplanation:
          'Por conservación de la carga eléctrica en el nodo superior, la corriente total que sale de la fuente se divide exactamente entre las ramas conectadas en paralelo.',
      },
      {
        id: 'chal_par_ptotal',
        title: 'Cálculo de la Potencia Total Disipada en Paralelo',
        prompt: `Determine la potencia eléctrica total disipada por el conjunto de ramas en paralelo activas.`,
        magnitudeType: 'power',
        expectedValueSI: circuit.pTotalDissipated,
        availableUnits: ['mW', 'W'],
        defaultUnit: 'mW',
        hints: [
          'En cada rama cerrada la potencia disipada es Pk = Vs² / Rk = Vs · Ik.',
          'Sume las potencias de todas las ramas activas o multiplique Vs por Itotal.',
        ],
        procedureLatex: `P_{\\text{total}} = V_s \\cdot I_{\\text{total}} = ${vs}\\text{ V} \\times ${(
          circuit.iTotalPhys * 1000
        ).toFixed(2)}\\text{ mA} = ${(circuit.pTotalDissipated * 1000).toFixed(2)}\\text{ mW}`,
        physicalExplanation:
          'En paralelo, el resistor de menor resistencia conduce la mayor corriente y, por tanto, disipa la mayor potencia (Pk = Vs² / Rk).',
      },
    ];
  }, [vs, r1K, r2K, r3K, r4K, sw1, sw2, sw3, sw4, circuit]);

  // Desarrollo matemático en 6 pasos
  const mathProcedures: MathProcedureStep[] = useMemo(
    () => [
      {
        title: 'Conductancia de cada Rama y Conductancia Equivalente',
        generalEquation: 'G_k = \\frac{1}{R_k}, \\qquad G_{\\text{eq}} = \\sum_{k} G_k',
        variablesIdentification: `Ramas activas: ${
          circuit.branchResults
            .filter((b) => b.closed)
            .map((b) => `${b.label} = ${(b.r / 1000).toFixed(1)} kΩ`)
            .join(', ') || 'Ninguna (todas abiertas)'
        }`,
        numericalSubstitution:
          circuit.branchResults
            .filter((b) => b.closed)
            .map((b) => `\\frac{1}{${(b.r / 1000).toFixed(1)}\\text{ k}\\Omega}`)
            .join(' + ') || 'G_{\\text{eq}} = 0\\text{ mS}',
        operationDetail:
          circuit.branchResults
            .filter((b) => b.closed)
            .map((b) => `${(b.g * 1000).toFixed(3)}\\text{ mS}`)
            .join(' + ') || '0\\text{ mS}',
        resultWithUnits: `G_{\\text{eq}} = ${(circuit.geq * 1000).toFixed(3)}\\text{ mS}`,
        physicalInterpretation:
          'La conductancia mide la facilidad que ofrece cada rama al paso de la corriente; al estar en paralelo, sus capacidades de conducción se suman.',
      },
      {
        title: 'Resistencia Equivalente en Paralelo',
        generalEquation: 'R_{\\text{eq}} = \\frac{1}{G_{\\text{eq}}} = \\left( \\sum_{k} \\frac{1}{R_k} \\right)^{-1}',
        variablesIdentification: `Geq = ${(circuit.geq * 1000).toFixed(3)} mS`,
        numericalSubstitution:
          circuit.req !== null
            ? `R_{\\text{eq}} = \\frac{1}{${(circuit.geq * 1000).toFixed(3)}\\text{ mS}}`
            : 'R_{\\text{eq}} \\to \\infty \\; (G_{\\text{eq}} = 0)',
        operationDetail:
          circuit.req !== null
            ? `R_{\\text{eq}} = ${(circuit.req / 1000).toFixed(3)}\\text{ k}\\Omega = ${circuit.req.toFixed(
                1
              )}\\text{ }\\Omega`
            : '\\text{Circuito Abierto}',
        resultWithUnits:
          circuit.req !== null
            ? `R_{\\text{eq}} = ${(circuit.req / 1000).toFixed(2)}\\text{ k}\\Omega`
            : 'R_{\\text{eq}} = \\infty\\text{ }\\Omega',
        physicalInterpretation:
          'El valor de la resistencia equivalente en paralelo siempre resulta inferior a la menor de las resistencias conectadas.',
      },
      {
        title: 'Corrientes Individuales por Rama y Corriente Total',
        generalEquation: 'I_k = \\frac{V_s}{R_k} = V_s \\cdot G_k, \\qquad I_{\\text{total}} = \\sum_{k} I_k',
        variablesIdentification: `Tensión común de nodos V_AB = ${vs.toFixed(2)} V`,
        numericalSubstitution: circuit.branchResults
          .map((b) => `${b.label}: ${(b.currentPhys * 1000).toFixed(2)}\\text{ mA}`)
          .join(',\\; '),
        operationDetail: `I_{\\text{total}} = ${circuit.branchResults
          .map((b) => (b.currentPhys * 1000).toFixed(2))
          .join(' + ')}\\text{ mA}`,
        resultWithUnits: `I_{\\text{total}} = ${(circuit.iTotalPhys * 1000).toFixed(2)}\\text{ mA}`,
        physicalInterpretation:
          'La rama de menor resistencia recibe la mayor fracción de corriente (relación inversa entre corriente y resistencia).',
      },
      {
        title: 'Potencia por Rama y Potencia Total',
        generalEquation: 'P_k = \\frac{V_s^2}{R_k} = V_s \\cdot I_k, \\qquad P_{\\text{total}} = \\sum_{k} P_k',
        variablesIdentification: `Vs = ${vs.toFixed(2)} V aplicada sobre cada rama cerrada`,
        numericalSubstitution: circuit.branchResults
          .map((b) => `P_{${b.label}} = ${(b.power * 1000).toFixed(1)}\\text{ mW}`)
          .join(',\\; '),
        operationDetail: `\\sum P = ${(circuit.pSourcePassive * 1000).toFixed(1)}\\text{ mW} + ${(
          circuit.pTotalDissipated * 1000
        ).toFixed(1)}\\text{ mW} = 0.0\\text{ mW}`,
        resultWithUnits: `P_{\\text{total}} = ${(circuit.pTotalDissipated * 1000).toFixed(
          2
        )}\\text{ mW}`,
        physicalInterpretation:
          'Cada rama absorbe potencia de manera independiente mientras la fuente ideal mantenga constante la tensión entre los nodos comunes.',
      },
    ],
    [vs, circuit]
  );

  return (
    <div className="space-y-6">
      {/* A. Explicación del objetivo del módulo */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-4xl">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-700">
            <span>MÓDULO 02 · NIVEL INTERMEDIO</span>
            <span aria-hidden="true">·</span>
            <span>ASOCIACIÓN EN PARALELO, CONDUCTANCIA Y DIVISIÓN DE CORRIENTE</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Circuitos Resistivos en Paralelo y Control Independiente de Ramas
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Explore cómo múltiples ramas conectadas al mismo par de nodos comparten una tensión común mientras la corriente total se divide inversamente proporcional a cada resistencia. Abra o cierre interruptores individuales y verifique qué ocurre cuando todas las ramas se abren.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSw4((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              sw4
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            {sw4 ? 'Desconectar 4.ª Rama (R4)' : 'Conectar 4.ª Rama en Paralelo (R4)'}
          </button>

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
            {isEquivalentView ? 'Ver Ramas en Paralelo' : 'Reducir a Equivalente (Req)'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer (12 V · 6k, 3k, 2k)
          </button>
        </div>
      </section>

      {/* Aviso de Circuito Abierto Total si todos los interruptores están abiertos */}
      {circuit.isAllOpen && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-950">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-sm">
              Estado de Circuito Abierto Total Detectado (Todas las ramas desconectadas)
            </p>
            <p className="leading-relaxed">
              Al encontrarse abiertos todos los interruptores de rama, la conductancia equivalente es nula (<span className="font-mono">Geq = 0 S</span>) y la resistencia equivalente tiende a infinito (<span className="font-mono">Req = ∞ Ω</span>). No circula corriente por ninguna rama (<span className="font-mono">Itotal = 0 mA</span>), aunque la tensión entre los buses superior e inferior sigue siendo igual a la tensión aplicada por la fuente ideal (<span className="font-mono">{vs.toFixed(1)} V</span>).
            </p>
          </div>
        </div>
      )}

      {/* Zona Principal: Esquema SVG + Controles */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* B. Esquema Interactivo en Paralelo (8 columnas) */}
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono font-semibold text-slate-800">
              {isEquivalentView
                ? 'ESQUEMA EQUIVALENTE VISTO DESDE LA FUENTE (Req)'
                : 'ESQUEMA ELÉCTRICO EN PARALELO (MISMO PAR DE NODOS A Y B)'}
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: 'S1 (R1)', state: sw1, toggle: () => setSw1((p) => !p) },
                { label: 'S2 (R2)', state: sw2, toggle: () => setSw2((p) => !p) },
                { label: 'S3 (R3)', state: sw3, toggle: () => setSw3((p) => !p) },
              ].map((sw) => (
                <button
                  key={sw.label}
                  type="button"
                  onClick={sw.toggle}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded border transition-colors cursor-pointer ${
                    sw.state
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-slate-100 border-slate-300 text-slate-600'
                  }`}
                >
                  {sw.label}: {sw.state ? 'CERRADO' : 'ABIERTO'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-[#F8FAFC] flex flex-col items-center">
            <svg
              viewBox="0 0 780 410"
              className="w-full max-w-[760px] h-auto select-none"
              role="img"
              aria-label="Esquema eléctrico interactivo de circuito resistivo en paralelo"
            >
              <defs>
                <pattern id="grid-parallel" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.7" />
                </pattern>
              </defs>

              <rect width="780" height="410" rx="12" fill="url(#grid-parallel)" />

              {!isEquivalentView ? (
                <>
                  {/* Buses principales superior (Nodo A) e inferior (Nodo B) */}
                  <g stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round">
                    {/* Fuente en x=100 */}
                    <line x1="100" y1="65" x2="100" y2="170" />
                    <line x1="100" y1="240" x2="100" y2="345" />

                    {/* Bus superior e inferior hasta la última rama activa */}
                    <line x1="100" y1="65" x2={sw4 ? 690 : 560} y2="65" />
                    <line x1="100" y1="345" x2={sw4 ? 690 : 560} y2="345" />
                  </g>

                  {/* Animación de corriente total en el alimentador principal */}
                  {animationsEnabled && !circuit.isAllOpen && circuit.iTotalPhys > 0 && (
                    <>
                      <line
                        x1="100"
                        y1="65"
                        x2="250"
                        y2="65"
                        stroke="#0284C7"
                        strokeWidth="4.5"
                        strokeDasharray="6 16"
                        className="animate-current-forward"
                        style={
                          {
                            '--flow-duration': `${getFlowDuration(circuit.iTotalPhys)}s`,
                          } as React.CSSProperties
                        }
                      />
                      <line
                        x1="250"
                        y1="345"
                        x2="100"
                        y2="345"
                        stroke="#0284C7"
                        strokeWidth="4.5"
                        strokeDasharray="6 16"
                        className="animate-current-forward"
                        style={
                          {
                            '--flow-duration': `${getFlowDuration(circuit.iTotalPhys)}s`,
                          } as React.CSSProperties
                        }
                      />
                    </>
                  )}

                  {/* Dibujo de cada rama paralela */}
                  {[
                    {
                      idx: 1,
                      x: 260,
                      label: 'R1',
                      swLabel: 'S1',
                      rK: r1K,
                      closed: sw1,
                      toggle: () => setSw1((p) => !p),
                      res: b1,
                      inv: refInv1,
                    },
                    {
                      idx: 2,
                      x: 410,
                      label: 'R2',
                      swLabel: 'S2',
                      rK: r2K,
                      closed: sw2,
                      toggle: () => setSw2((p) => !p),
                      res: b2,
                      inv: refInv2,
                    },
                    {
                      idx: 3,
                      x: 560,
                      label: 'R3',
                      swLabel: 'S3',
                      rK: r3K,
                      closed: sw3,
                      toggle: () => setSw3((p) => !p),
                      res: b3,
                      inv: refInv3,
                    },
                    ...(sw4 && b4
                      ? [
                          {
                            idx: 4,
                            x: 690,
                            label: 'R4',
                            swLabel: 'S4',
                            rK: r4K,
                            closed: sw4,
                            toggle: () => setSw4((p) => !p),
                            res: b4,
                            inv: refInv4,
                          },
                        ]
                      : []),
                  ].map((branch) => {
                    const bx = branch.x;
                    const iBranch = branch.res?.currentPhys ?? 0;
                    const iBranchRef = branch.res?.currentRef ?? 0;
                    const dur = getFlowDuration(iBranch);

                    return (
                      <g key={branch.label}>
                        {/* Nodos de derivación en el bus superior e inferior */}
                        <circle cx={bx} cy="65" r="5" fill="#0284C7" />
                        <circle cx={bx} cy="345" r="5" fill="#0F172A" />

                        {/* Tramo superior hasta el interruptor de rama */}
                        <line x1={bx} y1="65" x2={bx} y2="102" stroke="#334155" strokeWidth="3" />

                        {/* Interruptor interactivo de rama */}
                        <g onClick={branch.toggle} className="cursor-pointer">
                          <rect
                            x={bx - 24}
                            y="96"
                            width="48"
                            height="44"
                            fill="transparent"
                          />
                          {branch.closed ? (
                            <line
                              x1={bx}
                              y1="102"
                              x2={bx}
                              y2="136"
                              stroke="#059669"
                              strokeWidth="3.5"
                            />
                          ) : (
                            <line
                              x1={bx}
                              y1="102"
                              x2={bx + 22}
                              y2="130"
                              stroke="#D97706"
                              strokeWidth="3.5"
                            />
                          )}
                          <circle
                            cx={bx}
                            cy="102"
                            r="4"
                            fill="#FFFFFF"
                            stroke="#334155"
                            strokeWidth="2"
                          />
                          <circle
                            cx={bx}
                            cy="136"
                            r="4"
                            fill="#FFFFFF"
                            stroke="#334155"
                            strokeWidth="2"
                          />
                          <text
                            x={bx - 14}
                            y="122"
                            textAnchor="end"
                            className="fill-slate-600 font-mono text-[10px] font-semibold"
                          >
                            {branch.swLabel}
                          </text>
                        </g>

                        {/* Tramo e icono de Resistor vertical */}
                        <line x1={bx} y1="136" x2={bx} y2="165" stroke="#334155" strokeWidth="3" />
                        <polyline
                          points={`${bx},165 ${bx + 14},175 ${bx - 14},191 ${bx + 14},207 ${
                            bx - 14
                          },223 ${bx + 14},239 ${bx - 14},255 ${bx},265`}
                          fill="none"
                          stroke={branch.closed ? '#0F172A' : '#94A3B8'}
                          strokeWidth="3"
                          strokeLinejoin="round"
                        />
                        <line x1={bx} y1="265" x2={bx} y2="345" stroke="#334155" strokeWidth="3" />

                        {/* Animación de corriente en esta rama (SOLO si está cerrada y hay corriente) */}
                        {animationsEnabled && branch.closed && iBranch > 0 && (
                          <line
                            x1={bx}
                            y1="68"
                            x2={bx}
                            y2="342"
                            stroke="#0284C7"
                            strokeWidth="4"
                            strokeDasharray="5 15"
                            className={
                              branch.inv ? 'animate-current-reverse' : 'animate-current-forward'
                            }
                            style={{ '--flow-duration': `${dur}s` } as React.CSSProperties}
                          />
                        )}

                        {/* Etiqueta de datos de la rama */}
                        <rect
                          x={bx - 56}
                          y="276"
                          width="112"
                          height="54"
                          rx="6"
                          fill="#FFFFFF"
                          stroke={branch.closed ? '#CBD5E1' : '#E2E8F0'}
                          strokeWidth="1.2"
                        />
                        <text
                          x={bx}
                          y="293"
                          textAnchor="middle"
                          className="fill-slate-900 font-mono text-xs font-bold"
                        >
                          {branch.label} = {branch.rK.toFixed(1)} kΩ
                        </text>
                        <text
                          x={bx}
                          y="309"
                          textAnchor="middle"
                          className={`font-mono text-[11px] font-semibold ${
                            branch.closed ? 'fill-amber-600' : 'fill-slate-400'
                          }`}
                        >
                          {isChallengeMode
                            ? `I${branch.idx} = ?`
                            : branch.closed
                            ? `I${branch.idx} = ${(iBranchRef * 1000).toFixed(2)} mA`
                            : 'Rama Abierta (0 mA)'}
                        </text>
                        <text
                          x={bx}
                          y="323"
                          textAnchor="middle"
                          className="fill-slate-500 font-mono text-[10px]"
                        >
                          {isChallengeMode
                            ? 'G = ? · P = ?'
                            : `G=${((branch.res?.g ?? 0) * 1000).toFixed(2)} mS · P=${(
                                (branch.res?.power ?? 0) * 1000
                              ).toFixed(0)} mW`}
                        </text>
                      </g>
                    );
                  })}

                  {/* Etiquetas de Nodos Comunes */}
                  <text x="175" y="52" className="fill-sky-800 font-mono text-xs font-bold">
                    Nodo Común Superior A (+{vs.toFixed(1)} V)
                  </text>
                  <text x="175" y="368" className="fill-slate-700 font-mono text-xs font-bold">
                    Nodo Común Inferior B (Referencia 0 V)
                  </text>
                </>
              ) : (
                /* VISTA DE CIRCUITO EQUIVALENTE EN PARALELO */
                <>
                  <g stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round">
                    <line x1="100" y1="65" x2="100" y2="170" />
                    <line x1="100" y1="240" x2="100" y2="345" />
                    <line x1="100" y1="65" x2="460" y2="65" />
                    <line x1="460" y1="65" x2="460" y2="150" />
                    {circuit.req !== null ? (
                      <polyline
                        points="460,150 478,162 442,182 478,202 442,222 478,242 442,262 460,274"
                        stroke="#0284C7"
                        strokeWidth="3.5"
                      />
                    ) : (
                      <line x1="460" y1="150" x2="495" y2="210" stroke="#D97706" strokeWidth="3.5" />
                    )}
                    <line x1="460" y1="274" x2="460" y2="345" />
                    <line x1="460" y1="345" x2="100" y2="345" />
                  </g>

                  {animationsEnabled && !circuit.isAllOpen && circuit.iTotalPhys > 0 && (
                    <rect
                      x="100"
                      y="65"
                      width="360"
                      height="280"
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="4"
                      strokeDasharray="6 16"
                      className="animate-current-forward"
                      style={
                        {
                          '--flow-duration': `${getFlowDuration(circuit.iTotalPhys)}s`,
                        } as React.CSSProperties
                      }
                    />
                  )}

                  <rect
                    x="505"
                    y="152"
                    width="220"
                    height="108"
                    rx="8"
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth="1.5"
                  />
                  <text
                    x="615"
                    y="176"
                    textAnchor="middle"
                    className="fill-sky-900 font-mono text-xs font-bold"
                  >
                    ASOCIACIÓN EQUIVALENTE
                  </text>
                  <text
                    x="615"
                    y="198"
                    textAnchor="middle"
                    className="fill-slate-900 font-mono text-sm font-bold"
                  >
                    Req = {formatResistance(circuit.req).full}
                  </text>
                  <text
                    x="615"
                    y="218"
                    textAnchor="middle"
                    className="fill-slate-600 font-mono text-xs"
                  >
                    Geq = {(circuit.geq * 1000).toFixed(3)} mS
                  </text>
                  <text
                    x="615"
                    y="240"
                    textAnchor="middle"
                    className="fill-amber-600 font-mono text-xs font-bold"
                  >
                    Itotal = {(circuit.iTotalPhys * 1000).toFixed(2)} mA
                  </text>
                </>
              )}

              {/* Fuente DC */}
              <g>
                <circle cx="100" cy="205" r="34" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
                <text
                  x="100"
                  y="194"
                  textAnchor="middle"
                  className="fill-rose-600 font-mono text-base font-bold"
                >
                  +
                </text>
                <text
                  x="100"
                  y="226"
                  textAnchor="middle"
                  className="fill-slate-700 font-mono text-base font-bold"
                >
                  −
                </text>
                <rect x="12" y="178" width="48" height="52" rx="6" fill="#0F172A" />
                <text x="36" y="198" textAnchor="middle" className="fill-slate-300 font-mono text-[9px]">
                  FUENTE
                </text>
                <text x="36" y="216" textAnchor="middle" className="fill-white font-mono text-xs font-bold">
                  {vs.toFixed(0)}V
                </text>
              </g>

              {/* Indicador de Corriente Total de Fuente */}
              <g>
                <rect
                  x="122"
                  y="78"
                  width="112"
                  height="42"
                  rx="6"
                  fill="#FFFFFF"
                  stroke="#CBD5E1"
                />
                <text x="178" y="94" textAnchor="middle" className="fill-slate-500 font-mono text-[10px]">
                  CORRIENTE TOTAL
                </text>
                <text
                  x="178"
                  y="111"
                  textAnchor="middle"
                  className="fill-amber-600 font-mono text-xs font-bold"
                >
                  {isChallengeMode ? 'Itotal = ?' : `Itotal = ${(circuit.iTotalPhys * 1000).toFixed(2)} mA`}
                </text>
              </g>
            </svg>

            <div className="w-full pt-3 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
              <span>
                Haga clic directamente sobre cualquiera de los interruptores <strong>S1, S2 o S3</strong> en el esquema para abrir o cerrar esa rama en tiempo real.
              </span>
            </div>
          </div>
        </div>

        {/* C. Controles de Parámetros Eléctricos (4 columnas) */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-700" />
              <h3 className="text-sm font-semibold text-slate-900">
                Control de Fuente y Ramas en Paralelo
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Nodos A-B</span>
          </div>

          {/* Tensión Vs */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="p2-vs" className="font-medium text-slate-700">
                Tensión Común de Fuente (Vs)
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="p2-vs"
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
          </div>

          {/* Ramas R1, R2, R3 y R4 opcional */}
          {[
            {
              id: 'r1',
              label: 'Rama 1 (R1 · Inicial: 6 kΩ)',
              val: r1K,
              setter: setR1K,
              sw: sw1,
              setSw: setSw1,
              inv: refInv1,
              setInv: setRefInv1,
            },
            {
              id: 'r2',
              label: 'Rama 2 (R2 · Inicial: 3 kΩ)',
              val: r2K,
              setter: setR2K,
              sw: sw2,
              setSw: setSw2,
              inv: refInv2,
              setInv: setRefInv2,
            },
            {
              id: 'r3',
              label: 'Rama 3 (R3 · Inicial: 2 kΩ)',
              val: r3K,
              setter: setR3K,
              sw: sw3,
              setSw: setSw3,
              inv: refInv3,
              setInv: setRefInv3,
            },
            ...(sw4
              ? [
                  {
                    id: 'r4',
                    label: 'Rama 4 Adicional (R4)',
                    val: r4K,
                    setter: setR4K,
                    sw: sw4,
                    setSw: setSw4,
                    inv: refInv4,
                    setInv: setRefInv4,
                  },
                ]
              : []),
          ].map((branch) => (
            <div key={branch.id} className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800">{branch.label}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => branch.setInv((p) => !p)}
                    className="px-2 py-0.5 text-[11px] font-mono rounded border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer"
                    title="Invertir sentido de referencia de corriente en esta rama"
                  >
                    Ref: {branch.inv ? '−I↑' : '+I↓'}
                  </button>
                  <button
                    type="button"
                    onClick={() => branch.setSw((p) => !p)}
                    className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded border cursor-pointer ${
                      branch.sw
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-amber-50 border-amber-300 text-amber-900'
                    }`}
                  >
                    {branch.sw ? 'Cerrada' : 'Abierta'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0.5}
                  max={24}
                  step={0.5}
                  value={branch.val}
                  onChange={(e) => branch.setter(Number(e.target.value))}
                  className="flex-1 accent-slate-800 cursor-pointer"
                />
                <input
                  type="number"
                  min={0.5}
                  max={24}
                  step={0.5}
                  value={branch.val}
                  onChange={(e) =>
                    branch.setter(Math.max(0.5, Math.min(24, Number(e.target.value) || 0.5)))
                  }
                  className="w-16 text-right font-mono text-xs font-semibold border border-slate-300 rounded px-1.5 py-1 text-slate-900"
                />
                <span className="font-mono text-xs text-slate-500">kΩ</span>
              </div>
            </div>
          ))}

          {/* Polaridad global de medición */}
          <div className="pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setPolarityInverted((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span>Polaridad de medición (V_AB):</span>
              <span className="font-mono font-semibold text-sky-800">
                {polarityInverted ? 'Invertida (Nodo B − Nodo A)' : 'Directa (Nodo A − Nodo B)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* D. Panel de Mediciones y Gráficos de Corrientes y Potencias por Rama */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <p className="text-xs font-mono text-slate-500">
              CONDUCTANCIA, DIVISIÓN DE CORRIENTE Y POTENCIA POR RAMA
            </p>
            <h3 className="text-base font-semibold text-slate-900">
              Resultados Cuantitativos del Sistema en Paralelo
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Conservación de corriente: Itotal = ΣIk = {(circuit.iTotalPhys * 1000).toFixed(2)} mA
            </span>
          </div>
        </div>

        {/* Tarjetas de métricas principales */}
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
              {circuit.isAllOpen ? 'Ramas abiertas' : 'Menor que toda Rk'}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="block text-[11px] font-mono text-slate-500 uppercase">
              Conductancia Eq.
            </span>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-mono font-bold text-sky-700 tabular-nums">
                {isChallengeMode ? '—' : (circuit.geq * 1000).toFixed(3)}
              </span>
              <span className="text-xs font-mono text-slate-500 ml-1.5">mS</span>
            </div>
            <span className="block text-[11px] font-mono text-slate-500 mt-1">
              Geq = ΣGk
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="block text-[11px] font-mono text-slate-500 uppercase">
              Tensión Común
            </span>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                {circuit.vCommonMeasured.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-500 ml-1.5">V</span>
            </div>
            <span className="block text-[11px] font-mono text-slate-500 mt-1">
              Idéntica en cada rama
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="block text-[11px] font-mono text-slate-500 uppercase">
              Corriente Total
            </span>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-mono font-bold text-amber-600 tabular-nums">
                {isChallengeMode ? '—' : (circuit.iTotalPhys * 1000).toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-500 ml-1.5">mA</span>
            </div>
            <span className="block text-[11px] font-mono text-slate-500 mt-1">
              I1+I2+I3{sw4 ? '+I4' : ''}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="block text-[11px] font-mono text-slate-500 uppercase">
              Corrientes Ramas
            </span>
            <div className="mt-1 text-xs font-mono font-semibold text-slate-800 space-y-0.5">
              <div>I1 = {isChallengeMode ? '—' : `${((b1?.currentRef ?? 0) * 1000).toFixed(2)} mA`}</div>
              <div>I2 = {isChallengeMode ? '—' : `${((b2?.currentRef ?? 0) * 1000).toFixed(2)} mA`}</div>
              <div>I3 = {isChallengeMode ? '—' : `${((b3?.currentRef ?? 0) * 1000).toFixed(2)} mA`}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="block text-[11px] font-mono text-slate-500 uppercase">
              Potencia Total
            </span>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-mono font-bold text-emerald-700 tabular-nums">
                {isChallengeMode ? '—' : (circuit.pTotalDissipated * 1000).toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-500 ml-1.5">mW</span>
            </div>
            <span className="block text-[11px] font-mono text-slate-500 mt-1">
              ΣP = {circuit.powerBalanceSum.toFixed(2)} mW
            </span>
          </div>
        </div>

        {/* Dos gráficos de barras lado a lado: 1. Corrientes por rama, 2. Potencias por rama */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
          {/* Gráfico 1: Distribución de Corriente por Rama */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase font-mono text-slate-700">
                Gráfico de Barras: Corriente por Rama (mA)
              </h4>
              <span className="text-xs font-mono text-amber-700">
                Itotal = {(circuit.iTotalPhys * 1000).toFixed(2)} mA
              </span>
            </div>

            <div className="space-y-3">
              {circuit.branchResults.map((b) => {
                const maxBranchI = Math.max(
                  ...circuit.branchResults.map((x) => x.currentPhys * 1000),
                  1
                );
                const iMa = b.currentPhys * 1000;
                const widthPct = (iMa / maxBranchI) * 100;
                return (
                  <div key={b.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-slate-800">
                        {b.label} ({(b.r / 1000).toFixed(1)} kΩ · G = {(b.g * 1000).toFixed(3)} mS)
                      </span>
                      <span className="text-slate-700">
                        {iMa.toFixed(2)} mA ({b.sharePercent.toFixed(1)} % de Itotal)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-amber-500 transition-all duration-150"
                        style={{ width: `${Math.min(100, widthPct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gráfico 2: Potencia Disipada por Rama */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase font-mono text-slate-700">
                Gráfico de Barras: Potencia por Rama (mW)
              </h4>
              <span className="text-xs font-mono text-emerald-700">
                Ptotal = {(circuit.pTotalDissipated * 1000).toFixed(1)} mW
              </span>
            </div>

            <div className="space-y-3">
              {circuit.branchResults.map((b) => {
                const maxBranchP = Math.max(
                  ...circuit.branchResults.map((x) => x.power * 1000),
                  1
                );
                const pMw = b.power * 1000;
                const widthPct = (pMw / maxBranchP) * 100;
                return (
                  <div key={b.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-slate-800">
                        {b.label} ({b.closed ? 'Conectada' : 'Rama Abierta'})
                      </span>
                      <span className="text-slate-700">
                        {pMw.toFixed(2)} mW
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-150"
                        style={{ width: `${Math.min(100, widthPct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Multímetro Virtual */}
      {showMultimeter && (
        <VirtualMultimeter
          nodes={circuit.nodes}
          branches={circuit.branches}
          preferMilliAmps={true}
          moduleName="Módulo 2: Circuitos en Paralelo"
        />
      )}

      {/* Actividades de Predicción y Desafíos Guiados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PredictionActivitiesPanel activities={predictionActivities} />
        <GuidedNumericChallengePanel
          challenges={numericChallenges}
          isChallengeMode={isChallengeMode}
          onActivateChallengeMode={onActivateChallengeMode}
        />
      </div>

      {/* Desarrollo Matemático */}
      <MathDevelopmentPanel
        isOpen={showMath}
        onToggle={onToggleMath}
        moduleTitle="Asociación de Resistores en Paralelo y Conductancia"
        procedures={mathProcedures}
      />

      {/* Conclusiones e Interpretación Física */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <BookOpen className="w-4 h-4 text-sky-700 shrink-0" />
          <h3>Conclusiones e Interpretación Física — Circuitos en Paralelo</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-semibold text-slate-900 block mb-1">
              1. Tensión común e independencia de ramas
            </span>
            Todos los elementos conectados en paralelo al mismo par de nodos están sometidos a la misma diferencia de potencial (<MathFormula latex="V_1 = V_2 = V_3 = V_s" />). Abrir o cerrar una rama no altera la corriente de las demás ramas mientras la fuente mantenga su tensión constante.
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-semibold text-slate-900 block mb-1">
              2. División inversa de corriente y aditividad de conductancias
            </span>
            La corriente se divide en proporción directa a la conductancia <MathFormula latex="G_k = 1/R_k" /> de cada rama. Por ello, la rama de menor resistencia (<MathFormula latex="R_3 = 2\text{ k}\Omega" />) conduce la mayor corriente (<MathFormula latex="6\text{ mA}" />).
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-semibold text-slate-900 block mb-1">
              3. Disminución de la resistencia equivalente
            </span>
            Agregar ramas en paralelo incrementa el área efectiva de conducción (<MathFormula latex="G_{\text{eq}} = \sum G_k" />), logrando que <MathFormula latex="R_{\text{eq}}" /> sea siempre menor que cualquiera de las resistencias individuales conectadas.
          </div>
        </div>
      </section>
    </div>
  );
};
