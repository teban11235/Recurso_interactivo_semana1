/**
 * MOTOR MATEMÁTICO Y FÍSICO DE CIRCUITOS ELÉCTRICOS DC
 * Universidad Técnica Particular de Loja (UTPL) — Semana 1
 *
 * Todas las magnitudes se procesan internamente en unidades del Sistema Internacional (SI):
 * - Tensión: Voltios (V)
 * - Corriente: Amperios (A)
 * - Resistencia: Ohmios (Ω)
 * - Conductancia: Siemens (S)
 * - Potencia: Vatios (W)
 * - Carga: Culombios (C)
 * - Energía: Julios (J)
 */

export interface CircuitNode {
  id: string;
  label: string;
  voltage: number; // V respecto al nodo de referencia (0 V)
  description: string;
}

export interface BranchMeasurement {
  id: string;
  label: string;
  currentPhys: number; // A (sentido físico real)
  currentRef: number; // A (según referencia elegida)
  resistance: number | null; // Ω (null si rama abierta)
  voltageDrop: number; // V
  powerDissipated: number; // W (>= 0 en resistores pasivos)
  isOpen: boolean;
}

export interface SeriesCircuitInput {
  vs: number; // V (0 a 48 V)
  r1: number; // Ω (> 0)
  r2: number; // Ω (> 0)
  r3: number; // Ω (> 0)
  mainSwitchClosed: boolean;
  currentRefInverted: boolean;
  polarityInverted: boolean;
}

export interface SeriesCircuitResult {
  vs: number;
  r1: number;
  r2: number;
  r3: number;
  req: number;
  geq: number;
  isOpenCircuit: boolean;
  currentPhys: number; // A
  currentRef: number; // A
  v1Phys: number;
  v2Phys: number;
  v3Phys: number;
  v1Measured: number;
  v2Measured: number;
  v3Measured: number;
  p1: number; // W
  p2: number; // W
  p3: number; // W
  pSourceDelivered: number; // W (magnitud positiva entregada)
  pSourcePassive: number; // W (convención pasiva: negativa cuando entrega)
  pTotalDissipated: number; // W
  powerBalanceSum: number; // ΣP = pSourcePassive + p1 + p2 + p3 = 0
  nodes: CircuitNode[];
  branches: BranchMeasurement[];
}

export interface ParallelBranchInput {
  id: string;
  label: string;
  r: number; // Ω (> 0)
  closed: boolean;
  currentRefInverted: boolean;
}

export interface ParallelCircuitInput {
  vs: number; // V
  branches: ParallelBranchInput[];
  polarityInverted: boolean;
}

export interface ParallelBranchResult {
  id: string;
  label: string;
  r: number; // Ω
  closed: boolean;
  g: number; // S (0 si está abierta)
  currentPhys: number; // A
  currentRef: number; // A
  voltageMeasured: number; // V
  power: number; // W
  sharePercent: number; // % de la corriente total
}

export interface ParallelCircuitResult {
  vs: number;
  vCommonMeasured: number;
  geq: number; // S
  req: number | null; // Ω (null si todas las ramas están abiertas -> ∞)
  isAllOpen: boolean;
  iTotalPhys: number; // A
  iTotalRef: number; // A
  pTotalDissipated: number; // W
  pSourceDelivered: number; // W
  pSourcePassive: number; // W
  powerBalanceSum: number; // W
  branchResults: ParallelBranchResult[];
  nodes: CircuitNode[];
  branches: BranchMeasurement[];
}

export interface MixedCircuitInput {
  vs: number; // V
  r1: number; // Ω (en serie principal)
  r2: number; // Ω (rama paralela A)
  r3: number; // Ω (rama paralela B)
  swMain: boolean;
  sw2: boolean;
  sw3: boolean;
  currentRefInverted: boolean;
  polarityInverted: boolean;
}

export interface MixedCircuitResult {
  vs: number;
  r1: number;
  r2: number;
  r3: number;
  g2: number; // S
  g3: number; // S
  g23: number; // S
  r23: number | null; // Ω (null si sw2 y sw3 están abiertos)
  req: number | null; // Ω (null si el circuito está abierto)
  isOpenCircuit: boolean;
  iTotalPhys: number; // A
  iTotalRef: number; // A
  vr1Phys: number; // V
  vr1Measured: number; // V
  v23Phys: number; // V
  v23Measured: number; // V
  ir2Phys: number; // A
  ir2Ref: number; // A
  ir3Phys: number; // A
  ir3Ref: number; // A
  pr1: number; // W
  pr2: number; // W
  pr3: number; // W
  pTotalDissipated: number; // W
  pSourceDelivered: number; // W
  pSourcePassive: number; // W
  powerBalanceSum: number; // W
  nodes: CircuitNode[];
  branches: BranchMeasurement[];
}

export type NetworkFaultMode =
  | 'none'
  | 'open_branch_b'
  | 'short_load'
  | 'reversed_probes';

export interface NetworkPowerInput {
  vs: number; // V (por defecto 12 V)
  iMaxNominal: number; // A (por defecto 0.6 A)
  vMinRequired: number; // V (por defecto 11.4 V)
  rCond: number; // Ω (por defecto 1 Ω)
  rLoadA: number; // Ω (por defecto 48 Ω)
  rLoadB: number; // Ω (por defecto 48 Ω)
  rLoadC: number; // Ω (por defecto 48 Ω)
  swLoadA: boolean;
  swLoadB: boolean;
  swLoadC: boolean;
  faultMode: NetworkFaultMode;
}

export interface NetworkPowerResult {
  vs: number;
  iMaxNominal: number;
  vMinRequired: number;
  rCond: number;
  activeLoadsCount: number;
  rLoadsEq: number | null; // Ω (0 en cortocircuito, null si todas abiertas)
  rTotal: number | null; // Ω
  isShortCircuitFault: boolean;
  isAllLoadsOpen: boolean;
  iSupplyIdealModel: number; // A (calculada según el modelo de fuente ideal + resistencia serie)
  vDropConductors: number; // V
  vLoads: number; // V
  vLoadsMeasured: number; // V (invierte signo si faultMode === 'reversed_probes')
  iLoadA: number; // A
  iLoadB: number; // A
  iLoadC: number; // A
  pSourceDelivered: number; // W
  pSourcePassive: number; // W
  pConductorsLoss: number; // W
  pLoadsTotal: number; // W
  pLoadA: number; // W
  pLoadB: number; // W
  pLoadC: number; // W
  powerBalanceSum: number; // W
  efficiencyPercent: number; // %
  isCurrentAdmissible: boolean;
  isVoltageAdmissible: boolean;
  isSystemAdmissible: boolean;
  diagnosticSummary: string[];
  nodes: CircuitNode[];
  branches: BranchMeasurement[];
}

