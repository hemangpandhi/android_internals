---
title: "System Server: Best Practices and Optimization"
description: "Development guidelines, threading best practices, memory management, and security considerations for system_server development."
author: "Android Internals Team"
date: "2025-10-04"
category: "System Architecture"
tags: ["system_server", "best-practices", "optimization", "android", "platform", "development"]
series: "Android System Server Deep Dive"
series_order: 5
prerequisites: ["Parts 1-4"]
estimated_time: "60 minutes"
difficulty: "Advanced"
---

# System Server: Best Practices and Optimization

> **Part 5 of 6** in the [Android System Server Deep Dive](./android-system-server-series.html) series
> 
> **Previous**: [Part 4: Debugging and Troubleshooting](./android-system-server-debugging.html)  
> **Next**: [Part 6: Advanced Q&A](./android-system-server-qa.html)  
> **Series Index**: [View all articles](./android-system-server-series.html)

## Learning Objectives

By the end of this article, you will understand:
- **System Server Context**: Service development, threading, memory management, and IPC optimization
- **Application Context**: Best practices for apps interacting with system_server, avoiding ANRs, and optimizing Binder calls
- **Platform Context**: Boot time optimization, resource management, and system-wide performance
- **Security Context**: SELinux policies, permission management, and security hardening
- **Development Context**: Code organization, testing strategies, and debugging practices
- **Common Pitfalls**: Real-world mistakes to avoid and how to prevent them

---

## 1. System Server Context: Service Development Best Practices

The system_server is the heart of Android, managing critical system services. Following best practices ensures stability, performance, and security. This section covers essential guidelines for developing system services.

### 1.1 Threading and Concurrency

**Critical Threading Rules:**

Threading is one of the most critical aspects of system_server development. Improper thread management can lead to deadlocks, ANRs, and system instability. Follow these rules religiously:

1. **Never Block Critical Threads:**
   ```java
   // ❌ BAD: Blocking I/O on main thread
   public void onTransact(int code, Parcel data, Parcel reply, int flags) {
       File file = new File("/data/system/config.txt");
       String content = Files.readString(file.toPath()); // BLOCKING!
       reply.writeString(content);
   }
   
   // ✅ GOOD: Use background thread
   public void onTransact(int code, Parcel data, Parcel reply, int flags) {
       if (code == READ_CONFIG) {
           mHandler.post(() -> {
               try {
                   File file = new File("/data/system/config.txt");
                   String content = Files.readString(file.toPath());
                   // Send result via callback or one-way transaction
               } catch (IOException e) {
                   // Handle error
               }
           });
           return true;
       }
   }
   ```

2. **Use HandlerThreads for Background Work:**
   ```java
   // ✅ GOOD: Dedicated HandlerThread for service operations
   public class MyService extends SystemService {
       private HandlerThread mHandlerThread;
       private Handler mHandler;
       
       @Override
       public void onStart() {
           mHandlerThread = new HandlerThread("MyServiceHandler");
           mHandlerThread.start();
           mHandler = new Handler(mHandlerThread.getLooper());
       }
       
       private void performBackgroundWork() {
           mHandler.post(() -> {
               // Long-running operation
               processData();
           });
       }
   }
   ```

3. **Maintain Strict Lock Ordering:**
   ```java
   // ❌ BAD: Inconsistent lock ordering leads to deadlocks
   // Thread 1: lockA -> lockB
   // Thread 2: lockB -> lockA  // DEADLOCK!
   
   // ✅ GOOD: Always acquire locks in same order
   private final Object mLockA = new Object();
   private final Object mLockB = new Object();
   
   private void method1() {
       synchronized (mLockA) {
           synchronized (mLockB) {
               // Critical section
           }
       }
   }
   
   private void method2() {
       synchronized (mLockA) {  // Same order!
           synchronized (mLockB) {
               // Critical section
           }
       }
   }
   ```

4. **Avoid Binder Calls While Holding Locks:**
   ```java
   // ❌ BAD: Binder call while holding lock
   synchronized (mLock) {
       // Holding lock...
       mOtherService.doSomething(); // Binder call - can block!
       // Still holding lock - blocks other threads
   }
   
   // ✅ GOOD: Release lock before Binder call
   SomeResult result;
   synchronized (mLock) {
       result = prepareData();
   }
   // Lock released
   mOtherService.doSomething(result); // Safe Binder call
   ```

5. **Use ReadWriteLock for Read-Heavy Operations:**
   ```java
   // ✅ GOOD: Optimize for read-heavy scenarios
   private final ReadWriteLock mCacheLock = new ReentrantReadWriteLock();
   private Map<String, Data> mCache = new HashMap<>();
   
   public Data getData(String key) {
       mCacheLock.readLock().lock();
       try {
           return mCache.get(key);
       } finally {
           mCacheLock.readLock().unlock();
       }
   }
   
   public void updateCache(String key, Data data) {
       mCacheLock.writeLock().lock();
       try {
           mCache.put(key, data);
       } finally {
           mCacheLock.writeLock().unlock();
       }
   }
   ```

