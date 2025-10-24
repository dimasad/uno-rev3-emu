// SPDX-License-Identifier: MIT
// Arduino Uno Rev3 Emulator

import { PinState } from 'avr8js';
import { buildHex } from './compile';
import { CPUPerformance } from './cpu-performance';
import { AVRRunner } from './execute';
import { formatTime } from './format-time';
import './index.css';
import * as monaco from 'monaco-editor';

// Pin configuration for Arduino Uno Rev3
interface PinInfo {
  pin: number;
  name: string;
  mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP' | 'SERIAL' | 'PWM' | 'ANALOG';
  state: 'HIGH' | 'LOW' | 'FLOATING';
  port?: 'B' | 'C' | 'D';
  portPin?: number;
}

let editor: monaco.editor.IStandaloneCodeEditor;
let runner: AVRRunner | null = null;

// Example Arduino code - will be loaded from external file
let EXAMPLE_CODE = '';

// Initialize pin state
const pinStates: PinInfo[] = [
  // Digital pins 0-13
  { pin: 0, name: 'D0 (RX)', mode: 'SERIAL', state: 'FLOATING', port: 'D', portPin: 0 },
  { pin: 1, name: 'D1 (TX)', mode: 'SERIAL', state: 'FLOATING', port: 'D', portPin: 1 },
  { pin: 2, name: 'D2', mode: 'INPUT', state: 'LOW', port: 'D', portPin: 2 },
  { pin: 3, name: 'D3 (PWM)', mode: 'OUTPUT', state: 'LOW', port: 'D', portPin: 3 },
  { pin: 4, name: 'D4', mode: 'INPUT', state: 'LOW', port: 'D', portPin: 4 },
  { pin: 5, name: 'D5 (PWM)', mode: 'OUTPUT', state: 'LOW', port: 'D', portPin: 5 },
  { pin: 6, name: 'D6 (PWM)', mode: 'OUTPUT', state: 'LOW', port: 'D', portPin: 6 },
  { pin: 7, name: 'D7', mode: 'INPUT', state: 'LOW', port: 'D', portPin: 7 },
  { pin: 8, name: 'D8', mode: 'INPUT', state: 'LOW', port: 'B', portPin: 0 },
  { pin: 9, name: 'D9 (PWM)', mode: 'OUTPUT', state: 'LOW', port: 'B', portPin: 1 },
  { pin: 10, name: 'D10 (PWM)', mode: 'OUTPUT', state: 'LOW', port: 'B', portPin: 2 },
  { pin: 11, name: 'D11 (PWM)', mode: 'OUTPUT', state: 'LOW', port: 'B', portPin: 3 },
  { pin: 12, name: 'D12', mode: 'OUTPUT', state: 'LOW', port: 'B', portPin: 4 },
  { pin: 13, name: 'D13 (LED)', mode: 'OUTPUT', state: 'LOW', port: 'B', portPin: 5 },
  // Analog pins A0-A5
  { pin: 14, name: 'A0', mode: 'ANALOG', state: 'LOW', port: 'C', portPin: 0 },
  { pin: 15, name: 'A1', mode: 'ANALOG', state: 'LOW', port: 'C', portPin: 1 },
  { pin: 16, name: 'A2', mode: 'ANALOG', state: 'LOW', port: 'C', portPin: 2 },
  { pin: 17, name: 'A3', mode: 'ANALOG', state: 'LOW', port: 'C', portPin: 3 },
  { pin: 18, name: 'A4 (SDA)', mode: 'ANALOG', state: 'LOW', port: 'C', portPin: 4 },
  { pin: 19, name: 'A5 (SCL)', mode: 'ANALOG', state: 'LOW', port: 'C', portPin: 5 },
];

// Set up buttons and controls
const runButton = document.querySelector('#run-button') as HTMLButtonElement;
const stopButton = document.querySelector('#stop-button') as HTMLButtonElement;
const loadHexButton = document.querySelector('#load-hex-button') as HTMLButtonElement;
const hexFileInput = document.querySelector('#hex-file-input') as HTMLInputElement;
const exampleButton = document.querySelector('#example-button') as HTMLButtonElement;
const clearSerialButton = document.querySelector('#clear-serial-button') as HTMLButtonElement;
const statusLabel = document.querySelector('#status-label') as HTMLElement;
const compilerOutputText = document.querySelector('#compiler-output-text') as HTMLElement;
const serialOutputText = document.querySelector('#serial-output-text') as HTMLElement;