/**
 * Validación de seguridad numérica para resistencias pasivas positivas
 */
export function clampPositiveResistance(r: number, minOhms = 0.05, maxOhms = 1e7): number {
  if (!Number.isFinite(r) || r <= 0) return minOhms;
  return Math.min(Math.max(r, minOhms), maxOhms);
}

export function clampVoltage(v: number, minV = 0, maxV = 240): number {
  if (!Number.isFinite(v)) return 12;
  return Math.min(Math.max(v, minV), maxV);
}

/**
 * MÓDULO 1: Solucionador de Circuito Resistivo en Serie
 */
export function solveSeriesCircuit(input: SeriesCircuitInput): SeriesCircuitResult {
  const vs = clampVoltage(input.vs, 0, 100);
  const r1 = clampPositiveResistance(input.r1, 1, 1e6);
  const r2 = clampPositiveResistance(input.r2, 1, 1e6);
  const r3 = clampPositiveResistance(input.r3, 1, 1e6);

  const req = r1 + r2 + r3;
  const geq = 1 / req;
  const isOpenCircuit = !input.mainSwitchClosed;

  const currentPhys = isOpenCircuit ? 0 : vs / req;
  const currentSign = input.currentRefInverted ? -1 : 1;
  const polaritySign = input.polarityInverted ? -1 : 1;

  const currentRef = currentPhys * currentSign;

  const v1Phys = currentPhys * r1;
  const v2Phys = currentPhys * r2;
  const v3Phys = currentPhys * r3;

  const v1Measured = v1Phys * polaritySign;
  const v2Measured = v2Phys * polaritySign;
  const v3Measured = v3Phys * polaritySign;

  // Para resistores pasivos positivos, la potencia disipada siempre es >= 0
  const p1 = currentPhys * currentPhys * r1;
  const p2 = currentPhys * currentPhys * r2;
  const p3 = currentPhys * currentPhys * r3;

  const pTotalDissipated = p1 + p2 + p3;
  const pSourceDelivered = vs * currentPhys;
  const pSourcePassive = -pSourceDelivered;
  const powerBalanceSum = pSourcePassive + pTotalDissipated;

  // Tensiones nodales respecto al terminal negativo de la fuente (Nodo D = 0 V)
  const vNodeA = vs;
  const vNodeB = isOpenCircuit ? vs : vs - v1Phys;
  const vNodeC = isOpenCircuit ? 0 : v3Phys;
  const vNodeD = 0;

  const nodes: CircuitNode[] = [
    { id: 'A', label: 'Nodo A (Terminal + Fuente / Entrada R1)', voltage: vNodeA, description: 'Potencial positivo de la fuente DC' },
    { id: 'B', label: 'Nodo B (Entre R1 y R2)', voltage: vNodeB, description: 'Potencial tras la caída de tensión en R1' },
    { id: 'C', label: 'Nodo C (Entre R2 y R3)', voltage: vNodeC, description: 'Potencial tras las caídas en R1 y R2' },
    { id: 'D', label: 'Nodo D (Referencia 0 V / Terminal − Fuente)', voltage: vNodeD, description: 'Nodo de referencia común del circuito' },
  ];

  const branches: BranchMeasurement[] = [
    {
      id: 'loop_series',
      label: 'Trayectoria Única en Serie (Fuente → R1 → R2 → R3)',
      currentPhys,
      currentRef,
      resistance: isOpenCircuit ? null : req,
      voltageDrop: vs,
      powerDissipated: pTotalDissipated,
      isOpen: isOpenCircuit,
    },
    {
      id: 'r1_branch',
      label: 'Elemento R1',
      currentPhys,
      currentRef,
      resistance: r1,
      voltageDrop: v1Phys,
      powerDissipated: p1,
      isOpen: isOpenCircuit,
    },
    {
      id: 'r2_branch',
      label: 'Elemento R2',
      currentPhys,
      currentRef,
      resistance: r2,
      voltageDrop: v2Phys,
      powerDissipated: p2,
      isOpen: isOpenCircuit,
    },
    {
      id: 'r3_branch',
      label: 'Elemento R3',
      currentPhys,
      currentRef,
      resistance: r3,
      voltageDrop: v3Phys,
      powerDissipated: p3,
      isOpen: isOpenCircuit,
    },
  ];

  return {
    vs,
    r1,
    r2,
    r3,
    req,
    geq,
    isOpenCircuit,
    currentPhys,
    currentRef,
    v1Phys,
    v2Phys,
    v3Phys,
    v1Measured,
    v2Measured,
    v3Measured,
    p1,
    p2,
    p3,
    pSourceDelivered,
    pSourcePassive,
    pTotalDissipated,
    powerBalanceSum,
    nodes,
    branches,
  };
}

/**
 * MÓDULO 2: Solucionador de Circuito Resistivo en Paralelo
 */
