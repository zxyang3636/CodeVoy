---
title: Java 并发编程基础
published: 2025-08-18
tags: [后端, Java, 并发编程]
category: Java
draft: false
---


## 进程与线程




### 进程
- 程序由指令和数据组成，但这些指令要运行，数据要读写，就必须将指令加载至 CPU，数据加载至内存。在指令运行过程中还需要用到磁盘 、网络等设备。**进程就是用来加载指令、管理内存、管理 IO 的** 
- 当一个程序被运行，从磁盘加载这个程序的代码至内存，这时就开启了一个进程。 
- 进程就可以视为程序的一个实例。大部分程序可以同时运行多个实例进程（例如记事本、画图、浏览器等），也有的程序只能启动一个实例进程（例如网易云音乐、360 安全卫士等） 
>进程可以理解为程序的执行过程，是动态的！


### 线程

- 一个进程之内可以分为一到多个线程。 
- 一个线程就是一个指令流，将指令流中的一条条指令以一定的顺序交给 CPU 执行 
- Java 中，线程是最小的调度单位，进程作为资源分配的最小单位。 在 Windows 中进程是不活动的，只是作为线程的容器


### 对比
- 进程基本上相互独立，而线程存在于进程内，是进程的一个子集
- 进程拥有共享的资源，如内存空间等，供其内部的线程共享
- 进程间通信较为复杂
  - 同一台计算机的进程通信称为 IPC (Inter-process communication)
  - 不同计算机之间的进程通信，需要通过网络，并遵守共同的协议，例如 HTTP 协议
- 线程通信相对简单，因为它们共享进程内的内存，多个线程可以访问同一个共享变量
- 线程更轻量，线程上下文切换成本一般要比进程上下文切换低

### 💡面试题
什么是进程和线程？

进程是程序的一次执行过程，是系统运行程序的基本单位，因此进程是动态的。系统运行一个程序即是一个进程从创建，运行到消亡的过程。

在 Java 中，当我们启动 main 函数时其实就是启动了一个 JVM 的进程，而 main 函数所在的线程就是这个进程中的一个线程，也称主线程。

如下图所示，在 Windows 中通过查看任务管理器的方式，我们就可以清楚看到 Windows 当前运行的进程（.exe 文件的运行）。
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/xw_20250811211830.png)

*何为线程?*

线程与进程相似，但线程是一个比进程更小的执行单位。一个进程在其执行的过程中可以产生多个线程。与进程不同的是同类的多个线程共享进程的**堆**和**方法区**资源，但每个线程有自己的**程序计数器**、**虚拟机栈**和**本地方法栈**，所以系统在产生一个线程，或是在各个线程之间做切换工作时，负担要比进程小得多，也正因为如此，线程也被称为轻量级进程。

## 并行与并发

并发是在同一时间段，并行是在同一时刻！

:::tip
并发（Concurrent）：一个人同时做很多不同事情 

并行（Parallel）：一群人各自同时做很多事情
:::

### 并发
单核 CPU 下，线程实际还是 `串行执行` 的。操作系统中有一个组件叫做*任务调度器*，将 CPU 的时间片（windows 下时间片最小约为 15 毫秒）分给不同的程序使用，只是由于 CPU 在线程间（时间片很短）的切换非常快，人类感觉是同时运行的 。总结为一句话就是： *微观串行，宏观并行* 。

>一般我们会将这种 *线程轮流使用CPU* 的做法称为:  **并发（ Concurrent）**

| CPU  | 时间片 1 | 时间片 2 | 时间片 3 | 时间片 4 |
|------|----------|----------|----------|----------|
| core | 线程 1   | 线程 2   | 线程 3   | 线程 4   |

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/%E5%B9%B6%E5%8F%91%E7%BC%96%E7%A8%8B_page7_image.png)
### 并行
多核 cpu下，每个 `核（core）` 都可以调度运行线程，这时候线程可以是 **并行** 的
| CPU | 时间片 1 | 时间片 2 | 时间片 3 | 时间片 4 |
| --- | --- | --- | --- | --- |
| core 1 | 线程 1 | 线程 1 | 线程 3 | 线程 3 |
| core 2 | 线程 2 | 线程 4 | 线程 2 | 线程 4 |

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/%E5%B9%B6%E5%8F%91%E7%BC%96%E7%A8%8B_page8_image.png)

>在多核 CPU 下并发和并行是同时存在的。

:::info
- 并发（concurrent）是同一时间应对（dealing with）多件事情的能力
- 并行（parallel）是同一时间动手做（doing）多件事情的能力
:::


生活例子
- 家庭主妇做饭、打扫卫生、给孩子喂奶，她一个人轮流交替做这多件事，这时就是并发
- 家庭主妇雇了个保姆，她们一起这些事，这时既有并发，也有并行（这时会产生竞争，例如锅只有一口，一个人用锅时，另一个人就得等待）
- 雇了3个保姆，一个专做饭、一个专打扫卫生、一个专喂奶，互不干扰，这时是并行


### 💡面试题

并发和并行的区别
- 并发：两个及两个以上的作业在同一 时间段 内执行
- 并行：两个及两个以上的作业在同一 时刻 执行
最关键的点是：是否是 同时 执行

同步和异步的区别
- 同步：发出一个调用之后，在没有得到结果之前， 该调用就不可以返回，一直等待。
- 异步：调用在发出之后，不用等待返回结果，该调用直接返回。


## 线程基本应用

### 异步调用

从方法调用方的角度来讲，如果：
- 需要等待结果返回，才能继续运行就是 **同步**
- 不需要等待结果返回，就能继续运行就是 **异步**

注：同步在多线程中还有另外一个意思，就是让多个线程步调一致


1）设计
多线程可以让方法执行变成异步的（即不要一直干等着）。比如读取磁盘文件时，假设读取操作需要花费 5s，如果没有线程调度机制，那么这 5s 调用者其他的事都做不了，其余代码都得暂停。

2）结论
- 在项目中，如果需要进行一些费时操作，比如视频文件需要转换格式等操作，这时开一个新线程处理视频转换，避免阻塞住主线程
- Tomcat 的异步 Servlet 也是类似的目的，让用户线程处理耗时较长的操作，避免阻塞 Tomcat 的工作线程 
- UI 程序中，开线程进行其他操作，避免阻塞 UI 线程

