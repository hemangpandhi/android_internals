---
title: "System Server: Debugging and Troubleshooting"
description: "Practical debugging techniques, tools, and failure mode analysis for Android System Server troubleshooting."
author: "Android Internals Team"
date: "2025-10-04"
category: "System Architecture"
tags: ["system_server", "debugging", "troubleshooting", "android", "platform", "performance"]
series: "Android System Server Deep Dive"
series_order: 4
prerequisites: ["Parts 1-3"]
estimated_time: "60 minutes"
difficulty: "Advanced"
---

# System Server: Debugging and Troubleshooting

> **Part 4 of 6** in the [Android System Server Deep Dive](./android-system-server-series.html) series
> 
> **Previous**: [Part 3: Binder IPC Framework](./android-system-server-binder-ipc.html)  
> **Next**: [Part 5: Best Practices and Optimization](./android-system-server-best-practices.html)  
> **Series Index**: [View all articles](./android-system-server-series.html)

## Learning Objectives

By the end of this article, you will understand:
- Essential command-line debugging tools and advanced techniques
- Binder IPC debugging and transaction analysis
- Service-specific debugging commands for AMS, WMS, PMS, and others
- Thread analysis, deadlock detection, and memory leak identification
- Performance profiling with systrace, perfetto, and simpleperf
- Boot time debugging and service lifecycle analysis
- ANR analysis workflow and Watchdog timeout diagnosis
- SELinux debugging and system properties for troubleshooting
- Real-world debugging scenarios and step-by-step workflows

---

## Part IV: Practical Debugging and Analysis

### 4.1 Essential Command-Line Tools

**Process Inspection:**
```bash
# Find system_server PID
adb shell ps -A | grep system_server

# List all threads
adb shell ps -T -p $(pidof system_server)

# Monitor CPU usage
adb shell top -t -d 3
```

**Log Analysis:**
```bash
# Filter system_server logs
adb logcat | grep --line-buffered "$(pidof system_server)"

# Filter by specific tags
adb logcat ActivityManager:I PowerManagerService:W *:S

# View crash logs
adb logcat -b crash

# Advanced log filtering
# Filter by priority and tag
adb logcat *:S ActivityManager:D WindowManager:V

# Filter by process name
adb logcat | grep --line-buffered "system_server"

# Filter by time range
adb logcat -t '11-15 10:30:00.000' -t '11-15 10:35:00.000'

# Save logs to file
adb logcat > system_server.log

# Filter multiple tags
adb logcat -s ActivityManager WindowManager PackageManager

# Clear logs and start fresh
adb logcat -c
adb logcat > fresh_logs.txt
```

**Service State Inspection:**
```bash
# List all services
adb shell service list

# Dump service state
adb shell dumpsys activity
adb shell dumpsys window
adb shell dumpsys power
adb shell dumpsys meminfo system_server

# List all available dumpsys services
adb shell dumpsys -l

# Dump specific service with options
adb shell dumpsys activity activities
adb shell dumpsys activity services
adb shell dumpsys activity processes
adb shell dumpsys window windows
adb shell dumpsys window displays
```

**Service-Specific Debugging Commands:**

**ActivityManagerService (AMS):**
```bash
# Dump activity stack
adb shell dumpsys activity activities | grep -A 20 "mResumedActivity"

# Check running processes
adb shell dumpsys activity processes

# View pending intents
adb shell dumpsys activity intents

# Check app startup info
adb shell dumpsys activity top

# Monitor activity lifecycle
adb logcat | grep -E "ActivityManager|ActivityTaskManager"
```

**WindowManagerService (WMS):**
```bash
# Dump window hierarchy
adb shell dumpsys window windows

# Check display info
adb shell dumpsys window displays

# View surface flinger info
adb shell dumpsys SurfaceFlinger

# Monitor window operations
adb logcat | grep -E "WindowManager|SurfaceFlinger"
```

**PackageManagerService (PMS):**
```bash
# List installed packages
adb shell dumpsys package packages

# Check package permissions
adb shell dumpsys package permissions

# View package info
adb shell dumpsys package <package_name>

# Monitor package operations
adb logcat | grep -E "PackageManager|Installer"
```

