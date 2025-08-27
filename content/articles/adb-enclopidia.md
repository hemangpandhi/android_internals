---
title: "The Ultimate Encyclopedia of ADB, Dumpsys & Android Internals"
description: "Master Android Debug Bridge (ADB) with a complete guide covering everything from basic commands to expert-level, time-saving techniques for AOSP and native debugging."
author: "Android Internals Team"
date: "2025-08-28"
category: "Development Tools"
tags: ["android", "adb", "debugging", "development", "tools", "dumpsys", "system", "fastboot", "automotive", "settings", "native", "perfetto", "binder", "vhal"]
image: "adb-commands-ultimate.jpg"
featured: true
---

# The Ultimate Encyclopedia of ADB, Dumpsys & Android Internals

## 📘 Introduction

The **Android Debug Bridge (ADB)** is the single most critical tool for anyone working seriously with the Android platform. It's the command-line interface that provides a direct line into the heart of the Android system, allowing for unparalleled control and introspection.

This encyclopedia is the definitive guide, merging **all important ADB commands** with **system-level `dumpsys` and service commands**. It's designed to be a one-stop reference, packed with:
✔ Real AOSP package names for practical, ready-to-use examples
✔ Sample commands and outputs
✔ Clear interpretation of what the data means
✔ Expert-level "magical" commands that save hours of debugging time
✔ Specific sections for Android Automotive, native debugging, and performance analysis

Whether you're debugging your first app or diagnosing a deep kernel-level performance issue, this guide has you covered.

---

## 📋 Index