同步等待
```java
@Slf4j(topic = "c.Sync")
public class Sync {
    public static void main(String[] args) {
        FileReader.read(Constants.MP4_FULL_PATH);  // 同步调用
        log.debug("do other things ...");
    }
}
```
异步不等待
```java
@Slf4j(topic = "c.Async")
public class Async {
    public static void main(String[] args) {
        // 异步调用
        new Thread(new Runnable() {
            public void run() {
                FileReader.read(Constants.MP4_FULL_PATH);
            }
        }).start();

        log.debug("do other things ...");
    }
}
```

---
**提高运行效率**

充分利用多核 cpu 的优势，提高运行效率。想象下面的场景：执行 3 个计算，最后将计算结果汇总。

>计算 1 花费 10 ms
>
>计算 2 花费 11 ms
>
>计算 3 花费 9 ms
>
>汇总需要 1 ms

- 如果是串行执行，那么总共花费的时间是 10 + 11 + 9 + 1 = 31ms 
- 但如果是四核 cpu，各个核心分别使用线程 1 执行计算 1，线程 2 执行计算 2，线程 3 执行计算 3，那么 3 个 线程是并行的，花费时间只取决于最长的那个线程运行的时间，即 11ms最后加上汇总时间只会花费 12ms 
- 需要在多核 cpu 才能提高效率，单核仍然是轮流执行。


---

## 创建与运行线程

### 使用Thread

>Java 程序在启动时，都会创建一个主方法线程（也称：主线程）。默认就已经有一个主线程在运行。
```java
// 创建线程对象
Thread t = new Thread("t1") {
    @Override
    public void run() {
        // 要执行的任务
    }
};
// 启动线程
t.start();
```

指定名称
```java
@Slf4j(topic = "c.Test1")
public class DirectUseThreadTest {
    public static void main(String[] args) {
        // 创建线程
        Thread t1 = new Thread("t1") {  // 指定名称（方式一）
            @Override
            public void run() {
                log.debug("running ...");
            }
        };

        t1.setName("t1");  // 指定名称（方式二）

        // 启动线程
        t1.start();

        // 主线程打印
        log.debug("running ...");
    }
}
```

Lambda写法
```java
@Slf4j
public class ThreadDemo {
    public static void main(String[] args) {
        new Thread(() -> {
            log.info("running");
        }, "t1").start();

        log.info("main");
    }
}
```


### 使用Runable配合Thread
把【线程】和【任务】(要执行的代码) 分开
- Thread 代表线程
- Runnable 代表可运行的任务（线程要执行的代码）

语法：
```java
Runnable runnable = new Runnable() {
    @Override
    public void run() {
        // 要执行的任务
    }
};
// 创建线程对象
Thread t = new Thread(runnable);
// 启动线程
t.start();
```

```java
// 创建任务对象
Runnable task2 = new Runnable() {
    @Override
    public void run() {
        log.debug("hello");
    }
};

// 参数1 是任务对象; 参数2 是线程名字
Thread t2 = new Thread(task2, "t2");
t2.start();
```

lambda表达式:
```java
// 创建任务对象
Runnable task2 = () -> log.debug("hello");

// 参数1 是任务对象; 参数2 是线程名字，推荐
Thread t2 = new Thread(task2, "t2");
t2.start();



public static void test2() {
    Runnable runnable = () -> log.info("runnable running");
    new Thread(runnable, "t2").start();
}
```

原理 —— Thread 与 Runnable 的关系

Thread 核心源码
```java
private Runnable target;

@Override
public void run() {
    if (target != null) {
        target.run();
    }
}
```
实际，就是在 Thread 中的 run 方法里面调用了 Runnable 方法的 run 方法来执行任务。

- 第一种创建线程的方法是把线程和任务的创建合并在了一起，第二种创建线程的方法是把线程和任务分开创建了 
- 用 Runnable 更容易与线程池等高级 API 配合 
- 用 Runnable 让任务类脱离了 Thread 继承体系，更灵活

### FutureTask配合Thread

FutureTask能够接收Callable类型的参数，用来**处理有返回结果的情况**。

```java
@Slf4j(topic = "c.Test3")
public class FutureAndCallableTest {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        // 1.创建任务对象
        FutureTask<Integer> task = new FutureTask<>(new Callable<>() {
            @Override
            public Integer call() throws Exception {
                log.debug("running ...");
                Thread.sleep(4000);
                return 100;
            }
        });

        // 2.创建线程对象，并关联任务
        Thread t = new Thread(task, "t3");

        t.start();

        // 主线程运行到此处时，就会一直阻塞。直到 task 执行完毕后返回结果
        log.debug("{}",  task.get());
    }
}
```

```
11:46:34.082 c.Test3 [t3] - running ...
11:50:35.093 c.Test3 [main] - 100
```

lambda:
```java
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        FutureTask<Integer> task = new FutureTask<>(() -> {
            TimeUnit.SECONDS.sleep(1);
            log.info("running...");
            return 100;
        });
        new Thread(task, "t1").start();
        Integer i = task.get();
        log.info("i:{}", i);
    }
```


## 查看进程线程的方法

Windows
- 任务管理器可以查看进程和线程数，也可以用来杀死进程
- `tasklist` 查看进程
- `taskkill` 杀死进程

linux
- `ps -ef` 查看所有进程
- `ps -fT -p <PID>` 查看某个进程（PID）的所有线程
- `kill` 杀死进程
- `top` 按大写 H 切换是否显示线程
- `top -H -p <PID>` 查看某个进程（PID）中的所有线程

Java
- `jps` 命令查看所有 Java 进程
- `jstack <PID>` 查看某个 Java 进程（PID）在运行 jstack 时的所有线程状态
- `jconsole` 来查看某个 Java 进程中线程的运行情况（图形界面）


**Jconsole 使用**

jconsole 远程监控需要先进行如下配置： 

需要以如下方式运行你的 java 类(在服务器上执行的命令)
```
java -Djava.rmi.server.hostname=ip地址 -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.port=连接端口 -Dcom.sun.management.jmxremote.ssl=是否安全连接 -Dcom.sun.management.jmxremote.authenticate=是否认证 java类
```

在windows环境下，cmd中输入`jconsole`，连接远程的服务器即可，例如`192.168.1.100:1099`；要有ip加端口号进行连接。