**PowerManagerService:**
```bash
# Check wake locks
adb shell dumpsys power | grep -A 20 "Wake Locks"

# View power state
adb shell dumpsys power

# Check battery stats
adb shell dumpsys batterystats

# Monitor power events
adb logcat | grep -E "PowerManager|BatteryService"
```

**Other Critical Services:**
```bash
# Network service
adb shell dumpsys connectivity
adb shell dumpsys netstats

# Input service
adb shell dumpsys input

# Location service
adb shell dumpsys location

# Notification service
adb shell dumpsys notification
```

### 4.2 Performance Profiling

**CPU Profiling with simpleperf:**
```bash
# Record profile
adb shell simpleperf record -p $(pidof system_server) -g --duration 10 -o /data/local/tmp/perf.data

# Pull and analyze
adb pull /data/local/tmp/perf.data
```

**Memory Analysis:**
```bash
# Memory breakdown
adb shell dumpsys meminfo system_server

# Process ranking
adb shell procrank

# Native heap profiling
./tools/heap_profile --name system_server
```

**System Tracing:**

**Perfetto Tracing:**
```bash
# Capture comprehensive system trace
adb shell perfetto -o /data/local/tmp/trace.pbtxt -t 10s \
  -c - <<EOF
buffers: {
    size_kb: 63488
    fill_policy: DISCARD
}
buffers: {
    size_kb: 2048
    fill_policy: DISCARD
}
data_sources: {
    config {
        name: "android.surfaceflinger.frame"
    }
}
data_sources: {
    config {
        name: "linux.ftrace"
        ftrace_config {
            ftrace_events: "sched/sched_switch"
            ftrace_events: "sched/sched_waking"
            ftrace_events: "power/suspend_resume"
            ftrace_events: "power/cpu_frequency"
            ftrace_events: "power/cpu_idle"
            ftrace_events: "binder/binder_transaction"
            ftrace_events: "binder/binder_transaction_received"
            atrace_categories: "gfx"
            atrace_categories: "input"
            atrace_categories: "view"
            atrace_categories: "webview"
            atrace_categories: "wm"
            atrace_categories: "am"
            atrace_categories: "sm"
            atrace_categories: "audio"
            atrace_categories: "video"
            atrace_categories: "camera"
            atrace_categories: "hal"
            atrace_categories: "app"
            atrace_categories: "res"
            atrace_categories: "dalvik"
            atrace_categories: "rs"
            atrace_categories: "bionic"
            atrace_categories: "power"
            atrace_categories: "pm"
            atrace_categories: "ss"
            atrace_categories: "database"
            atrace_categories: "network"
            atrace_categories: "adb"
            atrace_categories: "vibrator"
            atrace_categories: "aidl"
            atrace_categories: "nnapi"
            atrace_categories: "rro"
            buffer_size_kb: 2048
        }
    }
}
EOF

# Pull trace and view in perfetto UI
adb pull /data/local/tmp/trace.pbtxt
# Open https://ui.perfetto.dev/ and upload trace.pbtxt
```

**Systrace (Legacy but still useful):**
```bash
# Capture systrace
python systrace.py --time=10 -o trace.html \
  sched freq idle am wm gfx view binder_driver hal dalvik camera input res

# View in Chrome: chrome://tracing
```

**Analyzing Traces:**
- **Binder Transactions**: Look for long binder_transaction events (>5ms)
- **CPU Scheduling**: Check for thread starvation or priority inversion
- **Service Calls**: Identify slow service responses
- **Deadlocks**: Look for circular wait patterns in thread states

### 4.3 Binder IPC Debugging

**Binder Transaction Monitoring:**
```bash
# View Binder statistics
adb shell cat /proc/binder/stats

# Monitor Binder transactions in real-time
adb shell strace -p $(pidof system_server) -e trace=binder_ioctl

# Check Binder thread pool state
adb shell dumpsys activity services | grep -A 10 "Binder"

# Monitor Binder transaction latency
adb shell dumpsys meminfo system_server | grep -i binder
```

**Binder Deadlock Detection:**
```bash
# Check for blocked Binder threads
adb shell cat /data/anr/traces.txt | grep -A 20 "Binder"

# Monitor Binder transaction timeouts
adb logcat | grep -E "Binder.*timeout|DeadObjectException"

# Check Binder transaction queue depth
adb shell cat /proc/binder/proc/$(pidof system_server)
```