export function solveParallelCircuit(input: ParallelCircuitInput): ParallelCircuitResult {
  const vs = clampVoltage(input.vs, 0, 100);
  const polaritySign = input.polarityInverted ? -1 : 1;
  const vCommonMeasured = vs * polaritySign;

  let geq = 0;
  const rawBranches = input.branches.map((b) => {
    const r = clampPositiveResistance(b.r, 1, 1e6);
    const g = b.closed ? 1 / r : 0;
    geq += g;
    const currentPhys = b.closed ? vs / r : 0;
    const currentRef = currentPhys * (b.currentRefInverted ? -1 : 1);
    const power = currentPhys * currentPhys * r;
    return {
      id: b.id,
      label: b.label,
      r,
      closed: b.closed,
      g,
      currentPhys,
      currentRef,
      voltageMeasured: b.closed ? vCommonMeasured : 0,
      power,
    };
  });

  const isAllOpen = geq === 0;
  const req = isAllOpen ? null : 1 / geq;
  const iTotalPhys = vs * geq;
  const iTotalRef = iTotalPhys * polaritySign;

  const branchResults: ParallelBranchResult[] = rawBranches.map((b) => ({
    ...b,
    sharePercent: iTotalPhys > 0 ? (b.currentPhys / iTotalPhys) * 100 : 0,
  }));

  const pTotalDissipated = branchResults.reduce((acc, b) => acc + b.power, 0);
  const pSourceDelivered = vs * iTotalPhys;
  const pSourcePassive = -pSourceDelivered;
  const powerBalanceSum = pSourcePassive + pTotalDissipated;

  const nodes: CircuitNode[] = [
    {
      id: 'N_SUP',
      label: 'Nodo Superior A (Bus Positivo Común)',
      voltage: vs,
      description: 'Nodo común superior conectado al terminal + de la fuente ideal',
    },
    {
      id: 'N_INF',
      label: 'Nodo Inferior B (Referencia 0 V / Retorno Común)',
      voltage: 0,
      description: 'Nodo común inferior conectado al terminal − de la fuente ideal',
    },
  ];

  const branches: BranchMeasurement[] = [
    {
      id: 'main_source',
      label: 'Rama Principal de la Fuente (Itotal)',
      currentPhys: iTotalPhys,
      currentRef: iTotalRef,
      resistance: req,
      voltageDrop: vs,
      powerDissipated: pTotalDissipated,
      isOpen: isAllOpen,
    },
    ...branchResults.map((b) => ({
      id: b.id,
      label: `Rama ${b.label}`,
      currentPhys: b.currentPhys,
      currentRef: b.currentRef,
      resistance: b.closed ? b.r : null,
      voltageDrop: b.closed ? vs : 0,
      powerDissipated: b.power,
      isOpen: !b.closed,
    })),
  ];

  return {
    vs,
    vCommonMeasured,
    geq,
    req,
    isAllOpen,
    iTotalPhys,
    iTotalRef,
    pTotalDissipated,
    pSourceDelivered,
    pSourcePassive,
    powerBalanceSum,
    branchResults,
    nodes,
    branches,
  };
}

/**
 * MÓDULO 3: Solucionador de Circuito Resistivo Mixto (R1 en serie con (R2 || R3))
 */
export function solveMixedCircuit(input: MixedCircuitInput): MixedCircuitResult {
  const vs = clampVoltage(input.vs, 0, 100);
  const r1 = clampPositiveResistance(input.r1, 1, 1e6);
  const r2 = clampPositiveResistance(input.r2, 1, 1e6);
  const r3 = clampPositiveResistance(input.r3, 1, 1e6);

  const g2 = input.sw2 ? 1 / r2 : 0;
  const g3 = input.sw3 ? 1 / r3 : 0;
  const g23 = g2 + g3;
  const r23 = g23 > 0 ? 1 / g23 : null;

  const isOpenCircuit = !input.swMain || r23 === null;
  const req = isOpenCircuit ? null : r1 + r23;

  const currentSign = input.currentRefInverted ? -1 : 1;
  const polaritySign = input.polarityInverted ? -1 : 1;

  const iTotalPhys = req !== null ? vs / req : 0;
  const iTotalRef = iTotalPhys * currentSign;

  const vr1Phys = iTotalPhys * r1;
  const v23Phys = req !== null ? vs - vr1Phys : 0;

  const vr1Measured = vr1Phys * polaritySign;
  const v23Measured = v23Phys * polaritySign;

  const ir2Phys = !isOpenCircuit && input.sw2 ? v23Phys / r2 : 0;
  const ir3Phys = !isOpenCircuit && input.sw3 ? v23Phys / r3 : 0;

  const ir2Ref = ir2Phys * currentSign;
  const ir3Ref = ir3Phys * currentSign;

  const pr1 = iTotalPhys * iTotalPhys * r1;
  const pr2 = ir2Phys * ir2Phys * r2;
  const pr3 = ir3Phys * ir3Phys * r3;

  const pTotalDissipated = pr1 + pr2 + pr3;
  const pSourceDelivered = vs * iTotalPhys;
  const pSourcePassive = -pSourceDelivered;
  const powerBalanceSum = pSourcePassive + pTotalDissipated;

  const nodes: CircuitNode[] = [
    {
      id: 'A',
      label: 'Nodo A (Terminal + Fuente / Entrada R1)',
      voltage: vs,
      description: 'Terminal positivo de la fuente de alimentación',
    },
    {
      id: 'B',
      label: 'Nodo B (Unión entre R1 y el bloque paralelo R2 || R3)',
      voltage: isOpenCircuit ? (input.swMain ? vs : 0) : v23Phys,
      description: 'Nodo de bifurcación donde se divide la corriente hacia R2 y R3',
    },
    {
      id: 'C',
      label: 'Nodo C (Referencia 0 V / Retorno Común)',
      voltage: 0,
      description: 'Nodo inferior de retorno conectado al terminal − de la fuente',
    },
  ];

  const branches: BranchMeasurement[] = [
    {
      id: 'main_series',
      label: 'Rama Principal (Fuente y R1)',
      currentPhys: iTotalPhys,
      currentRef: iTotalRef,
      resistance: req,
      voltageDrop: vr1Phys,
      powerDissipated: pr1,
      isOpen: isOpenCircuit,
    },
    {
      id: 'branch_r2',
      label: 'Rama Paralela R2',
      currentPhys: ir2Phys,
      currentRef: ir2Ref,
      resistance: input.sw2 ? r2 : null,
      voltageDrop: v23Phys,
      powerDissipated: pr2,
      isOpen: isOpenCircuit || !input.sw2,
    },
    {
      id: 'branch_r3',
      label: 'Rama Paralela R3',
      currentPhys: ir3Phys,
      currentRef: ir3Ref,
      resistance: input.sw3 ? r3 : null,
      voltageDrop: v23Phys,
      powerDissipated: pr3,
      isOpen: isOpenCircuit || !input.sw3,
    },
  ];

  return {
    vs,
    r1,
    r2,
    r3,
    g2,
    g3,
    g23,
    r23,
    req,
    isOpenCircuit,
    iTotalPhys,
    iTotalRef,
    vr1Phys,
    vr1Measured,
    v23Phys,
    v23Measured,
    ir2Phys,
    ir2Ref,
    ir3Phys,
    ir3Ref,
    pr1,
    pr2,
    pr3,
    pTotalDissipated,
    pSourceDelivered,
    pSourcePassive,
    powerBalanceSum,
    nodes,
    branches,
  };
}

/**
 * MÓDULO 4: Solucionador de Alimentación DC de Equipos de Red
 */
