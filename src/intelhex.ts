// SPDX-License-Identifier: MIT
// Adapted from avr8js demo

export function loadHex(source: string, target: Uint8Array) {
  const lines = source.split('\n');
  for (const line of lines) {
    if (line[0] === ':') {
      const bytes = parseInt(line.substr(1, 2), 16);
      const addr = parseInt(line.substr(3, 4), 16);
      const type = parseInt(line.substr(7, 2), 16);
      if (type === 0) {
        for (let i = 0; i < bytes; i++) {
          target[addr + i] = parseInt(line.substr(9 + i * 2, 2), 16);
        }
      }
    }
  }
}