**Binder Performance Analysis:**
```bash
# Trace Binder calls with systrace
python systrace.py --time=10 -o trace.html binder

# Check transaction sizes
adb shell dumpsys activity services | grep -E "transaction|parcel"
```

### 4.4 Thread Analysis and Deadlock Detection

**Thread Inspection:**
```bash
# List all threads with details
adb shell ps -T -p $(pidof system_server)

# Get thread stack traces
adb shell kill -3 $(pidof system_server)
adb shell cat /data/anr/traces.txt | grep -A 50 "system_server"

# Monitor thread CPU usage
adb shell top -H -p $(pidof system_server)

# Check thread priorities
adb shell cat /proc/$(pidof system_server)/task/*/stat | awk '{print $1, $18}'
```

**Deadlock Detection Workflow:**
```bash
# 1. Capture thread dump
adb shell kill -3 $(pidof system_server)
adb pull /data/anr/traces.txt

# 2. Analyze for deadlock patterns
# Look for:
# - Threads waiting on locks held by other threads
# - Circular wait conditions
# - Blocked threads in synchronized blocks

# 3. Identify lock holders
grep -B 5 -A 20 "BLOCKED" traces.txt

# 4. Check for monitor contention
grep -i "waiting.*monitor" traces.txt
```

**Thread State Analysis:**
```bash
# Check thread states (RUNNABLE, BLOCKED, WAITING, TIMED_WAITING)
adb shell cat /proc/$(pidof system_server)/task/*/stat | \
  awk '{print $1, $3}' | sort -k2

# Monitor thread creation/destruction
adb logcat | grep -E "Thread.*started|Thread.*terminated"
```

### 4.5 Memory Leak Detection

**Memory Monitoring:**
```bash
# Continuous memory monitoring
watch -n 1 "adb shell dumpsys meminfo system_server | head -30"

# Check for memory growth over time
adb shell dumpsys meminfo system_server > mem_before.txt
# ... perform operations ...
adb shell dumpsys meminfo system_server > mem_after.txt
diff mem_before.txt mem_after.txt

# Check native heap
adb shell dumpsys meminfo system_server | grep -A 10 "Native Heap"

# Check Java heap
adb shell dumpsys meminfo system_server | grep -A 10 "Java Heap"
```

**Heap Analysis:**
```bash
# Generate heap dump (requires root or debuggable build)
adb shell am dumpheap $(pidof system_server) /data/local/tmp/heap.hprof
adb pull /data/local/tmp/heap.hprof

# Analyze with Android Studio Memory Profiler or MAT (Eclipse Memory Analyzer)

# Check for object retention
adb shell dumpsys meminfo system_server | grep -E "Objects|Views|Activities"
```

**Native Memory Leaks:**
```bash
# Use Malloc Debug (requires root)
adb shell setprop libc.debug.malloc.options backtrace
adb shell setprop libc.debug.malloc.program system_server
adb reboot

# After reboot, check for leaks
adb shell dumpsys meminfo system_server | grep -A 5 "Native"
```

### 4.6 Boot Time Debugging

**Service Startup Analysis:**
```bash
# Monitor service startup sequence
adb logcat | grep -E "SystemServiceManager|Starting.*Service"

# Check boot time
adb shell dumpsys activity services | grep -E "boot|startup"

# Analyze service initialization order
adb logcat -b all | grep -E "SystemServer.*start|ServiceManager"
```

**Boot Performance:**
```bash
# Capture boot trace
adb shell perfetto -o /data/local/tmp/boot_trace.pbtxt \
  -c - <<EOF
buffers: { size_kb: 63488 }
data_sources: {
    config {
        name: "android.boot"
    }
}
EOF

# Check boot time metrics
adb shell dumpsys activity services | grep -E "boot.*time|startup.*duration"
```

**Service Registration Debugging:**
```bash
# Check service registration
adb shell service list | grep -E "activity|window|power"

# Monitor service binder registration
adb logcat | grep -E "addService|ServiceManager.*add"
```

### 4.7 Advanced Debugging Techniques