### 1.2 Memory Management

**Heap Management:**

Memory leaks in system_server can cause system-wide performance degradation and eventually lead to out-of-memory conditions. Proper memory management is essential for system stability.

1. **Monitor Memory Growth:**
   ```bash
   # Regular monitoring
   adb shell dumpsys meminfo system_server
   
   # Track over time
   watch -n 5 "adb shell dumpsys meminfo system_server | head -30"
   ```

2. **Avoid Memory Leaks:**
   ```java
   // ❌ BAD: Static reference to Activity/Context
   public class MyService {
       private static Activity sActivity; // LEAK!
   }
   
   // ✅ GOOD: Use ApplicationContext or WeakReference
   public class MyService {
       private final Context mAppContext;
       
       public MyService(Context context) {
           mAppContext = context.getApplicationContext();
       }
   }
   
   // ✅ GOOD: Use WeakReference for listeners
   private final List<WeakReference<Listener>> mListeners = new ArrayList<>();
   
   public void addListener(Listener listener) {
       mListeners.add(new WeakReference<>(listener));
   }
   
   private void notifyListeners() {
       Iterator<WeakReference<Listener>> it = mListeners.iterator();
       while (it.hasNext()) {
           WeakReference<Listener> ref = it.next();
           Listener listener = ref.get();
           if (listener == null) {
               it.remove(); // Clean up dead references
           } else {
               listener.onEvent();
           }
       }
   }
   ```

3. **Respect Binder Transaction Limits:**
   ```java
   // ❌ BAD: Large transaction (>1MB limit)
   public void sendLargeData(byte[] data) {
       Parcel parcel = Parcel.obtain();
       parcel.writeByteArray(data); // May exceed 1MB limit
       // Transaction fails!
   }
   
   // ✅ GOOD: Split large data into chunks
   private static final int MAX_CHUNK_SIZE = 512 * 1024; // 512KB chunks
   
   public void sendLargeData(byte[] data) {
       int offset = 0;
       while (offset < data.length) {
           int chunkSize = Math.min(MAX_CHUNK_SIZE, data.length - offset);
           byte[] chunk = Arrays.copyOfRange(data, offset, offset + chunkSize);
           sendChunk(chunk, offset, data.length);
           offset += chunkSize;
       }
   }
   ```

4. **Use Object Pools for Frequent Allocations:**
   ```java
   // ✅ GOOD: Reuse objects to reduce GC pressure
   private final Queue<Parcel> mParcelPool = new ConcurrentLinkedQueue<>();
   
   private Parcel obtainParcel() {
       Parcel parcel = mParcelPool.poll();
       if (parcel == null) {
           parcel = Parcel.obtain();
       }
       return parcel;
   }
   
   private void recycleParcel(Parcel parcel) {
       parcel.recycle();
       if (mParcelPool.size() < 5) { // Limit pool size
           mParcelPool.offer(parcel);
       }
   }
   ```

### 1.3 Binder IPC Optimization

**Transaction Optimization:**

Binder IPC is the primary communication mechanism in Android. Optimizing Binder transactions reduces latency, improves responsiveness, and prevents transaction buffer exhaustion. Every Binder call has overhead, so minimize unnecessary transactions.

1. **Use One-Way Transactions for Fire-and-Forget:**
   ```java
   // ✅ GOOD: One-way transaction for notifications
   public void notifyEvent(Event event) {
       Parcel data = Parcel.obtain();
       Parcel reply = Parcel.obtain();
       try {
           event.writeToParcel(data, 0);
           // FLAG_ONEWAY: Don't wait for reply
           transact(CODE_NOTIFY_EVENT, data, reply, IBinder.FLAG_ONEWAY);
       } finally {
           data.recycle();
           reply.recycle();
       }
   }
   ```

2. **Batch Multiple Operations:**
   ```java
   // ❌ BAD: Multiple separate transactions
   for (String item : items) {
       mService.processItem(item); // N transactions
   }
   
   // ✅ GOOD: Batch in single transaction
   public void processItems(List<String> items) {
       Parcel data = Parcel.obtain();
       data.writeStringList(items); // Single transaction
       transact(CODE_PROCESS_ITEMS, data, null, 0);
       data.recycle();
   }
   ```

3. **Minimize Transaction Data Size:**
   ```java
   // ❌ BAD: Sending unnecessary data
   public void updateUser(User user) {
       Parcel data = Parcel.obtain();
       user.writeToParcel(data, 0); // Sends entire user object
       transact(CODE_UPDATE_USER, data, null, 0);
   }
   
   // ✅ GOOD: Send only changed fields
   public void updateUserName(int userId, String name) {
       Parcel data = Parcel.obtain();
       data.writeInt(userId);
       data.writeString(name); // Only changed data
       transact(CODE_UPDATE_USER_NAME, data, null, 0);
   }
   ```

