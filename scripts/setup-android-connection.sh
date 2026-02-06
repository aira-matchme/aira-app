#!/bin/bash

echo "🔍 Checking Android device connection..."

# Check if device is connected
DEVICES=$(adb devices | grep -v "List" | grep "device" | wc -l)

if [ $DEVICES -eq 0 ]; then
    echo "❌ No Android device found!"
    echo ""
    echo "Please choose one of the following:"
    echo ""
    echo "📱 Physical Device (USB):"
    echo "   1. Enable Developer Options on your Android device"
    echo "   2. Enable USB Debugging"
    echo "   3. Connect device via USB"
    echo "   4. Run this script again"
    echo ""
    echo "📱 Physical Device (WiFi):"
    echo "   1. Connect device and computer to same WiFi"
    echo "   2. Enable USB Debugging"
    echo "   3. Connect via USB first, then run: adb tcpip 5555"
    echo "   4. Find your device IP in Settings > About Phone > Status"
    echo "   5. Run: adb connect YOUR_DEVICE_IP:5555"
    echo ""
    echo "🖥️  Emulator:"
    echo "   1. Start Android Studio"
    echo "   2. Open AVD Manager"
    echo "   3. Start an emulator"
    echo "   4. Run this script again"
    exit 1
fi

echo "✅ Device found! Setting up port forwarding..."
adb reverse tcp:8081 tcp:8081

if [ $? -eq 0 ]; then
    echo "✅ Port forwarding configured successfully!"
    echo ""
    echo "You can now run: npx react-native run-android"
else
    echo "❌ Failed to set up port forwarding"
    exit 1
fi

