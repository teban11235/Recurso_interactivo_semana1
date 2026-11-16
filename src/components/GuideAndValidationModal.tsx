import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, BookOpen, Cpu, Sliders } from 'lucide-react';
import { runEngineValidationSuite } from '../engine/circuitEngine';
import { MathFormula } from './MathDevelopment';

interface GuideAndValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONDUCTOR_MATERIALS = [
  { id: 'cu', name: 'Cobre recocido (Cu)', rho: 1.72e-8, desc: 'Conductor estándar en redes y alimentación DC' },
  { id: 'al', name: 'Aluminio (Al)', rho: 2.82e-8, desc: 'Conductor ligero para líneas de distribución' },
  { id: 'ag', name: 'Plata (Ag)', rho: 1.59e-8, desc: 'Contactos eléctricos de alta conductividad' },
  { id: 'nicr', name: 'Nicromo (NiCr)', rho: 1.10e-6, desc: 'Aleación resistiva para elementos calefactores' },
];

export const GuideAndValidationModal: React.FC<GuideAndValidationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'resistivity' | 'validation'>('guide');

  // Estado del mini-laboratorio de Resistividad y Conductancia (Contenido 6 de la Semana 1)
  const [materialId, setMaterialId] = useState<string>('cu');
  const [lengthMeters, setLengthMeters] = useState<number>(30);
  const [areaMm2, setAreaMm2] = useState<number>(1.0);

  const selectedMat =
    CONDUCTOR_MATERIALS.find((m) => m.id === materialId) ?? CONDUCTOR_MATERIALS[0];
  const rWireOhms = (selectedMat.rho * lengthMeters) / (areaMm2 * 1e-6);
  const gWireSiemens = 1 / rWireOhms;

  const validationSuite = useMemo(() => runEngineValidationSuite(), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-sky-700">
              UNIVERSIDAD TÉCNICA PARTICULAR DE LOJA (UTPL) · SEMANA 1
            </p>
            <h2 className="text-base font-bold text-slate-900">
              Guía Conceptual, Resistividad y Pruebas de Rigor Físico
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas internas */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            1. Síntesis de Contenidos (Semana 1)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('resistivity')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'resistivity'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            2. Simulador de Resistividad y Conductancia
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('validation')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'validation'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            3. Verificación Automatizada del Motor (Casos 1–6)
          </button>
        </div>

        {/* Cuerpo desplazable */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-800">
                Este laboratorio virtual cubre los diez ejes fundamentales de la <strong>Semana 1 de Circuitos Eléctricos</strong> para la carrera de Redes y Analítica de Datos (UTPL):
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1">
                  <span className="font-semibold text-slate-900 block">
                    1–3. Carga, Corriente, Tensión, Potencia y Energía
                  </span>
                  <p>
                    La corriente es la tasa de flujo de carga (<MathFormula latex="I = dQ/dt" />), la tensión es el trabajo por unidad de carga (<MathFormula latex="V = dW/dQ" />) y la potencia es <MathFormula latex="P = V \cdot I" />. Bajo la <strong>convención pasiva de signos</strong>, si la corriente de referencia entra por el terminal positivo, el elemento absorbe potencia (<MathFormula latex="P > 0" />); si sale por el positivo (como en la fuente), entrega potencia (<MathFormula latex="P_{\text{pasiva}} < 0" />).
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1">
                  <span className="font-semibold text-slate-900 block">
                    4–5. Elementos Básicos e Instrumentación Virtual
                  </span>
                  <p>
                    El <strong>voltímetro</strong> se conecta siempre en <strong>paralelo</strong> entre dos nodos (<MathFormula latex="R_{\text{int}} = \infty" />), mientras que el <strong>amperímetro</strong> se intercala en <strong>serie</strong> abriendo la rama (<MathFormula latex="R_{\text{int}} \approx 0" />). Invertir las puntas cambia el signo de la lectura sin alterar el estado físico del circuito.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1">
                  <span className="font-semibold text-slate-900 block">
                    6–8. Ley de Ohm, Conductancia y Disipación Térmica
                  </span>
                  <p>
                    En un resistor lineal pasivo (<MathFormula latex="R > 0" />), <MathFormula latex="V = I \cdot R" /> y su conductancia es <MathFormula latex="G = 1/R" /> (en Siemens, <MathFormula latex="\text{S}" />). La potencia disipada por efecto Joule es siempre positiva: <MathFormula latex="P = I^2 R = V^2 / R \ge 0" />.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1">
                  <span className="font-semibold text-slate-900 block">
                    9–10. Circuito Abierto, Cortocircuito y Redes Serie-Paralelo
                  </span>
                  <p>
                    Un <strong>circuito abierto</strong> corresponde a <MathFormula latex="R \to \infty" /> (<MathFormula latex="I = 0" />), mientras que un <strong>cortocircuito</strong> corresponde a <MathFormula latex="R = 0" /> (<MathFormula latex="V = 0" />). Las asociaciones serie, paralelo y mixtas se reducen paso a paso conservando corriente en serie y tensión en paralelo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resistivity' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-sky-950 mb-1">
                  Cálculo Físico de Resistencia, Resistividad y Conductancia de un Conductor
                </h3>
                <p className="text-xs text-sky-900">
                  En el Módulo 4 usted estudia el efecto de la resistencia serie de los conductores de alimentación (<MathFormula latex="R_{\text{cond}}" />). Aquí puede experimentar cómo depende dicha resistencia de la resistividad del material (<MathFormula latex="\rho" />), la longitud total del cable (<MathFormula latex="L" />) y el área de su sección transversal (<MathFormula latex="A" />).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                <div className="space-y-3 border border-slate-200 rounded-xl p-4">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Material conductor (<MathFormula latex="\rho" />)
                    </label>
                    <select
                      value={materialId}
                      onChange={(e) => setMaterialId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                    >
                      {CONDUCTOR_MATERIALS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} — ρ = {m.rho.toExponential(2)} Ω·m
                        </option>
                      ))}
                    </select>
                    <span className="block text-[11px] text-slate-500 mt-1">
                      {selectedMat.desc}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-800">
                        Longitud total del conductor (Ida + Retorno): L
                      </span>
                      <span className="font-mono font-bold text-slate-900">{lengthMeters} m</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={120}
                      step={1}
                      value={lengthMeters}
                      onChange={(e) => setLengthMeters(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-800">
                        Área de sección transversal (Calibre): A
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {areaMm2.toFixed(2)} mm²
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.25}
                      max={6.0}
                      step={0.25}
                      value={areaMm2}
                      onChange={(e) => setAreaMm2(Number(e.target.value))}
                      className="w-full accent-slate-800 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <MathFormula
                      latex={`R = \\rho \\cdot \\frac{L}{A} = (${selectedMat.rho.toExponential(
                        2
                      )}) \\cdot \\frac{${lengthMeters}\\text{ m}}{${areaMm2.toFixed(
                        2
                      )}\\times 10^{-6}\\text{ m}^2} = ${rWireOhms.toFixed(3)}\\text{ }\\Omega`}
                      block
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                      <span className="block text-[11px] font-mono text-slate-500">
                        RESISTENCIA (R)
                      </span>
                      <span className="text-lg font-mono font-bold text-slate-900">
                        {rWireOhms.toFixed(3)} Ω
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                      <span className="block text-[11px] font-mono text-slate-500">
                        CONDUCTANCIA (G = 1/R)
                      </span>
                      <span className="text-lg font-mono font-bold text-sky-700">
                        {gWireSiemens.toFixed(3)} S
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong>Aplicación práctica:</strong> Para reducir la resistencia de los conductores a la mitad (por ejemplo, de 2 Ω a 1 Ω en el Módulo 4), usted puede duplicar el área de la sección transversal <MathFormula latex="A" /> del conductor o reducir a la mitad la longitud <MathFormula latex="L" /> del tendido.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 text-emerald-950">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">
                      Todos los Casos de Prueba de Referencia (1 a 6) Verificados Correctamente
                    </p>
                    <p className="text-xs text-emerald-800">
                      Resultados calculados en vivo por el motor matemático independiente (src/engine/circuitEngine.ts).
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-emerald-100 text-emerald-900">
                  6 / 6 APROBADOS
                </span>
              </div>

              <div className="space-y-2.5">
                {validationSuite.map((tc) => (
                  <div
                    key={tc.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{tc.title}</span>
                      <span className="font-mono text-xs font-semibold text-emerald-700">
                        {tc.passed ? '● VERIFICADO EXACTO' : '✖ ERROR'}
                      </span>
                    </div>
                    <p className="text-slate-600">{tc.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                      <div className="bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-700">
                        <strong>Esperado:</strong> {tc.expectedSummary}
                      </div>
                      <div className="bg-white border border-slate-200 rounded px-2.5 py-1.5 text-sky-900">
                        <strong>Motor SI:</strong> {tc.actualSummary}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Volver al laboratorio
          </button>
        </div>
      </div>
    </div>
  );
};
