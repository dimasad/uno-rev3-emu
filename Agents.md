# Agent Instructions

This document provides instructions for AI agents working on this project.

## Testing

This project uses Vitest for testing. Tests are located in the `tests/` directory.

### Running Tests

To run all tests:
```bash
npm test
```

To run tests in watch mode during development:
```bash
npm run test:watch
```

To run tests with UI:
```bash
npm run test:ui
```

### Test Structure

The project includes comprehensive pin mode detection tests in `tests/pin-modes.test.ts`. These tests verify that:
- All digital pins (D0-D13) correctly report their mode (INPUT, OUTPUT, INPUT_PULLUP)
- All analog pins (A0-A5) correctly report their mode
- PWM pins correctly report OUTPUT mode after `analogWrite()`
- Analog pins maintain INPUT mode after `analogRead()`
- Serial (UART) pins are properly configured after `Serial.begin()`
- I2C pins are properly configured after `Wire.begin()`

### Test Sketches

Test sketches are Arduino `.ino` files located in `tests/sketches/`. Each sketch tests a specific pin configuration.

### Compiling Test Sketches

Test sketches must be compiled to HEX files before running tests. To compile all test sketches:

1. Install Arduino CLI:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
   export PATH="$PATH:./bin"
   ```

2. Setup Arduino CLI:
   ```bash
   arduino-cli config init
   arduino-cli core update-index
   arduino-cli core install arduino:avr
   ```

3. Compile sketches:
   ```bash
   chmod +x tests/compile-sketches.sh
   ./tests/compile-sketches.sh
   ```

The compiled HEX files are saved in `tests/hex/` and are excluded from version control (they're regenerated as needed).

### Before Completing a Pull Request

Agents must ensure all tests pass before wrapping up a pull request:

1. Compile test sketches (if not already compiled)
2. Run `npm test` and verify all tests pass
3. Run `npm run build` to ensure the project builds successfully
4. Review test output for any warnings or errors

## Building

To build the project for production:
```bash
npm run build
```

The built files will be in the `dist/` directory.

## Development

To start the development server:
```bash
npm start
```

This will start Vite's development server at `http://localhost:3000`.