**Attaching Native Debugger:**
```bash
# Get PID
adb shell pidof system_server

# Attach LLDB (requires root or debuggable build)
lldbclient.py -p <PID>

# Common LLDB commands:
# (lldb) bt          # Backtrace
# (lldb) thread list # List threads
# (lldb) frame select # Select frame
# (lldb) print <var> # Print variable
```

**Java Debugging with JDWP:**
```bash
# Enable JDWP (requires debuggable build)
adb shell setprop dalvik.vm.checkjni true
adb shell setprop debug.checkjni 1

# Attach debugger
jdb -attach localhost:8700
```

**System Properties for Debugging:**
```bash
# Enable debug logging
adb shell setprop log.tag.ActivityManager VERBOSE
adb shell setprop log.tag.WindowManager VERBOSE
adb shell setprop log.tag.PackageManager VERBOSE

# Enable Binder debugging
adb shell setprop debug.binder.logging 1

# Enable service manager debugging
adb shell setprop debug.servicemanager.logging 1

# Check all debug properties
adb shell getprop | grep debug
```

**SELinux Debugging:**
```bash
# Check SELinux status
adb shell getenforce

# View SELinux denials
adb shell dmesg | grep -i "avc.*denied"
adb logcat | grep -i "selinux"

# Check SELinux context for system_server
adb shell ps -Z | grep system_server

# Set SELinux to permissive (requires root, for debugging only)
adb shell setenforce 0
```

**Watchdog Analysis:**
- Examine `/data/anr/traces.txt` for deadlock patterns
- Look for blocked threads and lock holders
- Analyze circular dependencies
- Check for threads stuck in native code
- Verify no infinite loops in service code

## Part V: Common Failure Modes

### 5.1 Watchdog Timeouts

**Symptoms**: 60-second system freeze followed by soft reboot

**Causes**: Deadlocked threads, blocking I/O on main thread

**Diagnosis**: Analyze stack traces in `/data/anr/traces.txt`

### 5.2 System ANRs

**Symptoms**: App ANR dialogs with root cause in system_server

**Causes**: Slow service responses, blocked Binder threads

**ANR Analysis Workflow:**

**Step 1: Identify ANR Type**
```bash
# Check ANR traces
adb shell cat /data/anr/traces.txt

# Check ANR in logcat
adb logcat | grep -i "anr\|not responding"

# Check dropbox for ANR reports
adb shell dumpsys dropbox --print | grep -i anr
```

**Step 2: Analyze Application Stack Trace**
```bash
# Find the app process in traces.txt
grep -A 50 "pid.*<app_pid>" /data/anr/traces.txt

# Look for:
# - Main thread blocked on Binder call
# - Waiting on system_server response
# - Blocked on lock held by system_server
```

**Step 3: Analyze System Server Stack Trace**
```bash
# Find system_server in traces.txt
grep -A 50 "system_server" /data/anr/traces.txt

# Look for:
# - Binder thread blocked on slow operation
# - Service handler stuck in long-running code
# - Deadlock with application thread
```

**Step 4: Identify Root Cause**
```bash
# Check Binder transaction latency
adb shell dumpsys activity services | grep -A 5 "Binder"

# Check service response times
adb logcat | grep -E "Service.*took|Transaction.*duration"

# Verify service is not deadlocked
adb shell cat /data/anr/traces.txt | grep -E "BLOCKED|WAITING"
```

**Common ANR Patterns:**

1. **Slow Binder Transaction:**
   - App thread: `BinderProxy.transact()` waiting
   - System thread: Service handler processing slowly
   - Solution: Optimize service handler, use async callbacks

2. **Deadlock:**
   - App thread: Waiting on lock A, holding lock B
   - System thread: Waiting on lock B, holding lock A
   - Solution: Fix lock ordering, use tryLock with timeout

3. **Blocked on I/O:**
   - System thread: Blocked on file/network I/O
   - Solution: Move I/O to background thread, use async APIs

**ANR/Watchdog Interaction:**