4. **Use Async Callbacks for Long Operations:**
   ```java
   // ✅ GOOD: Async callback pattern
   public interface ResultCallback {
       void onResult(Result result);
       void onError(Error error);
   }
   
   public void performLongOperation(Params params, ResultCallback callback) {
       mHandler.post(() -> {
           try {
               Result result = doLongWork(params);
               callback.onResult(result);
           } catch (Exception e) {
               callback.onError(new Error(e));
           }
       });
   }
   ```

### 1.4 Service Lifecycle Management

**Startup Optimization:**

System services must start quickly during boot. Delayed service startup can significantly impact boot time. Optimize initialization to start critical services first and defer non-critical work.

1. **Lazy Initialization:**
   ```java
   // ✅ GOOD: Initialize heavy resources on-demand
   public class MyService extends SystemService {
       private HeavyResource mResource;
       
       public HeavyResource getResource() {
           if (mResource == null) {
               synchronized (this) {
                   if (mResource == null) {
                       mResource = new HeavyResource(); // Lazy init
                   }
               }
           }
           return mResource;
       }
   }
   ```

2. **Defer Non-Critical Work:**
   ```java
   // ✅ GOOD: Defer non-critical initialization
   @Override
   public void onStart() {
       // Critical initialization
       initializeCore();
       
       // Defer heavy work
       mHandler.postDelayed(() -> {
           initializeNonCritical();
       }, 5000); // 5 seconds after boot
   }
   ```

3. **Proper Cleanup:**
   ```java
   // ✅ GOOD: Clean up resources
   @Override
   public void onBootPhase(int phase) {
       if (phase == SystemService.PHASE_BOOT_COMPLETED) {
           // Cleanup temporary resources
           cleanupTempFiles();
       }
   }
   
   private void cleanupTempFiles() {
       File tempDir = new File("/data/system/temp");
       File[] files = tempDir.listFiles();
       if (files != null) {
           for (File file : files) {
               if (file.lastModified() < System.currentTimeMillis() - 86400000) {
                   file.delete(); // Delete files older than 24 hours
               }
           }
       }
   }
   ```

## 2. Application Context: Best Practices for Apps

Applications interact with system_server through Binder IPC. Following best practices ensures smooth app performance and prevents ANRs. This section covers optimization techniques for app developers.

### 2.1 Optimizing Binder Calls

**Minimize System Server Interactions:**

Every call to system_server involves Binder IPC overhead. Minimize these calls to improve app responsiveness and reduce system load.

1. **Cache Service References:**
   ```java
   // ❌ BAD: Getting service every time
   public void doSomething() {
       ActivityManager am = (ActivityManager) getSystemService(ACTIVITY_SERVICE);
       am.getRunningAppProcesses(); // Expensive call
   }
   
   // ✅ GOOD: Cache service reference
   private ActivityManager mActivityManager;
   
   @Override
   public void onCreate() {
       super.onCreate();
       mActivityManager = (ActivityManager) getSystemService(ACTIVITY_SERVICE);
   }
   
   public void doSomething() {
       mActivityManager.getRunningAppProcesses(); // Reuse cached reference
   }
   ```

2. **Batch Multiple Calls:**
   ```java
   // ❌ BAD: Multiple separate calls
   for (String packageName : packages) {
       PackageManager pm = getPackageManager();
       pm.getApplicationInfo(packageName, 0); // N calls to system_server
   }
   
   // ✅ GOOD: Batch operation if available
   PackageManager pm = getPackageManager();
   List<ApplicationInfo> infos = pm.getInstalledApplications(0);
   // Single call, filter locally
   ```

3. **Use Async APIs:**
   ```java
   // ❌ BAD: Blocking call on main thread
   public void loadData() {
       List<ProcessInfo> processes = mActivityManager.getRunningAppProcesses();
       // Blocks main thread, can cause ANR
   }
   
   // ✅ GOOD: Use async callback
   public void loadData() {
       new AsyncTask<Void, Void, List<ProcessInfo>>() {
           @Override
           protected List<ProcessInfo> doInBackground(Void... voids) {
               return mActivityManager.getRunningAppProcesses();
           }
           
           @Override
           protected void onPostExecute(List<ProcessInfo> processes) {
               updateUI(processes);
           }
       }.execute();
   }
   ```

### 2.2 Avoiding ANRs

**Best Practices:**

Application Not Responding (ANR) errors occur when the main thread is blocked for too long. ANRs severely impact user experience and can lead to app crashes. Follow these practices to prevent ANRs:

