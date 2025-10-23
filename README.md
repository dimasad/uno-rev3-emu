# Arduino Uno Rev3 Emulator

Simple emulator for the Arduino Uno Rev3 microcontroller board built with avr8js library.

## Features

- **Pin State Table**: Shows all Arduino Uno pins (Digital D0-D13, Analog A0-A5) with their current mode and state
- **Interactive Pin Control**: Toggle buttons for input pins to simulate external inputs
- **Serial Monitor**: Real-time serial output from the emulated Arduino
- **Code Editor**: Built-in code editor with Arduino C++ syntax support
- **Compilation Support**: Compile Arduino sketches using https://hexi.wokwi.com
- **HEX File Loading**: Load and run pre-compiled HEX files

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open http://localhost:3000 in your web browser

## Usage

### Running Code
1. Write or edit Arduino code in the code editor
2. Click "Run" to compile and execute the code
3. Watch the pin states update in real-time
4. Monitor serial output in the Serial Monitor section

### Pin Interaction
- **Input Pins**: Use toggle buttons to simulate HIGH/LOW input signals
- **Output Pins**: Watch their states change as your code executes
- **Special Pins**: 
  - D0/D1: Serial communication (RX/TX)
  - D3,D5,D6,D9,D10,D11: PWM capable pins
  - D13: Built-in LED (visual indicator provided)
  - A0-A5: Analog input pins

### Loading HEX Files
1. Click "Load HEX File" button
2. Select a compiled HEX file from your computer
3. The emulator will immediately start running the loaded program

### Example Code
Click "Load Example" to load a sample Arduino sketch that demonstrates:
- Serial communication
- Digital I/O operations
- Built-in LED blinking
- Reading input pin states

## Arduino Uno Pin Configuration

| Pin | Name | Type | Description |
|-----|------|------|-------------|
| D0 | RX | Serial | Serial receive |
| D1 | TX | Serial | Serial transmit |
| D2-D12 | Digital | I/O | General purpose digital pins |
| D3,D5,D6,D9,D10,D11 | PWM | Output | PWM capable pins |
| D13 | LED | Output | Built-in LED pin |
| A0-A5 | Analog | Input | Analog input pins |

## Technical Details

- **Microcontroller**: ATmega328P simulation
- **Clock Speed**: 16 MHz
- **Flash Memory**: 32KB (simulated)
- **Architecture**: AVR 8-bit
- **Libraries**: Built on avr8js and @wokwi/elements

## Build

To build for production:
```bash
npm run build
```

## Browser Compatibility

- Modern browsers with ES2020 support
- Works best in Chrome, Firefox, Safari, and Edge
- Requires JavaScript enabled

## External Dependencies

- **hexi.wokwi.com**: For Arduino code compilation (requires internet connection)
- **Monaco Editor**: For enhanced code editing experience
- **Google Fonts**: For improved typography

Note: The application includes fallbacks for when external services are unavailable.
