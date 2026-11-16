import React from 'react';
import katex from 'katex';

interface MathFormulaProps {
  latex: string;
  block?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  latex,
  block = false,
  className = '',
}) => {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: block,
        strict: false,
      });
    } catch {
      return latex;
    }
  }, [latex, block]);

  return (
    <span
      className={`${block ? 'block my-2 overflow-x-auto py-1' : 'inline-block'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export interface MathProcedureStep {
  title: string;
  generalEquation: string; // LaTeX
  variablesIdentification: string; // Texto o LaTeX
  numericalSubstitution: string; // LaTeX
  operationDetail: string; // LaTeX
  resultWithUnits: string; // LaTeX
  physicalInterpretation: string; // Explicación en tratamiento de "usted"
}

interface MathDevelopmentPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  moduleTitle: string;
  procedures: MathProcedureStep[];
}

export const MathDevelopmentPanel: React.FC<MathDevelopmentPanelProps> = ({
  isOpen,
  onToggle,
  moduleTitle,
  procedures,
}) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-slate-500">
            PROCEDIMIENTO ANALÍTICO PASO A PASO · TIEMPO REAL
          </p>
          <h3 className="text-base font-semibold text-slate-900">
            Desarrollo Matemático — {moduleTitle}
          </h3>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isOpen ? 'Ocultar desarrollo' : 'Mostrar desarrollo matemático'}
        </button>
      </div>

      {isOpen && (
        <div className="p-5 space-y-6">
          <p className="text-sm text-slate-600">
            Observe cómo las expresiones analíticas se actualizan automáticamente con los valores actuales definidos en el laboratorio. Cada magnitud sigue una estructura rigurosa de seis etapas:
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {procedures.map((proc, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {idx + 1}. {proc.title}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Etapas 1–6
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white border border-slate-200/80 rounded p-2.5">
                      <span className="block font-mono text-[11px] text-slate-400 mb-1">
                        1. Ecuación general
                      </span>
                      <MathFormula latex={proc.generalEquation} />
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded p-2.5">
                      <span className="block font-mono text-[11px] text-slate-400 mb-1">
                        2. Identificación de variables
                      </span>
                      <div className="text-slate-700 leading-relaxed">
                        {proc.variablesIdentification}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded p-2.5">
                      <span className="block font-mono text-[11px] text-slate-400 mb-1">
                        3. Sustitución numérica
                      </span>
                      <MathFormula latex={proc.numericalSubstitution} />
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded p-2.5">
                      <span className="block font-mono text-[11px] text-slate-400 mb-1">
                        4. Operación matemática
                      </span>
                      <MathFormula latex={proc.operationDetail} />
                    </div>
                  </div>

                  <div className="bg-sky-50/70 border border-sky-200 rounded p-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-sky-900">
                      5. Resultado con unidades:
                    </span>
                    <span className="font-mono font-semibold text-sm text-sky-950">
                      <MathFormula latex={proc.resultWithUnits} />
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">
                    6. Interpretación física:{' '}
                  </span>
                  {proc.physicalInterpretation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