1. **Never Block Main Thread:**
   ```java
   // ❌ BAD: Blocking on main thread
   @Override
   protected void onCreate(Bundle savedInstanceState) {
       super.onCreate(savedInstanceState);
       String data = loadDataFromNetwork(); // BLOCKS!
       displayData(data);
   }
   
   // ✅ GOOD: Use background thread
   @Override
   protected void onCreate(Bundle savedInstanceState) {
       super.onCreate(savedInstanceState);
       new Thread(() -> {
           String data = loadDataFromNetwork();
           runOnUiThread(() -> displayData(data));
       }).start();
   }
   ```

2. **Set Timeouts for System Calls:**
   ```java
   // ✅ GOOD: Timeout for potentially slow operations
   private static final int TIMEOUT_MS = 5000;
   
   public void performOperation() {
       Handler handler = new Handler();
       Runnable timeoutRunnable = () -> {
           // Handle timeout
           onTimeout();
       };
       handler.postDelayed(timeoutRunnable, TIMEOUT_MS);
       
       performAsyncOperation(() -> {
           handler.removeCallbacks(timeoutRunnable);
           onSuccess();
       });
   }
   ```

3. **Use IntentService for Long Operations:**
   ```java
   // ✅ GOOD: IntentService handles background work
   public class MyIntentService extends IntentService {
       public MyIntentService() {
           super("MyIntentService");
       }
       
       @Override
       protected void onHandleIntent(Intent intent) {
           // Long-running operation
           processData();
       }
   }
   ```

### 2.3 Memory Efficiency

**Reduce Memory Pressure:**

Excessive memory usage by apps increases system pressure and can trigger low-memory conditions, causing the system to kill processes. Efficient memory management improves both app and system performance.

1. **Release Resources Promptly:**
   ```java
   // ✅ GOOD: Release resources in onDestroy
   @Override
   protected void onDestroy() {
       super.onDestroy();
       if (mBitmap != null) {
           mBitmap.recycle();
           mBitmap = null;
       }
       if (mCursor != null) {
           mCursor.close();
       }
   }
   ```

2. **Use Lazy Loading:**
   ```java
   // ✅ GOOD: Load data on-demand
   private List<Item> mItems;
   
   public List<Item> getItems() {
       if (mItems == null) {
           mItems = loadItems(); // Load only when needed
       }
       return mItems;
   }
   ```

## 3. Platform Context: System-Wide Optimization

Platform-wide optimizations affect the entire Android system. These practices ensure efficient resource usage, fast boot times, and responsive system behavior.

### 3.1 Boot Time Optimization

**Service Startup:**

Boot time is a critical user experience metric. Optimizing service startup reduces time-to-usable state and improves perceived performance. Follow these strategies:

1. **Prioritize Critical Services:**
   ```java
   // ✅ GOOD: Critical services in bootstrap phase
   private void startBootstrapServices(@NonNull TimingsTraceAndSlog t) {
       t.traceBegin("startBootstrapServices");
       
       // Critical: Start first
       mActivityManagerService = startService(ActivityManagerService.class);
       mPowerManagerService = startService(PowerManagerService.class);
       
       t.traceEnd(); // startBootstrapServices
   }
   
   private void startOtherServices(@NonNull TimingsTraceAndSlog t) {
       t.traceBegin("startOtherServices");
       
       // Non-critical: Start later
       mWallpaperService = startService(WallpaperService.class);
       
       t.traceEnd(); // startOtherServices
   }
   ```

2. **Parallel Service Initialization:**
   ```java
   // ✅ GOOD: Initialize independent services in parallel
   private void startCoreServices(@NonNull TimingsTraceAndSlog t) {
       t.traceBegin("startCoreServices");
       
       ExecutorService executor = Executors.newFixedThreadPool(4);
       
       executor.submit(() -> startService(BatteryService.class));
       executor.submit(() -> startService(UsageStatsService.class));
       executor.submit(() -> startService(WebViewUpdateService.class));
       
       executor.shutdown();
       try {
           executor.awaitTermination(30, TimeUnit.SECONDS);
       } catch (InterruptedException e) {
           // Handle
       }
       
       t.traceEnd(); // startCoreServices
   }
   ```

3. **Defer Heavy Initialization:**
   ```java
   // ✅ GOOD: Defer non-critical work
   @Override
   public void onBootPhase(int phase) {
       if (phase == SystemService.PHASE_BOOT_COMPLETED) {
           // Defer to avoid blocking boot
           mHandler.postDelayed(() -> {
               initializeHeavyFeatures();
           }, 10000); // 10 seconds after boot complete
       }
   }
   ```

### 3.2 Resource Management

**CPU and Memory:**

System resources (CPU, memory, I/O) are finite. Proper resource management prevents resource exhaustion and ensures fair allocation across all processes.

1. **Monitor Resource Usage:**
   ```bash
   # CPU monitoring
   adb shell top -H -p $(pidof system_server)
   
   # Memory monitoring
   adb shell dumpsys meminfo system_server
   
   # Set up alerts for high usage
   ```