## 线程运行的原理
[原理视频](https://www.bilibili.com/video/BV16J411h7Rd?spm_id_from=333.788.videopod.episodes&vd_source=da7c7c4a886275716b7ca33f532f1905&p=21)

### 栈和栈帧

Java Virtual Machine Stacks（Java 虚拟机栈） 

我们都知道 **JVM 中由堆、栈、方法区所组成**，其中栈内存是给谁用的呢？其实就是线程 (对象都是在堆中创建的)，每个线程启动后，虚拟机就会为其分配一块栈内存。 
- 每个栈由多个栈帧（Frame）组成，对应着每次方法调用时所占用的内存 
- 每个线程只能有一个活动栈帧，对应着当前正在执行的那个方法 

在idea中debug的时候，就能看到栈帧信息；每执行一个方法就会生成一个栈帧，一个线程的栈中可以有多个栈帧（对应方法调用链，如 main → methodA → methodB）。

**栈帧是先进后出**；

**每个线程都有自己独立的栈**；这个栈是线程私有的，与其他线程隔离。
### 线程上下文切换

Thread Context Switch（线程上下文切换）


以下一些原因会导致 CPU 不再执行当前的线程，转而执行另一个线程的代码：
1. 线程的 cpu 时间片用完
2. 垃圾回收（会暂停当前所有的工作线程，让垃圾回收的线程来运行）
3. 有更高优先级的线程需要运行
4. 线程自发调用了 sleep()、yield()、wait()、join()、park()、synchronized、lock() 等方法

当上下文切换发生时，需要由操作系统保存当前线程的状态，并恢复另一个线程的状态，Java 中对应的概念就是**程序计数器（Program Counter Register）**，它的作用是记住下一条 jvm 指令的执行地址，它是线程私有的 
- 状态包括程序计数器、虚拟机栈中每个栈帧的信息，如局部变量、操作数栈、返回地址等 
- 频繁的上下文切换会影响性能


### 相关面试题🤏🏻


**什么是线程上下文切换？**

线程在执行过程中会有自己的运行条件和状态（也称上下文），比如程序计数器，栈信息等。当出现如下情况的时候，线程会从占用 CPU 状态中退出。
- 主动让出 CPU，比如调用了sleep(), wait() 等。
- 时间片用完，因为操作系统要防止一个线程或者进程长时间占用 CPU 导致其他线程或者进程饿死。
- 调用了阻塞类型的系统中断，比如请求 IO，线程被阻塞。
- 被终止或结束运行

这其中前三种都会发生线程切换，线程切换意味着需要保存当前线程的上下文，留待线程下次占用 CPU 的时候恢复现场。并加载下一个将要占用 CPU 的线程上下文。这就是所谓的 **上下文切换**。

上下文切换是现代操作系统的基本功能，因其每次需要保存信息恢复信息，这将会占用 CPU，内存等系统资源进行处理，也就意味着效率会有一定损耗，如果频繁切换就会造成整体效率低下。


:::tip
**“时间片用完”**

“时间片”（Time Slice）是操作系统分配给每个线程/进程的一小段 CPU 使用时间，比如 10 毫秒。
当一个线程开始运行，它只能使用 CPU 一段时间（即这个“时间片”）。
一旦这个时间到了，时间片用完，操作系统就会中断它，进行调度。这种机制叫做 **时间片轮转调度**（Round-Robin Scheduling）, 时间片的长度由操作系统决定，通常是几毫秒到几十毫秒

**“导致其他线程或进程饿死”**

“饿死”（Starvation）是一个术语，意思是：某些线程长期得不到 CPU 时间，无法执行。

比如你有 10
个线程，但有一个“霸道”线程一直运行，其他 9 个一直等，永远等不到机会 —— 它们就“饿死了”。

:::



## 线程常见方法

| 方法名 | 是否是静态方法 | 功能说明 | 注意
| --- | --- | --- | ---
| start() |  | 启动一个新线程，在新的线程运行 run 方法中的代码 | start 方法只是让线程进入就绪，里面代码不一定立刻运行（CPU 的时间片还没分给它）。每个线程对象的 start 方法只能调用一次，如果调用了多次会出现 IllegalThreadStateException
| run() |  | 新线程启动后会调用的方法 | 如果在构造 Thread 对象时传递了 Runnable 参数，则线程启动后会调用 Runnable 中的 run 方法，否则默认不执行任何操作。但可以创建 Thread 的子类对象，来覆盖默认行为
| join() |  | 等待线程运行结束 | 
| join(long n) |  | 等待线程运行结束,最多等待 n 毫秒 | 
| getId() |  | 获取线程长整型的 id | id 唯一
| getName() |  | 获取线程名 | 
| setName(String) |  | 修改线程名 | 
| getPriority() |  | 获取线程优先级 | 
| setPriority(int) |  | 修改线程优先级 | java 中规定线程优先级是 1~10 的整数，较大的优先级能提高该线程被 CPU 调度的机率
| getState() |  | 获取线程状态 | Java 中线程状态是用 6 个 enum 表示，分别为：NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED
| isInterrupted() |  | 判断是否被打断， | 不会清除 打断标记
| isAlive() |  | 线程是否存活（还没有运行完毕） | 
| interrupt() |  | 打断线程 | 如果被打断线程正在 sleep，wait，join 会导致被打断的线程抛出 InterruptedException，并清除 打断标记；如果打断的正在运行的线程，则会设置 打断标记；park 的线程被打断，也会设置 打断标记
| interrupted() | static | 判断当前线程是否被打断 | 会清除 打断标记
| currentThread() | static | 获取当前正在执行的线程 | 
| sleep(long n) | static | 让当前执行的线程休眠n毫秒，休眠时让出 cpu 的时间片给其它线程 |                  |
| yield()     | static | 提示线程调度器让出当前线程对 CPU 的使用 | 主要是为了测试和调试 |


还有一些不推荐使用的方法，这些方法已过时，容易破坏同步代码块，造成线程死锁
| 方法名|是否是静态方法|功能说明
|:----:|:----:|:----:|
|stop()|N|停止线程运行|
|suspend()|N|挂起（暂停）线程运行|
|resume()|N|恢复线程运行|

### start、run
结论：
1. 直接调用run()方法，相当于**同步**。是在主线程中执行run()方法，并没有启动新的线程来执行！
2. 通过start()方法来启动线程，相当于**异步**。通过新的线程来间接执行run()中的代码！

start用来启动线程，run是线程启动后，要执行的方法。

start方法只是让线程进入就绪，里面代码不一定立刻运行（CPU 的时间片还没分给它）。每个线程对象的 start 方法只能调用一次，如果调用了多次会出现 IllegalThreadStateException。


直接调用run的话不会生成一个新的线程 而是在当前的线程里面执行。直接调用run方法，相当于是同步的，不是异步了

两者区别代码演示如下：
```java
@Slf4j(topic = "c.Test4")
public class ThreadRunTest {

    public static void main(String[] args) {
        Thread t1 = new Thread(new Runnable() {
            @Override
            public void run() {
                log.debug("running...");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }, "t1");

        t1.run();
        log.debug("do other things...");
    }
}
```
```java
22:36:54.587 c.Test4 [main] - running...
22:36:56.596 c.Test4 [main] - do other things...
```
我们发现线程一直在【main】线程中执行，run()方法调用还是同步的。

```java
@Slf4j(topic = "c.Test4")
public class ThreadRunTest {

    public static void main(String[] args) {
        Thread t1 = new Thread(new Runnable() {
            @Override
            public void run() {
                log.debug("running...");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }, "t1");

        // 将 run() 改成 start() 	
        t1.start();
        log.debug("do other things...");
    }
}
```
```java
22:47:58.687 c.Test4 [main] - do other things...
22:47:58.687 c.Test4 [t1] - running...
```
我们发现run()方法中的代码在t1线程中执行，是异步调用的。


**线程执行前后状态信息变化**

```java
@Slf4j(topic = "c.Test5")
public class ThreadStateTest {
    public static void main(String[] args) {
        Thread t1 = new Thread(new Runnable() {
            @Override
            public void run() {
                log.debug("running...");
            }
        }, "t1");

        // 查看线程执行前后的状态信息
        System.out.println(t1.getState());
        t1.start();
//        t1.start();   不能被多次调用，否则会报错
        System.out.println(t1.getState());
    }
}
```
```java
NEW  
RUNNABLE
22:55:49.182 c.Test5 [t1] - running...
```

:::info
- NEW：初始状态，线程被创建出来但没有被调用start() 。
- RUNNABLE：运行状态，线程被调用了start()等待运行的状态。
:::
不调start就是初始状态，调用了start就是runnable

### sleep()
**sleep()方法**
1. 调用`sleep()`会让当前线程从 `Running` 状态进入 `Timed Waiting` 状态（运行 -> 阻塞） 
2. 其它线程可以用interrupt方法打断正在睡眠的线程，这时`sleep()`会抛出`InterruptedException`
3. 睡眠结束后的线程未必会立刻得到执行 (cpu有可能正在执行其他线程的代码，等到任务调度器把新的时间片分给该线程，才会继续运行)
4. 建议用TimeUnit的sleep代替Thread的sleep来获得更好的可读性 
5. sleep() 会让出 CPU 资源，进入“阻塞”状态。但不释放锁; 
```java
@Slf4j
public class TestSleep {
    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> {
            try {
                TimeUnit.SECONDS.sleep(2);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }, "t1");

        t1.start();
        log.info("t1:{}", t1.getState());
        TimeUnit.MILLISECONDS.sleep(500);
        log.info("t1:{}", t1.getState());
    }
}
```
```
20:56:18.937 [main] INFO com.thread.concurrent1.TestSleep -- t1:RUNNABLE
20:56:19.448 [main] INFO com.thread.concurrent1.TestSleep -- t1:TIMED_WAITING
```

*interrupt() 方法演示*
```java
@Slf4j
public class TestSleep {
    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> {
            try {
                TimeUnit.SECONDS.sleep(2);
            } catch (InterruptedException e) {
                log.info("wake up");
                throw new RuntimeException(e);
            }
        }, "t1");

        t1.start();
        TimeUnit.SECONDS.sleep(1);
        log.info("interrupted...");
        t1.interrupt();
    }
}
```
```
21:01:29.040 [main] INFO com.thread.concurrent1.TestSleep -- interrupted...
21:01:29.043 [t1] INFO com.thread.concurrent1.TestSleep -- wake up
Exception in thread "t1" java.lang.RuntimeException: java.lang.InterruptedException: sleep interrupted
	at com.thread.concurrent1.TestSleep.lambda$main$0(TestSleep.java:23)
	at java.base/java.lang.Thread.run(Thread.java:1583)
Caused by: java.lang.InterruptedException: sleep interrupted
	at java.base/java.lang.Thread.sleep0(Native Method)
	at java.base/java.lang.Thread.sleep(Thread.java:558)
	at java.base/java.util.concurrent.TimeUnit.sleep(TimeUnit.java:446)
	at com.thread.concurrent1.TestSleep.lambda$main$0(TestSleep.java:20)
	... 1 more
```



### yield()
**yield()方法**
1. 调用yield()会让当前线程从 Running 状态进入 Runnable 就绪状态，然后调度执行其它线程
2. 具体的实现依赖于操作系统的任务调度器 （有可能没有其他线程需要使用cpu时间片，那么系统又把执行权交给你了）
3. 和sleep()一样，不会释放任何已持有的锁（如 synchronized）


就绪状态(yield)有机会获得时间片，阻塞状态(sleep)不能获得时间片


### 线程优先级

`setPrority(int newPrority)`：设置线程优先级
- 线程优先级会提示（hint）调度器优先调度该线程，但它仅仅是一个提示，调度器可以忽略它
- 如果 cpu 比较忙，那么优先级高的线程会获得更多的时间片，但 cpu 闲时，优先级几乎没作用


```java
@Slf4j
public class TestPrority {
    public static void main(String[] args) {
        Runnable task1 = () -> {
            int count = 0;
            for (; ; ) {
                System.out.println("---->1 " + count++);
            }
        };
        Runnable task2 = () -> {
            int count = 0;
            for (; ; ) {
                // Thread.yield();
                System.out.println("              ---->2 " + count++);
            }
        };
        Thread t1 = new Thread(task1, "t1");
        Thread t2 = new Thread(task2, "t2");
        // t1.setPriority(Thread.MIN_PRIORITY);
        // t2.setPriority(Thread.MAX_PRIORITY);
        t1.start();
        t2.start();
    }
}
```
```
---->1 173105
---->1 173106
---->1 173107
---->1 173108
---->1 173109
---->1 173110
              ---->2 171147
              ---->2 171148
              ---->2 171149
              ---->2 171150
              ---->2 171151
```
我们可以看出输出的数字都是比较相近的

```java
@Slf4j
public class TestPrority {
    public static void main(String[] args) {
        Runnable task1 = () -> {
            int count = 0;
            for (; ; ) {
                System.out.println("---->1 " + count++);
            }
        };
        Runnable task2 = () -> {
            int count = 0;
            for (; ; ) {
                Thread.yield();
                System.out.println("              ---->2 " + count++);
            }
        };
        Thread t1 = new Thread(task1, "t1");
        Thread t2 = new Thread(task2, "t2");
        // t1.setPriority(Thread.MIN_PRIORITY);
        // t2.setPriority(Thread.MAX_PRIORITY);
        t1.start();
        t2.start();
    }
}
```
```
---->1 167177
---->1 167178
---->1 167179
---->1 167180
---->1 167181
---->1 167182
---->1 167183
---->1 167184
---->1 167185
---->1 167186
              ---->2 79648
              ---->2 79649
              ---->2 79650
              ---->2 79651
              ---->2 79652
              ---->2 79653
              ---->2 79654
              ---->2 79655
```
因为有yield的存在，相差很大

---

```java
@Slf4j
public class TestPrority {
    public static void main(String[] args) {
        Runnable task1 = () -> {
            int count = 0;
            for (; ; ) {
                System.out.println("---->1 " + count++);
            }
        };
        Runnable task2 = () -> {
            int count = 0;
            for (; ; ) {
//                Thread.yield();
                System.out.println("              ---->2 " + count++);
            }
        };
        Thread t1 = new Thread(task1, "t1");
        Thread t2 = new Thread(task2, "t2");
         t1.setPriority(Thread.MIN_PRIORITY);
         t2.setPriority(Thread.MAX_PRIORITY);
        t1.start();
        t2.start();
    }
}
```
```
---->1 117769
---->1 117770
---->1 117771
---->1 117772
---->1 117773
---->1 117774
---->1 117775
---->1 117776
---->1 117777
---->1 117778
---->1 117779
---->1 117780
              ---->2 125324
              ---->2 125325
              ---->2 125326
              ---->2 125327
              ---->2 125328
              ---->2 125329
              ---->2 125330
              ---->2 125331
              ---->2 125332
              ---->2 125333
              ---->2 125334
              ---->2 125335
              ---->2 125336
              ---->2 125337
              ---->2 125338
```
优先级的存在，也会相差比较大

>总结：
>
>不管是 yield() 还是优先级，他们都不能真正的去控制线程的调度，最终还是由操作系统的任务调度器来决定具体哪个线程分到更多的时间片。


#### 应用 —— 解除对 CPU 的使用

sleep() 实现

在没有利用 `CPU` 来计算时，不要让`while(true)`空转浪费 `CPU`，这时可以使用`yield()`或 `sleep()` 方法来让出 `CPU` 的使用权给其他的程序！
```java
while(true) {
    try {
        Thread.sleep(50);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}
```
Linux 下可通过 top 命令来查看对 CPU 的占用率。

1. 在单核 CPU 下，此代码对 CPU 的占用率高达 90%。其他程序几乎用不上此 CPU。
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-08-13_21-46-57.png)