// Initialize pin table
function initializePinTable() {
  const tableBody = document.querySelector('#pins-table-body') as HTMLTableSectionElement;
  
  pinStates.forEach((pinInfo) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${pinInfo.name}</td>
      <td><span class="pin-mode">${pinInfo.mode}</span></td>
      <td><span class="pin-state pin-state-${pinInfo.state.toLowerCase()}">${pinInfo.state}</span></td>
      <td>
        ${pinInfo.mode === 'INPUT' || pinInfo.mode === 'INPUT_PULLUP' 
          ? `<button class="pin-toggle" data-pin="${pinInfo.pin}">Toggle</button>` 
          : '-'
        }
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Add event listeners to toggle buttons
  document.querySelectorAll('.pin-toggle').forEach(button => {
    button.addEventListener('click', (e) => {
      const pinNumber = parseInt((e.target as HTMLElement).dataset.pin || '0');
      togglePin(pinNumber);
    });
  });
}

// Toggle pin state for input pins
function togglePin(pinNumber: number) {
  const pinInfo = pinStates.find(p => p.pin === pinNumber);
  if (!pinInfo || (pinInfo.mode !== 'INPUT' && pinInfo.mode !== 'INPUT_PULLUP')) {
    return;
  }

  pinInfo.state = pinInfo.state === 'HIGH' ? 'LOW' : 'HIGH';
  updatePinDisplay(pinNumber);
  
  // If emulator is running, update the actual pin state
  if (runner && pinInfo.port && pinInfo.portPin !== undefined) {
    const port = pinInfo.port === 'B' ? runner.portB : 
                 pinInfo.port === 'C' ? runner.portC : runner.portD;
    
    // Simulate external input by setting the pin register
    if (pinInfo.state === 'HIGH') {
      port.setPin(pinInfo.portPin, true);
    } else {
      port.setPin(pinInfo.portPin, false);
    }
  }
}

// Update pin display in table
function updatePinDisplay(pinNumber: number) {
  const pinInfo = pinStates.find(p => p.pin === pinNumber);
  if (!pinInfo) return;

  const rows = document.querySelectorAll('#pins-table-body tr');
  const row = rows[pinNumber];
  if (row) {
    const stateCell = row.querySelector('.pin-state') as HTMLElement;
    const modeCell = row.querySelector('.pin-mode') as HTMLElement;
    
    if (stateCell) {
      stateCell.textContent = pinInfo.state;
      stateCell.className = `pin-state pin-state-${pinInfo.state.toLowerCase()}`;
    }
    
    if (modeCell) {
      modeCell.textContent = pinInfo.mode;
    }
  }
}

// Execute the compiled program
function executeProgram(hex: string) {
  runner = new AVRRunner(hex);
  const MHZ = 16000000;

  // Hook to port registers to update pin states
  runner.portB.addListener(() => {
    updatePortPins('B', runner!.portB);
  });
  
  runner.portC.addListener(() => {
    updatePortPins('C', runner!.portC);
  });
  
  runner.portD.addListener(() => {
    updatePortPins('D', runner!.portD);
  });

  // Handle serial output
  runner.usart.onByteTransmit = (value) => {
    serialOutputText.textContent += String.fromCharCode(value);
    serialOutputText.scrollTop = serialOutputText.scrollHeight;
  };

  const cpuPerf = new CPUPerformance(runner.cpu, MHZ);
  runner.execute((cpu) => {
    const time = formatTime(cpu.cycles / MHZ);
    const speed = (cpuPerf.update() * 100).toFixed(0);
    statusLabel.textContent = `Simulation time: ${time} (${speed}%)`;
  });
}

// Update pin states from port changes
function updatePortPins(port: 'B' | 'C' | 'D', portObj: any) {
  pinStates.forEach((pinInfo, index) => {
    if (pinInfo.port === port && pinInfo.portPin !== undefined) {
      const pinState = portObj.pinState(pinInfo.portPin);
      
      // Update pin mode based on DDR register
      const ddrBit = portObj.ddr & (1 << pinInfo.portPin);
      if (ddrBit) {
        pinInfo.mode = pinInfo.name.includes('PWM') ? 'PWM' : 'OUTPUT';
      } else {
        const portBit = portObj.portValue & (1 << pinInfo.portPin);
        pinInfo.mode = portBit ? 'INPUT_PULLUP' : 'INPUT';
      }
      
      // Update pin state
      pinInfo.state = pinState === PinState.High ? 'HIGH' : 'LOW';
      
      updatePinDisplay(index);
    }
  });
}

// Compile and run the code
async function compileAndRun() {
  runButton.disabled = true;
  exampleButton.disabled = true;

  serialOutputText.textContent = '';
  compilerOutputText.textContent = '';
  
  try {
    const code = editor.getValue();
    
    // Check if code matches the default example
    if (code.trim() === EXAMPLE_CODE.trim()) {
      statusLabel.textContent = 'Loading precompiled example...';
      try {
        const response = await fetch('example.hex');
        if (response.ok) {
          const hex = await response.text();
          compilerOutputText.textContent = 'Using precompiled HEX file\nProgram running...';
          stopButton.disabled = false;
          executeProgram(hex);
          return;
        }
      } catch (err) {
        console.warn('Failed to load precompiled HEX, falling back to compilation:', err);
      }
    }
    
    // Compile using hexi.wokwi.com
    statusLabel.textContent = 'Compiling...';
    const result = await buildHex(code);
    compilerOutputText.textContent = result.stderr || result.stdout;
    
    if (result.hex) {
      compilerOutputText.textContent += '\nProgram running...';
      stopButton.disabled = false;
      executeProgram(result.hex);
    } else {
      runButton.disabled = false;
      exampleButton.disabled = false;
    }
  } catch (err) {
    runButton.disabled = false;
    exampleButton.disabled = false;
    alert('Failed: ' + err);
  } finally {
    if (!runner) {
      statusLabel.textContent = '';
    }
  }
}

// Stop the running program
function stopCode() {
  stopButton.disabled = true;
  runButton.disabled = false;
  exampleButton.disabled = false;
  
  if (runner) {
    runner.stop();
    runner = null;
  }
  
  statusLabel.textContent = 'Stopped';
}

// Load example code
function loadExample() {
  editor.setValue(EXAMPLE_CODE);
}

// Load HEX file
function loadHexFile() {
  hexFileInput.click();
}

// Handle HEX file selection
function handleHexFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const hex = e.target?.result as string;
    if (hex) {
      stopCode();
      compilerOutputText.textContent = 'Loading HEX file...';
      stopButton.disabled = false;
      executeProgram(hex);
    }
  };
  reader.readAsText(file);
}

