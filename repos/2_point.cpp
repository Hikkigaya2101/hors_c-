#include <iostream>
#include <cmath>
#include <stdio.h>

using namespace std;

int double_point() {
	int N = 54;

	int Angle1 = 150;
	int Angle2 = 80;

	int AzA = N + Angle1;
	int AzB = N + Angle2;

	float x1 = 54.887107;
	float y1 = 38.043579;

	float x2 = 54.885046;
	float y2 = 38.099651;

	float AzArad = AzA / 180 * 3.14159265;
	float AzBrad = AzB / 180 * 3.14159265;

	float coordinate_x = (tan(AzArad) * x1 - y1 - tan(AzBrad) * x2 + y2) / (tan(AzArad) - tan(AzBrad));
	float coordinate_y = tan(AzArad) * coordinate_x - tan(AzArad) * x1 + y1;
	cout << coordinate_x;
		return 0;
}