2. 在单核 CPU 下，加上sleep()方法睡眠后，Java 程序对 CPU 的占用大大降低，避免空转占用 CPU。
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-08-13_21-48-08.png)



- 可以用wait()或条件变量达到类似的效果
- 不同的是，后两种都需要加锁，并且需要相应的唤醒操作，一般适用于要进行同步的场景
- sleep()适用于无需锁同步的场景

### join()


#### 为什么需要join()
下面的代码，打印出来的r值是多少？
```java
static int r = 0;
public static void main(String[] args) throws InterruptedException {
    test1();
}

private static void test1() throws InterruptedException {
    log.debug("开始");
    Thread t1 = new Thread(() -> {
        log.debug("开始");
        sleep(1);
        log.debug("结束");
        r = 10;
    });
    t1.start();
    log.debug("结果为:{}", r);
    log.debug("结束");
}
```
输出：
```
23:07:21.660 c.Test10 [main] - 开始
23:07:21.663 c.Test10 [Thread-0] - 开始
23:07:21.663 c.Test10 [main] - 结果为:0
23:07:21.664 c.Test10 [main] - 结束
23:07:22.670 c.Test10 [Thread-0] - 结束
```
分析：
- 因为主线程和线程 t1 是并行执行的，t1 线程需要 1 秒之后才能算出 r=10 
- 而主线程一开始就要打印 r 的结果，所以就会打印出 r=0