// Clear serial output
function clearSerial() {
  serialOutputText.textContent = '';
}

// Event listeners
runButton.addEventListener('click', compileAndRun);
stopButton.addEventListener('click', stopCode);
loadHexButton.addEventListener('click', loadHexFile);
hexFileInput.addEventListener('change', handleHexFile);
exampleButton.addEventListener('click', loadExample);
clearSerialButton.addEventListener('click', clearSerial);

// Load example code from external file
async function loadExampleCode() {
  try {
    const response = await fetch('example.ino');
    if (response.ok) {
      EXAMPLE_CODE = await response.text();
    }
  } catch (err) {
    console.error('Failed to load example code:', err);
    // Fallback to inline code if file can't be loaded
    EXAMPLE_CODE = `// Arduino Uno Rev3 Example
// Blink the built-in LED and send serial messages

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  pinMode(3, OUTPUT);
  Serial.println("Arduino Uno Rev3 Emulator Started!");
}

void loop() {
  // Read digital pin 2
  int buttonState = digitalRead(2);
  
  // Blink LED
  digitalWrite(LED_BUILTIN, HIGH);
  digitalWrite(3, HIGH);
  Serial.print("LED ON, Button: ");
  Serial.println(buttonState);
  delay(500);
  
  digitalWrite(LED_BUILTIN, LOW);
  digitalWrite(3, LOW);
  Serial.print("LED OFF, Button: ");
  Serial.println(buttonState);
  delay(500);
}`;
  }
}

// Initialize the application
async function initializeApp() {
  // Load example code first
  await loadExampleCode();
  
  // Initialize Monaco Editor
  editor = monaco.editor.create(document.querySelector('.code-editor')!, {
    value: EXAMPLE_CODE,
    language: 'cpp',
    minimap: { enabled: false },
    theme: 'vs',
  });

  initializePinTable();
  statusLabel.textContent = 'Ready';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}