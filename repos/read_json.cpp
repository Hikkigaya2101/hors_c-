#include <jsoncpp/json/json.h>
#include <fstream>
#include <iostream>

int main() {
    // Открываем JSON файл
    std::ifstream file("data.json");
    if (!file.is_open()) {
        std::cerr << "Ошибка открытия файла!" << std::endl;
        return 1;
    }

    Json::Value data;
    Json::CharReaderBuilder builder;
    std::string errors;

    // Парсим JSON
    Json::parseFromStream(builder, file, &data, &errors);
    file.close();

    // Проверяем на ошибки
    if (!errors.empty()) {
        std::cerr << "Ошибки при парсинге: " << errors << std::endl;
        return 1;
    }

    // Доступ к данным
    std::string name = data["name"].asString();
    int age = data["age"].asInt();
    bool isStudent = data["isStudent"].asBool();

    std::cout << "Имя: " << name << std::endl;
    std::cout << "Возраст: " << age << std::endl;
    std::cout << "Студент: " << (isStudent ? "Да" : "Нет") << std::endl;

    // Работа с вложенными объектами
    std::string city = data["address"]["city"].asString();
    std::cout << "Город: " << city << std::endl;

    // Работа с массивами
    const Json::Value& courses = data["courses"];
    std::cout << "Курсы: ";
    for (int i = 0; i < courses.size(); ++i) {
        std::cout << courses[i].asString() << " ";
    }
    std::cout << std::endl;

    return 0;
}