解决方法：
- 用join()，加在 t1.start() 之后即可
```java
@Slf4j(topic = "c.Test10")
public class Test10 {
    static int r = 0;
    public static void main(String[] args) throws InterruptedException {
        test1();
    }

    private static void test1() throws InterruptedException {
        log.debug("开始");
        Thread t1 = new Thread(() -> {
            log.debug("开始");
            sleep(1);
            log.debug("结束");
            r = 10;
        });
        t1.start();
        
        // 哪个线程调用就等待哪个线程结束 (t1线程调用就等待t1线程结束)
        // 主线程等待 t1 线程结束
        t1.join();

        
        log.debug("结果为:{}", r);
        log.debug("结束");
    }
}
```


#### 同步应用

以调用方角度来讲，如果
- 需要等待结果返回，才能继续运行就是同步 
- 不需要等待结果返回，就能继续运行就是异步

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-08-13_22-17-27.png)

**等待多个线程结果**

问：下面代码 cost 大约多少秒？
 答：2s 左右

```java
static int r1 = 0;
static int r2 = 0;
public static void main(String[] args) throws InterruptedException {
    test2();
}
private static void test2() throws InterruptedException {
    Thread t1 = new Thread(() -> {
        sleep(1);
        r1 = 10;
    });
    Thread t2 = new Thread(() -> {
        sleep(2);
        r2 = 20;
    });
    long start = System.currentTimeMillis();
    t1.start();
    t2.start();
    t1.join();
    t2.join();
    long end = System.currentTimeMillis();
    log.debug("r1: {} r2: {} cost: {}", r1, r2, end - start);
}
```
输出：
```
23:35:51.088 c.TestJoin [main] - r1: 10 r2: 20 cost: 2006
```
分析：
- 第一个 join：等待 t1 时, t2 并没有停止, 而在运行 
- 第二个 join：1s 后, 执行到此, t2 也运行了 1s, 因此也只需再等待 1s 