2. **Implement Resource Limits:**
   ```java
   // ✅ GOOD: Limit resource consumption
   private static final int MAX_CONCURRENT_OPERATIONS = 10;
   private final Semaphore mOperationSemaphore = new Semaphore(MAX_CONCURRENT_OPERATIONS);
   
   public void performOperation() {
       if (!mOperationSemaphore.tryAcquire()) {
           // Reject if too many concurrent operations
           throw new TooManyOperationsException();
       }
       try {
           doWork();
       } finally {
           mOperationSemaphore.release();
       }
   }
   ```

### 3.3 Performance Monitoring

**Metrics Collection:**

Continuous performance monitoring helps identify regressions early and ensures optimal system performance. Track key metrics to maintain system health.

1. **Track Service Response Times:**
   ```java
   // ✅ GOOD: Monitor performance
   private void trackOperation(String operation, Runnable runnable) {
       long startTime = SystemClock.elapsedRealtime();
       try {
           runnable.run();
       } finally {
           long duration = SystemClock.elapsedRealtime() - startTime;
           if (duration > 100) { // Log slow operations
               Slog.w(TAG, "Slow operation: " + operation + " took " + duration + "ms");
           }
           mMetricsCollector.record(operation, duration);
       }
   }
   ```

2. **Monitor Binder Transaction Latency:**
   ```java
   // ✅ GOOD: Track Binder performance
   @Override
   public boolean onTransact(int code, Parcel data, Parcel reply, int flags) {
       long startTime = SystemClock.elapsedRealtime();
       try {
           boolean result = super.onTransact(code, data, reply, flags);
           return result;
       } finally {
           long duration = SystemClock.elapsedRealtime() - startTime;
           if (duration > 50) { // Log slow transactions
               Slog.w(TAG, "Slow transaction: code=" + code + " duration=" + duration);
           }
       }
   }
   ```

## 4. Security Context: Hardening Best Practices

Security is paramount in system_server. A compromised system_server can lead to complete device compromise. Follow these security best practices to harden the system.

### 4.1 SELinux Policies

**Policy Development:**

SELinux (Security-Enhanced Linux) provides mandatory access control. Proper SELinux policies restrict service capabilities and limit attack surface. Follow the principle of least privilege.

1. **Understand Domain Transitions:**
   ```bash
   # ✅ GOOD: Proper domain transition
   # Allow system_server to execute binary in new domain
   type_transition system_server, shell_exec, shell, shell;
   ```

2. **Minimize Permissions:**
   ```bash
   # ❌ BAD: Overly permissive
   allow system_server *:file { read write execute };
   
   # ✅ GOOD: Minimal permissions
   allow system_server config_file:file { read };
   ```

3. **Monitor SELinux Denials:**
   ```bash
   # Check for denials
   adb shell dmesg | grep "avc: denied"
   adb logcat | grep "SELinux"
   
   # Generate policy from denials
   adb shell audit2allow -p <policy_file> < denial_log
   ```

### 4.2 Permission Management

**Principle of Least Privilege:**

Always grant the minimum permissions necessary for functionality. Over-permissive services increase security risk. Verify permissions before performing sensitive operations.

1. **Check Permissions Before Operations:**
   ```java
   // ✅ GOOD: Verify permissions
   public void performSensitiveOperation(int uid) {
       if (!hasPermission(uid, PERMISSION_SENSITIVE_OP)) {
           throw new SecurityException("Permission denied");
       }
       // Proceed with operation
   }
   ```

2. **Use Permission Checks in Binder:**
   ```java
   // ✅ GOOD: Check caller identity
   @Override
   public boolean onTransact(int code, Parcel data, Parcel reply, int flags) {
       if (code == SENSITIVE_OPERATION) {
           enforceCallingPermission(Manifest.permission.SENSITIVE_OP);
       }
       return super.onTransact(code, data, reply, flags);
   }
   ```

### 4.3 Input Validation

**Sanitize All Inputs:**

All input from untrusted sources (apps, network, files) must be validated and sanitized. Malicious input can lead to security vulnerabilities, crashes, or privilege escalation.

1. **Validate Binder Input:**
   ```java
   // ❌ BAD: No validation
   public void processData(String data) {
       File file = new File(data); // Path traversal vulnerability!
   }
   
   // ✅ GOOD: Validate input
   public void processData(String data) {
       // Validate path
       if (!isValidPath(data)) {
           throw new IllegalArgumentException("Invalid path");
       }
       // Sanitize
       String sanitized = sanitizePath(data);
       File file = new File(sanitized);
   }
   
   private boolean isValidPath(String path) {
       // Check for path traversal
       return !path.contains("..") && path.startsWith("/data/system/");
   }
   ```

