// Arduino Uno Rev3 Example
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
}