export function solveNetworkPowerCircuit(input: NetworkPowerInput): NetworkPowerResult {
  const vs = clampVoltage(input.vs, 0, 48);
  const iMaxNominal = Math.max(0.05, input.iMaxNominal);
  const vMinRequired = Math.max(0, input.vMinRequired);
  const rCond = clampPositiveResistance(input.rCond, 0.05, 100);
  const rLoadA = clampPositiveResistance(input.rLoadA, 1, 10000);
  const rLoadB = clampPositiveResistance(input.rLoadB, 1, 10000);
  const rLoadC = clampPositiveResistance(input.rLoadC, 1, 10000);

  const swA = input.swLoadA;
  const swB = input.faultMode === 'open_branch_b' ? false : input.swLoadB;
  const swC = input.swLoadC;

  const isShortCircuitFault = input.faultMode === 'short_load';
  const polaritySign = input.faultMode === 'reversed_probes' ? -1 : 1;

  if (isShortCircuitFault) {
    // En cortocircuito virtual sobre el bus de cargas, R_cargas = 0 Ω.
    // La corriente de fallo queda limitada por la resistencia serie de los conductores (rCond).
    const rLoadsEq = 0;
    const rTotal = rCond;
    const iSupplyIdealModel = vs / rTotal;
    const vDropConductors = vs;
    const vLoads = 0;
    const vLoadsMeasured = 0;
    const pSourceDelivered = vs * iSupplyIdealModel;
    const pSourcePassive = -pSourceDelivered;
    const pConductorsLoss = iSupplyIdealModel * iSupplyIdealModel * rCond;
    const pLoadsTotal = 0;
    const powerBalanceSum = pSourcePassive + pConductorsLoss;

    const diagnosticSummary: string[] = [
      `CORTOCIRCUITO VIRTUAL DETECTADO EN EL BUS DE CARGAS (Rcargas = 0 Ω).`,
      `En este modelo con resistencia serie de conductores Rcond = ${rCond.toFixed(2)} Ω, la corriente teórica de fallo alcanza ${iSupplyIdealModel.toFixed(2)} A, superando ampliamente la capacidad nominal de la fuente (${iMaxNominal.toFixed(2)} A).`,
      `Toda la tensión de la fuente (${vs.toFixed(2)} V) cae en los conductores, dejando 0 V en los equipos de red y disipando ${pConductorsLoss.toFixed(2)} W en el cableado.`,
      `Nota física: Una fuente ideal de tensión conectada directamente a un cortocircuito ideal (sin Rcond) produciría un modelo matemático incompatible. En una fuente real actuaría la protección contra sobrecorriente (OCP) o el fusible.`,
    ];

    return {
      vs,
      iMaxNominal,
      vMinRequired,
      rCond,
      activeLoadsCount: (swA ? 1 : 0) + (swB ? 1 : 0) + (swC ? 1 : 0),
      rLoadsEq,
      rTotal,
      isShortCircuitFault: true,
      isAllLoadsOpen: false,
      iSupplyIdealModel,
      vDropConductors,
      vLoads,
      vLoadsMeasured,
      iLoadA: 0,
      iLoadB: 0,
      iLoadC: 0,
      pSourceDelivered,
      pSourcePassive,
      pConductorsLoss,
      pLoadsTotal,
      pLoadA: 0,
      pLoadB: 0,
      pLoadC: 0,
      powerBalanceSum,
      efficiencyPercent: 0,
      isCurrentAdmissible: false,
      isVoltageAdmissible: false,
      isSystemAdmissible: false,
      diagnosticSummary,
      nodes: [
        { id: 'SRC_POS', label: 'Nodo Fuente + (Salida 12 V)', voltage: vs, description: 'Terminal positivo de la fuente regulada' },
        { id: 'BUS_LOAD', label: 'Nodo Bus de Cargas (En Cortocircuito)', voltage: 0, description: 'Potencial colapsado a 0 V por el cortocircuito virtual' },
        { id: 'GND', label: 'Nodo Referencia (0 V)', voltage: 0, description: 'Retorno común del sistema' },
      ],
      branches: [
        {
          id: 'feeder_line',
          label: 'Línea de Alimentación (Conductores)',
          currentPhys: iSupplyIdealModel,
          currentRef: iSupplyIdealModel * polaritySign,
          resistance: rCond,
          voltageDrop: vs,
          powerDissipated: pConductorsLoss,
          isOpen: false,
        },
      ],
    };
  }

  const gA = swA ? 1 / rLoadA : 0;
  const gB = swB ? 1 / rLoadB : 0;
  const gC = swC ? 1 / rLoadC : 0;
  const gLoads = gA + gB + gC;
  const activeLoadsCount = (swA ? 1 : 0) + (swB ? 1 : 0) + (swC ? 1 : 0);

  const isAllLoadsOpen = gLoads === 0;
  const rLoadsEq = isAllLoadsOpen ? null : 1 / gLoads;
  const rTotal = rLoadsEq !== null ? rCond + rLoadsEq : null;

  const iSupplyIdealModel = rTotal !== null ? vs / rTotal : 0;
  const vDropConductors = iSupplyIdealModel * rCond;
  const vLoads = rTotal !== null ? vs - vDropConductors : vs;
  const vLoadsMeasured = vLoads * polaritySign;

  const iLoadA = !isAllLoadsOpen && swA ? vLoads / rLoadA : 0;
  const iLoadB = !isAllLoadsOpen && swB ? vLoads / rLoadB : 0;
  const iLoadC = !isAllLoadsOpen && swC ? vLoads / rLoadC : 0;

  const pLoadA = iLoadA * iLoadA * rLoadA;
  const pLoadB = iLoadB * iLoadB * rLoadB;
  const pLoadC = iLoadC * iLoadC * rLoadC;
  const pLoadsTotal = pLoadA + pLoadB + pLoadC;

  const pConductorsLoss = iSupplyIdealModel * iSupplyIdealModel * rCond;
  const pSourceDelivered = vs * iSupplyIdealModel;
  const pSourcePassive = -pSourceDelivered;
  const powerBalanceSum = pSourcePassive + pConductorsLoss + pLoadsTotal;
  const efficiencyPercent = pSourceDelivered > 0 ? (pLoadsTotal / pSourceDelivered) * 100 : 0;

  const EPS = 1e-6;
  const isCurrentAdmissible = iSupplyIdealModel <= iMaxNominal + EPS;
  const isVoltageAdmissible = !isAllLoadsOpen && vLoads >= vMinRequired - EPS;
  const isSystemAdmissible = !isAllLoadsOpen && isCurrentAdmissible && isVoltageAdmissible;

  const diagnosticSummary: string[] = [];
  if (isAllLoadsOpen) {
    diagnosticSummary.push(
      'Todas las cargas se encuentran desconectadas (circuito abierto). La corriente suministrada es 0 A y la tensión en el bus abierto iguala la tensión de la fuente.'
    );
  } else {
    if (isCurrentAdmissible) {
      diagnosticSummary.push(
        `Criterio de corriente CUMPLIDO: La corriente demandada (${iSupplyIdealModel.toFixed(3)} A) no excede la capacidad nominal máxima de la fuente (${iMaxNominal.toFixed(2)} A).`
      );
    } else {
      diagnosticSummary.push(
        `Criterio de corriente INCUMPLIDO: La corriente prevista por el modelo ideal (${iSupplyIdealModel.toFixed(3)} A) supera la capacidad nominal de la fuente (${iMaxNominal.toFixed(2)} A). Una fuente real no debe operar en estas condiciones (entraría en limitación de corriente, caída de tensión o apagado por protección).`
      );
    }

    if (isVoltageAdmissible) {
      diagnosticSummary.push(
        `Criterio de tensión mínima CUMPLIDO: Las cargas reciben ${vLoads.toFixed(2)} V, valor superior o igual al mínimo requerido de ${vMinRequired.toFixed(2)} V (caída en conductores: ${vDropConductors.toFixed(2)} V).`
      );
    } else {
      diagnosticSummary.push(
        `Criterio de tensión mínima INCUMPLIDO: Debido a la caída de tensión de ${vDropConductors.toFixed(2)} V en la resistencia de los conductores (${rCond.toFixed(2)} Ω), las cargas reciben únicamente ${vLoads.toFixed(2)} V, inferior al mínimo admisible de ${vMinRequired.toFixed(2)} V.`
      );
    }
  }

  if (input.faultMode === 'open_branch_b') {
    diagnosticSummary.push(
      'Diagnóstico de rama abierta: El Módulo de Red B presenta una interrupción (circuito abierto). Su corriente cae a 0 A, aumenta la resistencia equivalente y disminuye la caída de tensión en los conductores.'
    );
  }

  if (input.faultMode === 'reversed_probes') {
    diagnosticSummary.push(
      `Nota de medición: Las puntas del voltímetro están invertidas respecto a la polaridad de referencia, por lo que la lectura indica ${vLoadsMeasured.toFixed(2)} V aunque el potencial físico en el bus de cargas es +${vLoads.toFixed(2)} V.`
    );
  }

  const nodes: CircuitNode[] = [
    {
      id: 'SRC_POS',
      label: 'Nodo 1 (Salida Positiva Fuente DC)',
      voltage: vs,
      description: 'Terminal regulado de salida de la fuente de alimentación',
    },
    {
      id: 'BUS_LOAD',
      label: 'Nodo 2 (Bus de Alimentación en Cargas de Red)',
      voltage: vLoads,
      description: 'Tensión efectiva disponible en los terminales de los equipos tras la caída en los conductores',
    },
    {
      id: 'GND',
      label: 'Nodo 0 (Referencia 0 V / Retorno)',
      voltage: 0,
      description: 'Referencia común de potencial del sistema',
    },
  ];

  const branches: BranchMeasurement[] = [
    {
      id: 'feeder_line',
      label: 'Línea Principal y Conductores (Rcond)',
      currentPhys: iSupplyIdealModel,
      currentRef: iSupplyIdealModel * polaritySign,
      resistance: rCond,
      voltageDrop: vDropConductors,
      powerDissipated: pConductorsLoss,
      isOpen: isAllLoadsOpen,
    },
    {
      id: 'load_a',
      label: 'Módulo de Red A',
      currentPhys: iLoadA,
      currentRef: iLoadA * polaritySign,
      resistance: swA ? rLoadA : null,
      voltageDrop: swA ? vLoads : 0,
      powerDissipated: pLoadA,
      isOpen: !swA,
    },
    {
      id: 'load_b',
      label: 'Módulo de Red B',
      currentPhys: iLoadB,
      currentRef: iLoadB * polaritySign,
      resistance: swB ? rLoadB : null,
      voltageDrop: swB ? vLoads : 0,
      powerDissipated: pLoadB,
      isOpen: !swB,
    },
    {
      id: 'load_c',
      label: 'Módulo de Red C (Expansión)',
      currentPhys: iLoadC,
      currentRef: iLoadC * polaritySign,
      resistance: swC ? rLoadC : null,
      voltageDrop: swC ? vLoads : 0,
      powerDissipated: pLoadC,
      isOpen: !swC,
    },
  ];

  return {
    vs,
    iMaxNominal,
    vMinRequired,
    rCond,
    activeLoadsCount,
    rLoadsEq,
    rTotal,
    isShortCircuitFault: false,
    isAllLoadsOpen,
    iSupplyIdealModel,
    vDropConductors,
    vLoads,
    vLoadsMeasured,
    iLoadA,
    iLoadB,
    iLoadC,
    pSourceDelivered,
    pSourcePassive,
    pConductorsLoss,
    pLoadsTotal,
    pLoadA,
    pLoadB,
    pLoadC,
    powerBalanceSum,
    efficiencyPercent,
    isCurrentAdmissible,
    isVoltageAdmissible,
    isSystemAdmissible,
    diagnosticSummary,
    nodes,
    branches,
  };
}