While Watchdog Timeouts (Section 5.1) and System ANRs are distinct failure modes, they often interact in complex ways. For example, an extremely slow Binder call from an application waiting on the system_server could lead to both an App ANR (when the app's main thread is blocked waiting for the system_server response) and eventually contribute to a Watchdog timeout if critical system_server threads are blocked by the same operation. This interaction highlights the importance of monitoring both application-level ANRs and system-level watchdog events when diagnosing performance issues, as they may share a common root cause in system_server thread blocking.

### 5.3 Native Crashes

**Symptoms**: Instant hard reboot or system_server crash

**Causes**: Segmentation faults in JNI or native code, null pointer dereferences, stack overflow

**Crash Analysis Workflow:**

**Step 1: Locate Crash Reports**
```bash
# List tombstone files
adb shell ls -l /data/tombstones/

# Pull latest tombstone
adb pull /data/tombstones/tombstone_00

# Check crash in logcat
adb logcat -b crash

# Check dropbox for crash reports
adb shell dumpsys dropbox --print | grep -i "crash\|tombstone"
```

**Step 2: Analyze Tombstone**
```bash
# Key sections to examine:
# - Build fingerprint
# - Signal (SIGSEGV, SIGABRT, etc.)
# - Register state
# - Stack trace
# - Memory map

# Use addr2line to resolve addresses
addr2line -e <binary> <address>
```

**Step 3: Identify Root Cause**
- **SIGSEGV**: Null pointer, buffer overflow, use-after-free
- **SIGABRT**: Assertion failure, abort() call
- **SIGBUS**: Misaligned memory access
- **SIGFPE**: Floating point exception

**Common Native Crash Patterns:**

1. **JNI Null Pointer:**
   - Check JNI code for null checks
   - Verify object references are valid
   - Solution: Add null checks, validate JNI parameters

2. **Stack Overflow:**
   - Check for infinite recursion
   - Verify stack size limits
   - Solution: Fix recursion, increase stack size if needed

3. **Use-After-Free:**
   - Check for dangling pointers
   - Verify object lifetime management
   - Solution: Use smart pointers, validate object state

### 5.4 Service Lifecycle Issues

**Symptoms**: Services not starting, crashing, or not responding

**Debugging Service Startup:**
```bash
# Monitor service registration
adb logcat | grep -E "addService|ServiceManager"

# Check service availability
adb shell service check <service_name>

# Verify service binder interface
adb shell dumpsys activity services | grep <service_name>
```

**Service Crash Recovery:**
```bash
# Check if service crashed
adb logcat | grep -E "Service.*died|Service.*crash"

# Monitor service restart
adb logcat | grep -E "Service.*restart|Service.*recovery"

# Check service state
adb shell dumpsys activity services | grep -A 10 <service_name>
```

### 5.5 Performance Regressions

**Symptoms**: System slowdown, increased latency, higher CPU usage

**Performance Baseline:**
```bash
# Capture baseline metrics
adb shell dumpsys meminfo system_server > baseline_mem.txt
adb shell top -n 1 -p $(pidof system_server) > baseline_cpu.txt

# After changes, compare
adb shell dumpsys meminfo system_server > current_mem.txt
adb shell top -n 1 -p $(pidof system_server) > current_cpu.txt
```

**Identifying Regressions:**
```bash
# Compare CPU usage
diff baseline_cpu.txt current_cpu.txt

# Compare memory usage
diff baseline_mem.txt current_mem.txt

# Check for new allocations
adb shell dumpsys meminfo system_server | grep -E "Objects|Allocations"
```

**Performance Profiling:**
```bash
# Profile before and after
adb shell simpleperf record -p $(pidof system_server) -g --duration 30

# Compare profiles
simpleperf report --compare baseline.data current.data
```

### 5.6 Battery and Thermal Issues

**Symptoms**: Excessive battery drain, thermal throttling

**Battery Analysis:**
```bash
# Check wake locks
adb shell dumpsys power | grep -A 20 "Wake Locks"

# Check battery stats
adb shell dumpsys batterystats

# Monitor CPU frequency
adb shell cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_cur_freq

# Check thermal state
adb shell dumpsys thermalservice
```

**Identifying Battery Drains:**
```bash
# Check for excessive CPU wakeups
adb shell dumpsys batterystats | grep -E "wakeup|partial_wake_lock"

# Monitor service CPU usage
adb shell top -H -p $(pidof system_server) -d 5

# Check for polling loops
adb logcat | grep -E "polling|wakeup|alarm"
```

---

## 6. Real-World Debugging Scenarios

### Scenario 1: System Freeze Investigation

**Symptoms**: Device freezes, no response to input

**Debugging Steps:**
```bash
# 1. Check if system_server is alive
adb shell ps -A | grep system_server

# 2. Get thread dump
adb shell kill -3 $(pidof system_server)
adb pull /data/anr/traces.txt

# 3. Analyze for deadlocks
grep -E "BLOCKED|WAITING" traces.txt

# 4. Check Binder transactions
adb shell cat /proc/binder/stats

# 5. Check CPU usage
adb shell top -H -p $(pidof system_server)
```

### Scenario 2: App Launch Slowdown

**Symptoms**: Apps take too long to start

**Debugging Steps:**
```bash
# 1. Trace app launch
adb shell perfetto -o /data/local/tmp/launch.pbtxt -t 10s am

# 2. Check AMS activity stack
adb shell dumpsys activity activities | grep -A 10 "mResumedActivity"

# 3. Monitor service calls during launch
adb logcat | grep -E "ActivityManager|PackageManager" | grep -E "start|launch"

# 4. Check for blocking operations
adb shell dumpsys activity services | grep -A 5 "Binder"
```

### Scenario 3: Memory Leak Investigation

**Symptoms**: System memory usage grows over time

**Debugging Steps:**
```bash
# 1. Baseline memory
adb shell dumpsys meminfo system_server > mem_baseline.txt

# 2. Wait and check again
sleep 3600  # Wait 1 hour
adb shell dumpsys meminfo system_server > mem_after.txt

# 3. Compare
diff mem_baseline.txt mem_after.txt

# 4. Generate heap dump
adb shell am dumpheap $(pidof system_server) /data/local/tmp/heap.hprof
adb pull /data/local/tmp/heap.hprof

# 5. Analyze with MAT or Android Studio
```

### Scenario 4: Binder Transaction Timeout

**Symptoms**: Apps report "Service not responding"

**Debugging Steps:**
```bash
# 1. Check Binder statistics
adb shell cat /proc/binder/stats

# 2. Monitor Binder transactions
adb shell strace -p $(pidof system_server) -e trace=binder_ioctl

# 3. Check service handler threads
adb shell ps -T -p $(pidof system_server) | grep -E "Binder|Handler"

# 4. Analyze service response times
adb logcat | grep -E "Service.*took|Transaction.*duration"

# 5. Check for deadlocks
adb shell cat /data/anr/traces.txt | grep -A 20 "Binder"
```

---

## Summary

This comprehensive article covered essential and advanced debugging tools and techniques for system_server:

1. **Command-Line Tools**: Process inspection, log analysis, service state dumps, and service-specific debugging
2. **Binder IPC Debugging**: Transaction monitoring, deadlock detection, and performance analysis
3. **Thread Analysis**: Deadlock detection, thread state analysis, and CPU profiling
4. **Memory Debugging**: Leak detection, heap analysis, and native memory tracking
5. **Boot Time Debugging**: Service startup analysis and initialization order
6. **Performance Profiling**: CPU, memory, and system tracing with perfetto and systrace
7. **Advanced Techniques**: Native debugging, JDWP, system properties, and SELinux debugging
8. **Failure Modes**: Watchdog timeouts, ANRs, native crashes, service lifecycle issues, performance regressions, and battery/thermal problems
9. **Real-World Scenarios**: Step-by-step workflows for common debugging situations

---

## Next Steps

Continue to **[Part 5: Best Practices and Optimization](./android-system-server-best-practices.html)** to learn development guidelines and common pitfalls to avoid.

---

## Related Articles

- [Part 3: Binder IPC Framework](./android-system-server-binder-ipc.html)
- [Part 5: Best Practices and Optimization](./android-system-server-best-practices.html)
- [Part 6: Advanced Q&A](./android-system-server-qa.html) - See Q3, Q5 for detailed failure analysis
- [Series Index](./android-system-server-series.html)

---

*This article is part of the [Android System Server Deep Dive](./android-system-server-series.html) series. For the complete learning path, start with the [Series Index](./android-system-server-series.html).*

