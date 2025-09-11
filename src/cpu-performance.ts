// SPDX-License-Identifier: MIT
// Adapted from avr8js demo

import { CPU } from 'avr8js';

export class CPUPerformance {
  private prevTime = 0;
  private prevCycles = 0;

  constructor(private cpu: CPU, private mhz: number) {
    this.prevTime = performance.now();
    this.prevCycles = cpu.cycles;
  }

  update() {
    const now = performance.now();
    const timeDelta = now - this.prevTime;
    const cyclesDelta = this.cpu.cycles - this.prevCycles;
    const expectedCycles = (timeDelta * this.mhz) / 1000;
    this.prevTime = now;
    this.prevCycles = this.cpu.cycles;
    return cyclesDelta / expectedCycles;
  }
}