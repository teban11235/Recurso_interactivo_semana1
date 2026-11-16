import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Layers,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import {
  solveMixedCircuit,
  formatResistance,
  formatCurrent,
  formatPower,
  validateStudentNumericAnswer,
} from '../engine/circuitEngine';
import { MathDevelopmentPanel, MathProcedureStep, MathFormula } from './MathDevelopment';
import { VirtualMultimeter } from './VirtualMultimeter';
import {
  PredictionActivitiesPanel,
  PredictionActivity,
  GuidedNumericChallengePanel,
  NumericChallengeItem,
} from './ChallengeWorkbench';

interface Module3MixedProps {
  animationsEnabled: boolean;
  showMath: boolean;
  onToggleMath: () => void;
  showMultimeter: boolean;
  isChallengeMode: boolean;
  onActivateChallengeMode: () => void;
}

export const Module3Mixed: React.FC<Module3MixedProps> = ({
  animationsEnabled,
  showMath,
  onToggleMath,
  showMultimeter,
  isChallengeMode,
  onActivateChallengeMode,
}) => {
  // Valores iniciales: Vs = 12 V, R1 = 1 kΩ, R2 = 2 kΩ, R3 = 2 kΩ
  const [vs, setVs] = useState<number>(12);
  const [r1K, setR1K] = useState<number>(1);
  const [r2K, setR2K] = useState<number>(2);
  const [r3K, setR3K] = useState<number>(2);
  const [swMain, setSwMain] = useState<boolean>(true);
  const [sw2, setSw2] = useState<boolean>(true);
  const [sw3, setSw3] = useState<boolean>(true);
  const [currentRefInverted, setCurrentRefInverted] = useState<boolean>(false);
  const [polarityInverted, setPolarityInverted] = useState<boolean>(false);

  // Etapa visual de reducción del circuito: 1 = Original, 2 = Parcial (R1 + R23), 3 = Equivalente Final (Req)
  const [visualStage, setVisualStage] = useState<1 | 2 | 3>(1);

  // Estado del Asistente Interactivo de Reducción Progresiva
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [step1Topology, setStep1Topology] = useState<'parallel' | 'series' | ''>('');
  const [step1Formula, setStep1Formula] = useState<'parallel_correct' | 'series_wrong' | ''>('');
  const [step1ValueInput, setStep1ValueInput] = useState<string>('');
  const [step1Unit, setStep1Unit] = useState<string>('kΩ');
  const [step1Verified, setStep1Verified] = useState<boolean>(false);
  const [step1Feedback, setStep1Feedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const [step2Topology, setStep2Topology] = useState<'series' | 'parallel' | ''>('');
  const [step2ValueInput, setStep2ValueInput] = useState<string>('');
  const [step2Unit, setStep2Unit] = useState<string>('kΩ');
  const [step2Verified, setStep2Verified] = useState<boolean>(false);
  const [step2Feedback, setStep2Feedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const [step3CurrentInput, setStep3CurrentInput] = useState<string>('');
  const [step3Unit, setStep3Unit] = useState<string>('mA');
  const [step3Verified, setStep3Verified] = useState<boolean>(false);
  const [step3Feedback, setStep3Feedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // Selector de potencia nominal comercial para R1
  const [selectedNominalRatingMw, setSelectedNominalRatingMw] = useState<number>(125);

  const circuit = useMemo(
    () =>
      solveMixedCircuit({
        vs,
        r1: r1K * 1000,
        r2: r2K * 1000,
        r3: r3K * 1000,
        swMain,
        sw2,
        sw3,
        currentRefInverted,
        polarityInverted,
      }),
    [vs, r1K, r2K, r3K, swMain, sw2, sw3, currentRefInverted, polarityInverted]
  );

  const handleReset = () => {
    setVs(12);
    setR1K(1);
    setR2K(2);
    setR3K(2);
    setSwMain(true);
    setSw2(true);
    setSw3(true);
    setCurrentRefInverted(false);
    setPolarityInverted(false);
    setVisualStage(1);
    setSelectedComponents([]);
    setStep1Topology('');
    setStep1Formula('');
    setStep1ValueInput('');
    setStep1Verified(false);
    setStep1Feedback(null);
    setStep2Topology('');
    setStep2ValueInput('');
    setStep2Verified(false);
    setStep2Feedback(null);
    setStep3CurrentInput('');
    setStep3Verified(false);
    setStep3Feedback(null);
  };

  // Mostrar resultados completos solo si el estudiante completó la reducción o si decide desbloquear la telemetría
  const [revealFullTelemetry, setRevealFullTelemetry] = useState<boolean>(false);
  const hideSolutions = isChallengeMode || (!revealFullTelemetry && !step3Verified);

  const toggleSelectComponent = (compId: string) => {
    setSelectedComponents((prev) =>
      prev.includes(compId) ? prev.filter((x) => x !== compId) : [...prev, compId]
    );
    setStep1Feedback(null);
  };

  // Validación del Paso 1 de Reducción Progresiva (Combinar R2 y R3 en paralelo)
  const handleVerifyStep1 = () => {
    const hasR1 = selectedComponents.includes('R1');
    const hasR2 = selectedComponents.includes('R2');
    const hasR3 = selectedComponents.includes('R3');

    if (selectedComponents.length !== 2) {
      setStep1Feedback({
        ok: false,
        msg: 'Seleccione exactamente dos resistores del circuito original para evaluar su combinación directa.',
      });
      return;
    }

    if (hasR1 && (hasR2 || hasR3)) {
      setStep1Feedback({
        ok: false,
        msg: `Equivalencia eléctrica inválida: Usted ha seleccionado R1 y ${
          hasR2 ? 'R2' : 'R3'
        }. Estos dos resistores NO están directamente en serie porque entre ellos se encuentra el Nodo B de bifurcación hacia ${
          hasR2 ? 'R3' : 'R2'
        } (por lo que no comparten la misma corriente). Tampoco están en paralelo porque no comparten ambos pares de nodos. Debe reducir primero el bloque paralelo formado por R2 y R3.`,
      });
      return;
    }

    if (hasR2 && hasR3) {
      if (step1Topology !== 'parallel') {
        setStep1Feedback({
          ok: false,
          msg: 'Ha seleccionado correctamente R2 y R3, pero debe identificar que su conexión entre el Nodo B y el Nodo C es en PARALELO.',
        });
        return;
      }
      if (step1Formula !== 'parallel_correct') {
        setStep1Feedback({
          ok: false,
          msg: 'Seleccione la relación matemática correspondiente a dos resistores en paralelo: R23 = (R2 · R3) / (R2 + R3).',
        });
        return;
      }

      const expectedR23 = circuit.r23 ?? 0;
      const valCheck = validateStudentNumericAnswer(
        step1ValueInput,
        step1Unit,
        expectedR23,
        'resistance',
        0.025,
        [
          {
            valueSI: (r2K + r3K) * 1000,
            category: 'parallel_sum_mistake',
            message:
              'Ha sumado R2 + R3 como si estuvieran en serie. Aplique R23 = (R2 · R3) / (R2 + R3).',
          },
        ]
      );

      if (!valCheck.isCorrect) {
        setStep1Feedback({ ok: false, msg: valCheck.feedbackMessage });
        return;
      }

      setStep1Verified(true);
      setStep1Feedback({
        ok: true,
        msg: `¡Correcto! R2 y R3 están conectados en paralelo entre los nodos B y C. Su resistencia equivalente es R23 = ${(
          expectedR23 / 1000
        ).toFixed(2)} kΩ. Observe cómo el circuito se transforma a su Etapa 2 (Parcialmente Reducido).`,
      });
      setVisualStage(2);
    }
  };

  // Validación del Paso 2 de Reducción Progresiva (Combinar R1 y R23 en serie)
  const handleVerifyStep2 = () => {
    if (step2Topology !== 'series') {
      setStep2Feedback({
        ok: false,
        msg: 'En el circuito parcialmente reducido, la corriente que atraviesa R1 fluye íntegramente hacia el bloque equivalente R23. Por tanto, R1 y R23 están en SERIE.',
      });
      return;
    }

    const expectedReq = circuit.req ?? 0;
    const valCheck = validateStudentNumericAnswer(
      step2ValueInput,
      step2Unit,
      expectedReq,
      'resistance',
      0.025
    );

    if (!valCheck.isCorrect) {
      setStep2Feedback({ ok: false, msg: valCheck.feedbackMessage });
      return;
    }

    setStep2Verified(true);
    setStep2Feedback({
      ok: true,
      msg: `¡Excelente! Al combinar R1 (${r1K} kΩ) en serie con R23 (${(
        (circuit.r23 ?? 0) / 1000
      ).toFixed(2)} kΩ), se obtiene la resistencia equivalente total Req = ${(
        expectedReq / 1000
      ).toFixed(2)} kΩ. El esquema muestra ahora la Etapa 3 (Circuito Equivalente Final).`,
    });
    setVisualStage(3);
  };

  // Validación del Paso 3 (Cálculo de Itotal y Reconstrucción)
  const handleVerifyStep3 = () => {
    const valCheck = validateStudentNumericAnswer(
      step3CurrentInput,
      step3Unit,
      circuit.iTotalPhys,
      'current',
      0.025
    );

    if (!valCheck.isCorrect) {
      setStep3Feedback({ ok: false, msg: valCheck.feedbackMessage });
      return;
    }

    setStep3Verified(true);
    setRevealFullTelemetry(true);
    setStep3Feedback({
      ok: true,
      msg: `¡Reducción y reconstrucción completadas! Con Itotal = ${(
        circuit.iTotalPhys * 1000
      ).toFixed(2)} mA, al regresar a la Etapa 2 hallamos VR1 = Itotal · R1 = ${circuit.vr1Phys.toFixed(
        2
      )} V y V23 = Itotal · R23 = ${circuit.v23Phys.toFixed(
        2
      )} V. Finalmente, en la Etapa 1 hallamos IR2 = V23 / R2 = ${(
        circuit.ir2Phys * 1000
      ).toFixed(2)} mA e IR3 = V23 / R3 = ${(circuit.ir3Phys * 1000).toFixed(2)} mA.`,
    });
  };

  const getFlowDuration = (amps: number) => {
    const ma = amps * 1000;
    if (ma <= 0.01) return 0;
    return Math.max(0.3, Math.min(3.0, 2.8 / Math.max(ma, 0.3)));
  };

  // Actividades de predicción (Sección 7)
  const predictionActivities: PredictionActivity[] = useMemo(
    () => [
      {
        id: 'pred_mixed_r2_effect_on_r3',
        title: 'Acoplamiento entre ramas en un circuito mixto al modificar R2',
        question:
          'A diferencia de un circuito en paralelo puro, aquí existe R1 en serie con la fuente. Si usted aumenta R2 (por ejemplo, de 2 kΩ a 6 kΩ), ¿qué ocurrirá con la corriente IR3 que circula por R3?',
        options: [
          { id: 'remain_same', label: 'Permanecerá constante como en el paralelo puro' },
          { id: 'increase_ir3', label: 'Aumentará porque sube la tensión en el nodo B (V23)' },
          { id: 'decrease_ir3', label: 'Disminuirá a cero' },
        ],
        correctOptionId: 'increase_ir3',
        actionInstruction:
          'Incremente R2 de 2 kΩ a 6 kΩ y observe cómo cambian Itotal, VR1, V23 e IR3.',
        actionButtonLabel: 'Aumentar R2 a 6 kΩ y comprobar cambio en IR3',
        onExecuteAction: () => {
          setR1K(1);
          setR2K(6);
          setR3K(2);
          setRevealFullTelemetry(true);
        },
        physicalExplanation:
          '¡Fenómeno clave de los circuitos mixtos! Al aumentar R2, aumenta R23 y también aumenta Req. Esto reduce la corriente total Itotal que pasa por R1, disminuyendo la caída de tensión VR1 = Itotal · R1. Como consecuencia, queda mayor tensión disponible en el nodo B (V23 = Vs − VR1 aumenta), por lo que la corriente en R3 (IR3 = V23 / R3) AUMENTA.',
        formulaSupportLatex:
          'R_2 \\uparrow \\;\\Rightarrow\\; R_{\\text{eq}} \\uparrow \\;\\Rightarrow\\; I_{\\text{total}} \\downarrow \\;\\Rightarrow\\; V_{R1} \\downarrow \\;\\Rightarrow\\; V_{23} = (V_s - V_{R1}) \\uparrow \\;\\Rightarrow\\; I_{R3} = \\frac{V_{23}\\uparrow}{R_3} \\uparrow',
      },
      {
        id: 'pred_mixed_max_power_component',
        title: 'Identificación del resistor con mayor disipación térmica',
        question:
          'En la configuración inicial (R1 = 1 kΩ en serie con R2 = 2 kΩ || R3 = 2 kΩ), ¿cuál de los tres resistores disipa la mayor potencia eléctrica?',
        options: [
          { id: 'r1_max', label: 'R1 (disipa 36 mW, el doble que R2 o R3)' },
          { id: 'r2_max', label: 'R2 porque tiene mayor resistencia (2 kΩ)' },
          { id: 'all_equal', label: 'Los tres disipan exactamente la misma potencia' },
        ],
        correctOptionId: 'r1_max',
        actionInstruction:
          'Restablezca los valores iniciales (1 kΩ, 2 kΩ, 2 kΩ) y compare PR1 frente a PR2 y PR3.',
        actionButtonLabel: 'Restablecer configuración inicial y comparar potencias',
        onExecuteAction: () => {
          setVs(12);
          setR1K(1);
          setR2K(2);
          setR3K(2);
          setRevealFullTelemetry(true);
        },
        physicalExplanation:
          'Aunque R1 tiene menor resistencia (1 kΩ) que R2 o R3 (2 kΩ), por R1 circula la totalidad de la corriente de la fuente (Itotal = 6 mA), mientras que por R2 y R3 circula solo la mitad (3 mA cada uno). Como P = I² · R, PR1 = (6 mA)² · 1 kΩ = 36 mW, mientras que PR2 = PR3 = (3 mA)² · 2 kΩ = 18 mW.',
        formulaSupportLatex:
          'P_{R1} = I_{\\text{total}}^2 R_1 = 36\\text{ mW} \\;>\\; P_{R2} = P_{R3} = \\left(\\frac{I_{\\text{total}}}{2}\\right)^2 R_2 = 18\\text{ mW}',
      },
    ],
    []
  );

  // Desafíos adicionales graduales
  const numericChallenges: NumericChallengeItem[] = useMemo(
    () => [
      {
        id: 'chal_mix_r23',
        title: 'Paso 1: Resistencia Equivalente del Bloque Paralelo (R23)',
        prompt: `Para R2 = ${r2K} kΩ y R3 = ${r3K} kΩ conectados en paralelo entre los nodos B y C, determine R23.`,
        magnitudeType: 'resistance',
        expectedValueSI: circuit.r23 ?? 0,
        availableUnits: ['kΩ', 'Ω'],
        defaultUnit: 'kΩ',
        hints: [
          'R2 y R3 comparten el nodo B y el nodo C, por lo que están en paralelo.',
          'Utilice R23 = (R2 · R3) / (R2 + R3). Si R2 = R3, la resistencia equivalente en paralelo es exactamente la mitad de una de ellas.',
        ],
        procedureLatex: `R_{23} = \\frac{R_2 \\cdot R_3}{R_2 + R_3} = \\frac{${r2K} \\times ${r3K}}{${r2K} + ${r3K}} = ${(
          (circuit.r23 ?? 0) / 1000
        ).toFixed(3)}\\text{ k}\\Omega`,
        physicalExplanation:
          'El bloque paralelo formado por R2 y R3 puede sustituirse por un único resistor equivalente R23 conectado entre los nodos B y C.',
      },
      {
        id: 'chal_mix_itotal',
        title: 'Paso 2: Corriente Total Suministrada por la Fuente',
        prompt: `Con Vs = ${vs} V, R1 = ${r1K} kΩ en serie con el bloque paralelo R2 || R3, calcule la corriente total Itotal.`,
        magnitudeType: 'current',
        expectedValueSI: circuit.iTotalPhys,
        availableUnits: ['mA', 'A'],
        defaultUnit: 'mA',
        hints: [
          'Obtenga primero Req = R1 + R23.',
          `Divida la tensión de la fuente Vs (${vs} V) entre Req (${((circuit.req ?? 0) / 1000).toFixed(2)} kΩ).`,
        ],
        procedureLatex: `R_{\\text{eq}} = R_1 + R_{23} = ${(
          (circuit.req ?? 0) / 1000
        ).toFixed(2)}\\text{ k}\\Omega \\quad\\Longrightarrow\\quad I_{\\text{total}} = \\frac{${vs}\\text{ V}}{${(
          (circuit.req ?? 0) / 1000
        ).toFixed(2)}\\text{ k}\\Omega} = ${(circuit.iTotalPhys * 1000).toFixed(2)}\\text{ mA}`,
        physicalExplanation:
          'La corriente total entregada por la fuente atraviesa íntegramente el resistor serie R1 antes de llegar al nodo de bifurcación B.',
      },
      {
        id: 'chal_mix_ptotal',
        title: 'Paso 3: Potencia Total y Verificación Energética',
        prompt: `Determine la potencia total disipada por el circuito mixto completo.`,
        magnitudeType: 'power',
        expectedValueSI: circuit.pTotalDissipated,
        availableUnits: ['mW', 'W'],
        defaultUnit: 'mW',
        hints: [
          'Puede calcular Ptotal = Vs · Itotal o bien sumar PR1 + PR2 + PR3.',
          `Multiplique Vs (${vs} V) por Itotal (${(circuit.iTotalPhys * 1000).toFixed(2)} mA).`,
        ],
        procedureLatex: `P_{\\text{total}} = P_{R1} + P_{R2} + P_{R3} = ${(
          circuit.pr1 * 1000
        ).toFixed(1)} + ${(circuit.pr2 * 1000).toFixed(1)} + ${(circuit.pr3 * 1000).toFixed(
          1
        )} = ${(circuit.pTotalDissipated * 1000).toFixed(1)}\\text{ mW}`,
        physicalExplanation:
          'La suma de las potencias absorbidas en los resistores serie y paralelo iguala exactamente la potencia suministrada por la fuente DC.',
      },
    ],
    [vs, r1K, r2K, r3K, circuit]
  );

  // Desarrollo matemático en 6 pasos
  const mathProcedures: MathProcedureStep[] = useMemo(
    () => [
      {
        title: 'Reducción del Subcircuito en Paralelo (R2 || R3 → R23)',
        generalEquation: 'R_{23} = \\frac{R_2 \\cdot R_3}{R_2 + R_3}',
        variablesIdentification: `R2 = ${r2K.toFixed(2)} kΩ, R3 = ${r3K.toFixed(2)} kΩ`,
        numericalSubstitution: `R_{23} = \\frac{${r2K.toFixed(2)} \\times ${r3K.toFixed(
          2
        )}}{${r2K.toFixed(2)} + ${r3K.toFixed(2)}}\\text{ k}\\Omega`,
        operationDetail: `R_{23} = \\frac{${(r2K * r3K).toFixed(2)}}{${(r2K + r3K).toFixed(
          2
        )}}\\text{ k}\\Omega`,
        resultWithUnits: `R_{23} = ${((circuit.r23 ?? 0) / 1000).toFixed(2)}\\text{ k}\\Omega`,
        physicalInterpretation:
          'Las dos ramas paralelas entre los nodos B y C equivalen a una única resistencia R23.',
      },
      {
        title: 'Reducción Serie Final (R1 + R23 → Req) y Corriente Total',
        generalEquation: 'R_{\\text{eq}} = R_1 + R_{23}, \\qquad I_{\\text{total}} = \\frac{V_s}{R_{\\text{eq}}}',
        variablesIdentification: `R1 = ${r1K.toFixed(2)} kΩ, R23 = ${(
          (circuit.r23 ?? 0) / 1000
        ).toFixed(2)} kΩ, Vs = ${vs.toFixed(1)} V`,
        numericalSubstitution: `R_{\\text{eq}} = ${r1K.toFixed(2)} + ${(
          (circuit.r23 ?? 0) / 1000
        ).toFixed(2)} = ${((circuit.req ?? 0) / 1000).toFixed(2)}\\text{ k}\\Omega`,
        operationDetail: `I_{\\text{total}} = \\frac{${vs.toFixed(1)}\\text{ V}}{${(
          (circuit.req ?? 0) / 1000
        ).toFixed(2)}\\text{ k}\\Omega}`,
        resultWithUnits: `R_{\\text{eq}} = ${((circuit.req ?? 0) / 1000).toFixed(
          2
        )}\\text{ k}\\Omega, \\quad I_{\\text{total}} = ${(circuit.iTotalPhys * 1000).toFixed(
          2
        )}\\text{ mA}`,
        physicalInterpretation:
          'El circuito completo visto desde la fuente se comporta como un único resistor de valor Req.',
      },
      {
        title: 'Reconstrucción de Tensiones (VR1 y V23) y Corrientes de Rama (IR2, IR3)',
        generalEquation:
          'V_{R1} = I_{\\text{total}} \\cdot R_1, \\quad V_{23} = V_s - V_{R1} = I_{\\text{total}} \\cdot R_{23}, \\quad I_{Rk} = \\frac{V_{23}}{R_k}',
        variablesIdentification: `Itotal = ${(circuit.iTotalPhys * 1000).toFixed(2)} mA`,
        numericalSubstitution: `V_{R1} = ${(circuit.iTotalPhys * 1000).toFixed(
          2
        )}\\text{ mA} \\cdot ${r1K}\\text{ k}\\Omega, \\quad V_{23} = ${vs.toFixed(
          1
        )} - ${circuit.vr1Phys.toFixed(2)}`,
        operationDetail: `I_{R2} = \\frac{${circuit.v23Phys.toFixed(
          2
        )}\\text{ V}}{${r2K}\\text{ k}\\Omega}, \\quad I_{R3} = \\frac{${circuit.v23Phys.toFixed(
          2
        )}\\text{ V}}{${r3K}\\text{ k}\\Omega}`,
        resultWithUnits: `V_{R1} = ${circuit.vr1Phys.toFixed(2)}\\text{ V},\\; V_{23} = ${circuit.v23Phys.toFixed(
          2
        )}\\text{ V},\\; I_{R2} = ${(circuit.ir2Phys * 1000).toFixed(2)}\\text{ mA},\\; I_{R3} = ${(
          circuit.ir3Phys * 1000
        ).toFixed(2)}\\text{ mA}`,
        physicalInterpretation:
          'La corriente total atraviesa R1 y al llegar al nodo B se bifurca en IR2 e IR3 cumpliendo Itotal = IR2 + IR3.',
      },
      {
        title: 'Balance Algebraico de Potencia (Convención Pasiva de Signos)',
        generalEquation: 'P_{\\text{fuente,pasiva}} + P_{R1} + P_{R2} + P_{R3} = 0',
        variablesIdentification: `P_fuente(absorbida) = -Vs · Itotal; PRk = +Vk · Ik`,
        numericalSubstitution: `${(circuit.pSourcePassive * 1000).toFixed(2)} + ${(
          circuit.pr1 * 1000
        ).toFixed(2)} + ${(circuit.pr2 * 1000).toFixed(2)} + ${(circuit.pr3 * 1000).toFixed(2)}`,
        operationDetail: `${(circuit.pSourcePassive * 1000).toFixed(2)}\\text{ mW} + ${(
          circuit.pTotalDissipated * 1000
        ).toFixed(2)}\\text{ mW} = 0`,
        resultWithUnits: `\\sum P = 0.00\\text{ mW} \\quad (P_{\\text{entregada}} = ${(
          circuit.pSourceDelivered * 1000
        ).toFixed(2)}\\text{ mW})`,
        physicalInterpretation:
          'La suma algebraica de las potencias bajo la convención pasiva es idénticamente nula, verificando la conservación de la energía.',
      },
    ],
    [vs, r1K, r2K, r3K, circuit]
  );

  return (
    <div className="space-y-6">
      {/* A. Explicación del objetivo */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-4xl">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-700">
            <span>MÓDULO 03 · NIVEL AVANZADO</span>
            <span aria-hidden="true">·</span>
            <span>REDUCCIÓN PROGRESIVA DE REDES SERIE-PARALELO Y VERIFICACIÓN ENERGÉTICA</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Circuitos Resistivos Mixtos y Reducción Topológica Paso a Paso
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Resuelva circuitos serie-paralelo identificando qué elementos pueden combinarse válidamente en cada etapa. Reduzca progresivamente el circuito hasta su resistencia equivalente <span className="font-mono">Req</span> y reconstruya luego las tensiones y corrientes de cada componente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setRevealFullTelemetry((prev) => !prev)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              revealFullTelemetry
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
            }`}
          >
            {revealFullTelemetry
              ? 'Modo Exploración Activo (Valores Visibles)'
              : 'Mostrar todos los resultados (Exploración Libre)'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer (12 V · R1=1k, R2=2k, R3=2k)
          </button>
        </div>
      </section>

      {/* FUNCIONALIDAD PRINCIPAL: REDUCCIÓN PROGRESIVA INTERACTIVA + ESQUEMA DE 3 ETAPAS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* B. Esquema Vectorial con Selector de las 3 Representaciones (7 columnas) */}
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-700" />
              <span className="text-xs font-mono font-semibold text-slate-800">
                ETAPA TOPOLÓGICA {visualStage} DE 3
              </span>
            </div>

            {/* Navegación entre las tres representaciones topológicas */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setVisualStage(1)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  visualStage === 1
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Original (R1, R2, R3)
              </button>
              <button
                type="button"
                onClick={() => setVisualStage(2)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  visualStage === 2
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Parcial (R1 + R23)
              </button>
              <button
                type="button"
                onClick={() => setVisualStage(3)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  visualStage === 3
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Equivalente (Req)
              </button>
            </div>
          </div>

          {/* Lienzo SVG para las 3 etapas */}
          <div className="p-4 sm:p-6 bg-[#F8FAFC] flex flex-col items-center">
            <svg
              viewBox="0 0 740 400"
              className="w-full max-w-[720px] h-auto select-none"
              role="img"
              aria-label="Esquema eléctrico interactivo de circuito resistivo mixto con reducción progresiva"
            >
              <defs>
                <pattern id="grid-mixed" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.7" />
                </pattern>
              </defs>

              <rect width="740" height="400" rx="12" fill="url(#grid-mixed)" />

              {/* ETAPA 1: CIRCUITO ORIGINAL (R1 en serie con R2 || R3) */}
              {visualStage === 1 && (
                <>
                  <g stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round">
                    {/* Fuente en x=100 */}
                    <line x1="100" y1="80" x2="100" y2="165" />
                    <line x1="100" y1="235" x2="100" y2="330" />

                    {/* Rama superior con R1 (x=100 a x=430) */}
                    <line x1="100" y1="80" x2="210" y2="80" />
                    <polyline
                      points="210,80 222,64 242,96 262,64 282,96 302,64 322,96 334,80"
                      stroke={selectedComponents.includes('R1') ? '#0284C7' : '#0F172A'}
                      strokeWidth="3.5"
                    />
                    <line x1="334" y1="80" x2="430" y2="80" />

                    {/* Bifurcación en Nodo B (x=430, y=80) hacia R2 (x=430) y R3 (x=600) */}
                    <line x1="430" y1="80" x2="600" y2="80" />
                    <line x1="430" y1="330" x2="600" y2="330" />
                    <line x1="430" y1="330" x2="100" y2="330" />

                    {/* Rama R2 (x=430) */}
                    <line x1="430" y1="80" x2="430" y2="145" />
                    <polyline
                      points="430,145 445,155 415,175 445,195 415,215 445,235 415,255 430,265"
                      stroke={selectedComponents.includes('R2') ? '#0284C7' : '#0F172A'}
                      strokeWidth="3.5"
                    />
                    <line x1="430" y1="265" x2="430" y2="330" />

                    {/* Rama R3 (x=600) */}
                    <line x1="600" y1="80" x2="600" y2="145" />
                    <polyline
                      points="600,145 615,155 585,175 615,195 585,215 615,235 585,255 600,265"
                      stroke={selectedComponents.includes('R3') ? '#0284C7' : '#0F172A'}
                      strokeWidth="3.5"
                    />
                    <line x1="600" y1="265" x2="600" y2="330" />
                  </g>

                  {/* Animaciones coherentes de corriente: Itotal en R1 que se divide en IR2 e IR3 */}
                  {animationsEnabled && !circuit.isOpenCircuit && circuit.iTotalPhys > 0 && (
                    <>
                      {/* Lazo principal Itotal */}
                      <line
                        x1="100"
                        y1="80"
                        x2="430"
                        y2="80"
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
                        x1="430"
                        y1="330"
                        x2="100"
                        y2="330"
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
                      {/* Rama R2 */}
                      <line
                        x1="430"
                        y1="80"
                        x2="430"
                        y2="330"
                        stroke="#0284C7"
                        strokeWidth="3.5"
                        strokeDasharray="5 16"
                        className="animate-current-forward"
                        style={
                          {
                            '--flow-duration': `${getFlowDuration(circuit.ir2Phys)}s`,
                          } as React.CSSProperties
                        }
                      />
                      {/* Rama R3 */}
                      <polyline
                        points="430,80 600,80 600,330 430,330"
                        fill="none"
                        stroke="#0284C7"
                        strokeWidth="3.5"
                        strokeDasharray="5 16"
                        className="animate-current-forward"
                        style={
                          {
                            '--flow-duration': `${getFlowDuration(circuit.ir3Phys)}s`,
                          } as React.CSSProperties
                        }
                      />
                    </>
                  )}

                  {/* Tarjeta clicable R1 */}
                  <g onClick={() => toggleSelectComponent('R1')} className="cursor-pointer">
                    <rect
                      x="202"
                      y="12"
                      width="140"
                      height="44"
                      rx="6"
                      fill={selectedComponents.includes('R1') ? '#E0F2FE' : '#FFFFFF'}
                      stroke={selectedComponents.includes('R1') ? '#0284C7' : '#CBD5E1'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="272"
                      y="30"
                      textAnchor="middle"
                      className="fill-slate-900 font-mono text-xs font-bold"
                    >
                      R1 = {r1K.toFixed(1)} kΩ (Serie)
                    </text>
                    <text
                      x="272"
                      y="46"
                      textAnchor="middle"
                      className="fill-sky-700 font-mono text-[11px]"
                    >
                      {hideSolutions
                        ? 'Clic para seleccionar R1'
                        : `VR1=${circuit.vr1Phys.toFixed(1)}V · I=${(
                            circuit.iTotalPhys * 1000
                          ).toFixed(1)}mA`}
                    </text>
                  </g>

                  {/* Tarjeta clicable R2 */}
                  <g onClick={() => toggleSelectComponent('R2')} className="cursor-pointer">
                    <rect
                      x="362"
                      y="274"
                      width="136"
                      height="44"
                      rx="6"
                      fill={selectedComponents.includes('R2') ? '#E0F2FE' : '#FFFFFF'}
                      stroke={selectedComponents.includes('R2') ? '#0284C7' : '#CBD5E1'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="430"
                      y="292"
                      textAnchor="middle"
                      className="fill-slate-900 font-mono text-xs font-bold"
                    >
                      R2 = {r2K.toFixed(1)} kΩ
                    </text>
                    <text
                      x="430"
                      y="308"
                      textAnchor="middle"
                      className="fill-amber-700 font-mono text-[11px]"
                    >
                      {hideSolutions
                        ? 'Clic para seleccionar R2'
                        : `V2=${circuit.v23Phys.toFixed(1)}V · I2=${(
                            circuit.ir2Phys * 1000
                          ).toFixed(1)}mA`}
                    </text>
                  </g>

                  {/* Tarjeta clicable R3 */}
                  <g onClick={() => toggleSelectComponent('R3')} className="cursor-pointer">
                    <rect
                      x="532"
                      y="274"
                      width="136"
                      height="44"
                      rx="6"
                      fill={selectedComponents.includes('R3') ? '#E0F2FE' : '#FFFFFF'}
                      stroke={selectedComponents.includes('R3') ? '#0284C7' : '#CBD5E1'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="600"
                      y="292"
                      textAnchor="middle"
                      className="fill-slate-900 font-mono text-xs font-bold"
                    >
                      R3 = {r3K.toFixed(1)} kΩ
                    </text>
                    <text
                      x="600"
                      y="308"
                      textAnchor="middle"
                      className="fill-amber-700 font-mono text-[11px]"
                    >
                      {hideSolutions
                        ? 'Clic para seleccionar R3'
                        : `V3=${circuit.v23Phys.toFixed(1)}V · I3=${(
                            circuit.ir3Phys * 1000
                          ).toFixed(1)}mA`}
                    </text>
                  </g>

                  {/* Nodos A, B, C */}
                  <circle cx="100" cy="80" r="5" fill="#0284C7" />
                  <text x="108" y="68" className="fill-slate-800 font-mono text-xs font-bold">
                    Nodo A (+{vs}V)
                  </text>

                  <circle cx="430" cy="80" r="5.5" fill="#0284C7" />
                  <text x="415" y="66" className="fill-sky-900 font-mono text-xs font-bold">
                    Nodo B (Bifurcación)
                  </text>

                  <circle cx="430" cy="330" r="5.5" fill="#0F172A" />
                  <text x="240" y="352" className="fill-slate-800 font-mono text-xs font-bold">
                    Nodo C (Referencia 0 V)
                  </text>
                </>
              )}

              {/* ETAPA 2: CIRCUITO PARCIALMENTE REDUCIDO (R1 en serie con R23) */}
              {visualStage === 2 && (
                <>
                  <g stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round">
                    <line x1="100" y1="80" x2="100" y2="165" />
                    <line x1="100" y1="235" x2="100" y2="330" />
                    <line x1="100" y1="80" x2="220" y2="80" />
                    <polyline
                      points="220,80 232,64 252,96 272,64 292,96 312,64 332,96 344,80"
                      stroke="#0F172A"
                      strokeWidth="3.5"
                    />
                    <line x1="344" y1="80" x2="500" y2="80" />
                    <line x1="500" y1="80" x2="500" y2="145" />
                    <polyline
                      points="500,145 516,155 484,175 516,195 484,215 516,235 484,255 500,265"
                      stroke="#0284C7"
                      strokeWidth="3.5"
                    />
                    <line x1="500" y1="265" x2="500" y2="330" />
                    <line x1="500" y1="330" x2="100" y2="330" />
                  </g>

                  {animationsEnabled && !circuit.isOpenCircuit && circuit.iTotalPhys > 0 && (
                    <rect
                      x="100"
                      y="80"
                      width="400"
                      height="250"
                      fill="none"
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
                  )}

                  <rect
                    x="212"
                    y="15"
                    width="140"
                    height="40"
                    rx="6"
                    fill="#FFFFFF"
                    stroke="#CBD5E1"
                  />
                  <text
                    x="282"
                    y="39"
                    textAnchor="middle"
                    className="fill-slate-900 font-mono text-xs font-bold"
                  >
                    R1 = {r1K.toFixed(1)} kΩ
                  </text>

                  <rect
                    x="530"
                    y="162"
                    width="185"
                    height="85"
                    rx="8"
                    fill="#E0F2FE"
                    stroke="#0284C7"
                    strokeWidth="1.5"
                  />
                  <text
                    x="622"
                    y="184"
                    textAnchor="middle"
                    className="fill-sky-950 font-mono text-xs font-bold"
                  >
                    BLOQUE EQUIVALENTE R23
                  </text>
                  <text
                    x="622"
                    y="204"
                    textAnchor="middle"
                    className="fill-slate-900 font-mono text-sm font-bold"
                  >
                    R23 = {((circuit.r23 ?? 0) / 1000).toFixed(2)} kΩ
                  </text>
                  <text
                    x="622"
                    y="224"
                    textAnchor="middle"
                    className="fill-slate-700 font-mono text-[11px]"
                  >
                    (Sustituye a R2 || R3)
                  </text>
                  <text
                    x="622"
                    y="240"
                    textAnchor="middle"
                    className="fill-sky-800 font-mono text-[11px] font-semibold"
                  >
                    En serie directa con R1
                  </text>

                  <circle cx="500" cy="80" r="5" fill="#0284C7" />
                  <text x="510" y="75" className="fill-slate-800 font-mono text-xs font-bold">
                    Nodo B
                  </text>
                </>
              )}

              {/* ETAPA 3: CIRCUITO EQUIVALENTE FINAL (Req única) */}
              {visualStage === 3 && (
                <>
                  <g stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round">
                    <line x1="100" y1="80" x2="100" y2="165" />
                    <line x1="100" y1="235" x2="100" y2="330" />
                    <line x1="100" y1="80" x2="450" y2="80" />
                    <line x1="450" y1="80" x2="450" y2="145" />
                    <polyline
                      points="450,145 468,155 432,175 468,195 432,215 468,235 432,255 450,265"
                      stroke="#059669"
                      strokeWidth="3.5"
                    />
                    <line x1="450" y1="265" x2="450" y2="330" />
                    <line x1="450" y1="330" x2="100" y2="330" />
                  </g>

                  {animationsEnabled && !circuit.isOpenCircuit && circuit.iTotalPhys > 0 && (
                    <rect
                      x="100"
                      y="80"
                      width="350"
                      height="250"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="4.5"
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
                    x="490"
                    y="148"
                    width="215"
                    height="108"
                    rx="8"
                    fill="#ECFDF5"
                    stroke="#059669"
                    strokeWidth="1.5"
                  />
                  <text
                    x="597"
                    y="172"
                    textAnchor="middle"
                    className="fill-emerald-950 font-mono text-xs font-bold"
                  >
                    CIRCUITO EQUIVALENTE FINAL
                  </text>
                  <text
                    x="597"
                    y="196"
                    textAnchor="middle"
                    className="fill-slate-900 font-mono text-base font-bold"
                  >
                    Req = {((circuit.req ?? 0) / 1000).toFixed(2)} kΩ
                  </text>
                  <text
                    x="597"
                    y="216"
                    textAnchor="middle"
                    className="fill-slate-700 font-mono text-xs"
                  >
                    Req = R1 + R23
                  </text>
                  <text
                    x="597"
                    y="238"
                    textAnchor="middle"
                    className="fill-amber-700 font-mono text-xs font-bold"
                  >
                    Itotal = {(circuit.iTotalPhys * 1000).toFixed(2)} mA
                  </text>
                </>
              )}

              {/* Fuente DC */}
              <g>
                <circle cx="100" cy="200" r="34" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
                <text
                  x="100"
                  y="188"
                  textAnchor="middle"
                  className="fill-rose-600 font-mono text-base font-bold"
                >
                  +
                </text>
                <text
                  x="100"
                  y="222"
                  textAnchor="middle"
                  className="fill-slate-700 font-mono text-base font-bold"
                >
                  −
                </text>
                <rect x="14" y="174" width="46" height="52" rx="6" fill="#0F172A" />
                <text x="37" y="194" textAnchor="middle" className="fill-slate-300 font-mono text-[9px]">
                  FUENTE
                </text>
                <text x="37" y="212" textAnchor="middle" className="fill-white font-mono text-xs font-bold">
                  {vs}V
                </text>
              </g>
            </svg>

            {/* Controles para avanzar y retroceder por las etapas de reducción */}
            <div className="w-full pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={visualStage === 1}
                onClick={() => setVisualStage((prev) => (prev > 1 ? ((prev - 1) as 1 | 2) : 1))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Etapa anterior
              </button>

              <span className="text-xs font-mono text-slate-600">
                {visualStage === 1 && 'Etapa 1: Topología Mixta Original (R1, R2, R3)'}
                {visualStage === 2 && 'Etapa 2: Reducción Parcial (R1 en serie con R23)'}
                {visualStage === 3 && 'Etapa 3: Equivalente Total visto por la fuente (Req)'}
              </span>

              <button
                type="button"
                disabled={visualStage === 3}
                onClick={() => setVisualStage((prev) => (prev < 3 ? ((prev + 1) as 2 | 3) : 3))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Siguiente etapa
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Consola Interactiva de Reducción Progresiva (5 columnas) */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <p className="text-xs font-mono text-sky-700">
              CONSOLA INTERACTIVA DE REDUCCIÓN TOPOLÓGICA
            </p>
            <h3 className="text-base font-semibold text-slate-900">
              Reducción Progresiva Guiada del Circuito Mixto
            </h3>
          </div>

          {/* PASO 1: Combinar R2 y R3 */}
          <div className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-slate-50/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                Etapa 1 → 2: Seleccione dos resistores combinables directamente
              </span>
              {step1Verified && (
                <span className="text-xs font-mono text-emerald-700 font-semibold">
                  ● Verificado
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {['R1', 'R2', 'R3'].map((id) => {
                const active = selectedComponents.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleSelectComponent(id)}
                    className={`flex-1 py-1.5 text-xs font-mono font-semibold rounded border transition-colors cursor-pointer ${
                      active
                        ? 'bg-sky-700 text-white border-sky-700'
                        : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {id} ({id === 'R1' ? r1K : id === 'R2' ? r2K : r3K} kΩ)
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={step1Topology}
                onChange={(e) => setStep1Topology(e.target.value as 'parallel' | 'series' | '')}
                className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
              >
                <option value="">Tipo de conexión...</option>
                <option value="parallel">Están en Paralelo</option>
                <option value="series">Están en Serie</option>
              </select>

              <select
                value={step1Formula}
                onChange={(e) =>
                  setStep1Formula(e.target.value as 'parallel_correct' | 'series_wrong' | '')
                }
                className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
              >
                <option value="">Relación matemática...</option>
                <option value="parallel_correct">R23 = (R2 · R3) / (R2 + R3)</option>
                <option value="series_wrong">R23 = R2 + R3</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={step1ValueInput}
                onChange={(e) => setStep1ValueInput(e.target.value)}
                placeholder="Valor de R23 (ej: 1)"
                className="flex-1 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono"
              />
              <select
                value={step1Unit}
                onChange={(e) => setStep1Unit(e.target.value)}
                className="rounded border border-slate-300 bg-white px-2 py-1.5 text-xs font-mono"
              >
                <option value="kΩ">kΩ</option>
                <option value="Ω">Ω</option>
              </select>
              <button
                type="button"
                onClick={handleVerifyStep1}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 cursor-pointer whitespace-nowrap"
              >
                Comprobar R23
              </button>
            </div>

            {step1Feedback && (
              <div
                className={`p-2.5 rounded border text-xs leading-relaxed ${
                  step1Feedback.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                {step1Feedback.msg}
              </div>
            )}
          </div>

          {/* PASO 2: Combinar R1 y R23 */}
          <div className="border border-slate-200 rounded-lg p-3.5 space-y-2.5 bg-slate-50/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                Etapa 2 → 3: Combinar R1 con el bloque equivalente R23
              </span>
              {step2Verified && (
                <span className="text-xs font-mono text-emerald-700 font-semibold">
                  ● Verificado
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={step2Topology}
                onChange={(e) => setStep2Topology(e.target.value as 'series' | 'parallel' | '')}
                className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
              >
                <option value="">Conexión R1 y R23...</option>
                <option value="series">En Serie (Req = R1 + R23)</option>
                <option value="parallel">En Paralelo</option>
              </select>

              <input
                type="text"
                value={step2ValueInput}
                onChange={(e) => setStep2ValueInput(e.target.value)}
                placeholder="Req (ej: 2)"
                className="w-24 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono"
              />
              <select
                value={step2Unit}
                onChange={(e) => setStep2Unit(e.target.value)}
                className="rounded border border-slate-300 bg-white px-2 py-1.5 text-xs font-mono"
              >
                <option value="kΩ">kΩ</option>
                <option value="Ω">Ω</option>
              </select>
              <button
                type="button"
                onClick={handleVerifyStep2}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 cursor-pointer whitespace-nowrap"
              >
                Comprobar Req
              </button>
            </div>

            {step2Feedback && (
              <div
                className={`p-2.5 rounded border text-xs leading-relaxed ${
                  step2Feedback.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                {step2Feedback.msg}
              </div>
            )}
          </div>

          {/* PASO 3: Calcular Itotal y Reconstruir */}
          <div className="border border-slate-200 rounded-lg p-3.5 space-y-2.5 bg-slate-50/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                Etapa 3 → Reconstrucción: Calcular corriente total Itotal = Vs / Req
              </span>
              {step3Verified && (
                <span className="text-xs font-mono text-emerald-700 font-semibold">
                  ● Completado
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={step3CurrentInput}
                onChange={(e) => setStep3CurrentInput(e.target.value)}
                placeholder="Itotal (ej: 6)"
                className="flex-1 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono"
              />
              <select
                value={step3Unit}
                onChange={(e) => setStep3Unit(e.target.value)}
                className="rounded border border-slate-300 bg-white px-2 py-1.5 text-xs font-mono"
              >
                <option value="mA">mA</option>
                <option value="A">A</option>
              </select>
              <button
                type="button"
                onClick={handleVerifyStep3}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-sky-700 text-white hover:bg-sky-800 cursor-pointer whitespace-nowrap"
              >
                Verificar y Reconstruir
              </button>
            </div>

            {step3Feedback && (
              <div
                className={`p-2.5 rounded border text-xs leading-relaxed ${
                  step3Feedback.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                {step3Feedback.msg}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* C y D. Controles de Parámetros + Panel de Verificación Energética (ΣP = 0) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controles de Parámetros (5 columnas) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-700" />
              <h3 className="text-sm font-semibold text-slate-900">
                Parámetros del Circuito Mixto
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Serie-Paralelo</span>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'vs',
                label: 'Tensión de Fuente Vs',
                val: vs,
                min: 0,
                max: 48,
                step: 0.5,
                unit: 'V',
                setter: setVs,
              },
              {
                id: 'r1',
                label: 'Resistor Serie R1 (Inicial: 1 kΩ)',
                val: r1K,
                min: 0.2,
                max: 15,
                step: 0.2,
                unit: 'kΩ',
                setter: setR1K,
              },
              {
                id: 'r2',
                label: 'Rama Paralela R2 (Inicial: 2 kΩ)',
                val: r2K,
                min: 0.2,
                max: 15,
                step: 0.2,
                unit: 'kΩ',
                setter: setR2K,
              },
              {
                id: 'r3',
                label: 'Rama Paralela R3 (Inicial: 2 kΩ)',
                val: r3K,
                min: 0.2,
                max: 15,
                step: 0.2,
                unit: 'kΩ',
                setter: setR3K,
              },
            ].map((ctl) => (
              <div key={ctl.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{ctl.label}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={ctl.min}
                      max={ctl.max}
                      step={ctl.step}
                      value={ctl.val}
                      onChange={(e) =>
                        ctl.setter(
                          Math.max(ctl.min, Math.min(ctl.max, Number(e.target.value) || ctl.min))
                        )
                      }
                      className="w-16 text-right font-mono text-xs font-semibold border border-slate-300 rounded px-1.5 py-0.5 text-slate-900"
                    />
                    <span className="font-mono text-xs text-slate-500">{ctl.unit}</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={ctl.min}
                  max={ctl.max}
                  step={ctl.step}
                  value={ctl.val}
                  onChange={(e) => ctl.setter(Number(e.target.value))}
                  className="w-full accent-slate-800 cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* Selección de potencia nominal comercial para el resistor más exigido (R1) */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-sky-700" />
              <span>Dimensionamiento de Potencia Nominal para R1</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-600">
                Potencia disipada en R1: <strong>{(circuit.pr1 * 1000).toFixed(1)} mW</strong>
              </span>
              <select
                value={selectedNominalRatingMw}
                onChange={(e) => setSelectedNominalRatingMw(Number(e.target.value))}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono"
              >
                <option value={25}>1/40 W (25 mW)</option>
                <option value={62.5}>1/16 W (62,5 mW)</option>
                <option value={125}>1/8 W (125 mW)</option>
                <option value={250}>1/4 W (250 mW)</option>
                <option value={500}>1/2 W (500 mW)</option>
              </select>
            </div>
            <div
              className={`text-xs p-2 rounded border ${
                circuit.pr1 * 1000 <= selectedNominalRatingMw
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {circuit.pr1 * 1000 <= selectedNominalRatingMw
                ? `● Admisible: La potencia disipada en R1 (${(circuit.pr1 * 1000).toFixed(
                    1
                  )} mW) es inferior a la potencia nominal seleccionada (${selectedNominalRatingMw} mW).`
                : `✖ Sobrecarga térmica en R1: La disipación (${(circuit.pr1 * 1000).toFixed(
                    1
                  )} mW) supera la capacidad nominal del resistor (${selectedNominalRatingMw} mW).`}
            </div>
          </div>
        </div>

        {/* Panel de Verificación Energética y Convención Pasiva de Signos (7 columnas) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <p className="text-xs font-mono text-slate-500">
                CONVENCIÓN PASIVA DE SIGNOS Y CONSERVACIÓN DE ENERGÍA
              </p>
              <h3 className="text-base font-semibold text-slate-900">
                Verificación Energética del Circuito Mixto (ΣP = 0)
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700">
              ΣP_algebraica = {circuit.powerBalanceSum.toFixed(2)} mW
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono">
                  <th className="py-2 pr-3">Elemento</th>
                  <th className="py-2 px-3">Tensión (V)</th>
                  <th className="py-2 px-3">Corriente (mA)</th>
                  <th className="py-2 px-3">Potencia Conv. Pasiva</th>
                  <th className="py-2 pl-3">Rol Energético</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                <tr>
                  <td className="py-2.5 pr-3 font-semibold text-slate-900">Fuente DC (Vs)</td>
                  <td className="py-2.5 px-3">{vs.toFixed(2)} V</td>
                  <td className="py-2.5 px-3">
                    {hideSolutions ? '—' : `${(circuit.iTotalPhys * 1000).toFixed(2)} mA`}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-sky-700">
                    {hideSolutions ? '—' : `${(circuit.pSourcePassive * 1000).toFixed(2)} mW`}
                  </td>
                  <td className="py-2.5 pl-3 font-sans text-slate-600">
                    Suministra energía (P_abs &lt; 0)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-3 font-semibold text-slate-900">Resistor R1 (Serie)</td>
                  <td className="py-2.5 px-3">
                    {hideSolutions ? '—' : `${circuit.vr1Phys.toFixed(2)} V`}
                  </td>
                  <td className="py-2.5 px-3">
                    {hideSolutions ? '—' : `${(circuit.iTotalPhys * 1000).toFixed(2)} mA`}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-amber-700">
                    {hideSolutions ? '—' : `+${(circuit.pr1 * 1000).toFixed(2)} mW`}
                  </td>
                  <td className="py-2.5 pl-3 font-sans text-slate-600">
                    Absorbe / disipa energía (P_abs &gt; 0)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-3 font-semibold text-slate-900">Resistor R2 (Paralelo)</td>
                  <td className="py-2.5 px-3">
                    {hideSolutions ? '—' : `${circuit.v23Phys.toFixed(2)} V`}
                  </td>
                  <td className="py-2.5 px-3">
                    {hideSolutions ? '—' : `${(circuit.ir2Phys * 1000).toFixed(2)} mA`}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-amber-700">
                    {hideSolutions ? '—' : `+${(circuit.pr2 * 1000).toFixed(2)} mW`}
                  </td>
                  <td className="py-2.5 pl-3 font-sans text-slate-600">
                    Absorbe / disipa energía (P_abs &gt; 0)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-3 font-semibold text-slate-900">Resistor R3 (Paralelo)</td>
                  <td className="py-2.5 px-3">
                    {hideSolutions ? '—' : `${circuit.v23Phys.toFixed(2)} V`}
                  </td>
                  <td className="py-2.5 px-3">
                    {hideSolutions ? '—' : `${(circuit.ir3Phys * 1000).toFixed(2)} mA`}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-amber-700">
                    {hideSolutions ? '—' : `+${(circuit.pr3 * 1000).toFixed(2)} mW`}
                  </td>
                  <td className="py-2.5 pl-3 font-sans text-slate-600">
                    Absorbe / disipa energía (P_abs &gt; 0)
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-mono font-bold text-slate-900">
                  <td colSpan={3} className="py-2.5 px-3">
                    Suma Algebraica Total (ΣP = P_fuente + PR1 + PR2 + PR3)
                  </td>
                  <td className="py-2.5 px-3 text-emerald-700">0.00 mW</td>
                  <td className="py-2.5 pl-3 font-sans font-medium text-emerald-800">
                    Conservación exacta
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-sky-50/70 border border-sky-200 text-xs">
              <span className="block font-mono text-[11px] text-sky-800">
                MAGNITUD POSITIVA SUMINISTRADA POR LA FUENTE
              </span>
              <span className="text-lg font-mono font-bold text-sky-950">
                {hideSolutions ? '—' : `${(circuit.pSourceDelivered * 1000).toFixed(2)} mW`}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
              <span className="block font-mono text-[11px] text-amber-900">
                MAGNITUD POSITIVA TOTAL DISIPADA EN RESISTORES
              </span>
              <span className="text-lg font-mono font-bold text-amber-950">
                {hideSolutions ? '—' : `${(circuit.pTotalDissipated * 1000).toFixed(2)} mW`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multímetro Virtual */}
      {showMultimeter && (
        <VirtualMultimeter
          nodes={circuit.nodes}
          branches={circuit.branches}
          preferMilliAmps={true}
          moduleName="Módulo 3: Circuitos Mixtos"
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
        moduleTitle="Reducción Serie-Paralelo y Reconstrucción de Magnitudes"
        procedures={mathProcedures}
      />

      {/* Conclusiones e Interpretación Física */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <BookOpen className="w-4 h-4 text-sky-700 shrink-0" />
          <h3>Conclusiones e Interpretación Física — Circuitos Resistivos Mixtos</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-semibold text-slate-900 block mb-1">
              1. Orden de reducción de adentro hacia afuera
            </span>
            En una red mixta no deben combinarse resistores separados por nodos de derivación. Primero se identifican subbloques puramente en serie o en paralelo (<MathFormula latex="R_2 \parallel R_3 \to R_{23}" />) hasta alcanzar <MathFormula latex="R_{\text{eq}}" />.
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-semibold text-slate-900 block mb-1">
              2. Interacción entre el elemento serie y el bloque paralelo
            </span>
            Debido a la caída de tensión en <MathFormula latex="R_1" />, modificar la resistencia de una rama paralela altera la corriente total y la tensión del nodo de bifurcación <MathFormula latex="V_B" />, afectando también a la corriente de la otra rama.
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-semibold text-slate-900 block mb-1">
              3. Balance energético universal
            </span>
            Con la convención pasiva de signos, la suma algebraica de las potencias de todos los elementos del circuito es siempre igual a cero (<MathFormula latex="\sum P = 0" />).
          </div>
        </div>
      </section>
    </div>
  );
};
