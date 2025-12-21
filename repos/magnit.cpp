#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_HMC5883_U.h>

// Инициализация магнитометра
Adafruit_HMC5883_Unified mag = Adafruit_HMC5883_Unified();

void setup() {
    Serial.begin(9600);

    // Инициализация I2C
    if (!mag.begin()) {
        Serial.println("Could not find a valid magnetometer, check wiring!");
        while (1);
    }

    // Настройка магнитометра
    mag.setRange(Adafruit_HMC5883_Unified::RANGE_1_3GA);
    mag.setDataRate(Adafruit_HMC5883_Unified::DATARATE_15HZ);
}

void loop() {
    sensors_event_t event;

    // Получение данных с магнитометра
    mag.getEvent(&event);

    // Проверка на валидность данных
    if (event.is_updated) {
        Serial.print("X: "); Serial.print(event.magnetic.x);
        Serial.print(" Y: "); Serial.print(event.magnetic.y);
        Serial.print(" Z: "); Serial.print(event.magnetic.z);
        Serial.println(" uT");
    }

    delay(100);
}
