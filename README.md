# Laboratorio Virtual de Circuitos DC — UTPL

Laboratorio virtual interactivo de análisis, simulación y decisiones técnicas en circuitos eléctricos DC para la asignatura **Circuitos Eléctricos** (Semana 1) de la carrera de **Redes y Analítica de Datos** de la **Universidad Técnica Particular de Loja (UTPL)**.

## Módulos del Laboratorio

1. **Módulo 01 · Circuitos Resistivos en Serie:** Trayectoria única, Ley de Ohm, división proporcional de tensión, potencia, carga y energía.
2. **Módulo 02 · Circuitos Resistivos en Paralelo:** Tensión común de nodos, aditividad de conductancias, división inversa de corriente y control independiente de ramas.
3. **Módulo 03 · Circuitos Resistivos Mixtos:** Reducción topológica progresiva guiada en 3 etapas (`R1, R2, R3` → `R1 + R23` → `Req`) y balance energético bajo la convención pasiva de signos.
4. **Módulo 04 · Ingeniería de Red (Alimentación DC):** Evaluación de caída de tensión en conductores (`Rcond`), capacidad nominal de fuente (`Imáx`), tensión mínima operativa en cargas (`Vmín`) y diagnóstico de fallas.

Incluye además un **Multímetro Digital Virtual** (`V DC` / `A DC`), **Desarrollo Matemático Paso a Paso** con KaTeX, **Simulador de Resistividad y Conductancia** y **Suite de Validación Automatizada (Casos 1 a 6)**.

## Requisitos Previos

- **Node.js** (v20 o superior recomendado)

## Ejecución Local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Abrir en el navegador:
   ```text
   http://localhost:3000
   ```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor local de desarrollo en el puerto `3000`.
- `npm run build`: Genera la versión optimizada de producción en la carpeta `dist/`.
- `npm run preview`: Previsualiza localmente la compilación de producción.
- `npm run lint`: Verifica el tipado estático con TypeScript (`tsc --noEmit`).