/**
 * Formateadores científicos con prefijos SI consistentes
 */
export function formatResistance(ohms: number | null, decimals = 2): { value: string; unit: string; full: string } {
  if (ohms === null || !Number.isFinite(ohms)) {
    return { value: '∞', unit: 'Ω', full: '∞ Ω (Circuito Abierto)' };
  }
  if (Math.abs(ohms) >= 1000) {
    const k = ohms / 1000;
    const formatted = Number.isInteger(Number(k.toFixed(decimals))) ? Number(k.toFixed(decimals)).toString() : k.toFixed(decimals);
    return { value: formatted, unit: 'kΩ', full: `${formatted} kΩ` };
  }
  const formatted = Number.isInteger(Number(ohms.toFixed(decimals))) ? Number(ohms.toFixed(decimals)).toString() : ohms.toFixed(decimals);
  return { value: formatted, unit: 'Ω', full: `${formatted} Ω` };
}

export function formatCurrent(amps: number, preferMilli = true, decimals = 2): { value: string; unit: string; full: string } {
  if (preferMilli && Math.abs(amps) < 1 && Math.abs(amps) > 0) {
    const ma = amps * 1000;
    const formatted = Number.isInteger(Number(ma.toFixed(decimals))) ? Number(ma.toFixed(decimals)).toString() : ma.toFixed(decimals);
    return { value: formatted, unit: 'mA', full: `${formatted} mA` };
  }
  if (preferMilli && amps === 0) {
    return { value: '0', unit: 'mA', full: '0 mA' };
  }
  const formatted = amps.toFixed(decimals);
  return { value: formatted, unit: 'A', full: `${formatted} A` };
}

