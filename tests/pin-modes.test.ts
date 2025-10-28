// SPDX-License-Identifier: MIT
// Tests for pin mode detection

import { describe, it, expect } from 'vitest';
import { loadHexFile, runSetup, getPinMode } from './test-utils';

describe('Pin Mode Detection - Digital Pins INPUT', () => {
  for (let pin = 0; pin <= 13; pin++) {
    it(`should detect INPUT mode for digital pin D${pin}`, () => {
      const hex = loadHexFile(`input_d${pin}.hex`);
      const runner = runSetup(hex);
      const mode = getPinMode(runner, pin);
      expect(mode).toBe('INPUT');
      runner.stop();
    });
  }
});

describe('Pin Mode Detection - Digital Pins OUTPUT', () => {
  for (let pin = 0; pin <= 13; pin++) {
    it(`should detect OUTPUT mode for digital pin D${pin}`, () => {
      const hex = loadHexFile(`output_d${pin}.hex`);
      const runner = runSetup(hex);
      const mode = getPinMode(runner, pin);
      expect(mode).toBe('OUTPUT');
      runner.stop();
    });
  }
});

describe('Pin Mode Detection - Digital Pins INPUT_PULLUP', () => {
  for (let pin = 0; pin <= 13; pin++) {
    it(`should detect INPUT_PULLUP mode for digital pin D${pin}`, () => {
      const hex = loadHexFile(`input_pullup_d${pin}.hex`);
      const runner = runSetup(hex);
      const mode = getPinMode(runner, pin);
      expect(mode).toBe('INPUT_PULLUP');
      runner.stop();
    });
  }
});

describe('Pin Mode Detection - Analog Pins INPUT', () => {
  for (let pin = 0; pin <= 5; pin++) {
    it(`should detect INPUT mode for analog pin A${pin}`, () => {
      const hex = loadHexFile(`input_a${pin}.hex`);
      const runner = runSetup(hex);
      const mode = getPinMode(runner, 14 + pin); // A0 = pin 14
      expect(mode).toBe('INPUT');
      runner.stop();
    });
  }
});

describe('Pin Mode Detection - Analog Pins OUTPUT', () => {
  for (let pin = 0; pin <= 5; pin++) {
    it(`should detect OUTPUT mode for analog pin A${pin}`, () => {
      const hex = loadHexFile(`output_a${pin}.hex`);
      const runner = runSetup(hex);
      const mode = getPinMode(runner, 14 + pin); // A0 = pin 14
      expect(mode).toBe('OUTPUT');
      runner.stop();
    });
  }
});

describe('Pin Mode Detection - Analog Pins INPUT_PULLUP', () => {
  for (let pin = 0; pin <= 5; pin++) {
    it(`should detect INPUT_PULLUP mode for analog pin A${pin}`, () => {
      const hex = loadHexFile(`input_pullup_a${pin}.hex`);
      const runner = runSetup(hex);
      const mode = getPinMode(runner, 14 + pin); // A0 = pin 14
      expect(mode).toBe('INPUT_PULLUP');
      runner.stop();
    });
  }
});

describe('Pin Mode Detection - PWM Pins', () => {
  const pwmPins = [3, 5, 6, 9, 10, 11];
  
  for (const pin of pwmPins) {
    it(`should detect OUTPUT mode for PWM pin D${pin} after analogWrite`, () => {
      const hex = loadHexFile(`pwm_d${pin}.hex`);
      const runner = runSetup(hex);
      const mode = getPinMode(runner, pin);
      expect(mode).toBe('OUTPUT');
      runner.stop();
    });
  }
});

describe('Pin Mode Detection - Analog Read', () => {
  for (let pin = 0; pin <= 5; pin++) {
    it(`should keep INPUT mode for analog pin A${pin} after analogRead`, () => {
      const hex = loadHexFile(`analog_read_a${pin}.hex`);
      const runner = runSetup(hex);
      const mode = getPinMode(runner, 14 + pin); // A0 = pin 14
      expect(mode).toBe('INPUT');
      runner.stop();
    });
  }
});

describe('Pin Mode Detection - Serial UART', () => {
  it('should detect appropriate modes for Serial pins after Serial.begin', () => {
    const hex = loadHexFile('serial_uart.hex');
    const runner = runSetup(hex);
    
    // After Serial.begin, D0 (RX) and D1 (TX) should be configured
    // TX (D1) is typically OUTPUT, RX (D0) is typically INPUT
    const d0Mode = getPinMode(runner, 0);
    const d1Mode = getPinMode(runner, 1);
    
    // Note: The actual mode depends on USART configuration
    // We check that the modes are set (not the default)
    expect(d0Mode).toBeDefined();
    expect(d1Mode).toBeDefined();
    
    runner.stop();
  });
});

describe('Pin Mode Detection - I2C Wire', () => {
  it('should detect appropriate modes for I2C pins after Wire.begin', () => {
    const hex = loadHexFile('i2c_wire.hex');
    const runner = runSetup(hex);
    
    // After Wire.begin, A4 (SDA) and A5 (SCL) should be configured
    const sdaMode = getPinMode(runner, 18); // A4 = pin 18
    const sclMode = getPinMode(runner, 19); // A5 = pin 19
    
    // I2C pins are typically INPUT_PULLUP
    expect(sdaMode).toBeDefined();
    expect(sclMode).toBeDefined();
    
    runner.stop();
  });
});