2. **Validate Array Bounds:**
   ```java
   // ✅ GOOD: Bounds checking
   public void processArray(int[] array, int index) {
       if (index < 0 || index >= array.length) {
           throw new IndexOutOfBoundsException("Invalid index: " + index);
       }
       // Safe to access
       int value = array[index];
   }
   ```

## 5. Development Context: Code Quality

Maintainable, testable code is essential for long-term system health. This section covers code organization, testing strategies, and error handling best practices.

### 5.1 Code Organization

**Service Structure:**

Well-organized code is easier to understand, test, and maintain. Follow these principles for clean service architecture:

1. **Separate Concerns:**
   ```java
   // ✅ GOOD: Clear separation
   public class MyService extends SystemService {
       private final Handler mHandler;
       private final DataManager mDataManager;
       private final NetworkManager mNetworkManager;
       
       // Each component has single responsibility
   }
   ```

2. **Use Dependency Injection:**
   ```java
   // ✅ GOOD: Testable design
   public class MyService extends SystemService {
       private final DataSource mDataSource;
       
       public MyService(Context context, DataSource dataSource) {
           super(context);
           mDataSource = dataSource; // Injected dependency
       }
   }
   ```

### 5.2 Testing Strategies

**Comprehensive Testing Approach:**

1. **Unit Testing:**
   ```java
   // ✅ GOOD: Testable service methods
   public class MyService {
       private final DataSource mDataSource;
       
       public MyService(DataSource dataSource) {
           mDataSource = dataSource; // Dependency injection
       }
       
       public Result processData(Input input) {
           // Pure function - easy to test
           return doProcessing(input);
       }
   }
   
   // Unit test
   @Test
   public void testProcessData() {
       DataSource mockDataSource = mock(DataSource.class);
       MyService service = new MyService(mockDataSource);
       
       Input input = new Input("test");
       Result result = service.processData(input);
       
       assertEquals("expected", result.getValue());
   }
   ```

2. **Integration Testing:**
   ```bash
   # ✅ GOOD: Test service interactions
   # Test service registration
   adb shell service check activity
   
   # Test service response
   adb shell dumpsys activity services | grep MyService
   
   # Test Binder transactions
   adb shell dumpsys activity services | grep -A 10 "Binder"
   ```

3. **Performance Testing:**
   ```bash
   # ✅ GOOD: Performance benchmarks
   # Baseline measurement
   adb shell dumpsys meminfo system_server > baseline.txt
   
   # After changes
   adb shell dumpsys meminfo system_server > current.txt
   
   # Compare
   diff baseline.txt current.txt
   ```

### 5.3 Error Handling

**Robust Error Handling:**

System services must handle errors gracefully. Unhandled exceptions can crash system_server, causing system instability. Implement comprehensive error handling for all failure modes.

1. **Handle All Exceptions:**
   ```java
   // ✅ GOOD: Comprehensive error handling
   public void performOperation() {
       try {
           doWork();
       } catch (IOException e) {
           Slog.e(TAG, "IO error", e);
           // Recover gracefully
           recoverFromIOError();
       } catch (SecurityException e) {
           Slog.e(TAG, "Security error", e);
           // Don't expose sensitive info
           throw new RuntimeException("Operation failed");
       } catch (Exception e) {
           Slog.e(TAG, "Unexpected error", e);
           // Log and continue if possible
       }
   }
   ```

2. **Validate State:**
   ```java
   // ✅ GOOD: State validation
   public void performOperation() {
       if (!isInitialized()) {
           throw new IllegalStateException("Service not initialized");
       }
       if (isShuttingDown()) {
           throw new IllegalStateException("Service is shutting down");
       }
       // Proceed
   }
   ```

## 6. Common Pitfalls and How to Avoid Them

Even experienced developers make mistakes. This section highlights common pitfalls in system_server development and how to avoid them.

### 6.1 Deadlock Prevention

**Common Deadlock Scenarios:**

Deadlocks occur when two or more threads are blocked waiting for each other. Deadlocks in system_server can cause system-wide hangs. Follow these patterns to prevent deadlocks:

1. **Lock Ordering Violations:**
   ```java
   // ❌ BAD: Potential deadlock
   // Thread 1: lockA -> lockB
   // Thread 2: lockB -> lockA
   
   // ✅ GOOD: Consistent lock ordering
   // Always: lockA -> lockB
   ```

2. **Binder Calls in Synchronized Blocks:**
   ```java
   // ❌ BAD: Deadlock risk
   synchronized (mLock) {
       mOtherService.call(); // Can block, holding lock
   }
   
   // ✅ GOOD: Release lock first
   Data data;
   synchronized (mLock) {
       data = getData();
   }
   mOtherService.call(data);
   ```

### 6.2 Memory Leak Prevention

**Common Leak Sources:**

Memory leaks gradually consume system memory, eventually leading to out-of-memory conditions. Common leak sources include static references, unregistered listeners, and retained contexts.

