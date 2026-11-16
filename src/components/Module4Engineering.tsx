import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Sliders,
  Wrench,
  BookOpen,
  Server,
} from 'lucide-react';
import {
  solveNetworkPowerCircuit,
  NetworkFaultMode,
} from '../engine/circuitEngine';
import { MathDevelopmentPanel, MathProcedureStep, MathFormula } from './MathDevelopment';
import { VirtualMultimeter } from './VirtualMultimeter';
import {
  GuidedNumericChallengePanel,
  NumericChallengeItem,
} from './ChallengeWorkbench';

interface Module4EngineeringProps {
  animationsEnabled: boolean;
  showMath: boolean;
  onToggleMath: () => void;
  showMultimeter: boolean;
  isChallengeMode: boolean;
  onActivateChallengeMode: () => void;
}

type EngineeringSituationId = 'SIT_A' | 'SIT_B' | 'SIT_C' | 'SIT_D';

export const Module4Engineering: React.FC<Module4EngineeringProps> = ({
  animationsEnabled,
  showMath,
  onToggleMath,
  showMultimeter,
  isChallengeMode,
  onActivateChallengeMode,
}) => {
  // Especificaciones iniciales del escenario (Sección 8)
  const [vs, setVs] = useState<number>(12);
  const [iMaxNominal, setIMaxNominal] = useState<number>(0.6);
  const [vMinRequired, setVMinRequired] = useState<number>(11.4);
  const [rCond, setRCond] = useState<number>(1.0);
  const [rLoadA, setRLoadA] = useState<number>(48);
  const [rLoadB, setRLoadB] = useState<number>(48);
  const [rLoadC, setRLoadC] = useState<number>(48);

  const [swLoadA, setSwLoadA] = useState<boolean>(true);
  const [swLoadB, setSwLoadB] = useState<boolean>(true);
  const [swLoadC, setSwLoadC] = useState<boolean>(false);
  const [faultMode, setFaultMode] = useState<NetworkFaultMode>('none');

  const [activeSituation, setActiveSituation] = useState<EngineeringSituationId>('SIT_A');

  // Estado para la toma de decisiones en Situaciones A, B, C y D
  const [studentAdmissibilityVote, setStudentAdmissibilityVote] = useState<
    Record<string, 'admissible' | 'not_admissible_v' | 'not_admissible_i' | ''>
  >({});
  const [selectedSolutionD, setSelectedSolutionD] = useState<string>('');
  const [selectedJustificationD, setSelectedJustificationD] = useState<string>('');
  const [decisionFeedbackD, setDecisionFeedbackD] = useState<{
    ok: boolean;
    title: string;
    detail: string;
  } | null>(null);

  const circuit = useMemo(
    () =>
      solveNetworkPowerCircuit({
        vs,
        iMaxNominal,
        vMinRequired,
        rCond,
        rLoadA,
        rLoadB,
        rLoadC,
        swLoadA,
        swLoadB,
        swLoadC,
        faultMode,
      }),
    [
      vs,
      iMaxNominal,
      vMinRequired,
      rCond,
      rLoadA,
      rLoadB,
      rLoadC,
      swLoadA,
      swLoadB,
      swLoadC,
      faultMode,
    ]
  );

  // Cargar preajustes de las Situaciones A, B, C, D
  const applySituationPreset = (sit: EngineeringSituationId) => {
    setActiveSituation(sit);
    setFaultMode('none');
    setVs(12);
    setVMinRequired(11.4);
    setRLoadA(48);
    setRLoadB(48);
    setRLoadC(48);

    if (sit === 'SIT_A') {
      setIMaxNominal(0.6);
      setRCond(1.0);
      setSwLoadA(true);
      setSwLoadB(true);
      setSwLoadC(false);
    } else if (sit === 'SIT_B') {
      setIMaxNominal(0.6);
      setRCond(2.0);
      setSwLoadA(true);
      setSwLoadB(true);
      setSwLoadC(false);
    } else if (sit === 'SIT_C') {
      setIMaxNominal(0.6);
      setRCond(1.0);
      setSwLoadA(true);
      setSwLoadB(true);
      setSwLoadC(true);
    } else if (sit === 'SIT_D') {
      // Punto de partida para evaluar soluciones técnicas
      setDecisionFeedbackD(null);
    }
  };

  const handleReset = () => {
    applySituationPreset('SIT_A');
    setStudentAdmissibilityVote({});
    setSelectedSolutionD('');
    setSelectedJustificationD('');
    setDecisionFeedbackD(null);
  };

  // Evaluar la solución de ingeniería elegida en la Situación D
  const handleEvaluateSolutionD = () => {
    if (!selectedSolutionD || !selectedJustificationD) {
      setDecisionFeedbackD({
        ok: false,
        title: 'Selección incompleta',
        detail:
          'Por favor, seleccione tanto la alternativa técnica como la justificación basada en las magnitudes eléctricas antes de validar.',
      });
      return;
    }

    if (selectedSolutionD === 'keep_current') {
      if (!circuit.isSystemAdmissible) {
        setDecisionFeedbackD({
          ok: false,
          title: 'Alternativa inadmisible: El sistema actual incumple las especificaciones',
          detail: `No es válido mantener la configuración actual porque I = ${circuit.iSupplyIdealModel.toFixed(
            3
          )} A (máx. ${iMaxNominal.toFixed(2)} A) y Vcargas = ${circuit.vLoads.toFixed(
            2
          )} V (mín. ${vMinRequired.toFixed(2)} V). Debe corregir la causa técnica del incumplimiento.`,
        });
      } else {
        setDecisionFeedbackD({
          ok: true,
          title: 'Configuración actual dentro de parámetros nominales',
          detail: `Con Rcond = ${rCond.toFixed(2)} Ω y ${
            circuit.activeLoadsCount
          } cargas activas, la corriente es ${circuit.iSupplyIdealModel.toFixed(
            2
          )} A (≤ ${iMaxNominal.toFixed(2)} A) y la tensión en cargas es ${circuit.vLoads.toFixed(
            2
          )} V (≥ ${vMinRequired.toFixed(2)} V).`,
        });
      }
      return;
    }

    if (selectedSolutionD === 'reduce_rcond_for_2loads') {
      // Aplicar Rcond = 1.0 Ω con 2 cargas
      setRCond(1.0);
      setSwLoadA(true);
      setSwLoadB(true);
      setSwLoadC(false);
      setIMaxNominal(0.6);
      const okJust = selectedJustificationD === 'just_vdrop';
      setDecisionFeedbackD({
        ok: okJust,
        title: okJust
          ? 'Decisión Técnica Correcta para corregir la caída de tensión (2 módulos)'
          : 'Acción aplicada, pero revise la justificación cuantitativa',
        detail: okJust
          ? 'Al reducir la resistencia serie de los conductores de 2 Ω a 1 Ω (por ejemplo, empleando conductores de mayor sección transversal o menor longitud), la caída de tensión se reduce de 0,92 V a 0,48 V. Así, las dos cargas reciben 11,52 V (≥ 11,4 V) con una corriente de 0,48 A (≤ 0,6 A).'
          : 'Reducir la resistencia de los conductores corrige específicamente la caída de tensión serie (Vcond = I · Rcond), pero su justificación debe fundamentarse en el cumplimiento de Vcargas = 11,52 V ≥ 11,4 V.',
      });
      return;
    }

    if (selectedSolutionD === 'upgrade_source_only_3loads') {
      // Si solo sube Imáx a 1.0 A pero deja Rcond = 1 Ω con 3 cargas: ¡Vcargas sigue siendo 11.29 V < 11.4 V!
      setIMaxNominal(1.0);
      setRCond(1.0);
      setSwLoadA(true);
      setSwLoadB(true);
      setSwLoadC(true);
      setDecisionFeedbackD({
        ok: false,
        title: 'Solución Parcial Insuficiente: Persiste subtensión en las 3 cargas',
        detail:
          'Observe con atención todas las restricciones: al sustituir la fuente por una de 1,0 A nominales con 3 cargas (Rcargas = 16 Ω) y Rcond = 1 Ω, la corriente de 0,706 A ya no sobrecarga la fuente, PERO la caída en los conductores es 0,706 V y las cargas reciben únicamente 11,29 V (< 11,4 V mínimo requerido). Para alimentar 3 cargas debe combinar mayor capacidad de fuente Y menor resistencia de conductores.',
      });
      return;
    }

    if (selectedSolutionD === 'upgrade_source_and_cables_3loads') {
      setIMaxNominal(1.0);
      setRCond(0.5);
      setSwLoadA(true);
      setSwLoadB(true);
      setSwLoadC(true);
      const okJust = selectedJustificationD === 'just_both';
      setDecisionFeedbackD({
        ok: okJust,
        title: okJust
          ? 'Solución Integral de Ingeniería Validada para 3 Módulos de Red'
          : 'Configuración admisible alcanzada, pero ajuste la justificación técnica',
        detail: okJust
          ? '¡Excelente decisión de ingeniería! Con 3 cargas de 48 Ω en paralelo (Rcargas = 16 Ω), al reducir Rcond a 0,5 Ω y emplear una fuente de 1,0 A nominal, la resistencia total es 16,5 Ω, la corriente suministrada es 0,727 A (≤ 1,0 A) y la tensión en las cargas alcanza 11,64 V (≥ 11,4 V), cumpliendo simultáneamente ambas restricciones.'
          : 'La medida técnica resuelve el problema, pero recuerde justificarla verificando tanto el límite de corriente nominal como el límite de tensión mínima en bornes de las cargas.',
      });
      return;
    }

    if (selectedSolutionD === 'shed_third_load') {
      setIMaxNominal(0.6);
      setRCond(1.0);
      setSwLoadA(true);
      setSwLoadB(true);
      setSwLoadC(false);
      const okJust = selectedJustificationD === 'just_demand';
      setDecisionFeedbackD({
        ok: okJust,
        title: okJust
          ? 'Decisión Técnica Válida: Reducción de demanda conectada a límites nominales'
          : 'Demanda reducida, pero revise la justificación',
        detail: okJust
          ? 'Al desconectar la tercera carga y alimentar únicamente dos módulos de 48 Ω con Rcond = 1 Ω, la resistencia equivalente de carga sube de 16 Ω a 24 Ω (Rtotal = 25 Ω). La corriente desciende de 0,706 A a 0,48 A (≤ 0,6 A) y la tensión en cargas sube a 11,52 V (≥ 11,4 V).'
          : 'Desconectar la tercera carga restablece tanto la corriente (0,48 A ≤ 0,6 A) como la tensión (11,52 V ≥ 11,4 V); asegúrese de seleccionar la justificación correspondiente a la reducción de demanda.',
      });
    }
  };

  // Desafíos numéricos guiados contextualizados al Módulo 4
  const numericChallenges: NumericChallengeItem[] = useMemo(
    () => [
      {
        id: 'chal_net_rloads',
        title: 'Resistencia Equivalente de los Equipos de Red Conectados',
        prompt: `Con el estado actual de los módulos en paralelo (${circuit.activeLoadsCount} cargas conectadas), calcule la resistencia equivalente total del bloque de cargas Rcargas.`,
        magnitudeType: 'resistance',
        expectedValueSI: circuit.rLoadsEq ?? 0,
        availableUnits: ['Ω', 'kΩ'],
        defaultUnit: 'Ω',
        hints: [
          'Los módulos de red están conectados en paralelo entre el bus de alimentación y el retorno.',
          'Si hay N cargas iguales de valor R conectadas en paralelo, la resistencia equivalente del bloque es Rcargas = R / N.',
        ],
        procedureLatex: `R_{\\text{cargas}} = \\left(\\sum \\frac{1}{R_k}\\right)^{-1} = ${(
          circuit.rLoadsEq ?? 0
        ).toFixed(2)}\\text{ }\\Omega`,
        physicalExplanation:
          'Cada equipo adicional conectado en paralelo reduce la resistencia equivalente del conjunto de cargas y demanda mayor corriente por la línea.',
      },
      {
        id: 'chal_net_vloads',
        title: 'Tensión Efectiva Recibida por los Equipos de Red (Vcargas)',
        prompt: `Considerando la fuente de ${vs} V y la resistencia serie de conductores Rcond = ${rCond} Ω, calcule la tensión efectiva Vcargas que llega a los terminales de los módulos.`,
        magnitudeType: 'voltage',
        expectedValueSI: circuit.vLoads,
        availableUnits: ['V', 'mV'],
        defaultUnit: 'V',
        hints: [
          'Primero determine Rtotal = Rcond + Rcargas y la corriente suministrada I = Vs / Rtotal.',
          'Reste la caída de tensión en los conductores: Vcargas = Vs − (I · Rcond) = I · Rcargas.',
        ],
        procedureLatex: `I = \\frac{${vs}\\text{ V}}{${(circuit.rTotal ?? 0).toFixed(
          2
        )}\\text{ }\\Omega} = ${circuit.iSupplyIdealModel.toFixed(
          4
        )}\\text{ A} \\quad\\Longrightarrow\\quad V_{\\text{cargas}} = ${vs} - (${circuit.iSupplyIdealModel.toFixed(
          4
        )} \\times ${rCond}) = ${circuit.vLoads.toFixed(2)}\\text{ V}`,
        physicalExplanation:
          'La resistencia de los conductores forma un divisor de tensión en serie con las cargas. A mayor corriente o mayor resistencia de cableado, menor es la tensión que llega a los equipos.',
      },
      {
        id: 'chal_net_ploss',
        title: 'Potencia Disipada por Pérdidas en los Conductores (Pcond)',
        prompt: `Calcule la potencia eléctrica disipada en forma de calor en la resistencia de los conductores y conexiones (Rcond = ${rCond} Ω).`,
        magnitudeType: 'power',
        expectedValueSI: circuit.pConductorsLoss,
        availableUnits: ['W', 'mW'],
        defaultUnit: 'W',
        hints: [
          'La potencia de pérdidas en la línea depende del cuadrado de la corriente total suministrada.',
          `Aplique Pcond = I² · Rcond con I = ${circuit.iSupplyIdealModel.toFixed(4)} A y Rcond = ${rCond} Ω.`,
        ],
        procedureLatex: `P_{\\text{cond}} = I^2 \\cdot R_{\\text{cond}} = (${circuit.iSupplyIdealModel.toFixed(
          4
        )}\\text{ A})^2 \\times ${rCond}\\text{ }\\Omega = ${circuit.pConductorsLoss.toFixed(
          4
        )}\\text{ W}`,
        physicalExplanation:
          'Las pérdidas por efecto Joule en el cableado crecen con el cuadrado de la corriente total y reducen la eficiencia energética del sistema de distribución DC.',
      },
    ],
    [vs, rCond, circuit]
  );

  // Procedimiento matemático en 6 pasos
  const mathProcedures: MathProcedureStep[] = useMemo(
    () => [
      {
        title: 'Resistencia Equivalente de las Cargas y Resistencia Total del Sistema',
        generalEquation:
          'R_{\\text{cargas}} = \\left( \\sum_{k} \\frac{1}{R_{\\text{carga},k}} \\right)^{-1}, \\qquad R_{\\text{total}} = R_{\\text{cond}} + R_{\\text{cargas}}',
        variablesIdentification: `Rcond = ${rCond.toFixed(2)} Ω; Cargas activas: ${circuit.activeLoadsCount}`,
        numericalSubstitution: `R_{\\text{cargas}} = ${(circuit.rLoadsEq ?? 0).toFixed(
          2
        )}\\text{ }\\Omega, \\quad R_{\\text{total}} = ${rCond.toFixed(2)} + ${(
          circuit.rLoadsEq ?? 0
        ).toFixed(2)}`,
        operationDetail: `R_{\\text{total}} = ${(circuit.rTotal ?? 0).toFixed(2)}\\text{ }\\Omega`,
        resultWithUnits: `R_{\\text{cargas}} = ${(circuit.rLoadsEq ?? 0).toFixed(
          2
        )}\\text{ }\\Omega, \\quad R_{\\text{total}} = ${(circuit.rTotal ?? 0).toFixed(
          2
        )}\\text{ }\\Omega`,
        physicalInterpretation:
          'La resistencia serie de los conductores de ida y retorno se suma a la resistencia equivalente del conjunto de módulos en paralelo.',
      },
      {
        title: 'Corriente Total Suministrada y Verificación de Capacidad Nominal',
        generalEquation:
          'I_{\\text{modelo}} = \\frac{V_s}{R_{\\text{total}}}, \\qquad \\text{Criterio: } I_{\\text{modelo}} \\le I_{\\text{máx,nom}}',
        variablesIdentification: `Vs = ${vs.toFixed(2)} V, Rtotal = ${(
          circuit.rTotal ?? 0
        ).toFixed(2)} Ω, Imáx,nom = ${iMaxNominal.toFixed(2)} A`,
        numericalSubstitution: `I_{\\text{modelo}} = \\frac{${vs.toFixed(2)}\\text{ V}}{${(
          circuit.rTotal ?? 0
        ).toFixed(2)}\\text{ }\\Omega}`,
        operationDetail: `I_{\\text{modelo}} = ${circuit.iSupplyIdealModel.toFixed(
          4
        )}\\text{ A} \\;\\; (${
          circuit.isCurrentAdmissible ? '\\le' : '>'
        } ${iMaxNominal.toFixed(2)}\\text{ A})`,
        resultWithUnits: `I = ${circuit.iSupplyIdealModel.toFixed(3)}\\text{ A}`,
        physicalInterpretation:
          'Distinga siempre entre la corriente teórica calculada con fuente ideal y la corriente máxima admisible que una fuente real puede entregar sin sobrecargarse.',
      },
      {
        title: 'Caída de Tensión en Conductores y Tensión en las Cargas',
        generalEquation:
          'V_{\\text{cond}} = I \\cdot R_{\\text{cond}}, \\qquad V_{\\text{cargas}} = V_s - V_{\\text{cond}} \\ge V_{\\text{mín}}',
        variablesIdentification: `I = ${circuit.iSupplyIdealModel.toFixed(
          4
        )} A, Rcond = ${rCond.toFixed(2)} Ω, Vmín = ${vMinRequired.toFixed(2)} V`,
        numericalSubstitution: `V_{\\text{cond}} = ${circuit.iSupplyIdealModel.toFixed(
          4
        )} \\times ${rCond.toFixed(2)} = ${circuit.vDropConductors.toFixed(2)}\\text{ V}`,
        operationDetail: `V_{\\text{cargas}} = ${vs.toFixed(
          2
        )} - ${circuit.vDropConductors.toFixed(2)} = ${circuit.vLoads.toFixed(2)}\\text{ V}`,
        resultWithUnits: `V_{\\text{cargas}} = ${circuit.vLoads.toFixed(2)}\\text{ V}`,
        physicalInterpretation:
          'Si la resistencia de los conductores o la corriente aumentan en exceso, la tensión recibida por los equipos cae por debajo del umbral mínimo operativo.',
      },
      {
        title: 'Balance de Potencia y Eficiencia de Alimentación',
        generalEquation:
          'P_{\\text{fuente}} = P_{\\text{cond}} + P_{\\text{cargas}}, \\qquad \\eta = \\frac{P_{\\text{cargas}}}{P_{\\text{fuente}}} \\times 100\\%',
        variablesIdentification: `P_fuente = Vs · I; P_cond = I² · Rcond; P_cargas = Vcargas · I`,
        numericalSubstitution: `P_{\\text{fuente}} = ${circuit.pSourceDelivered.toFixed(
          4
        )}\\text{ W}, \\quad P_{\\text{cond}} = ${circuit.pConductorsLoss.toFixed(4)}\\text{ W}`,
        operationDetail: `P_{\\text{cargas}} = ${circuit.pLoadsTotal.toFixed(
          4
        )}\\text{ W}, \\quad \\Sigma P = 0.0000\\text{ W}`,
        resultWithUnits: `P_{\\text{cargas}} = ${circuit.pLoadsTotal.toFixed(
          4
        )}\\text{ W} \\;\\; (\\eta = ${circuit.efficiencyPercent.toFixed(1)}\\%)`,
        physicalInterpretation:
          'Una baja resistencia en los conductores maximiza la fracción de potencia útil entregada a los equipos de red.',
      },
    ],
    [vs, rCond, iMaxNominal, vMinRequired, circuit]
  );

  const flowDur =
    circuit.iSupplyIdealModel <= 0.01
      ? 0
      : Math.max(0.25, Math.min(2.5, 0.8 / Math.max(circuit.iSupplyIdealModel, 0.1)));

  return (
    <div className="space-y-6">
      {/* A. Explicación del escenario de ingeniería */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-4xl">
            <div className="flex items-center gap-2 text-xs font-mono text-sky-700">
              <span>MÓDULO 04 · DESAFÍO DE INGENIERÍA APLICADA</span>
              <span aria-hidden="true">·</span>
              <span>ALIMENTACIÓN DC DE EQUIPOS DE RED Y DECISIONES TÉCNICAS</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Análisis de Alimentación DC, Caída de Tensión en Línea y Capacidad Nominal
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Evalúe un sistema simplificado de alimentación de 12 V DC para módulos tecnológicos de red (cargas resistivas equivalentes de 48 Ω en paralelo) alimentados a través de conductores con resistencia serie agregada <span className="font-mono">Rcond</span>. Compruebe las restricciones hipotéticas de operación (<span className="font-mono">Imáx = 0,6 A</span> y <span className="font-mono">Vmín = 11,4 V</span>) y tome decisiones técnicas fundamentadas.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer Caso Base (Situación A)
          </button>
        </div>

        {/* Selector de las 4 Situaciones Técnicas de Ingeniería */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200">
          {[
            {
              id: 'SIT_A' as EngineeringSituationId,
              code: 'SITUACIÓN A',
              title: 'Verificación de Operación Normal',
              desc: 'Rcond = 1 Ω · 2 Cargas (48 Ω)',
            },
            {
              id: 'SIT_B' as EngineeringSituationId,
              code: 'SITUACIÓN B',
              title: 'Aumento de Resistencia Serie',
              desc: 'Rcond = 2 Ω · Caída de tensión',
            },
            {
              id: 'SIT_C' as EngineeringSituationId,
              code: 'SITUACIÓN C',
              title: 'Incorporación de 3.ª Carga',
              desc: 'Rcond = 1 Ω · 3 Cargas (48 Ω)',
            },
            {
              id: 'SIT_D' as EngineeringSituationId,
              code: 'SITUACIÓN D',
              title: 'Selección de Solución Técnica',
              desc: 'Toma de decisiones y justificación',
            },
          ].map((sit) => {
            const active = activeSituation === sit.id;
            return (
              <button
                key={sit.id}
                type="button"
                onClick={() => applySituationPreset(sit.id)}
                className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`block font-mono text-[11px] font-semibold ${
                    active ? 'text-sky-300' : 'text-sky-700'
                  }`}
                >
                  {sit.code}
                </span>
                <span className="block text-xs font-bold mt-0.5">{sit.title}</span>
                <span
                  className={`block text-[11px] font-mono mt-0.5 ${
                    active ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {sit.desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Banner de Estado de Admisibilidad Técnica y Seguridad */}
      <div
        className={`rounded-xl border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          circuit.isShortCircuitFault
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : circuit.isSystemAdmissible
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex items-start gap-3">
          {circuit.isShortCircuitFault ? (
            <ShieldAlert className="w-6 h-6 text-rose-700 shrink-0 mt-0.5" />
          ) : circuit.isSystemAdmissible ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 text-xs">
            <div className="font-bold text-sm flex flex-wrap items-center gap-2">
              <span>
                {circuit.isShortCircuitFault
                  ? '✖ FALLA CRÍTICA SIMULADA: CORTOCIRCUITO VIRTUAL EN BUS DE CARGAS'
                  : circuit.isSystemAdmissible
                  ? '● ESTADO OPERATIVO ADMISIBLE: CUMPLE ESPECIFICACIONES DE TENSIÓN Y CORRIENTE'
                  : '✖ ESCENARIO NO ADMISIBLE: INCUMPLE RESTRICCIONES TÉCNICAS DE OPERACIÓN'}
              </span>
            </div>
            <ul className="space-y-0.5 list-disc list-inside text-slate-800">
              {circuit.diagnosticSummary.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-1.5 shrink-0 font-mono text-xs">
          <span
            className={`px-2.5 py-1 rounded border ${
              circuit.isCurrentAdmissible
                ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900'
                : 'bg-rose-100 border-rose-300 text-rose-900 font-bold'
            }`}
          >
            {circuit.isCurrentAdmissible ? '●' : '✖'} I = {circuit.iSupplyIdealModel.toFixed(3)} A /{' '}
            {iMaxNominal.toFixed(2)} A máx.
          </span>
          <span
            className={`px-2.5 py-1 rounded border ${
              circuit.isVoltageAdmissible
                ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900'
                : 'bg-rose-100 border-rose-300 text-rose-900 font-bold'
            }`}
          >
            {circuit.isVoltageAdmissible ? '●' : '✖'} Vcargas = {circuit.vLoads.toFixed(2)} V /{' '}
            {vMinRequired.toFixed(2)} V mín.
          </span>
        </div>
      </div>

      {/* Zona Principal: Esquema de Alimentación de Equipos de Red + Panel de Decisiones / Controles */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* B. Esquema Interactivo del Sistema de Alimentación DC (7 columnas) */}
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-700" />
              <span className="text-xs font-mono font-semibold text-slate-800">
                DIAGRAMA DE DISTRIBUCIÓN DC A MÓDULOS DE RED
              </span>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Modelo Simplificado: Fuente + Rcond (Ida/Retorno) + Cargas en Paralelo
            </span>
          </div>

          <div className="p-4 sm:p-6 bg-[#F8FAFC] flex flex-col items-center">
            <svg
              viewBox="0 0 760 410"
              className="w-full max-w-[740px] h-auto select-none"
              role="img"
              aria-label="Esquema eléctrico de alimentación DC de equipos de red"
            >
              <defs>
                <pattern id="grid-net" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.7" />
                </pattern>
              </defs>

              <rect width="760" height="410" rx="12" fill="url(#grid-net)" />

              {/* Trazado principal de conductores */}
              <g stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round">
                {/* Fuente regulada en x=95 */}
                <line x1="95" y1="80" x2="95" y2="170" />
                <line x1="95" y1="240" x2="95" y2="340" />

                {/* Línea superior con Rcond (resistencia agregada de conductores y conexiones) */}
                <line x1="95" y1="80" x2="175" y2="80" />
                <polyline
                  points="175,80 187,64 205,96 223,64 241,96 259,64 277,96 289,80"
                  stroke="#D97706"
                  strokeWidth="3.5"
                />
                <line x1="289" y1="80" x2="660" y2="80" />

                {/* Línea inferior de retorno común */}
                <line x1="95" y1="340" x2="660" y2="340" />
              </g>

              {/* Animación de corriente en el alimentador principal */}
              {animationsEnabled && circuit.iSupplyIdealModel > 0 && (
                <>
                  <line
                    x1="95"
                    y1="80"
                    x2="370"
                    y2="80"
                    stroke={circuit.isCurrentAdmissible ? '#0284C7' : '#DC2626'}
                    strokeWidth="4.5"
                    strokeDasharray="6 16"
                    className="animate-current-forward"
                    style={{ '--flow-duration': `${flowDur}s` } as React.CSSProperties}
                  />
                  <line
                    x1="370"
                    y1="340"
                    x2="95"
                    y2="340"
                    stroke={circuit.isCurrentAdmissible ? '#0284C7' : '#DC2626'}
                    strokeWidth="4.5"
                    strokeDasharray="6 16"
                    className="animate-current-forward"
                    style={{ '--flow-duration': `${flowDur}s` } as React.CSSProperties}
                  />
                </>
              )}

              {/* Etiqueta de Resistencia de Conductores y Conexiones (Rcond) */}
              <g>
                <rect
                  x="150"
                  y="12"
                  width="165"
                  height="46"
                  rx="6"
                  fill="#FFFBEB"
                  stroke="#F59E0B"
                  strokeWidth="1.3"
                />
                <text
                  x="232"
                  y="30"
                  textAnchor="middle"
                  className="fill-amber-950 font-mono text-xs font-bold"
                >
                  Rcond = {rCond.toFixed(2)} Ω (Cables)
                </text>
                <text
                  x="232"
                  y="47"
                  textAnchor="middle"
                  className="fill-amber-800 font-mono text-[11px]"
                >
                  Caída Vcond = {circuit.vDropConductors.toFixed(2)} V · P ={' '}
                  {circuit.pConductorsLoss.toFixed(3)} W
                </text>
              </g>

              {/* Tres ramas de Cargas de Equipos de Red (Carga A, Carga B, Carga C) */}
              {[
                {
                  id: 'A',
                  title: 'Módulo Red A',
                  x: 380,
                  r: rLoadA,
                  closed: swLoadA,
                  toggle: () => setSwLoadA((p) => !p),
                  i: circuit.iLoadA,
                  p: circuit.pLoadA,
                },
                {
                  id: 'B',
                  title: 'Módulo Red B',
                  x: 520,
                  r: rLoadB,
                  closed: faultMode === 'open_branch_b' ? false : swLoadB,
                  toggle: () => {
                    if (faultMode === 'open_branch_b') setFaultMode('none');
                    setSwLoadB((p) => !p);
                  },
                  i: circuit.iLoadB,
                  p: circuit.pLoadB,
                },
                {
                  id: 'C',
                  title: 'Módulo Red C',
                  x: 660,
                  r: rLoadC,
                  closed: swLoadC,
                  toggle: () => setSwLoadC((p) => !p),
                  i: circuit.iLoadC,
                  p: circuit.pLoadC,
                },
              ].map((load) => {
                const lx = load.x;
                return (
                  <g key={load.id}>
                    <circle cx={lx} cy="80" r="5" fill="#0284C7" />
                    <circle cx={lx} cy="340" r="5" fill="#0F172A" />

                    {/* Interruptor de rama */}
                    <line x1={lx} y1="80" x2={lx} y2="112" stroke="#334155" strokeWidth="3" />
                    <g onClick={load.toggle} className="cursor-pointer">
                      <rect x={lx - 22} y="106" width="44" height="40" fill="transparent" />
                      {load.closed ? (
                        <line
                          x1={lx}
                          y1="112"
                          x2={lx}
                          y2="142"
                          stroke="#059669"
                          strokeWidth="3.5"
                        />
                      ) : (
                        <line
                          x1={lx}
                          y1="112"
                          x2={lx + 20}
                          y2="136"
                          stroke="#D97706"
                          strokeWidth="3.5"
                        />
                      )}
                      <circle cx={lx} cy="112" r="4" fill="#FFFFFF" stroke="#334155" strokeWidth="2" />
                      <circle cx={lx} cy="142" r="4" fill="#FFFFFF" stroke="#334155" strokeWidth="2" />
                    </g>

                    {/* Símbolo de módulo / resistor de carga equivalente */}
                    <line x1={lx} y1="142" x2={lx} y2="168" stroke="#334155" strokeWidth="3" />
                    <rect
                      x={lx - 48}
                      y="168"
                      width="96"
                      height="96"
                      rx="8"
                      fill={load.closed ? '#FFFFFF' : '#F1F5F9'}
                      stroke={
                        !load.closed
                          ? '#CBD5E1'
                          : circuit.isVoltageAdmissible
                          ? '#0284C7'
                          : '#DC2626'
                      }
                      strokeWidth="2"
                    />
                    {/* Símbolo de resistor interno dentro del bloque de equipo de red */}
                    <polyline
                      points={`${lx},176 ${lx + 10},183 ${lx - 10},195 ${lx + 10},207 ${
                        lx - 10
                      },219 ${lx},226`}
                      fill="none"
                      stroke={load.closed ? '#0F172A' : '#94A3B8'}
                      strokeWidth="2.2"
                    />
                    <text
                      x={lx}
                      y="242"
                      textAnchor="middle"
                      className="fill-slate-900 font-mono text-[11px] font-bold"
                    >
                      {load.title}
                    </text>
                    <text
                      x={lx}
                      y="256"
                      textAnchor="middle"
                      className="fill-slate-600 font-mono text-[10px]"
                    >
                      R_{load.id} = {load.r} Ω
                    </text>

                    <line x1={lx} y1="264" x2={lx} y2="340" stroke="#334155" strokeWidth="3" />

                    {/* Animación de corriente por la carga */}
                    {animationsEnabled && load.closed && load.i > 0 && (
                      <line
                        x1={lx}
                        y1="82"
                        x2={lx}
                        y2="338"
                        stroke="#0284C7"
                        strokeWidth="3.5"
                        strokeDasharray="5 15"
                        className="animate-current-forward"
                        style={{ '--flow-duration': '1.2s' } as React.CSSProperties}
                      />
                    )}

                    {/* Lectura de corriente y potencia del módulo */}
                    <rect
                      x={lx - 52}
                      y="274"
                      width="104"
                      height="44"
                      rx="5"
                      fill="#FFFFFF"
                      stroke="#CBD5E1"
                    />
                    <text
                      x={lx}
                      y="291"
                      textAnchor="middle"
                      className="fill-slate-800 font-mono text-[11px] font-semibold"
                    >
                      {load.closed ? `I_${load.id} = ${load.i.toFixed(3)} A` : 'DESCONECTADO'}
                    </text>
                    <text
                      x={lx}
                      y="307"
                      textAnchor="middle"
                      className="fill-slate-500 font-mono text-[10px]"
                    >
                      {load.closed ? `P_${load.id} = ${load.p.toFixed(2)} W` : 'I = 0 A'}
                    </text>
                  </g>
                );
              })}

              {/* Representación visual si está activo el cortocircuito virtual */}
              {circuit.isShortCircuitFault && (
                <g>
                  <line
                    x1="340"
                    y1="80"
                    x2="340"
                    y2="340"
                    stroke="#DC2626"
                    strokeWidth="5"
                  />
                  <rect
                    x="275"
                    y="185"
                    width="130"
                    height="46"
                    rx="6"
                    fill="#FEF2F2"
                    stroke="#DC2626"
                    strokeWidth="2"
                  />
                  <text
                    x="340"
                    y="204"
                    textAnchor="middle"
                    className="fill-rose-800 font-mono text-[11px] font-bold"
                  >
                    CORTOCIRCUITO
                  </text>
                  <text
                    x="340"
                    y="221"
                    textAnchor="middle"
                    className="fill-rose-700 font-mono text-[10px] font-semibold"
                  >
                    Ifallo = {circuit.iSupplyIdealModel.toFixed(1)} A
                  </text>
                </g>
              )}

              {/* Fuente DC Regulada y Especificación Nominal */}
              <g>
                <circle cx="95" cy="205" r="34" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
                <text
                  x="95"
                  y="194"
                  textAnchor="middle"
                  className="fill-rose-600 font-mono text-base font-bold"
                >
                  +
                </text>
                <text
                  x="95"
                  y="226"
                  textAnchor="middle"
                  className="fill-slate-700 font-mono text-base font-bold"
                >
                  −
                </text>
                <rect x="8" y="168" width="52" height="72" rx="6" fill="#0F172A" />
                <text x="34" y="188" textAnchor="middle" className="fill-sky-300 font-mono text-[9px]">
                  FUENTE
                </text>
                <text x="34" y="205" textAnchor="middle" className="fill-white font-mono text-xs font-bold">
                  {vs.toFixed(1)}V
                </text>
                <text x="34" y="222" textAnchor="middle" className="fill-amber-300 font-mono text-[9px]">
                  Máx:{iMaxNominal}A
                </text>
              </g>

              {/* Indicador de Tensión en el Bus de Cargas */}
              <g>
                <rect
                  x="415"
                  y="14"
                  width="265"
                  height="44"
                  rx="6"
                  fill={circuit.isVoltageAdmissible ? '#ECFDF5' : '#FEF2F2'}
                  stroke={circuit.isVoltageAdmissible ? '#059669' : '#DC2626'}
                  strokeWidth="1.5"
                />
                <text
                  x="547"
                  y="32"
                  textAnchor="middle"
                  className="fill-slate-900 font-mono text-xs font-bold"
                >
                  Bus de Cargas: Vcargas = {circuit.vLoadsMeasured.toFixed(2)} V
                </text>
                <text
                  x="547"
                  y="48"
                  textAnchor="middle"
                  className="fill-slate-700 font-mono text-[10px]"
                >
                  Requisito mínimo: {vMinRequired.toFixed(2)} V · Corriente Total:{' '}
                  {circuit.iSupplyIdealModel.toFixed(3)} A
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Panel Derecho: Decisiones Técnicas por Situación y Controles (5 columnas) */}
        <div className="xl:col-span-5 space-y-5">
          {/* Panel interactivo de Decisiones Técnicas según la situación seleccionada */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-700" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Evaluación y Toma de Decisiones de Ingeniería
                </h3>
              </div>
              <span className="text-xs font-mono text-sky-700 font-semibold">
                {activeSituation.replace('_', ' ')}
              </span>
            </div>

            {activeSituation !== 'SIT_D' ? (
              <div className="space-y-3 text-xs">
                <p className="text-slate-700 leading-relaxed">
                  {activeSituation === 'SIT_A' &&
                    'SITUACIÓN A (Operación Normal): Con Rcond = 1 Ω y dos módulos de 48 Ω en paralelo (Rcargas = 24 Ω, Rtotal = 25 Ω), analice las magnitudes resultantes y determine si la operación es admisible.'}
                  {activeSituation === 'SIT_B' &&
                    'SITUACIÓN B (Aumento de Resistencia de Conductores): La resistencia serie de los conductores y empalmes ha aumentado de 1 Ω a 2 Ω (Rtotal = 26 Ω). Compruebe la nueva tensión en las cargas frente al umbral mínimo de 11,4 V.'}
                  {activeSituation === 'SIT_C' &&
                    'SITUACIÓN C (Incorporación de 3.ª Carga de 48 Ω): Se ha conectado un tercer módulo en paralelo manteniendo Rcond = 1 Ω (Rcargas = 16 Ω, Rtotal = 17 Ω). Compare la corriente demandada en el modelo ideal frente a la capacidad nominal de 0,6 A de la fuente.'}
                </p>

                <div className="space-y-2 pt-1">
                  <span className="block font-semibold text-slate-900">
                    Dictamen técnico para esta situación:
                  </span>
                  {[
                    {
                      id: 'admissible',
                      label:
                        'Operación admisible: Cumple tanto corriente nominal (≤ 0,6 A) como tensión mínima (≥ 11,4 V).',
                    },
                    {
                      id: 'not_admissible_v',
                      label:
                        'No admisible por subtensión: La caída en conductores reduce Vcargas a ≈ 11,08 V (< 11,4 V).',
                    },
                    {
                      id: 'not_admissible_i',
                      label:
                        'No admisible por sobrecorriente (y subtensión): La corriente prevista (≈ 0,706 A) supera la capacidad nominal de la fuente (0,6 A).',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setStudentAdmissibilityVote((prev) => ({
                          ...prev,
                          [activeSituation]: opt.id as
                            | 'admissible'
                            | 'not_admissible_v'
                            | 'not_admissible_i',
                        }))
                      }
                      className={`w-full p-2.5 text-left rounded-lg border transition-colors cursor-pointer ${
                        studentAdmissibilityVote[activeSituation] === opt.id
                          ? 'bg-sky-50 border-sky-600 text-sky-950 font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {studentAdmissibilityVote[activeSituation] && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed">
                    {activeSituation === 'SIT_A' &&
                      (studentAdmissibilityVote.SIT_A === 'admissible'
                        ? '● Correcto: Con I = 0,48 A (≤ 0,6 A) y Vcargas = 11,52 V (≥ 11,4 V), el sistema opera dentro de todas las especificaciones.'
                        : '✖ Revise los valores: En la Situación A (1 Ω y 2 cargas), I = 0,48 A y Vcargas = 11,52 V, por lo que sí cumple las especificaciones.')}
                    {activeSituation === 'SIT_B' &&
                      (studentAdmissibilityVote.SIT_B === 'not_admissible_v'
                        ? '● Correcto: Al subir Rcond a 2 Ω, la corriente es 12 V / 26 Ω ≈ 0,4615 A (no excede 0,6 A), pero la tensión en las cargas cae a 11,08 V, incumpliendo el mínimo de 11,4 V.'
                        : '✖ Observe Vcargas: Con Rcond = 2 Ω, las cargas reciben solo 11,08 V, inferior al mínimo requerido de 11,4 V.')}
                    {activeSituation === 'SIT_C' &&
                      (studentAdmissibilityVote.SIT_C === 'not_admissible_i'
                        ? '● Correcto: Con 3 cargas de 48 Ω (Rcargas = 16 Ω y Rtotal = 17 Ω), el modelo ideal predice I = 12/17 ≈ 0,706 A, superando la capacidad nominal de 0,6 A de la fuente (y además Vcargas cae a 11,29 V).'
                        : '✖ Atención: Con 3 cargas conectadas, la corriente demandada (0,706 A) supera el límite nominal de 0,6 A de la fuente.')}
                  </div>
                )}
              </div>
            ) : (
              /* SITUACIÓN D: Selección de una solución técnica y justificación cuantitativa */
              <div className="space-y-3 text-xs">
                <p className="text-slate-700 leading-relaxed">
                  <strong>SITUACIÓN D (Selección de una Solución):</strong> Seleccione una alternativa de ingeniería y su justificación cuantitativa para garantizar que el sistema cumpla simultáneamente las restricciones de corriente nominal y tensión mínima:
                </p>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">
                    1. Seleccione la medida técnica a implementar:
                  </label>
                  <select
                    value={selectedSolutionD}
                    onChange={(e) => setSelectedSolutionD(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="">Seleccione una alternativa técnica...</option>
                    <option value="reduce_rcond_for_2loads">
                      Opción 1 (Para 2 cargas): Reducir la resistencia de los conductores a 1,0 Ω (mayor calibre AWG)
                    </option>
                    <option value="shed_third_load">
                      Opción 2 (Ante sobrecarga por 3.ª carga): Reducir la demanda desconectando el 3.er módulo (operar con 2 cargas y Rcond = 1 Ω)
                    </option>
                    <option value="upgrade_source_and_cables_3loads">
                      Opción 3 (Para alimentar los 3 módulos): Utilizar fuente de 1,0 A nominal Y reducir Rcond a 0,5 Ω
                    </option>
                    <option value="upgrade_source_only_3loads">
                      Opción 4 (Incompleta para 3 módulos): Cambiar solo la fuente a 1,0 A manteniendo Rcond = 1,0 Ω
                    </option>
                    <option value="keep_current">
                      Opción 5: Mantener la configuración sin cambios
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">
                    2. Justificación mediante las magnitudes eléctricas calculadas:
                  </label>
                  <select
                    value={selectedJustificationD}
                    onChange={(e) => setSelectedJustificationD(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="">Seleccione la justificación cuantitativa...</option>
                    <option value="just_vdrop">
                      Porque con Rcond = 1 Ω y 2 cargas, la caída serie se limita a 0,48 V, logrando Vcargas = 11,52 V (≥ 11,4 V) e I = 0,48 A (≤ 0,6 A).
                    </option>
                    <option value="just_demand">
                      Porque al desconectar la 3.ª carga, Rcargas pasa de 16 Ω a 24 Ω, reduciendo la corriente de 0,706 A a 0,48 A (≤ 0,6 A) y elevando Vcargas a 11,52 V.
                    </option>
                    <option value="just_both">
                      Porque para 3 cargas (Rcargas = 16 Ω), Rcond = 0,5 Ω eleva Vcargas a 11,64 V (≥ 11,4 V) y la fuente de 1,0 A admite los 0,727 A demandados.
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleEvaluateSolutionD}
                  className="w-full py-2 px-4 rounded-lg bg-sky-700 text-white font-semibold hover:bg-sky-800 transition-colors cursor-pointer"
                >
                  Aplicar y validar decisión técnica
                </button>

                {decisionFeedbackD && (
                  <div
                    className={`p-3 rounded-lg border space-y-1 ${
                      decisionFeedbackD.ok
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50 border-rose-200 text-rose-950'
                    }`}
                  >
                    <p className="font-bold">{decisionFeedbackD.title}</p>
                    <p className="leading-relaxed">{decisionFeedbackD.detail}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controles de Parámetros y Simulación de Diagnóstico de Fallas */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-700" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Parámetros de Línea, Cargas y Diagnóstico
                </h3>
              </div>
            </div>

            {/* Resistencia de conductores Rcond */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">
                  Resistencia de conductores y conexiones (Rcond)
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={rCond}
                    onChange={(e) =>
                      setRCond(Math.max(0.1, Math.min(5, Number(e.target.value) || 0.1)))
                    }
                    className="w-16 text-right font-mono text-xs font-semibold border border-slate-300 rounded px-1.5 py-0.5"
                  />
                  <span className="font-mono text-xs text-slate-500">Ω</span>
                </div>
              </div>
              <input
                type="range"
                min={0.1}
                max={5}
                step={0.1}
                value={rCond}
                onChange={(e) => setRCond(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Capacidad nominal de corriente de la fuente */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">
                  Capacidad nominal máxima de fuente (Imáx,nom)
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {iMaxNominal.toFixed(2)} A
                </span>
              </div>
              <input
                type="range"
                min={0.3}
                max={1.2}
                step={0.05}
                value={iMaxNominal}
                onChange={(e) => setIMaxNominal(Number(e.target.value))}
                className="w-full accent-slate-800 cursor-pointer"
              />
            </div>

            {/* Interruptores de las 3 cargas */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { label: 'Carga A (48Ω)', sw: swLoadA, set: setSwLoadA },
                { label: 'Carga B (48Ω)', sw: swLoadB, set: setSwLoadB },
                { label: 'Carga C (48Ω)', sw: swLoadC, set: setSwLoadC },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => item.set((p) => !p)}
                  className={`py-2 px-2 text-xs font-mono font-semibold rounded-lg border transition-colors cursor-pointer ${
                    item.sw
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-slate-100 border-slate-300 text-slate-600'
                  }`}
                >
                  {item.label}: {item.sw ? 'ON' : 'OFF'}
                </button>
              ))}
            </div>

            {/* Selector de Situaciones de Diagnóstico (Cortocircuito virtual, rama abierta, polaridad invertida) */}
            <div className="pt-3 border-t border-slate-200 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Simulador de Situaciones de Diagnóstico y Fallas Virtuales:
              </label>
              <select
                value={faultMode}
                onChange={(e) => setFaultMode(e.target.value as NetworkFaultMode)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              >
                <option value="none">Operación sin fallas de diagnóstico activas</option>
                <option value="open_branch_b">
                  Diagnóstico 1: Circuito abierto fortuito en la rama del Módulo B
                </option>
                <option value="short_load">
                  Diagnóstico 2: Cortocircuito virtual en una carga (Rcargas = 0 Ω limitado por Rcond)
                </option>
                <option value="reversed_probes">
                  Diagnóstico 3: Polaridad de medición invertida en el bus de cargas
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* D. Panel de Resultados de Referencia y Gráficos Comparativos de Límites Operativos */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <p className="text-xs font-mono text-slate-500">
              MAGNITUDES DEL SISTEMA Y VERIFICACIÓN DE ESPECIFICACIONES
            </p>
            <h3 className="text-base font-semibold text-slate-900">
              Resultados de Ingeniería y Balance de Potencia (Fuente · Conductores · Cargas)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-600">
            Eficiencia de línea η = {circuit.efficiencyPercent.toFixed(2)} %
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            {
              label: 'R eq. Cargas',
              val: circuit.rLoadsEq !== null ? `${circuit.rLoadsEq.toFixed(1)} Ω` : '∞ Ω',
              sub: `${circuit.activeLoadsCount} mód. activos`,
            },
            {
              label: 'R Total',
              val: circuit.rTotal !== null ? `${circuit.rTotal.toFixed(1)} Ω` : '∞ Ω',
              sub: `Rcond + Rcargas`,
            },
            {
              label: 'I Suministrada',
              val: `${circuit.iSupplyIdealModel.toFixed(3)} A`,
              sub: `Máx: ${iMaxNominal.toFixed(2)} A`,
              alert: !circuit.isCurrentAdmissible,
            },
            {
              label: 'V en Cargas',
              val: `${circuit.vLoads.toFixed(2)} V`,
              sub: `Mín: ${vMinRequired.toFixed(2)} V`,
              alert: !circuit.isVoltageAdmissible,
            },
            {
              label: 'I por Carga (A)',
              val: `${circuit.iLoadA.toFixed(3)} A`,
              sub: `Módulo A (48 Ω)`,
            },
            {
              label: 'P Fuente',
              val: `${circuit.pSourceDelivered.toFixed(2)} W`,
              sub: `Entregada total`,
            },
            {
              label: 'P Conductores',
              val: `${circuit.pConductorsLoss.toFixed(4)} W`,
              sub: `Pérdida I²·Rcond`,
            },
            {
              label: 'P Cargas Útil',
              val: `${circuit.pLoadsTotal.toFixed(4)} W`,
              sub: `Suma módulos`,
            },
          ].map((m) => (
            <div
              key={m.label}
              className={`p-3 rounded-lg border ${
                m.alert
                  ? 'bg-rose-50/70 border-rose-300'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <span className="block text-[10px] font-mono uppercase text-slate-500">
                {m.label}
              </span>
              <span
                className={`block text-base font-mono font-bold mt-1 tabular-nums ${
                  m.alert ? 'text-rose-700' : 'text-slate-900'
                }`}
              >
                {isChallengeMode ? '—' : m.val}
              </span>
              <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                {m.sub}
              </span>
            </div>
          ))}
        </div>

        {/* Gráficos comparativos: 1. Tensión recibida vs Tensión mínima requerida, 2. Corriente demandada vs Capacidad nominal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
          {/* Gráfico 1: Tensión disponible frente a tensión mínima requerida */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase font-mono text-slate-700">
                Comparación: Tensión Disponible en Cargas vs. Mínimo Requerido
              </h4>
              <span
                className={`text-xs font-mono font-semibold ${
                  circuit.isVoltageAdmissible ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {circuit.isVoltageAdmissible ? '● CUMPLE (≥ 11,40 V)' : '✖ INCUMPLE (< 11,40 V)'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Tensión Efectiva en Cargas (Vcargas)</span>
                  <span className="font-bold">{circuit.vLoads.toFixed(2)} V</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                  <div
                    className={`h-full transition-all duration-150 ${
                      circuit.isVoltageAdmissible ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                    style={{ width: `${Math.min(100, (circuit.vLoads / 12) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-600">
                  <span>Umbral Mínimo Operativo Especificado (Vmín)</span>
                  <span>{vMinRequired.toFixed(2)} V</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-slate-700"
                    style={{ width: `${Math.min(100, (vMinRequired / 12) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico 2: Corriente demandada (modelo ideal) vs Capacidad nominal de la fuente */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase font-mono text-slate-700">
                Comparación: Corriente Prevista vs. Capacidad Nominal de Fuente
              </h4>
              <span
                className={`text-xs font-mono font-semibold ${
                  circuit.isCurrentAdmissible ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {circuit.isCurrentAdmissible
                  ? `● ADMISIBLE (≤ ${iMaxNominal.toFixed(2)} A)`
                  : `✖ SOBRECORRIENTE (> ${iMaxNominal.toFixed(2)} A)`}
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Corriente Calculada (Modelo Fuente Ideal)</span>
                  <span className="font-bold">{circuit.iSupplyIdealModel.toFixed(3)} A</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all duration-150 ${
                      circuit.isCurrentAdmissible ? 'bg-sky-600' : 'bg-rose-600'
                    }`}
                    style={{ width: `${Math.min(100, (circuit.iSupplyIdealModel / 1.0) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-600">
                  <span>Capacidad Nominal Máxima de la Fuente (Imáx)</span>
                  <span>{iMaxNominal.toFixed(2)} A</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-slate-700"
                    style={{ width: `${Math.min(100, (iMaxNominal / 1.0) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multímetro Virtual */}
      {showMultimeter && (
        <VirtualMultimeter
          nodes={circuit.nodes}
          branches={circuit.branches}
          preferMilliAmps={false}
          moduleName="Módulo 4: Alimentación DC de Equipos de Red"
        />
      )}

      {/* Desafíos Numéricos Guiados */}
      <GuidedNumericChallengePanel
        challenges={numericChallenges}
        isChallengeMode={isChallengeMode}
        onActivateChallengeMode={onActivateChallengeMode}
      />

      {/* Desarrollo Matemático */}
      <MathDevelopmentPanel
        isOpen={showMath}
        onToggle={onToggleMath}
        moduleTitle="Análisis de Línea de Alimentación DC y Cargas en Paralelo"
        procedures={mathProcedures}
      />

      {/* Conclusiones e Interpretación Física */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <BookOpen className="w-4 h-4 text-sky-700 shrink-0" />
          <h3>Conclusiones de Ingeniería — Alimentación DC de Equipos de Red</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-semibold text-slate-900 block mb-1">
              1. Efecto de la resistencia de conductores
            </span>
            Los conductores reales poseen resistencia no nula (<MathFormula latex="R_{\text{cond}}" />). Al circular corriente hacia los equipos, se produce una caída de tensión <MathFormula latex="V_{\text{cond}} = I \cdot R_{\text{cond}}" /> que reduce la tensión disponible en las cargas.
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-semibold text-slate-900 block mb-1">
              2. Modelo ideal frente a capacidad nominal real
            </span>
            El modelo de fuente ideal permite calcular la corriente que demandaría el circuito (<MathFormula latex="0,706\text{ A}" /> con 3 cargas), pero en ingeniería debe contrastarse siempre con la corriente nominal máxima admisible de la fuente (<MathFormula latex="0,6\text{ A}" />).
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="font-semibold text-slate-900 block mb-1">
              3. Criterios simultáneos de diseño
            </span>
            Una solución técnica solo es admisible cuando satisface simultáneamente la restricción térmica/corriente de la fuente (<MathFormula latex="I \le I_{\text{máx}}" />) y la tensión mínima de operación en las cargas (<MathFormula latex="V_{\text{cargas}} \ge V_{\text{mín}}" />).
          </div>
        </div>
      </section>
    </div>
  );
};
