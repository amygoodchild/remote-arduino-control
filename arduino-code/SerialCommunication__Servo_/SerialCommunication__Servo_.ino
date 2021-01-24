#define SENSOR_PIN   A0
#define OUTPUT_PIN   9 //choose a pin for analog output (use a PWM pin)

#include <Servo.h>
Servo myservo;  // create servo object to control a servo
int val = 0;

void setup() {
  // initialize the serial communication:
  Serial.begin(9600);

  // Initialise the pins
  pinMode(SENSOR_PIN, INPUT);
  // pinMode(OUTPUT_PIN, OUTPUT);

  // Turn the output off
  analogWrite(OUTPUT_PIN, 0);

  myservo.attach(9);  // attaches the servo on pin 9 to the servo object
}

void loop() {

  // Take reading from the sensor
  int reading = analogRead(SENSOR_PIN);
  reading = map(reading, 0, 1023, 0, 255); //make sure the full range of the sensor is scaled to 0~255 so we can send it as a single byte
  
  // Send it to the serial connection
  Serial.write(reading);

  // check if data has been received from the serial connection:
  if (Serial.available() > 0) {

    // take the reading from online
    val = Serial.read();
    // sets the servo position according to the scaled value
    val = map(val, 0, 255, 0, 180);     // scale it to use it with the servo (value between 0 and 180)
    myservo.write(val);
  }

  delay(15); //give the servo a breather

}
