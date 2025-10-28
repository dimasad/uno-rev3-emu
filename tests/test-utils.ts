// SPDX-License-Identifier: MIT
// Test utilities for Arduino emulator

import { AVRRunner } from '../src/execute';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface PinMode {
  pin: number;
  mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP';
  port: 'B' | 'C' | 'D';
  portPin: number;
}

// Arduino Uno pin mapping
export const PIN_MAP: PinMode[] = [
  { pin: 0, mode: 'INPUT', port: 'D', portPin: 0 },  // D0
  { pin: 1, mode: 'INPUT', port: 'D', portPin: 1 },  // D1
  { pin: 2, mode: 'INPUT', port: 'D', portPin: 2 },  // D2
  { pin: 3, mode: 'INPUT', port: 'D', portPin: 3 },  // D3
  { pin: 4, mode: 'INPUT', port: 'D', portPin: 4 },  // D4
  { pin: 5, mode: 'INPUT', port: 'D', portPin: 5 },  // D5
  { pin: 6, mode: 'INPUT', port: 'D', portPin: 6 },  // D6
  { pin: 7, mode: 'INPUT', port: 'D', portPin: 7 },  // D7
  { pin: 8, mode: 'INPUT', port: 'B', portPin: 0 },  // D8
  { pin: 9, mode: 'INPUT', port: 'B', portPin: 1 },  // D9
  { pin: 10, mode: 'INPUT', port: 'B', portPin: 2 }, // D10
  { pin: 11, mode: 'INPUT', port: 'B', portPin: 3 }, // D11
  { pin: 12, mode: 'INPUT', port: 'B', portPin: 4 }, // D12
  { pin: 13, mode: 'INPUT', port: 'B', portPin: 5 }, // D13 (LED)
  { pin: 14, mode: 'INPUT', port: 'C', portPin: 0 }, // A0
  { pin: 15, mode: 'INPUT', port: 'C', portPin: 1 }, // A1
  { pin: 16, mode: 'INPUT', port: 'C', portPin: 2 }, // A2
  { pin: 17, mode: 'INPUT', port: 'C', portPin: 3 }, // A3
  { pin: 18, mode: 'INPUT', port: 'C', portPin: 4 }, // A4 (SDA)
  { pin: 19, mode: 'INPUT', port: 'C', portPin: 5 }, // A5 (SCL)
];

export function loadHexFile(filename: string): string {
  const hexPath = join(__dirname, 'hex', filename);
  return readFileSync(hexPath, 'utf-8');
}

export function runSetup(hex: string): AVRRunner {
  const runner = new AVRRunner(hex);
  const { avrInstruction } = require('avr8js');
  
  // Run enough cycles for setup() to complete
  // Arduino programs start with bootloader, initialization, then setup()
  // We need to run until we're in loop() or past setup()
  const maxCycles = 2000000;  // Increase to 2M cycles
  const startCycles = runner.cpu.cycles;
  
  let lastPC = runner.cpu.pc;
  let stableCount = 0;
  
  while (runner.cpu.cycles - startCycles < maxCycles) {
    avrInstruction(runner.cpu);
    runner.cpu.tick();
    
    // Check if PC is stable (stuck in loop), indicating setup is complete
    if (runner.cpu.pc === lastPC) {
      stableCount++;
      if (stableCount > 1000) {
        // PC hasn't changed for 1000 cycles, setup is likely complete
        break;
      }
    } else {
      stableCount = 0;
      lastPC = runner.cpu.pc;
    }
  }
  
  return runner;
}

export function getPinMode(runner: AVRRunner, pin: number): 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP' {
  const pinInfo = PIN_MAP[pin];
  if (!pinInfo) {
    throw new Error(`Invalid pin number: ${pin}`);
  }
  
  const port = pinInfo.port === 'B' ? runner.portB : 
               pinInfo.port === 'C' ? runner.portC : runner.portD;
  
  // Access DDR and PORT registers directly from CPU data memory
  const { portBConfig, portCConfig, portDConfig } = require('avr8js');
  const portConfig = pinInfo.port === 'B' ? portBConfig :
                     pinInfo.port === 'C' ? portCConfig : portDConfig;
  
  const ddrValue = runner.cpu.data[portConfig.DDR];
  const portValue = runner.cpu.data[portConfig.PORT];
  
  const ddrBit = ddrValue & (1 << pinInfo.portPin);
  
  if (ddrBit) {
    return 'OUTPUT';
  } else {
    const portBit = portValue & (1 << pinInfo.portPin);
    return portBit ? 'INPUT_PULLUP' : 'INPUT';
  }
}
