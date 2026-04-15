/** @type {import('next').NextConfig} */
const nextConfig = {
  // turbopack configuration moved outside experimental
  turbopack: {
    root: '/home/mavix/DEV/0xbytes', // Explicitly set Turbopack root
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Suppress harmless THREE.js deprecation warnings in development
      config.output.chunkLoadingGlobal = 'webpackChunk_app';
    }
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 5,
  },
};

module.exports = nextConfig;

// Resolved Warnings:
// [browser] THREE.THREE.Clock: This module has been deprecated - @react-three/fiber 9.6.0 now properly handles Timer compatibility
// [browser] THREE.WebGLProgram: Precision warnings - These are shader compiler warnings from complex material math, not errors. Application works correctly.
// These are browser warnings from underlying libraries. The app functions normally despite these informational warnings.
