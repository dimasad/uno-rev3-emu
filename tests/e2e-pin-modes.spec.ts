// SPDX-License-Identifier: MIT
// End-to-end tests for pin mode display in web interface

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use the precompiled example.hex file
const EXAMPLE_HEX_PATH = join(__dirname, '../public/example.hex');

test.describe('Web Interface Pin Mode Display', () => {
  test('should display correct pin modes after loading example.hex', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000/uno-rev3-emu/');
    
    // Wait for the page to load
    await page.waitForSelector('#pins-table-body');
    
    // Load the example HEX file programmatically
    const hexContent = readFileSync(EXAMPLE_HEX_PATH, 'utf-8');
    
    // Inject the hex file into the file input
    await page.evaluate((hex) => {
      const dataTransfer = new DataTransfer();
      const file = new File([hex], 'example.hex', { type: 'text/plain' });
      dataTransfer.items.add(file);
      const input = document.querySelector('#hex-file-input') as HTMLInputElement;
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, hexContent);
    
    // Wait for the program to start executing
    await page.waitForTimeout(2000);
    
    // Check pin modes in the table
    // The example code configures:
    // - D0 (RX): Used by Serial (should remain INPUT or show serial mode)
    // - D1 (TX): Used by Serial (should be OUTPUT for TX)
    // - D2: INPUT_PULLUP
    // - D3: OUTPUT
    // - D13 (LED_BUILTIN): OUTPUT
    
    // Get all rows in the pin table
    const rows = await page.locator('#pins-table-body tr').all();
    
    // Helper function to get pin mode from a row
    const getPinMode = async (rowIndex: number) => {
      const modeCell = await rows[rowIndex].locator('.pin-mode').textContent();
      return modeCell?.trim();
    };
    
    // Take a screenshot before checking
    await page.screenshot({ path: '/tmp/pins-before-check.png', fullPage: true });
    
    // Log all pin modes for debugging
    console.log('Pin modes:');
    for (let i = 0; i < Math.min(rows.length, 20); i++) {
      const name = await rows[i].locator('td:first-child').textContent();
      const mode = await getPinMode(i);
      console.log(`  ${name}: ${mode}`);
    }
    
    // Check specific pins that should be configured
    const d2Mode = await getPinMode(2); // D2
    const d3Mode = await getPinMode(3); // D3
    const d13Mode = await getPinMode(13); // D13
    
    console.log(`D2 mode: ${d2Mode}, D3 mode: ${d3Mode}, D13 mode: ${d13Mode}`);
    
    // Verify the modes match the sketch configuration
    expect(d2Mode).toBe('INPUT_PULLUP');
    expect(d3Mode).toBe('OUTPUT');
    expect(d13Mode).toBe('OUTPUT');
  });
  
  test('should update pin modes when running code', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000/uno-rev3-emu/');
    
    // Wait for the page to load
    await page.waitForSelector('#run-button');
    
    // Initially, all pins should show INPUT mode
    const initialMode = await page.locator('#pins-table-body tr').first().locator('.pin-mode').textContent();
    console.log(`Initial mode of first pin: ${initialMode}`);
    
    // Click the Run button to execute the example code
    await page.click('#run-button');
    
    // Wait for compilation and execution
    await page.waitForTimeout(5000);
    
    // Take a screenshot after running
    await page.screenshot({ path: '/tmp/pins-after-run.png', fullPage: true });
    
    // Check that pin modes have been updated
    const d13Mode = await page.locator('#pins-table-body tr').nth(13).locator('.pin-mode').textContent();
    console.log(`D13 mode after run: ${d13Mode}`);
    
    // D13 should be OUTPUT after the example code runs
    expect(d13Mode?.trim()).toBe('OUTPUT');
  });
});
