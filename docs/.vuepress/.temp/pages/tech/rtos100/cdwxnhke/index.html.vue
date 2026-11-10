<template><div><blockquote>
<p>大家好，我是李述铜。这个专栏用来解答嵌入式操作系统学习和开发中最常见的 100 个问题。</p>
</blockquote>
<h2 id="专栏简介" tabindex="-1"><a class="header-anchor" href="#专栏简介"><span>专栏简介</span></a></h2>
<p>嵌入式操作系统（RTOS）是嵌入式开发的核心技能，但很多初学者在学习和使用过程中会遇到各种各样的疑问——</p>
<ul>
<li>任务和函数到底有什么区别？</li>
<li>优先级高的任务一定先执行吗？</li>
<li>中断里为什么不能随便调阻塞接口？</li>
<li>消息队列和邮箱到底怎么选？</li>
<li>栈溢出是怎么发生的，怎么排查？</li>
</ul>
<p>本专栏从实际开发场景出发，用通俗易懂的语言 + 代码示例，逐一解答这些高频问题。每篇文章聚焦一个问题，讲清楚原理和实战要点。</p>
<h2 id="专栏大纲" tabindex="-1"><a class="header-anchor" href="#专栏大纲"><span>专栏大纲</span></a></h2>
<h3 id="一、基础概念" tabindex="-1"><a class="header-anchor" href="#一、基础概念"><span>一、基础概念</span></a></h3>
<ol>
<li><VPLink href="base/q01.md">什么是嵌入式操作系统</VPLink></li>
<li><VPLink href="base/q02.md">你的项目真的需要RTOS吗</VPLink></li>
<li><VPLink href="base/q03.md">RTOS中的实时到底是什么意思</VPLink></li>
<li><VPLink href="base/q04.md">RTOS和裸机程序最大的区别是什么</VPLink></li>
<li><VPLink href="base/q05.md">裸机程序用状态机能代替RTOS吗</VPLink></li>
<li><VPLink href="base/q06.md">学习RTOS需要哪些前置知识</VPLink></li>
<li><VPLink href="base/q07.md">如何深入理解RTOS</VPLink></li>
<li><VPLink href="base/q08.md">为什么要学着手写一个RTOS</VPLink></li>
<li><VPLink href="base/q09.md">一个RTOS内核通常由哪些部分组成</VPLink></li>
</ol>
<h3 id="二、任务管理" tabindex="-1"><a class="header-anchor" href="#二、任务管理"><span>二、任务管理</span></a></h3>
<ol>
<li><VPLink href="task/q10.md">什么是任务</VPLink></li>
<li><VPLink href="task/q11.md">任务函数和普通C函数有什么区别</VPLink></li>
<li><VPLink href="task/q12.md">任务必须是无限循环吗</VPLink></li>
<li><VPLink href="task/q13.md">任务从创建到运行会经历哪些状态</VPLink></li>
<li><VPLink href="task/q14.md">什么是任务控制块</VPLink></li>
<li><VPLink href="task/q15.md">任务优先级究竟控制什么</VPLink></li>
<li><VPLink href="task/q16.md">一个任务函数可以被多个任务共用吗</VPLink></li>
<li><VPLink href="task/q17.md">什么是任务安全函数</VPLink></li>
<li><VPLink href="task/q18.md">任务删除时需要注意什么</VPLink></li>
<li><VPLink href="task/q19.md">任务数量是不是越多越好</VPLink></li>
<li><VPLink href="task/q20.md">创建任务时内核需要做哪些事情</VPLink></li>
<li><VPLink href="task/q21.md">任务参数为什么不能传局部变量地址</VPLink></li>
<li><VPLink href="task/q22.md">静态创建和动态创建任务的区别</VPLink></li>
<li><VPLink href="task/q23.md">为什么RT-Thread把任务叫做线程</VPLink></li>
<li><VPLink href="task/q24.md">任务挂起与阻塞有什么区别</VPLink></li>
<li><VPLink href="task/q25.md">为什么每个任务都需要自己的栈</VPLink></li>
<li><VPLink href="task/q26.md">任务的栈应当设置成多大</VPLink></li>
<li><VPLink href="task/q27.md">可以动态修改任务栈大小吗</VPLink></li>
<li><VPLink href="task/q28.md">任务栈溢出后为什么程序会跑飞</VPLink></li>
<li><VPLink href="task/q29.md">为什么局部大数组容易导致栈溢出</VPLink></li>
<li><VPLink href="task/q30.md">创建任务时栈里放了什么</VPLink></li>
<li><VPLink href="task/q31.md">中断栈和任务栈为什么要分离</VPLink></li>
</ol>
<h3 id="三、内存管理" tabindex="-1"><a class="header-anchor" href="#三、内存管理"><span>三、内存管理</span></a></h3>
<ol>
<li><VPLink href="memory/q32.md">什么是内存池，和动态分配有什么区别</VPLink></li>
<li><VPLink href="memory/q33.md">为什么频繁申请释放内存会产生碎片</VPLink></li>
</ol>
<h3 id="四、调度与上下文切换" tabindex="-1"><a class="header-anchor" href="#四、调度与上下文切换"><span>四、调度与上下文切换</span></a></h3>
<ol>
<li><VPLink href="schedule/q34.md">什么情况下RTOS会立即切换任务</VPLink></li>
<li><VPLink href="schedule/q35.md">什么是抢占式调度</VPLink></li>
<li><VPLink href="schedule/q36.md">什么是时间片轮转调度</VPLink></li>
<li><VPLink href="schedule/q37.md">什么是优先级反转</VPLink></li>
<li><VPLink href="schedule/q38.md">优先级继承为什么能缓解优先级反转</VPLink></li>
<li><VPLink href="schedule/q39.md">两个任务互相等待会发生什么</VPLink></li>
<li><VPLink href="schedule/q40.md">任务被唤醒后为什么不一定立即运行</VPLink></li>
<li><VPLink href="schedule/q41.md">什么是优先级位图算法</VPLink></li>
<li><VPLink href="schedule/q42.md">什么是任务饿死，如何避免</VPLink></li>
<li><VPLink href="schedule/q43.md">rt_thread_yield函数的工作原理</VPLink></li>
<li><VPLink href="schedule/q45.md">多个任务等同一个信号量谁先被唤醒</VPLink></li>
<li><VPLink href="schedule/q46.md">什么是上下文切换</VPLink></li>
<li><VPLink href="schedule/q47.md">一个任务的上下文包含哪些内容</VPLink></li>
<li><VPLink href="schedule/q48.md">Cortex-M如何配合完成任务切换</VPLink></li>
<li><VPLink href="schedule/q49.md">单核CPU为什么能让任务同时运行</VPLink></li>
<li><VPLink href="schedule/q50.md">系统节拍设为1000ms会发生什么</VPLink></li>
<li><VPLink href="schedule/q51.md">任务延时时CPU在干什么</VPLink></li>
<li><VPLink href="schedule/q52.md">为什么RTOS中的延时不一定精确</VPLink></li>
<li><VPLink href="schedule/q53.md">如何实现更精确的延时</VPLink></li>
</ol>
<h3 id="五、定时器与时间管理" tabindex="-1"><a class="header-anchor" href="#五、定时器与时间管理"><span>五、定时器与时间管理</span></a></h3>
<ol>
<li><VPLink href="timer/q54.md">软件定时器和硬件定时器的区别</VPLink></li>
<li><VPLink href="timer/q55.md">定时器回调里能调用延时函数吗</VPLink></li>
<li><VPLink href="timer/q56.md">如何实现任务的周期性执行</VPLink></li>
<li><VPLink href="timer/q57.md">一个硬件定时器如何实现多个软件定时器</VPLink></li>
<li><VPLink href="timer/q58.md">任务等待超时是怎么实现的</VPLink></li>
<li><VPLink href="timer/q59.md">什么是看门狗，如何正确使用</VPLink></li>
</ol>
<h3 id="六、同步与通信" tabindex="-1"><a class="header-anchor" href="#六、同步与通信"><span>六、同步与通信</span></a></h3>
<ol>
<li><VPLink href="ipc/q60.md">什么是信号量</VPLink></li>
<li><VPLink href="ipc/q61.md">什么是二值信号量</VPLink></li>
<li><VPLink href="ipc/q62.md">什么是互斥锁</VPLink></li>
<li><VPLink href="ipc/q63.md">互斥锁和二值信号量的区别</VPLink></li>
<li><VPLink href="ipc/q64.md">什么是消息队列</VPLink></li>
<li><VPLink href="ipc/q65.md">什么是事件标志组</VPLink></li>
<li><VPLink href="ipc/q66.md">事件标志组和信号量的区别</VPLink></li>
<li><VPLink href="ipc/q67.md">多任务访问串口/全局变量如何保护</VPLink></li>
<li><VPLink href="ipc/q68.md">生产数据和处理数据的任务如何通信</VPLink></li>
<li><VPLink href="ipc/q69.md">任务间传递大块消息怎么完成</VPLink></li>
<li><VPLink href="ipc/q70.md">多个任务如何共享同一份数据</VPLink></li>
<li><VPLink href="ipc/q71.md">计数信号量如何管理多个资源</VPLink></li>
<li><VPLink href="ipc/q72.md">如何避免生产者速度超过消费者</VPLink></li>
<li><VPLink href="ipc/q73.md">如何实现任务间的双向通信</VPLink></li>
<li><VPLink href="ipc/q74.md">如何实现一个任务向多个任务广播</VPLink></li>
<li><VPLink href="ipc/q75.md">什么是消息队列的紧急消息</VPLink></li>
<li><VPLink href="ipc/q76.md">邮箱可以传递哪些类型的数据</VPLink></li>
<li><VPLink href="ipc/q77.md">邮箱和消息队列什么时候用哪个</VPLink></li>
<li><VPLink href="ipc/q78.md">如何实现请求响应模式的通信</VPLink></li>
<li><VPLink href="ipc/q79.md">怎样把ISR中的事交给任务完成</VPLink></li>
</ol>
<h3 id="七、中断与临界区" tabindex="-1"><a class="header-anchor" href="#七、中断与临界区"><span>七、中断与临界区</span></a></h3>
<ol>
<li><VPLink href="irq/q80.md">为什么中断里不能调用阻塞接口</VPLink></li>
<li><VPLink href="irq/q81.md">中断唤醒高优先级任务为何不立即执行</VPLink></li>
<li><VPLink href="irq/q82.md">什么是临界区</VPLink></li>
<li><VPLink href="irq/q83.md">临界区的嵌套使用</VPLink></li>
<li><VPLink href="irq/q84.md">什么是原子指令，有哪些原子操作</VPLink></li>
<li><VPLink href="irq/q91.md">关中断、调度锁和互斥锁的适用场景</VPLink></li>
</ol>
<h3 id="八、内核机制与移植" tabindex="-1"><a class="header-anchor" href="#八、内核机制与移植"><span>八、内核机制与移植</span></a></h3>
<ol>
<li><VPLink href="kernel/q85.md">RTOS中的链表用在哪些地方</VPLink></li>
<li><VPLink href="kernel/q86.md">RTOS内部有哪些队列，如何管理任务</VPLink></li>
<li><VPLink href="kernel/q87.md">为什么大多数RTOS不用系统调用指令</VPLink></li>
<li><VPLink href="kernel/q88.md">空闲任务是做什么的</VPLink></li>
<li><VPLink href="kernel/q89.md">移植RTOS到不同MCU要改哪些代码</VPLink></li>
<li><VPLink href="kernel/q90.md">RTOS的钩子函数Hook是干什么的</VPLink></li>
</ol>
<hr>
<p>关于本文内容，有任何疑问或独到见解，都非常欢迎在评论区与我交流。</p>
<blockquote>
<p><strong>李述铜，嵌入式系统与底层架构领域讲师</strong>，专注于操作系统、CPU 架构的教学与研究。出版作品《从0手写x86计算机操作系统》。<strong>主讲课程</strong>包括：《从0手写嵌入式操作系统》《从0手写TCP/IP协议栈》等。</p>
<p>欢迎扫码关注我的微信公众号，及时获取更多文章！</p>
</blockquote>
<p><img src="/公众号二维码.jpg" alt="公众号二维码"></p>
</div></template>