export function formatPower(watts: number, preferMilli = true, decimals = 2): { value: string; unit: string; full: string } {
  if (preferMilli && Math.abs(watts) < 1 && Math.abs(watts) > 0) {
    const mw = watts * 1000;
    const formatted = Number.isInteger(Number(mw.toFixed(decimals))) ? Number(mw.toFixed(decimals)).toString() : mw.toFixed(decimals);
    return { value: formatted, unit: 'mW', full: `${formatted} mW` };
  }
  if (preferMilli && watts === 0) {
    return { value: '0', unit: 'mW', full: '0 mW' };
  }
  const formatted = watts.toFixed(decimals);
  return { value: formatted, unit: 'W', full: `${formatted} W` };
}

export function formatConductance(siemens: number, decimals = 3): { value: string; unit: string; full: string } {
  if (siemens === 0) {
    return { value: '0', unit: 'mS', full: '0 mS' };
  }
  if (Math.abs(siemens) < 1) {
    const ms = siemens * 1000;
    const formatted = Number.isInteger(Number(ms.toFixed(decimals))) ? Number(ms.toFixed(decimals)).toString() : ms.toFixed(decimals);
    return { value: formatted, unit: 'mS', full: `${formatted} mS` };
  }
  const formatted = siemens.toFixed(decimals);
  return { value: formatted, unit: 'S', full: `${formatted} S` };
}

/**
 * Validador inteligente de respuestas numéricas con soporte de prefijos y diagnóstico de errores comunes
 */
export type PhysicalMagnitudeType = 'resistance' | 'current' | 'voltage' | 'power' | 'conductance';

export interface AnswerValidationResult {
  isCorrect: boolean;
  parsedValueSI: number | null;
  expectedValueSI: number;
  relativeError: number;
  errorCategory:
    | 'none'
    | 'invalid_number'
    | 'unit_prefix_mismatch'
    | 'sign_inverted'
    | 'parallel_sum_mistake'
    | 'calculation_error';
  feedbackMessage: string;
}

const UNIT_MULTIPLIERS: Record<string, number> = {
  // Resistencia
  'Ω': 1,
  'ohm': 1,
  'ohms': 1,
  'kΩ': 1e3,
  'kohm': 1e3,
  'MΩ': 1e6,
  // Corriente
  'A': 1,
  'mA': 1e-3,
  'μA': 1e-6,
  'uA': 1e-6,
  // Tensión
  'V': 1,
  'mV': 1e-3,
  'kV': 1e3,
  // Potencia
  'W': 1,
  'mW': 1e-3,
  'kW': 1e3,
  // Conductancia
  'S': 1,
  'mS': 1e-3,
};

export function validateStudentNumericAnswer(
  rawNumberInput: string,
  selectedUnit: string,
  expectedValueSI: number,
  magnitudeType: PhysicalMagnitudeType,
  toleranceRatio = 0.025, // 2.5% de tolerancia para redondeo
  commonMistakeValuesSI?: { valueSI: number; message: string; category: AnswerValidationResult['errorCategory'] }[]
): AnswerValidationResult {
  const normalized = rawNumberInput.trim().replace(',', '.');
  const numericVal = Number(normalized);

  if (!normalized || Number.isNaN(numericVal) || !Number.isFinite(numericVal)) {
    return {
      isCorrect: false,
      parsedValueSI: null,
      expectedValueSI,
      relativeError: 1,
      errorCategory: 'invalid_number',
      feedbackMessage: 'Por favor, introduzca un valor numérico válido antes de comprobar su respuesta.',
    };
  }

  const multiplier = UNIT_MULTIPLIERS[selectedUnit] ?? 1;
  const studentValueSI = numericVal * multiplier;

  const absDiff = Math.abs(studentValueSI - expectedValueSI);
  const absExpected = Math.abs(expectedValueSI);
  const isZeroTarget = absExpected < 1e-9;

  const isExactOrWithinTolerance = isZeroTarget
    ? absDiff < 1e-6
    : absDiff / absExpected <= toleranceRatio;

  if (isExactOrWithinTolerance) {
    return {
      isCorrect: true,
      parsedValueSI: studentValueSI,
      expectedValueSI,
      relativeError: isZeroTarget ? 0 : absDiff / absExpected,
      errorCategory: 'none',
      feedbackMessage:
        'Su cálculo y la unidad seleccionada son físicamente correctos y consistentes con las leyes del circuito.',
    };
  }

  // Comprobar si el estudiante introdujo la magnitud con el signo invertido
  if (!isZeroTarget && Math.abs(studentValueSI + expectedValueSI) / absExpected <= toleranceRatio) {
    return {
      isCorrect: false,
      parsedValueSI: studentValueSI,
      expectedValueSI,
      relativeError: absDiff / absExpected,
      errorCategory: 'sign_inverted',
      feedbackMessage:
        'La magnitud numérica es correcta, pero el signo está invertido. Revise el sentido de referencia de la corriente o la polaridad de tensión seleccionada.',
    };
  }

  // Comprobar si el estudiante confundió el prefijo de unidad (por ejemplo, mA con A, o kΩ con Ω)
  const ratio = absExpected > 0 ? Math.abs(studentValueSI / expectedValueSI) : 0;
  if (
    Math.abs(ratio - 1000) / 1000 <= toleranceRatio ||
    Math.abs(ratio - 0.001) / 0.001 <= toleranceRatio
  ) {
    const unitHint =
      magnitudeType === 'current'
        ? 'Recuerde que 1 A = 1000 mA (1 mA = 0,001 A).'
        : magnitudeType === 'resistance'
        ? 'Recuerde que 1 kΩ = 1000 Ω.'
        : magnitudeType === 'power'
        ? 'Recuerde que 1 W = 1000 mW (1 mW = 0,001 W).'
        : 'Revise el factor de conversión de 10³ entre la unidad base y el prefijo seleccionado.';
    return {
      isCorrect: false,
      parsedValueSI: studentValueSI,
      expectedValueSI,
      relativeError: absDiff / absExpected,
      errorCategory: 'unit_prefix_mismatch',
      feedbackMessage: `¡Atención a las unidades! El número significativo es correcto, pero existe un factor de 1000 de diferencia con la unidad elegida (${selectedUnit}). ${unitHint}`,
    };
  }

  // Comprobar errores conceptuales específicos registrados (ej. sumar resistencias en paralelo como si estuvieran en serie)
  if (commonMistakeValuesSI) {
    for (const mistake of commonMistakeValuesSI) {
      if (
        Math.abs(studentValueSI - mistake.valueSI) / Math.max(Math.abs(mistake.valueSI), 1e-9) <=
        toleranceRatio
      ) {
        return {
          isCorrect: false,
          parsedValueSI: studentValueSI,
          expectedValueSI,
          relativeError: absDiff / absExpected,
          errorCategory: mistake.category,
          feedbackMessage: mistake.message,
        };
      }
    }
  }

  return {
    isCorrect: false,
    parsedValueSI: studentValueSI,
    expectedValueSI,
    relativeError: isZeroTarget ? absDiff : absDiff / absExpected,
    errorCategory: 'calculation_error',
    feedbackMessage:
      'El resultado numérico no coincide con el estado eléctrico actual del circuito. Revise la relación matemática aplicada y sustituya los valores actuales de los componentes.',
  };
}

