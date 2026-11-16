import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, AlertTriangle, CheckCircle2, Gauge } from 'lucide-react';
import { CircuitNode, BranchMeasurement, formatCurrent } from '../engine/circuitEngine';

interface VirtualMultimeterProps {
  nodes: CircuitNode[];
  branches: BranchMeasurement[];
  preferMilliAmps?: boolean;
  moduleName: string;
}

export const VirtualMultimeter: React.FC<VirtualMultimeterProps> = ({
  nodes,
  branches,
  preferMilliAmps = true,
  moduleName,
}) => {
  const [mode, setMode] = useState<'VDC' | 'ADC'>('VDC');
  const [probePosId, setProbePosId] = useState<string>(nodes[0]?.id ?? '');
  const [probeNegId, setProbeNegId] = useState<string>(nodes[nodes.length - 1]?.id ?? '');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id ?? '');
  const [ammeterInverted, setAmmeterInverted] = useState<boolean>(false);
  const [ammeterConnectionType, setAmmeterConnectionType] = useState<'series' | 'parallel_error'>('series');

  useEffect(() => {
    if (nodes.length > 0 && !nodes.some((n) => n.id === probePosId)) {
      setProbePosId(nodes[0].id);
    }
    if (nodes.length > 0 && !nodes.some((n) => n.id === probeNegId)) {
      setProbeNegId(nodes[nodes.length - 1].id);
    }
  }, [nodes, probePosId, probeNegId]);

  useEffect(() => {
    if (branches.length > 0 && !branches.some((b) => b.id === selectedBranchId)) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  const posNode = nodes.find((n) => n.id === probePosId) ?? nodes[0];
  const negNode = nodes.find((n) => n.id === probeNegId) ?? nodes[nodes.length - 1];
  const activeBranch = branches.find((b) => b.id === selectedBranchId) ?? branches[0];

  const voltageReading = (posNode?.voltage ?? 0) - (negNode?.voltage ?? 0);
  const formattedVoltage = `${voltageReading >= 0 ? '+' : ''}${voltageReading.toFixed(2)} V`;

  const rawBranchCurrent = activeBranch ? activeBranch.currentRef * (ammeterInverted ? -1 : 1) : 0;
  const formattedAmpObj = formatCurrent(rawBranchCurrent, preferMilliAmps, 3);
  const formattedAmp = `${rawBranchCurrent > 0 ? '+' : ''}${formattedAmpObj.value} ${formattedAmpObj.unit}`;

  const handleSwapProbes = () => {
    const temp = probePosId;
    setProbePosId(probeNegId);
    setProbeNegId(temp);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <Gauge className="w-5 h-5 text-sky-700 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Multímetro Digital Virtual de Precisión
            </h3>
            <p className="text-xs text-slate-500">
              Instrumento reutilizable conectado al estado eléctrico real · {moduleName}
            </p>
          </div>
        </div>

        {/* Selector de Modo V DC / A DC */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('VDC')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'VDC'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Voltímetro (V DC)
          </button>
          <button
            type="button"
            onClick={() => setMode('ADC')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'ADC'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Amperímetro (A DC)
          </button>
        </div>
      </div>

      {/* Pantalla LCD de Instrumentación */}
      <div className="bg-slate-900 text-slate-100 rounded-lg p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>MODO: {mode === 'VDC' ? 'TENSIÓN CONTINUA (V DC)' : 'CORRIENTE CONTINUA (A DC)'}</span>
            <span aria-hidden="true">·</span>
            <span>
              {mode === 'VDC' ? 'CONEXIÓN EN PARALELO (R_int = ∞ Ω)' : 'CONEXIÓN EN SERIE (R_int ≈ 0 Ω)'}
            </span>
          </div>

          {mode === 'VDC' ? (
            <div className="text-3xl font-mono font-bold tracking-tight text-sky-400 tabular-nums">
              {formattedVoltage}
            </div>
          ) : ammeterConnectionType === 'parallel_error' ? (
            <div className="text-xl font-mono font-bold text-rose-400">
              ✖ BLOQUEO DE SEGURIDAD (CONEXIÓN EN PARALELO)
            </div>
          ) : (
            <div className="text-3xl font-mono font-bold tracking-tight text-amber-400 tabular-nums">
              {formattedAmp}
            </div>
          )}
        </div>

        <div className="text-xs font-mono text-slate-300 bg-slate-800/90 px-3 py-2 rounded border border-slate-700 space-y-1">
          {mode === 'VDC' ? (
            <>
              <div>
                Punta Roja (+): <span className="text-rose-300">{posNode?.id}</span> ({posNode?.voltage.toFixed(2)} V)
              </div>
              <div>
                Punta Negra (−): <span className="text-slate-300">{negNode?.id}</span> ({negNode?.voltage.toFixed(2)} V)
              </div>
              <div className="text-[11px] text-slate-400">
                Lectura: V(+) − V(−) = {formattedVoltage}
              </div>
            </>
          ) : (
            <>
              <div>
                Rama: <span className="text-amber-300">{activeBranch?.label}</span>
              </div>
              <div>
                Estado de rama: {activeBranch?.isOpen ? 'Abierta (I = 0)' : 'Cerrada (Activa)'}
              </div>
              <div className="text-[11px] text-slate-400">
                Orientación puntas: {ammeterInverted ? 'Invertida (− a +)' : 'Directa (+ a −)'}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Controles específicos según el modo */}
      {mode === 'VDC' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Terminal Positivo — Punta Roja (+)
              </label>
              <select
                value={probePosId}
                onChange={(e) => setProbePosId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Terminal de Referencia — Punta Negra (COM / −)
              </label>
              <select
                value={probeNegId}
                onChange={(e) => setProbeNegId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleSwapProbes}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Invertir puntas de medición (+ / −)
            </button>

            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                El voltímetro ideal posee resistencia interna infinita y se conecta en paralelo entre dos puntos sin alterar la corriente del circuito.
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 leading-relaxed">
            <span className="font-semibold text-slate-900">Interpretación de polaridad: </span>
            El voltímetro calcula la diferencia de potencial{' '}
            <span className="font-mono">V_lectura = V(Punta Roja) − V(Punta Negra)</span>. Si usted invierte las puntas de medición, los potenciales de los nodos en el circuito no cambian, pero el orden de la resta se invierte (<span className="font-mono">V_BA = −V_AB</span>), cambiando el signo algebraico mostrado en pantalla.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Seleccione la rama donde insertar el amperímetro
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Forma de conexión del instrumento
              </label>
              <select
                value={ammeterConnectionType}
                onChange={(e) => setAmmeterConnectionType(e.target.value as 'series' | 'parallel_error')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                <option value="series">Conexión correcta: En serie abriendo la rama elegida</option>
                <option value="parallel_error">
                  Simular error: Conectar en paralelo con la fuente o resistor
                </option>
              </select>
            </div>
          </div>

          {ammeterConnectionType === 'parallel_error' ? (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 text-xs text-rose-900 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-rose-800">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Advertencia Técnica: Conexión Incorrecta de Amperímetro en Paralelo</span>
              </div>
              <p className="leading-relaxed">
                Un amperímetro posee una resistencia interna extremadamente baja (<span className="font-mono">R_int ≈ 0 Ω</span> en el modelo ideal) para no introducir caídas de tensión al medir en serie. Si usted lo conecta en paralelo directamente sobre la fuente o un componente, provoca un <strong>cortocircuito virtual</strong> a través del instrumento.
              </p>
              <p className="leading-relaxed">
                El simulador ha bloqueado esta maniobra para mantener la estabilidad del modelo y proteger el fusible virtual del instrumento. Seleccione <strong>«Conexión correcta: En serie»</strong> para medir la corriente de la rama.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setAmmeterInverted((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Invertir terminales del amperímetro ({ammeterInverted ? 'Invertido −/+' : 'Directo +/−'})
              </button>

              <p className="text-xs text-slate-600">
                Para medir corriente, el circuito debe abrirse e intercalar el amperímetro <strong>en serie</strong> con la rama analizada.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
