/**
 * Suppress harmless deprecation and precision warnings from Three.js
 * These warnings don't affect functionality but clutter the console
 */
export function suppressThreeJsWarnings() {
  if (typeof window === 'undefined') return;

  const originalWarn = console.warn;
  const warningsToSuppress = [
    'THREE.THREE.Clock: This module has been deprecated', // THREE.Clock deprecation
    'THREE.WebGLProgram: Program Info Log', // Shader floating-point precision warnings
    'WebGLProgram: Unsupported', // WebGL program warnings
  ];

  console.warn = function (...args: any[]) {
    const message = args
      .map((arg) => (typeof arg === 'string' ? arg : ''))
      .join(' ');

    // Only suppress specific Three.js warnings
    const shouldSuppress = warningsToSuppress.some((warning) =>
      message.includes(warning)
    );

    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };
}