如果颠倒两个 join 呢？ 

最终都是输出：`20:45:43.239 [main] c.TestJoin - r1: 10 r2: 20 cost: 2005`
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-08-13_22-19-28.png)



#### 有时效的join()
1. 如果等够时间，会提前结束join()的等待。
2. 如果没等够时间，则主线程继续往下执行，无影响。

等够时间
```java
@Slf4j
public class Test1 {
    static int r1 = 0;
    static int r2 = 0;
    public static void main(String[] args) throws InterruptedException {
        test3();
    }

    public static void test3() throws InterruptedException {
        Thread t1 = new Thread(() -> {
            try {
                sleep(2000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            r1 = 10;
        });
        long start = System.currentTimeMillis();
        t1.start();
        // 线程执行结束会导致 join 结束
        t1.join(3000);
        long end = System.currentTimeMillis();
        log.info("r1: {} r2: {} cost: {}", r1, r2, end - start);
    }
}
```
```
22:32:19.077 [main] INFO com.thread.concurrent1.Test1 -- r1: 10 r2: 0 cost: 2013
```

没等够时间
```java
@Slf4j
public class Test1 {
    static int r1 = 0;
    static int r2 = 0;
    public static void main(String[] args) throws InterruptedException {
        test3();
    }

    public static void test3() throws InterruptedException {
        Thread t1 = new Thread(() -> {
            try {
                sleep(2000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            r1 = 10;
        });
        long start = System.currentTimeMillis();
        t1.start();
        // 线程执行结束会导致 join 结束
        t1.join(1500);
        long end = System.currentTimeMillis();
        log.info("r1: {} r2: {} cost: {}", r1, r2, end - start);
    }
}
```
```
22:31:05.884 [main] INFO com.thread.concurrent1.Test1 -- r1: 0 r2: 0 cost: 1505
```

>等朋友,五分钟你不下来,我就走了





### interrupt

#### interrupt打断阻塞

打断等待状态/阻塞状态的线程, 会抛出异常信息表示被打断，此时会清空打断状态，打断状态为false
```java
@Slf4j
public class Test2 {
    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> {
            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }, "t1");
        t1.start();

        Thread.sleep(1000);

        t1.interrupt();
        log.info("打断标记:{}", t1.isInterrupted());  // isInterrupted()  判断线程是否被打断 | true：被打断  false：未被打断
    }
}
```
```
Exception in thread "t1" java.lang.RuntimeException: java.lang.InterruptedException: sleep interrupted
	at com.thread.concurrent1.Test2.lambda$main$0(Test2.java:20)
	at java.base/java.lang.Thread.run(Thread.java:1583)
Caused by: java.lang.InterruptedException: sleep interrupted
	at java.base/java.lang.Thread.sleep0(Native Method)
	at java.base/java.lang.Thread.sleep(Thread.java:509)
	at com.thread.concurrent1.Test2.lambda$main$0(Test2.java:18)
	... 1 more
22:42:56.962 [main] INFO com.thread.concurrent1.Test2 -- 打断标记:false
```

#### 打断运行状态的线程


```java
@Slf4j
public class Test3 {
    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> {
            while (true) {
                boolean interrupted = Thread.currentThread().isInterrupted();
                if (interrupted) {
                    log.info("被打断了");
                    break;
                }
            }
        }, "t1");
        t1.start();
        Thread.sleep(1000);
        log.info("interrupt...");
        t1.interrupt();
    }
}
```
```
21:49:42.708 [main] INFO com.thread.concurrent1.Test3 -- interrupt...
21:49:42.711 [t1] INFO com.thread.concurrent1.Test3 -- 被打断了
```

#### 设计模式 - 两阶段终止

两阶段终止（Two Phase Termination）


**场景：**
>有两个线程t1、t2。如何在线程t1中优雅的终止t2？
>
>【优雅】指的是给t2料理后事的机会

**错误思路：**

1. 使用线程对象的`stop()`方法停止线程 
  - `stop()`方法会真正杀死线程，如果这时线程锁住了共享资源，那么当它被杀死后就没有机会释放锁，其它线程将永远无法获取这个锁
2. 使用`System.exit(int)`方法停止线程 
  - 目的仅是停止一个线程，但这种方法会让整个程序都停止

**正确做法：**
- 使用两阶段终止模式来优雅的结束线程
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-08-14_21-56-11.png)



**interrupt() 实现**

```java
public class Test4 {
    public static void main(String[] args) throws InterruptedException {
        TwoPhaseTermination twoPhaseTermination = new TwoPhaseTermination();
        twoPhaseTermination.start();
        Thread.sleep(3500);
        twoPhaseTermination.stop();
    }
}

@Slf4j
class TwoPhaseTermination {
    private Thread monitor;

    public void start() {
        monitor = new Thread(() -> {
            while (true) {
                Thread currentThread = Thread.currentThread();
                if (currentThread.isInterrupted()) {
                    log.info("料理后事");
                    break;
                }
                try {
                    Thread.sleep(1000);
                    log.info("监控中。。。");
                } catch (InterruptedException e) {
                    // 重置打断标记 因为 sleep() 方法被打断后，会抛出异常信息并清除打断标记，此时打断标记是 false。需要重新打断一次
                    currentThread.interrupt();
                    throw new RuntimeException(e);
                }
            }
        });
        monitor.start();
    }

    public void stop() {
        monitor.interrupt();
    }
}
```

#### 打断park

park() 方法：阻塞线程

- park()不是 Thread 类中提供的方法，是LockSupport工具类中提供的方法。
- 作用也是让当前线程停下来，进入阻塞状态
- 可以通过interrupt()方法来打断正在park的线程，打断状态变为true
- park()是不可重入的。一旦打断状态变为true后，再次调用interrupt()方法会失效。一个线程不可多次调用park()



1. `LockSupport.park()`：让此方法所在的线程阻塞。可以通过`interrupt()`方法来打断正在阻塞的线程，也可通过`unpark()`方法
2. `LockSupport.unpark(线程名)`：让指定的线程执行，取消阻塞



```java
@Slf4j
public class Test5 {
    public static void main(String[] args) throws InterruptedException {
        test3();
    }

    private static void test3() throws InterruptedException {
        Thread t1 = new Thread(() -> {
            log.info("park...");
            LockSupport.park();
            log.info("unpark...");
            log.info("打断状态：{}", Thread.currentThread().isInterrupted());

            LockSupport.park();
            log.info("unpark...");
        }, "t1");
        t1.start();

        // 主线程睡眠 1s 后，打断正在 park 的线程
        sleep(1);
        t1.interrupt();
    }
}
```