1. **Static References:**
   ```java
   // ❌ BAD: Static reference leaks context
   private static Context sContext;
   
   // ✅ GOOD: Use ApplicationContext
   private final Context mAppContext;
   ```

2. **Listener Registration:**
   ```java
   // ❌ BAD: Forgot to unregister
   mBroadcastReceiver = new BroadcastReceiver() { ... };
   registerReceiver(mBroadcastReceiver, filter);
   // Never unregistered!
   
   // ✅ GOOD: Always unregister
   @Override
   protected void onDestroy() {
       if (mBroadcastReceiver != null) {
           unregisterReceiver(mBroadcastReceiver);
       }
   }
   ```

### 6.3 Performance Anti-Patterns

**Avoid These Patterns:**

Some coding patterns seem reasonable but cause performance issues. Avoid these anti-patterns to maintain optimal system performance.

1. **Excessive Synchronization:**
   ```java
   // ❌ BAD: Over-synchronization
   public synchronized void method1() { ... }
   public synchronized void method2() { ... }
   public synchronized void method3() { ... }
   
   // ✅ GOOD: Minimize synchronization
   private final Object mLock = new Object();
   public void method1() {
       synchronized (mLock) {
           // Only critical section
       }
   }
   ```

2. **Premature Optimization:**
   ```java
   // ❌ BAD: Complex optimization without profiling
   // ✅ GOOD: Profile first, optimize hot paths
   ```

## 7. Additional Best Practices

### 7.1 Logging Best Practices

**Effective Logging:**

1. **Use Appropriate Log Levels:**
   ```java
   // ✅ GOOD: Appropriate log levels
   Slog.v(TAG, "Detailed debug info"); // Verbose - development only
   Slog.d(TAG, "Debug information");   // Debug - development
   Slog.i(TAG, "Informational message"); // Info - important events
   Slog.w(TAG, "Warning condition");    // Warning - potential issues
   Slog.e(TAG, "Error occurred", exception); // Error - failures
   ```

2. **Avoid Logging Sensitive Data:**
   ```java
   // ❌ BAD: Logging sensitive information
   Slog.d(TAG, "User password: " + password);
   Slog.d(TAG, "Auth token: " + token);
   
   // ✅ GOOD: Sanitize sensitive data
   Slog.d(TAG, "User authentication attempted");
   Slog.d(TAG, "Token length: " + (token != null ? token.length() : 0));
   ```

3. **Use Structured Logging:**
   ```java
   // ✅ GOOD: Structured logging for better analysis
   Slog.i(TAG, String.format("Service started: name=%s, pid=%d, uid=%d", 
       serviceName, Process.myPid(), Process.myUid()));
   ```

### 7.2 Error Recovery Strategies

**Graceful Degradation:**

1. **Implement Fallback Mechanisms:**
   ```java
   // ✅ GOOD: Fallback on failure
   public Data loadData() {
       try {
           return loadFromPrimarySource();
       } catch (IOException e) {
           Slog.w(TAG, "Primary source failed, using cache", e);
           return loadFromCache();
       }
   }
   ```

2. **Retry with Exponential Backoff:**
   ```java
   // ✅ GOOD: Retry with backoff
   private static final int MAX_RETRIES = 3;
   private static final long INITIAL_DELAY_MS = 100;
   
   public void performOperationWithRetry() {
       int retries = 0;
       long delay = INITIAL_DELAY_MS;
       
       while (retries < MAX_RETRIES) {
           try {
               performOperation();
               return; // Success
           } catch (TransientException e) {
               retries++;
               if (retries < MAX_RETRIES) {
                   SystemClock.sleep(delay);
                   delay *= 2; // Exponential backoff
               }
           }
       }
       throw new OperationFailedException("Max retries exceeded");
   }
   ```

### 7.3 Testing Best Practices

**Comprehensive Testing:**

1. **Unit Testing:**
   ```java
   // ✅ GOOD: Testable service design
   public class MyService {
       private final DataSource mDataSource;
       
       public MyService(DataSource dataSource) {
           mDataSource = dataSource; // Dependency injection
       }
       
       public Result processData(Input input) {
           // Pure logic - easy to test
           return doProcessing(input);
       }
   }
   
   // Unit test
   @Test
   public void testProcessData() {
       DataSource mockDataSource = mock(DataSource.class);
       MyService service = new MyService(mockDataSource);
       
       Input input = new Input("test");
       Result result = service.processData(input);
       
       assertEquals("expected", result.getValue());
   }
   ```

2. **Integration Testing:**
   ```bash
   # ✅ GOOD: Test service interactions
   # Test service registration
   adb shell service check activity
   
   # Test service response
   adb shell dumpsys activity services | grep MyService
   
   # Test Binder transactions
   adb shell dumpsys activity services | grep -A 10 "Binder"
   ```

