// SPDX-License-Identifier: MIT
// Adapted from avr8js demo

export function formatTime(seconds: number) {
  if (seconds < 1e-6) {
    return (seconds * 1e9).toFixed(0) + 'ns';
  }
  if (seconds < 1e-3) {
    return (seconds * 1e6).toFixed(0) + 'μs';
  }
  if (seconds < 1) {
    return (seconds * 1e3).toFixed(0) + 'ms';
  }
  return seconds.toFixed(2) + 's';
}