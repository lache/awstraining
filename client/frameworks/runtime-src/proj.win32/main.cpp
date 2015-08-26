#include "main.h"
#include "SimulatorWin.h"
#include <shellapi.h>

int wmain(int argc, wchar_t** argv)
{
    auto simulator = SimulatorWin::getInstance();
    return simulator->run();
}