/**
 * Suite de Pruebas Automatizadas de Validación (Sección 16 del pliego técnico)
 */
export interface ValidationTestCaseResult {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  expectedSummary: string;
  actualSummary: string;
}

export function runEngineValidationSuite(): ValidationTestCaseResult[] {
  const results: ValidationTestCaseResult[] = [];
  const approx = (a: number, b: number, eps = 1e-4) => Math.abs(a - b) <= eps;

  // CASO 1: Serie (12 V, 1 kΩ, 2 kΩ, 3 kΩ)
  const c1 = solveSeriesCircuit({
    vs: 12,
    r1: 1000,
    r2: 2000,
    r3: 3000,
    mainSwitchClosed: true,
    currentRefInverted: false,
    polarityInverted: false,
  });
  const c1Pass =
    approx(c1.req, 6000) &&
    approx(c1.currentPhys, 0.002) &&
    approx(c1.v1Phys, 2) &&
    approx(c1.v2Phys, 4) &&
    approx(c1.v3Phys, 6) &&
    approx(c1.pSourceDelivered, 0.024) &&
    approx(c1.powerBalanceSum, 0);

  results.push({
    id: 'CASO_1',
    title: 'Caso 1 · Circuito en Serie (12 V, 1 kΩ, 2 kΩ, 3 kΩ)',
    description: 'Verifica Req = 6 kΩ, I = 2 mA, V1 = 2 V, V2 = 4 V, V3 = 6 V, Ptotal = 24 mW y ΣP = 0.',
    passed: c1Pass,
    expectedSummary: 'Req = 6 kΩ | I = 2 mA | V1=2 V, V2=4 V, V3=6 V | P = 24 mW',
    actualSummary: `Req = ${(c1.req / 1000).toFixed(2)} kΩ | I = ${(c1.currentPhys * 1000).toFixed(2)} mA | V1=${c1.v1Phys.toFixed(1)} V, V2=${c1.v2Phys.toFixed(1)} V, V3=${c1.v3Phys.toFixed(1)} V | P = ${(c1.pSourceDelivered * 1000).toFixed(1)} mW`,
  });

  // CASO 2: Paralelo (12 V, 6 kΩ, 3 kΩ, 2 kΩ)
  const c2 = solveParallelCircuit({
    vs: 12,
    polarityInverted: false,
    branches: [
      { id: 'r1', label: 'R1', r: 6000, closed: true, currentRefInverted: false },
      { id: 'r2', label: 'R2', r: 3000, closed: true, currentRefInverted: false },
      { id: 'r3', label: 'R3', r: 2000, closed: true, currentRefInverted: false },
    ],
  });
  const c2Pass =
    c2.req !== null &&
    approx(c2.req, 1000) &&
    approx(c2.branchResults[0].currentPhys, 0.002) &&
    approx(c2.branchResults[1].currentPhys, 0.004) &&
    approx(c2.branchResults[2].currentPhys, 0.006) &&
    approx(c2.iTotalPhys, 0.012);

  results.push({
    id: 'CASO_2',
    title: 'Caso 2 · Circuito en Paralelo (12 V, 6 kΩ, 3 kΩ, 2 kΩ)',
    description: 'Verifica Req = 1 kΩ, I1 = 2 mA, I2 = 4 mA, I3 = 6 mA, Itotal = 12 mA.',
    passed: c2Pass,
    expectedSummary: 'Req = 1 kΩ | I1 = 2 mA, I2 = 4 mA, I3 = 6 mA | Itotal = 12 mA',
    actualSummary: `Req = ${((c2.req ?? 0) / 1000).toFixed(2)} kΩ | I1 = ${(c2.branchResults[0].currentPhys * 1000).toFixed(1)} mA, I2 = ${(c2.branchResults[1].currentPhys * 1000).toFixed(1)} mA, I3 = ${(c2.branchResults[2].currentPhys * 1000).toFixed(1)} mA | Itotal = ${(c2.iTotalPhys * 1000).toFixed(1)} mA`,
  });

  // CASO 3: Mixto (12 V, R1 = 1 kΩ, R2 = 2 kΩ, R3 = 2 kΩ)
  const c3 = solveMixedCircuit({
    vs: 12,
    r1: 1000,
    r2: 2000,
    r3: 2000,
    swMain: true,
    sw2: true,
    sw3: true,
    currentRefInverted: false,
    polarityInverted: false,
  });
  const c3Pass =
    c3.r23 !== null &&
    c3.req !== null &&
    approx(c3.r23, 1000) &&
    approx(c3.req, 2000) &&
    approx(c3.iTotalPhys, 0.006) &&
    approx(c3.vr1Phys, 6) &&
    approx(c3.v23Phys, 6) &&
    approx(c3.ir2Phys, 0.003) &&
    approx(c3.ir3Phys, 0.003) &&
    approx(c3.pr1, 0.036) &&
    approx(c3.pr2, 0.018) &&
    approx(c3.pr3, 0.018) &&
    approx(c3.pTotalDissipated, 0.072);

  results.push({
    id: 'CASO_3',
    title: 'Caso 3 · Circuito Mixto (12 V, R1 = 1 kΩ, R2 = R3 = 2 kΩ)',
    description: 'Verifica R23 = 1 kΩ, Req = 2 kΩ, Itotal = 6 mA, VR1 = V23 = 6 V, Ptotal = 72 mW.',
    passed: c3Pass,
    expectedSummary: 'R23 = 1 kΩ | Req = 2 kΩ | Itotal = 6 mA | Ptotal = 72 mW',
    actualSummary: `R23 = ${((c3.r23 ?? 0) / 1000).toFixed(2)} kΩ | Req = ${((c3.req ?? 0) / 1000).toFixed(2)} kΩ | Itotal = ${(c3.iTotalPhys * 1000).toFixed(2)} mA | Ptotal = ${(c3.pTotalDissipated * 1000).toFixed(1)} mW`,
  });

  // CASO 4: Alimentación DC Normal (12 V, Rcond = 1 Ω, dos cargas de 48 Ω)
  const c4 = solveNetworkPowerCircuit({
    vs: 12,
    iMaxNominal: 0.6,
    vMinRequired: 11.4,
    rCond: 1,
    rLoadA: 48,
    rLoadB: 48,
    rLoadC: 48,
    swLoadA: true,
    swLoadB: true,
    swLoadC: false,
    faultMode: 'none',
  });
  const c4Pass =
    c4.rLoadsEq !== null &&
    c4.rTotal !== null &&
    approx(c4.rLoadsEq, 24) &&
    approx(c4.rTotal, 25) &&
    approx(c4.iSupplyIdealModel, 0.48) &&
    approx(c4.vLoads, 11.52) &&
    approx(c4.pSourceDelivered, 5.76) &&
    approx(c4.pConductorsLoss, 0.2304) &&
    approx(c4.pLoadsTotal, 5.5296) &&
    c4.isSystemAdmissible === true;

  results.push({
    id: 'CASO_4',
    title: 'Caso 4 · Alimentación DC Operación Normal (Rcond = 1 Ω, 2 cargas de 48 Ω)',
    description: 'Verifica Req = 25 Ω, I = 0,48 A, Vcargas = 11,52 V, Pfuente = 5,76 W, Ppérdidas = 0,2304 W.',
    passed: c4Pass,
    expectedSummary: 'Req = 25 Ω | I = 0,48 A | Vcargas = 11,52 V | Pcond = 0,2304 W | Admisible: Sí',
    actualSummary: `Req = ${(c4.rTotal ?? 0).toFixed(1)} Ω | I = ${c4.iSupplyIdealModel.toFixed(2)} A | Vcargas = ${c4.vLoads.toFixed(2)} V | Pcond = ${c4.pConductorsLoss.toFixed(4)} W | Admisible: ${c4.isSystemAdmissible ? 'Sí' : 'No'}`,
  });

  // CASO 5: Aumento de resistencia serie a 2 Ω
  const c5 = solveNetworkPowerCircuit({
    vs: 12,
    iMaxNominal: 0.6,
    vMinRequired: 11.4,
    rCond: 2,
    rLoadA: 48,
    rLoadB: 48,
    rLoadC: 48,
    swLoadA: true,
    swLoadB: true,
    swLoadC: false,
    faultMode: 'none',
  });
  const c5Pass =
    c5.rTotal !== null &&
    approx(c5.rTotal, 26) &&
    approx(c5.vLoads, 12 * (24 / 26), 1e-3) &&
    c5.vLoads < 11.4 &&
    c5.isVoltageAdmissible === false &&
    c5.isSystemAdmissible === false;

  results.push({
    id: 'CASO_5',
    title: 'Caso 5 · Aumento de Resistencia Serie a 2 Ω (Caída de Tensión)',
    description: 'Verifica que Vcargas ≈ 11,08 V (< 11,4 V) y el sistema se marca como no admisible por subtensión.',
    passed: c5Pass,
    expectedSummary: 'Vcargas ≈ 11,08 V (< 11,4 V) | Criterio tensión: Incumplido',
    actualSummary: `Vcargas = ${c5.vLoads.toFixed(2)} V | I = ${c5.iSupplyIdealModel.toFixed(3)} A | Criterio tensión: ${c5.isVoltageAdmissible ? 'Cumplido' : 'Incumplido'}`,
  });

  // CASO 6: Incorporación de tercera carga de 48 Ω con Rcond = 1 Ω
  const c6 = solveNetworkPowerCircuit({
    vs: 12,
    iMaxNominal: 0.6,
    vMinRequired: 11.4,
    rCond: 1,
    rLoadA: 48,
    rLoadB: 48,
    rLoadC: 48,
    swLoadA: true,
    swLoadB: true,
    swLoadC: true,
    faultMode: 'none',
  });
  const c6Pass =
    c6.rLoadsEq !== null &&
    c6.rTotal !== null &&
    approx(c6.rLoadsEq, 16) &&
    approx(c6.rTotal, 17) &&
    approx(c6.iSupplyIdealModel, 12 / 17, 1e-3) &&
    c6.iSupplyIdealModel > 0.6 &&
    c6.isCurrentAdmissible === false &&
    c6.isSystemAdmissible === false;

  results.push({
    id: 'CASO_6',
    title: 'Caso 6 · Tercera Carga de 48 Ω en Paralelo (Sobrecorriente)',
    description: 'Verifica Rcargas = 16 Ω, Rtotal = 17 Ω, Iprevista ≈ 0,706 A (> 0,6 A nominal) y estado no admisible.',
    passed: c6Pass,
    expectedSummary: 'Rtotal = 17 Ω | Iprevista ≈ 0,706 A (> 0,6 A) | Admisible: No',
    actualSummary: `Rtotal = ${(c6.rTotal ?? 0).toFixed(1)} Ω | Iprevista = ${c6.iSupplyIdealModel.toFixed(3)} A | Admisible: ${c6.isSystemAdmissible ? 'Sí' : 'No'}`,
  });

  return results;
}