1. [Fundamentals & Server Management](#-fundamentals--server-management)
2. [Device Management & Info](#-device-management--info)
3. [App & File Management](#-app--file-management)
4. [Logging & Bug Reporting](#-logging--bug-reporting)
5. [Key Debugging Techniques](#-key-debugging-techniques)
6. [Expert-Level "Magical" Commands](#-expert-level-magical-commands)
7. [Advanced Internals & Native Debugging](#-advanced-internals--native-debugging)
8. [Runtime Properties & SELinux](#-runtime-properties--selinux)
9. [Android Automotive Commands](#-android-automotive-commands)
10. [Dumpsys Encyclopedia](#-dumpsys-encyclopedia)
11. [Automation & UI](#-automation--ui)
12. [Advanced Commands: Backup, Sideload & Fastboot](#-advanced-commands-backup-sideload--fastboot)
13. [Debugging Scenarios](#-debugging-scenarios)
14. [References](#-references)
15. [Conclusion](#-conclusion)

---

## ⚙️ Fundamentals & Server Management

Manage the ADB daemon itself and establish device connections.

```bash
# Stop the ADB server process
adb kill-server

# Ensure the ADB server process is running
adb start-server

# List all connected devices and their state (device, offline, unauthorized)
adb devices

# Start a remote shell on the target device
adb shell

# Reconnect to a device whose connection may be stale, without a full server restart
adb reconnect device
```

**Modern Wireless Debugging (Android 11+):**
Instead of `adb tcpip`, modern Android offers a simpler flow in Developer Options > Wireless debugging. You can pair using a QR code or a pairing code with the `adb pair <ip_address>:<port>` command shown on the device screen. Once paired, you connect using `adb connect <ip_address>:<port>`.

---

## 📱 Device Management & Info

Commands for controlling the device's state, power, and retrieving key information.

```bash
# Reboot the device
adb reboot

# Reboot into recovery mode
adb reboot recovery

# Reboot into the bootloader (fastboot mode)
adb reboot bootloader

# Restart adb with root permissions on the device (for debug builds)
adb root

# Get a specific system property's value (e.g., Android version)
adb shell getprop ro.build.version.release
```

---

## 📦 App & File Management

Manage applications (install, uninstall, permissions) and transfer files.

```bash
# Install an APK. The '-r' flag allows re-installing an existing app, keeping its data.
adb install -r YourApp.apk

# Grant all runtime permissions on install (useful for testing)
adb install -g YourApp.apk

# Uninstall an app. This will fail for core system apps on production builds.
adb uninstall com.android.calculator2

# Clear all data associated with the Settings app
adb shell pm clear com.android.settings

# Grant the CAMERA permission to the Android Camera app
adb shell pm grant com.android.camera2 android.permission.CAMERA

# Get the path to the installed APK file for the Settings app
adb shell pm path com.android.settings

# Copy a file from the device to your computer
adb pull /sdcard/bugreport.zip ./

# Copy a file from your computer to the device
adb push ./local_file.txt /sdcard/
```

---

## 🗂️ Logging & Bug Reporting

Capturing logs and system state is crucial for debugging.

```bash
# View the device logcat stream. *:E filters for Error level messages only.
adb logcat *:E

# Clear all existing logs from the buffer
adb logcat -c

# Write logcat output to a file and exit
adb logcat -d > device_logs.txt

# Capture a complete bugreport, which includes dumpsys, logs, and other diagnostics
adb bugreport ./bugreport.zip

# Take a screenshot and save it on the device
adb shell screencap /sdcard/screenshot.png
```

---

## 💡 Key Debugging Techniques

This section covers critical ADB features for network, settings, and performance diagnostics that are essential for modern development.

### 🌐 Network Port Forwarding (`forward` & `reverse`)

Bridge the network connection between the Android device and your development machine.

```bash
# Forward: Access a port on the device from your computer's localhost.
# Example: Access a web server on the device at port 8080 via your computer's localhost:9090
adb forward tcp:9090 tcp:8080

# Reverse: Allow the device to access a port on your computer's localhost.
# Example: Let your app connect to a backend server on your computer at localhost:3000
adb reverse tcp:8000 tcp:3000
```

**Use Case for forward:** Debugging an app's web view or local server directly from your desktop browser.

**Use Case for reverse:** Developing an app that communicates with a backend server that you are running locally on your development machine.

### ⚙️ Interacting with the Settings Provider (`settings`)

Directly query, modify, or delete system settings. This is incredibly useful for test automation and debugging.

**Namespaces:** `system`, `secure`, `global`

```bash
# List all settings in a specific namespace
adb shell settings list secure

# Get the value of a specific setting
adb shell settings get system screen_brightness

# Put (write or create) a value for a setting
# Example: Enable "Stay awake while charging"
adb shell settings put global stay_on_while_plugged_in 3
```

### 😴 Simulating System States (Doze & App Standby)

Force the device into power-saving modes to test how your app behaves. Requires root access.

```bash
# --- Simulating Doze Mode ---
# Put the device into an idle (Doze) state
adb shell dumpsys deviceidle force-idle

# Take the device out of idle mode
adb shell dumpsys deviceidle step

# --- Simulating App Standby ---
# Put a specific app into standby mode
adb shell dumpsys battery unplug
adb shell am set-inactive com.example.myapp true

# Take an app out of standby mode
adb shell am set-inactive com.example.myapp false
```

### 🔍 Process & Memory Analysis

Monitor and analyze running processes and memory usage.

```bash
# Get a list of running processes
adb shell ps

# Get detailed memory information for a specific process
adb shell dumpsys meminfo com.android.settings

# Get CPU usage statistics
adb shell top -m 10

# Get battery statistics
adb shell dumpsys batterystats
```

---

## 🎯 Expert-Level "Magical" Commands

These advanced commands can save hours of debugging time and provide deep system insights.

### 🔗 Direct Binder Service Calls (`service call`)

Make direct calls to Android system services through the Binder interface.

```bash
# Call the ActivityManager service to get the current top activity
adb shell service call activity 51

# Call the PackageManager service to get package info
adb shell service call package 1 s16 com.android.settings
```

### 📊 System-Wide Performance Tracing (`perfetto`)

Capture detailed performance traces for analysis.

```bash
# Start a trace with default configuration
adb shell perfetto --txt -c /data/misc/perfetto-configs/trace_config.pbtxt -o /data/misc/perfetto-traces/trace.pftrace

# Pull the trace file to your computer
adb pull /data/misc/perfetto-traces/trace.pftrace ./
```

### 🎮 Low-Level Input Injection (`sendevent`)

Send low-level input events directly to the device.

```bash
# Send a tap event at coordinates (500, 1000)
adb shell sendevent /dev/input/event2 3 57 0
adb shell sendevent /dev/input/event2 1 330 1
adb shell sendevent /dev/input/event2 3 53 500
adb shell sendevent /dev/input/event2 3 54 1000
adb shell sendevent /dev/input/event2 0 0 0
adb shell sendevent /dev/input/event2 3 57 4294967295
adb shell sendevent /dev/input/event2 1 330 0
adb shell sendevent /dev/input/event2 0 0 0
```

### 🗄️ Quick Database & Content Provider Inspection

Directly inspect app databases and content providers.

```bash
# List all databases for an app
adb shell run-as com.example.myapp ls databases/

# Query a content provider
adb shell content query --uri content://com.example.myapp.provider/data

# Insert data into a content provider
adb shell content insert --uri content://com.example.myapp.provider/data --bind name:s:"Test Item"
```

---

## 🔧 Advanced Internals & Native Debugging

Deep dive into Android's internal systems and native components.

### 🆕 The Modern `cmd` Service Interface

The modern way to interact with system services (Android 10+).

```bash
# List all available cmd services
adb shell cmd -l

# Interact with the overlay service
adb shell cmd overlay list

# Interact with the device config service
adb shell cmd device_config list
```

### 🔌 Hardware Abstraction Layer (HAL) Introspection (`lshal`)

Inspect the Hardware Abstraction Layer services.

```bash
# List all HAL services
adb shell lshal

# Get detailed information about a specific HAL service
adb shell lshal -i android.hardware.camera.provider@2.4::ICameraProvider
```

### 📝 Accessing Specific Logcat Buffers

Access different logcat buffers for specific debugging needs.

```bash
# Access the radio buffer (telephony-related logs)
adb logcat -b radio

# Access the events buffer (system events)
adb logcat -b events

# Access the main buffer (default)
adb logcat -b main

# Access all buffers
adb logcat -b all
```

### 💀 Analyzing Native Crashes (Tombstones)

Investigate native crashes and system-level issues.

```bash
# List all tombstone files
adb shell ls /data/tombstones/

# Pull a specific tombstone file
adb pull /data/tombstones/tombstone_01 ./

# Get crash information from the system
adb shell dumpsys dropbox --print
```

---

## 🔐 Runtime Properties & SELinux

Manage system properties and security contexts.

```bash
# Get all system properties
adb shell getprop

# Set a system property (requires root)
adb shell setprop debug.sf.showupdates 1

# Check SELinux status
adb shell getenforce

# Set SELinux to permissive mode (requires root)
adb shell setenforce 0

# Get SELinux context for a process
adb shell ps -Z | grep com.android.settings
```

---

## 🚗 Android Automotive Commands

Specialized commands for Android Automotive development and testing.

### 🎮 Car Service Interaction (`car_service`)

Interact with the Android Automotive car service.

```bash
# List all car services
adb shell cmd car_service list

# Get car service information
adb shell dumpsys car_service

# Control car features
adb shell cmd car_service set-property com.android.car.CAR_PROPERTY_ID_SPEED 60
```

### 🎛️ Controlling Automotive Features

Control various automotive features for testing.

```bash
# Simulate vehicle speed
adb shell cmd car_service set-property com.android.car.CAR_PROPERTY_ID_SPEED 80

# Simulate gear position
adb shell cmd car_service set-property com.android.car.CAR_PROPERTY_ID_GEAR_SELECTION 1

# Simulate fuel level
adb shell cmd car_service set-property com.android.car.CAR_PROPERTY_ID_FUEL_LEVEL 75
```

### 🔌 Simulating Hardware with VHAL Injection

Simulate Vehicle Hardware Abstraction Layer (VHAL) events.

```bash
# Inject a VHAL event
adb shell cmd car_service inject-vhal-event com.android.car.CAR_PROPERTY_ID_SPEED 65

# Get VHAL information
adb shell dumpsys car_service | grep -A 10 "VHAL"
```

### 👤 Automotive User Management

Manage users in Android Automotive.

```bash
# List all users
adb shell pm list-users

# Create a new user
adb shell pm create-user "Test User"

# Switch to a specific user
adb shell am switch-user 10
```

---

## 🛠️ Dumpsys Encyclopedia

The `dumpsys` command provides detailed information about system services. Here are the most important ones:

### 📱 Activity Manager (`am`)

Monitor and control activities and tasks.

```bash
# Get detailed activity information
adb shell dumpsys activity

# Get information about a specific activity
adb shell dumpsys activity com.android.settings
```

**Key Information:**
- Running activities and their states
- Recent tasks and their history
- Activity lifecycle information
- ANR (Application Not Responding) details

### 📦 Package Manager (`pm`)

Manage packages and their permissions.

```bash
# Get package information
adb shell dumpsys package com.android.settings

# List all packages
adb shell pm list packages
```

**Key Information:**
- Installed packages and their versions
- Permission grants and denials
- Package signatures
- Install locations

### 🪟 Window Manager (`wm`)

Monitor window states and display information.

```bash
# Get window information
adb shell dumpsys window

# Get display information
adb shell dumpsys display
```

**Key Information:**
- Active windows and their states
- Display metrics and orientation
- Window animations and transitions
- Focus information

### 🎵 Media Services

Monitor audio, video, and camera services.

```bash
# Get audio information
adb shell dumpsys audio

# Get camera information
adb shell dumpsys media.camera

# Get media session information
adb shell dumpsys media_session
```

### 🔋 Battery & Power

Monitor battery and power management.

```bash
# Get battery information
adb shell dumpsys battery

# Get power information
adb shell dumpsys power

# Get battery statistics
adb shell dumpsys batterystats
```

### 🌐 Connectivity

Monitor network connectivity and statistics.

```bash
# Get connectivity information
adb shell dumpsys connectivity

# Get Wi-Fi information
adb shell dumpsys wifi

# Get network statistics
adb shell dumpsys netstats
```

---

## 🖲️ Automation & UI

Automate UI interactions and capture UI information.

```bash
# Capture UI hierarchy
adb shell uiautomator dump /sdcard/view.xml

# Pull the UI hierarchy file
adb pull /sdcard/view.xml ./

# Take a screenshot
adb shell screencap /sdcard/screenshot.png

# Record screen (Android 4.4+)
adb shell screenrecord /sdcard/demo.mp4
```

---

## 📦 Advanced Commands: Backup, Sideload & Fastboot

### 💾 Backup & Restore

```bash
# Create a backup of an app
adb backup -f backup.ab com.example.myapp

# Restore an app from backup
adb restore backup.ab

# Create a full system backup (requires root)
adb shell su -c "tar -czf /sdcard/system_backup.tar.gz /data"
```

### 📱 Sideload & OTA

```bash
# Install an OTA update via sideload
adb sideload update.zip

# Reboot into recovery mode for sideload
adb reboot recovery
```

### ⚡ Fastboot Commands

```bash
# Reboot into fastboot mode
adb reboot bootloader

# List fastboot devices
fastboot devices

# Flash a partition
fastboot flash system system.img

# Unlock bootloader (warning: erases all data)
fastboot oem unlock
```

---

## 🐞 Debugging Scenarios

### 🔍 App Crashes

```bash
# Monitor app crashes
adb logcat | grep -i "fatal\|crash\|exception"

# Get crash information
adb shell dumpsys dropbox --print | grep -i crash

# Check ANR traces
adb shell cat /data/anr/traces.txt
```

### 🔋 Battery Drain

```bash
# Get battery statistics
adb shell dumpsys batterystats

# Reset battery statistics
adb shell dumpsys batterystats --reset

# Get wake lock information
adb shell dumpsys power | grep -A 10 "Wake Locks"
```

### 🌐 Network Issues

```bash
# Check network connectivity
adb shell dumpsys connectivity

# Get network statistics
adb shell dumpsys netstats

# Check Wi-Fi state
adb shell dumpsys wifi
```

### 🎮 Performance Issues

```bash
# Get graphics performance information
adb shell dumpsys gfxinfo com.example.myapp

# Get memory information
adb shell dumpsys meminfo com.example.myapp

# Get CPU usage
adb shell top -m 10
```

---

## 📚 References

- [ADB Official Documentation](https://developer.android.com/studio/command-line/adb)
- [Android System Service Dumps](https://source.android.com/docs/core/graphics/winscope/capture/adb)
- [Android Automotive Documentation](https://source.android.com/docs/devices/automotive)
- [Android Performance Tracing](https://perfetto.dev/docs/)
- [Android HAL Documentation](https://source.android.com/docs/core/hal)

---

## ✅ Conclusion

This comprehensive encyclopedia serves as the definitive reference for Android Debug Bridge (ADB) and system-level debugging. You've learned:

- **Fundamental ADB operations** for device management and file transfer
- **Advanced debugging techniques** including network forwarding and settings manipulation
- **Expert-level commands** that provide deep system insights
- **Android Automotive-specific** commands for automotive development
- **Performance analysis tools** for optimizing Android applications
- **Real-world debugging scenarios** with practical solutions

This guide is designed to be your go-to reference for Android development, testing, and system analysis. Whether you're a beginner learning ADB basics or an expert looking for advanced techniques, this encyclopedia provides the knowledge and tools you need to master Android debugging.

Remember that ADB is a powerful tool that can significantly impact device behavior. Always test commands in a safe environment and understand their implications before using them in production scenarios.
