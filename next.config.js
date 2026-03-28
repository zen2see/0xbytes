/** @type {import('next').NextConfig} */
const nextConfig = {
  // turbopack configuration moved outside experimental
  turbopack: {
    root: '/home/mavix/DEV/0xbytes', // Explicitly set Turbopack root
  },
};

module.exports = nextConfig;

// Known Warnings:
// [browser] Image with src "http://localhost:3000/next.svg" has either width or height modified...
// [browser] THREE.THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.
// These are browser warnings from underlying libraries and are informational.