3. **Performance Testing:**
   ```bash
   # ✅ GOOD: Performance benchmarks
   # Baseline measurement
   adb shell dumpsys meminfo system_server > baseline.txt
   
   # After changes
   adb shell dumpsys meminfo system_server > current.txt
   
   # Compare
   diff baseline.txt current.txt
   ```

### 7.4 Documentation Best Practices

**Clear Documentation:**

1. **Code Comments:**
   ```java
   // ✅ GOOD: Clear, concise comments
   /**
    * Processes user data and returns result.
    * 
    * @param userId The unique identifier for the user
    * @param data The data to process
    * @return Processed result, or null if user not found
    * @throws SecurityException if caller lacks required permission
    */
   public Result processUserData(int userId, Data data) {
       // Implementation
   }
   ```

2. **API Documentation:**
   ```java
   // ✅ GOOD: Document public APIs
   /**
    * System service for managing user data.
    * 
    * <p>This service provides secure access to user-specific data
    * stored in the system. All operations require appropriate
    * permissions and are subject to SELinux policies.
    * 
    * <p>Thread safety: This service is thread-safe. Multiple
    * concurrent calls are supported.
    */
   public class UserDataService extends SystemService {
       // ...
   }
   ```

### 7.5 Performance Optimization Checklist

**Before Optimization:**

1. **Profile First:**
   ```bash
   # Use profiling tools
   adb shell simpleperf record -p $(pidof system_server) -g --duration 30
   adb shell perfetto -o /data/local/tmp/trace.pbtxt -t 10s
   ```

2. **Identify Hot Paths:**
   - Use profiling data to find slow operations
   - Focus on frequently called methods
   - Optimize critical paths first

3. **Measure Impact:**
   ```bash
   # Before optimization
   adb shell dumpsys meminfo system_server > before.txt
   
   # After optimization
   adb shell dumpsys meminfo system_server > after.txt
   
   # Compare results
   diff before.txt after.txt
   ```

**Optimization Strategies:**

1. **Cache Frequently Accessed Data:**
   ```java
   // ✅ GOOD: Cache with TTL
   private final Map<String, CachedData> mCache = new ConcurrentHashMap<>();
   private static final long CACHE_TTL_MS = 60000; // 1 minute
   
   public Data getData(String key) {
       CachedData cached = mCache.get(key);
       if (cached != null && 
           SystemClock.elapsedRealtime() - cached.timestamp < CACHE_TTL_MS) {
           return cached.data;
       }
       
       Data data = loadData(key);
       mCache.put(key, new CachedData(data, SystemClock.elapsedRealtime()));
       return data;
   }
   ```

2. **Use Lazy Initialization:**
   ```java
   // ✅ GOOD: Initialize on demand
   private HeavyResource mResource;
   
   private HeavyResource getResource() {
       if (mResource == null) {
           synchronized (this) {
               if (mResource == null) {
                   mResource = new HeavyResource();
               }
           }
       }
       return mResource;
   }
   ```

3. **Batch Operations:**
   ```java
   // ❌ BAD: Individual operations
   for (String item : items) {
       processItem(item); // N operations
   }
   
   // ✅ GOOD: Batch processing
   processItems(items); // Single operation
   ```

## Summary

This comprehensive article covered best practices and optimization techniques across multiple contexts:

1. **System Server Context**: Threading, memory management, Binder optimization, service lifecycle
2. **Application Context**: Optimizing Binder calls, avoiding ANRs, memory efficiency
3. **Platform Context**: Boot time optimization, resource management, performance monitoring
4. **Security Context**: SELinux policies, permission management, input validation
5. **Development Context**: Code organization, testing, error handling
6. **Common Pitfalls**: Deadlock prevention, memory leak avoidance, performance anti-patterns
7. **Additional Best Practices**: Logging, error recovery, testing strategies, documentation, performance optimization checklist

**Key Takeaways:**
- Always use background threads for I/O and long operations
- Maintain consistent lock ordering to prevent deadlocks
- Monitor memory usage and clean up resources promptly
- Optimize Binder transactions (batch, one-way, minimize size)
- Follow security best practices (SELinux, permissions, input validation)
- Profile before optimizing, focus on hot paths
- Write testable, maintainable code with proper error handling

---

## Next Steps

Continue to **[Part 6: Advanced Q&A](./android-system-server-qa.html)** for comprehensive answers to 25+ common questions about system_server, covering edge cases and advanced scenarios.

---

## Related Articles

- [Part 4: Debugging and Troubleshooting](./android-system-server-debugging.html)
- [Part 6: Advanced Q&A](./android-system-server-qa.html)
- [Series Index](./android-system-server-series.html)

---

*This article is part of the [Android System Server Deep Dive](./android-system-server-series.html) series. For the complete learning path, start with the [Series Index](./android-system-server-series.html).*

