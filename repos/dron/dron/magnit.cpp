#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_HMC5883_U.h>

Adafruit_HMC5883_Unified mag = Adafruit_HMC5883_Unified(12345);

void setup() {
    Serial.begin(9600);

    if (!mag.begin()) {
        Serial.println("Не удалось найти магнитометр!");
        while (1);
    }
}

void loop() {
    sensors_event_t event;
    mag.getEvent(&event);

    // Выводим значения по осям (в микротеслах, µT)
    Serial.print("X: "); Serial.print(event.magnetic.x); Serial.println(" µT");
    Serial.print("Y: "); Serial.print(event.magnetic.y); Serial.println(" µT");
    Serial.print("Z: "); Serial.print(event.magnetic.z); Serial.println(" µT");

    delay(500);
}