```
22:27:34.498 [t1] INFO com.thread.concurrent1.Test5 -- park...
22:27:34.503 [t1] INFO com.thread.concurrent1.Test5 -- unpark...
22:27:34.504 [t1] INFO com.thread.concurrent1.Test5 -- 打断状态：true
22:27:34.507 [t1] INFO com.thread.concurrent1.Test5 -- unpark...
```


### 主线程与守护线程

默认情况下，Java 进程需要等待所有线程都运行结束，才会结束

有一种特殊的线程叫做**守护线程**，**只要其它非守护线程运行结束了，即使守护线程的代码没有执行完，也会强制结束**

>`setDaemon(Boolean)`：设置为守护线程。默认为 false，非守护线程

演示守护线程强制结束
```java
@Slf4j
public class Test6 {
    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> {
            while (true) {
                if (Thread.currentThread().isInterrupted()) {
                    log.info("t1停止");
                    break;
                }
            }
        }, "t1");
        t1.setDaemon(true);
        t1.start();

        Thread.sleep(2000);

        log.info("主线程结束");
    }
}
```
```
22:43:42.720 [main] INFO com.thread.concurrent1.Test6 -- 主线程结束
```


注意：
- 垃圾回收器线程就是一种就常见的守护线程
- Tomcat 中的 Acceptor（接收请求）和 Poller（分发请求）线程都是守护线程，所以 `Tomcat` 接收到 `shutdown` 命令后，不会等待它们处理完当前请求，会让它们强制结束


### 线程状态

线程状态从不同的维度来描述有不同的状态。
- 从 操作系统 层面来描述，有五种线程状态。
- 从 JAVA API 层面来描述，有六钟线程状态。

#### 五种状态 —— 操作系统层面

这是从 `操作系统` 层面来描述的

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/%E5%B9%B6%E5%8F%91%E7%BC%96%E7%A8%8B_page28_image.png)

- 【初始状态】仅是在语言层面创建了线程对象，还未与操作系统线程关联 
- 【可运行状态】（也称为：就绪状态）指该线程已经被创建（与操作系统线程关联），可以由 CPU 调度执行 
- 【运行状态】指获取了 CPU 时间片运行中的状态 
  - 当 CPU 时间片用完，会从【运行状态】转换至【可运行状态】，会导致线程的上下文切换 
- 【阻塞状态】 
  - 如果调用了阻塞 API，如 BIO 读写文件，这时该线程实际不会用到 CPU，会导致线程上下文切换，进入【阻塞状态】 
  - 等 BIO 操作完毕，会由操作系统唤醒阻塞的线程，转换至【可运行状态】 
  - 与【可运行状态】的区别是，对【阻塞状态】的线程来说只要它们一直不唤醒，调度器就一直不会考虑调度它们。调度器只会调度【可运行状态】的线程，给他们分配时间片
- 【终止状态】表示线程已经执行完毕，生命周期已经结束，不会再转换为其它状态

#### 六种状态 —— JAVA API 层面

这是从 Java API 层面来描述的

根据`Thread.State`枚举，分为六种状态
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/%E5%B9%B6%E5%8F%91%E7%BC%96%E7%A8%8B_page29_image.png)


- `NEW`：线程刚被创建，但是还没有调用`start()`方法 
- `RUNNABLE`： 当调用了`start()`方法之后，注意，Java API 层面的RUNNABLE状态涵盖了 操作系统 层面的【可运行状态】、【运行状态】和【阻塞状态】（由于 BIO 导致的线程阻塞，在 Java 里无法区分，仍然认为是可运行） 
- `BLOCKED` ，`WAITING`，`TIMED_WAITING`：都是 Java API 层面对【阻塞状态】的细分，后面会在状态转换一节详述
- `TERMINATED`：当线程代码运行结束，表示线程已经执行完毕


:::warning
Java中的RUNNABLE，即有可能分到了时间片，也可能没有分到时间片，也有可能陷入了操作系统的io阻塞，这三种状态在Java中都叫`RUNNABLE`

比如：在读取文件时，在操作系统层面就变成了 阻塞状态。但是在 Java 层面还是 Runnable 可运行状态
:::

```java
@Slf4j(topic = "c.TestState")
public class TestState {
    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            log.debug("running...");
        }, "t1");


        Thread t2 = new Thread(() -> {
            while (true) {

            }
        }, "t2");
        t2.start();


        Thread t3 = new Thread(() -> {
            log.debug("running...");
        }, "t3");
        t3.start();


        Thread t4 = new Thread(() -> {
            synchronized (TestState.class) {
                try {
                    Thread.sleep(1000000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }, "t4");
        t4.start();


        Thread t5 = new Thread(() -> {
            try {
                t2.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }, "t5");
        t5.start();


        Thread t6 = new Thread(() -> {
            synchronized (TestState.class) {
                try {
                    Thread.sleep(1000000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }, "t6");
        t6.start();

        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        log.debug("t1 state {}", t1.getState());  // NEW 新建状态
        log.debug("t2 state {}", t2.getState());  // RUNNABLE 可运行状态
        log.debug("t3 state {}", t3.getState());  // TERMINATED 终止状态
        log.debug("t4 state {}", t4.getState());  // TIME_WAITING 超时等待状态
        log.debug("t5 state {}", t5.getState());  // WAITING 等待状态
        log.debug("t6 state {}", t6.getState());  // BLOCKED 阻塞状态。需要等待锁的释放
    }
}
```
```
23:12:49.760 [t3] INFO com.thread.concurrent1.Test7 -- running...
23:12:50.261 [main] INFO com.thread.concurrent1.Test7 -- t1 state NEW
23:12:50.263 [main] INFO com.thread.concurrent1.Test7 -- t2 state RUNNABLE
23:12:50.263 [main] INFO com.thread.concurrent1.Test7 -- t3 state TERMINATED
23:12:50.263 [main] INFO com.thread.concurrent1.Test7 -- t4 state TIMED_WAITING
23:12:50.263 [main] INFO com.thread.concurrent1.Test7 -- t5 state WAITING
23:12:50.263 [main] INFO com.thread.concurrent1.Test7 -- t6 state BLOCKED
```


