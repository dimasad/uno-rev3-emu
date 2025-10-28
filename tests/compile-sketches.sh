#!/bin/bash

# Script to compile all test sketches and save HEX files
# This speeds up test execution by pre-compiling all sketches

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SKETCH_DIR="${SCRIPT_DIR}/sketches"
HEX_DIR="${SCRIPT_DIR}/hex"
ARDUINO_CLI="${SCRIPT_DIR}/../bin/arduino-cli"

# Create hex directory if it doesn't exist
mkdir -p "${HEX_DIR}"

echo "Compiling test sketches..."

# Function to compile a sketch
compile_sketch() {
    local sketch_path=$1
    local sketch_name=$(basename "$sketch_path" .ino)
    local sketch_dir=$(dirname "$sketch_path")
    local hex_output="${HEX_DIR}/${sketch_name}.hex"
    
    echo "Compiling ${sketch_name}..."
    
    # Compile the sketch
    ${ARDUINO_CLI} compile --fqbn arduino:avr:uno "${sketch_dir}" --output-dir "${HEX_DIR}/build_${sketch_name}" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        # Copy the generated HEX file
        cp "${HEX_DIR}/build_${sketch_name}/${sketch_name}.ino.hex" "${hex_output}"
        # Clean up build directory
        rm -rf "${HEX_DIR}/build_${sketch_name}"
        echo "  ✓ ${sketch_name}.hex"
    else
        echo "  ✗ Failed to compile ${sketch_name}"
        return 1
    fi
}

# Find and compile all sketches
find "${SKETCH_DIR}" -name "*.ino" | while read sketch; do
    compile_sketch "$sketch"
done

echo "Done! HEX files saved to ${HEX_DIR}"
