#!/bin/bash

# 기존 실행중인 모든 클라이언트 종료
killall ataxx-desktop

echo CLIENT START

# 클라이언트 실행 (아마도 블러킹)
$HOME/awstraining/clientjs/bin/ataxx-desktop.app/Contents/MacOS/ataxx-desktop

echo CLIENT FINISH

#read -n1 -r -p "Press any key to continue..." key

# Atom 에디터로 포커스 복원하기
osascript -e 'tell application "Atom" to activate'