#### 相关面试题🤏🏻

**说说线程的生命状态和状态？**

Java 线程在运行的生命周期中的指定时刻只可能处于下面 6 种不同状态的其中一个状态：
- NEW: 初始状态，线程被创建出来但没有被调用start() 。
- RUNNABLE: 运行状态，线程被调用了start()等待运行的状态。
- BLOCKED：阻塞状态，需要等待锁释放。
- WAITING：等待状态，表示该线程需要等待其他线程做出一些特定动作（通知或中断）。比如join()方法。
- TIME_WAITING：超时等待状态，可以在指定的时间后自行返回而不是像 WAITING 那样一直等待。比如sleep
- TERMINATED：终止状态，表示该线程已经运行完毕。
线程在生命周期中并不是固定处于某一个状态而是随着代码的执行在不同状态之间切换。


### 应用 - 统筹（烧水泡茶）


华罗庚《统筹方法》

统筹方法，是一种安排工作进程的数学方法。它的实用范围极广泛，在企业管理和基本建设中，以及关系复杂的科研项目的组织与管理中，都可以应用。 

怎样应用呢？主要是把工序安排好。
比如，想泡壶茶喝。当时的情况是：开水没有；水壶要洗，茶壶、茶杯要洗；火已生了，茶叶也有了。怎么办？ 
- 办法甲：洗好水壶，灌上凉水，放在火上；在等待水开的时间里，洗茶壶、洗茶杯、拿茶叶；等水开 
了，泡茶喝。 
- 办法乙：先做好一些准备工作，洗水壶，洗茶壶茶杯，拿茶叶；一切就绪，灌水烧水；坐待水开了，泡茶喝。 
- 办法丙：洗净水壶，灌上凉水，放在火上，坐待水开；水开了之后，急急忙忙找茶叶，洗茶壶茶杯，泡茶喝。 
哪一种办法省时间？我们能一眼看出，第一种办法好，后两种办法都窝了工。

这是小事，但这是引子，可以引出生产管理等方面有用的方法来。 

水壶不洗，不能烧开水，因而洗水壶是烧开水的前提。没开水、没茶叶、不洗茶壶茶杯，就不能泡茶，因而这些又是泡茶的前提。它们的相互关系，可以用下边的箭头图来表示：
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-08-15_20-56-52.png)


从这个图上可以一眼看出，办法甲总共要16分钟（而办法乙、丙需要20分钟）。如果要缩短工时、提高工作效率，应当主要抓烧开水这个环节，而不是抓拿茶叶等环节。同时，洗茶壶茶杯、拿茶叶总共不过4分钟，大可利用“等水开”的时间来做。 

是的，这好像是废话，卑之无甚高论。有如走路要用两条腿走，吃饭要一口一口吃，这些道理谁都懂得。但稍有变化，临事而迷的情况，常常是存在的。在近代工业的错综复杂的工艺过程中，往往就不是像泡茶喝这么简单了。任务多了，几百几千，甚至有好几万个任务。关系多了，错综复杂，千头万绪，往往出现“万事俱备，只欠东风”的情况。由于一两个零件没完成，耽误了一台复杂机器的出厂时间。或往往因为抓的不是关键，连夜三班，急急忙忙，完成这一环节之后，还得等待旁的环节才能装配。 

洗茶壶，洗茶杯，拿茶叶，或先或后，关系不大，而且同是一个人的活儿，因而可以合并成为：

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-08-15_20-58-18.png)

看来这是“小题大做”，但在工作环节太多的时候，这样做就非常必要了。 

这里讲的主要是时间方面的事，但在具体生产实践中，还有其他方面的许多事。这种方法虽然不一定能直接解决所有问题，但是，我们利用这种方法来考虑问题，也是不无裨益的。

---

题目：
阅读华罗庚《统筹方法》，给出烧水泡茶的多线程解决方案。
- 参考上图二，用两个线程（两个人协作）模拟烧水泡茶过程
  - 文中办法乙、丙都相当于任务串行
  - 而上图一相当于启动了 4 个线程，有点浪费
- 用 sleep(n) 模拟洗茶壶、洗水壶等耗费的时间

**解法一、join()**
```java
@Slf4j(topic = "c.Test16")
public class Test16 {

    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            // 洗水壶 1s
            log.debug("洗水壶");
            Sleeper.sleep(1);

            // 烧开水 5s
            log.debug("烧开水");
            Sleeper.sleep(5);
        }, "t1");

        t1.start();

        Thread t2 = new Thread(() -> {
            // 洗茶壶 1s
            log.debug("洗茶壶");
            Sleeper.sleep(1);

            // 洗茶杯 2s
            log.debug("洗茶杯");
            Sleeper.sleep(2);

            // 拿茶叶 1s
            log.debug("拿茶叶");
            Sleeper.sleep(1);

            // 等待 t1 运行结束
            try {
                t1.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            log.debug("泡茶");
        }, "t2");

        t2.start();
    }
}
```
```
22:42:41.457 c.Test16 [t2] - 洗茶壶
22:42:41.457 c.Test16 [t1] - 洗水壶
22:42:42.468 c.Test16 [t2] - 洗茶杯
22:42:42.468 c.Test16 [t1] - 烧开水
22:42:44.473 c.Test16 [t2] - 拿茶叶
22:42:47.483 c.Test16 [t2] - 泡茶
```


**缺陷：**
- 上面模拟的是 t2 等 t1 的水烧开了，小王泡茶，如果反过来要实现 t1 等 t2 的茶叶拿来了，老王泡茶呢？代码最好能适应两种情况 
- 上面的两个线程其实是各执行各的，如果要模拟 t1 把水壶交给 t2 泡茶，或模拟 t2 把茶叶交给 t1 泡茶呢?



---

**小结**

本章的重点在于掌握
- 线程创建
- 线程重要 api，如 start，run，sleep，join，interrupt 等
- 线程状态 -> 操作系统：5 种 Java API：6 种
- 应用方面
  - 异步调用：主线程执行期间，其它线程异步执行耗时操作
  - 提高效率：并行计算，缩短运算时间
  - 同步等待：join
  - 统筹规划：合理使用线程，得到最优效果
- 原理方面
  - 线程运行流程：栈、栈帧、上下文切换、程序计数器
  - Thread 两种创建方式的源码
- 模式方面
  - 终止模式之两阶段终止



