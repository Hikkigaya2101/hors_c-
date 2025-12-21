#include <iostream>
#include <vector>
#include <cmath>
#include <string>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_HMC5883_U.h>

Adafruit_HMC5883_Unified mag = Adafruit_HMC5883_Unified(12345);


using namespace std;


int double_point(int N, int Angle1, int Angle2, float x1, float x2, float y1, float y2) {
    N = 54;Angle1 = 150;Angle2 = 80;y1 = 38.043579;x2 = 54.885046;y2 = 38.099651;

    int AzA = N + Angle1;
    int AzB = N + Angle2;


    float AzArad = AzA / 180 * 3.14159265;
    float AzBrad = AzB / 180 * 3.14159265;

    float coordinate_x = (tan(AzArad) * x1 - y1 - tan(AzBrad) * x2 + y2) / (tan(AzArad) - tan(AzBrad));
    float coordinate_y = tan(AzArad) * coordinate_x - tan(AzArad) * x1 + y1;
    return 0;
}

int three_point() {
    double N = 0.0;
    double Angle1 = 30.0, Angle2 = 45.0, Angle3 = 60.0;
    double x1 = 1.0, y1 = 2.0;
    double x2 = 3.0, y2 = 4.0;
    double x3 = 5.0, y3 = 6.0;

    // Шаг 1: вычисление AzA, AzB, AzC
    double AzA = N + Angle1;
    double AzB = N + Angle2;
    double AzC = N + Angle3;

    // Шаг 2: перевод в радианы
    const double PI = 3.14159265358979323846;
    double AzArad = AzA / 180.0 * PI;
    double AzBrad = AzB / 180.0 * PI;
    double AzCrad = AzC / 180.0 * PI;

    // Шаг 3: вычисление тангенсов
    double a1 = std::tan(AzArad);
    double a2 = std::tan(AzBrad);
    double a3 = std::tan(AzCrad);

    // Шаг 4: инициализация b1, b2, b3
    double b1 = -1.0;
    double b2 = -1.0;
    double b3 = -1.0;

    // Шаг 5: вычисление c1, c2, c3
    double c1 = y1 - std::tan(AzArad) * x1;
    double c2 = y2 - std::tan(AzBrad) * x2;
    double c3 = y3 - std::tan(AzCrad) * x3;


    // Шаг 6: вычисление M1, M2, M3
    double M1 = (std::pow(a1, 2) / (std::pow(a1, 2) + std::pow(b1, 2))) +
        (std::pow(a2, 2) / (std::pow(a2, 2) + std::pow(b2, 2))) +
        (std::pow(a3, 2) / (std::pow(a3, 2) + std::pow(b3, 2)));

    double M2 = (a1 * b1) / (std::pow(a1, 2) + std::pow(b1, 2)) +
        (a2 * b2) / (std::pow(a2, 2) + std::pow(b2, 2)) +
        (a3 * b3) / (std::pow(a3, 2) + std::pow(b3, 2));


    double M3 = (std::pow(b1, 2) / (std::pow(a1, 2) + std::pow(b1, 2))) +
        (std::pow(b2, 2) / (std::pow(a2, 2) + std::pow(b2, 2))) +
        (std::pow(b3, 2) / (std::pow(a3, 2) + std::pow(b3, 2)));


    // Шаг 7: создание матрицы A (вектор векторов)
    std::vector<std::vector<double>> A = {
        {M1, M2},
        {M2, M3}
    };

    // Шаг 8: вычисление векторов vektor_1 и vektor_2
    double vektor_1 = (a1 * c1) / (std::pow(a1, 2) + std::pow(b1, 2)) +
        (a2 * c2) / (std::pow(a2, 2) + std::pow(b2, 2)) +
        (a3 * c3) / (std::pow(a3, 2) + std::pow(b3, 2));


    double vektor_2 = (b1 * c1) / (std::pow(a1, 2) + std::pow(b1, 2)) +
        (b2 * c2) / (std::pow(a2, 2) + std::pow(b2, 2)) +
        (b3 * c3) / (std::pow(a3, 2) + std::pow(b3, 2));


    // Вывод результатов (для проверки)
    std::cout << "M1 = " << M1 << std::endl;
    std::cout << "M2 = " << M2 << std::endl;
    std::cout << "M3 = " << M3 << std::endl;

    std::cout << "vektor_1 = " << vektor_1 << std::endl;
    std::cout << "vektor_2 = " << vektor_2 << std::endl;


    std::cout << "Матрица A:" << std::endl;
    for (const auto& row : A) {
        for (double val : row) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }

    return 0;
}



int main() {
    // Объявляем векторы для хранения данных
    vector<int> ARFCN;
    vector<int> BSIC;
    vector<int> MCC;
    vector<int> MNC;
    vector<int> RXLEV;
    vector<int> LAC;
    vector<int> Cell_Id;
    vector<long long> F_mod;  // частота может быть большой, используем long long
    vector<double> D;
    vector<double> E;

    // Собираем таблицу (вектор векторов) — аналог table_1
    vector<vector<long long>> table_1 = {
        ARFCN, BSIC, MCC, MNC, RXLEV, LAC, Cell_Id, F_mod, D, E
    };

    try {
        float arfcn = ARFCN[0];
        // Вычисляем F_mod по условиям
        if (arfcn < 124) {
            F_mod.push_back((890000000LL + 200000LL * arfcn) + 45000000LL);
        }
        else if (arfcn > 512 && arfcn < 885) {
            F_mod.push_back((17102000000LL + 200000LL * (arfcn - 512)) + 95000000LL);
        }
        else if (arfcn > 975 && arfcn < 1023) {
            F_mod.push_back((890000000LL + 200000LL * (arfcn - 1024)) + 45000000LL);
        }

    }
    catch (const std::exception& e) {
        cerr << "Ошибка: " << e.what() << endl;
        return 1;
    }

    // Выводим table_1 (для демонстрации — выводим размеры векторов и первые элементы)
    cout << "table_1:" << endl;
    for (size_t i = 0; i < table_1.size(); ++i) {
        cout << "Вектор " << i << ": размер = " << table_1[i].size();
        if (!table_1[i].empty()) {
            cout << ", первый элемент = " << table_1[i][0];
        }
        cout << endl;
    }

    return 0;
}
