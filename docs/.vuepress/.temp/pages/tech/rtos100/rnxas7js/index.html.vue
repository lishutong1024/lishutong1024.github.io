<template><div><p>你有没有过这样的疑惑：RTOS的运行，到底是全部由软件来实现，还是同时利用了CPU某些特性？</p>
<blockquote>
<p>记得自己最初第一次研究RTOS的时候，以为任务切换就是用指令将寄存器进行保存和恢复。
直到深入之后才发现：有些CPU在设计时，为了让RTOS高效运行，专门设计了好几种硬件机制。</p>
</blockquote>
<p>今天这篇文章，我们就来好好聊一聊，Cortex-M处理器到底为RTOS的运行提供了哪些硬件支持。</p>
<h2 id="支持一-双栈指针" tabindex="-1"><a class="header-anchor" href="#支持一-双栈指针"><span>支持一：双栈指针</span></a></h2>
<p>和传统的ARM架构只有一个栈指针不同，Cortex-M有两个栈指针：</p>
<ul>
<li><strong>MSP（Main Stack Pointer，主栈指针）</strong>：复位后默认使用的栈指针，常用于中断处理程序。</li>
<li><strong>PSP（Process Stack Pointer，进程栈指针）</strong>：用于用户任务的栈指针。
<img src="@source/notes/tech/rtos100/schedule/images/q48/Cortex-M双栈指针分工示意图.jpg" alt="Cortex-M双栈指针分工示意图"></li>
</ul>
<p><strong>之所以使用两个栈指针，主要是为了让中断处理和任务使用不同的栈空间，互不干扰。</strong></p>
<p>如此一来，中断处理有自己的栈空间，不会占用任务的栈。任务只需要根据自己的工作内容来估计需要用栈的大小，不必考虑任务执行过程中是否发生中断。</p>
<h2 id="机制二-异常自动压栈" tabindex="-1"><a class="header-anchor" href="#机制二-异常自动压栈"><span>机制二：异常自动压栈</span></a></h2>
<p>当异常（含中断）发生时，Cortex-M会自动将8个内核寄存器压栈，这些分别是：xPSR、PC、LR、R12、R3、R2、R1、R0。</p>
<p><img src="@source/notes/tech/rtos100/schedule/images/q48/p1.png" alt="p1.png"></p>
<p>当异常返回时，Cortex-M又会自动从栈中弹出这些个寄存器，恢复到原来的值。</p>
<p><strong>对于RTOS来说，这个机制大大减少了软件需要保存的寄存器数量，RTOS只需要手动保存R4-R11这8个寄存器。</strong></p>
<h2 id="机制三-pendsv异常" tabindex="-1"><a class="header-anchor" href="#机制三-pendsv异常"><span>机制三：PendSV异常</span></a></h2>
<p>PendSV的全称是Pendable Service Call，即可挂起的服务调用异常。</p>
<p>它是Cortex-M专门为RTOS上下文切换设计的异常，它具有如下几个关键特点：</p>
<ol>
<li><strong>优先级可设置</strong>：优先级可以通过软件设置，RTOS通常把它设置为最低优先级。</li>
<li><strong>可挂起</strong>：可以将该异常设置为挂起状态，当有更高优先级的中断在处理时，PendSV会等所有高优先级中断处理完后再执行。</li>
</ol>
<p>为什么需要PendSV呢？这是为了解决任务切换可能在中断处理程序中被触发的问题。</p>
<p>比如，在下图中，SysTick中断抢占了IRQ中断，导致系统切换至任务B运行。这使得IRQ中断的处理被任务B切换打断，增加中断的响应时间。</p>
<p><img src="@source/notes/tech/rtos100/schedule/images/q48/p2.png" alt="p2.png"></p>
<p>当使用PendSV时，SysTick中断中只需要挂起PendSV异常。等所有中断（含IRQ中断）都处理完后，PendSV才会执行，完成上下文切换。这样既保证了中断的快速响应，又能在合适的时机完成任务切换。</p>
<h2 id="机制四-systick定时器" tabindex="-1"><a class="header-anchor" href="#机制四-systick定时器"><span>机制四：SysTick定时器</span></a></h2>
<p>Cortex-M处理器还内置了SysTick定时器，即系统节拍定时器，主要用来给RTOS提供系统节拍（tick）。</p>
<p>它是一个24位的递减计数器，所有Cortex-M系列的芯片都有这个定时器。
<img src="@source/notes/tech/rtos100/schedule/images/q48/SysTick节拍触发处理流程图.jpg" alt="SysTick节拍触发处理流程图"></p>
<p>SysTick定时器对RTOS来说有什么用呢？</p>
<p>在没有SysTick之前，不同厂家的芯片有不同的定时器，RTOS需要为每种芯片提供不同的定时器驱动代码。</p>
<p>但自从有了SysTick，一切就变得简单起来。</p>
<p>由于它是Cortex-M内核的一部分，所有Cortex-M芯片的SysTick都是一样的。如此一来，<strong>RTOS只需要写一份SysTick驱动代码，就可以在所有Cortex-M芯片上运行，这大大提高了RTOS的可移植性</strong>。</p>
<h2 id="机制五-权限等级-可选" tabindex="-1"><a class="header-anchor" href="#机制五-权限等级-可选"><span>机制五：权限等级（可选）</span></a></h2>
<p>Cortex-M处理器还为RTOS提供了权限等级机制，主要有两种特权等级：</p>
<ul>
<li><strong>特权级（Privileged）</strong>：可以访问所有寄存器和所有内存区域、执行所有指令。</li>
<li><strong>用户级（Unprivileged）</strong>：某些寄存器不能直接访问，某些内存区域可能被保护，某些指令不能执行。</li>
</ul>
<p>理论上来说，<strong>RTOS可以利用这个机制来保护系统安全</strong>，比如：让内核代码运行在特权级，用户任务运行在用户级，任务可以通过SVC系统调用指令请求内核完成某些特殊的工作。</p>
<p>不过，实际上大多数RTOS（包括RT-Thread、FreeRTOS等）并没有使用这个机制，以避免增加复杂性、带来额外的开销。同时，大多数时候，代码通常都是开发者自己写的，不需要像桌面系统那样隔离不可信的第三方应用。</p>
<p>因此，<strong>大多数RTOS选择让所有任务都运行在特权级，以简化实现、提高性能</strong>。</p>
<h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>综上所述，Cortex-M处理器为RTOS的运行提供了多个关键的硬件机制。</p>
<p>其中，最核心的几个机制是：双栈指针、异常自动压栈、PendSV异常和SysTick定时器。这四个机制配合起来，大大简化了RTOS在该处理器上的实现。</p>
<p>此外，Cortex-M还提供了权限等级机制，但大多数RTOS为了简化实现、提高性能，并未使用该机制。</p>
<hr>
<blockquote>
<p>如果你希望系统地学习RTOS底层原理，可以了解我的《RTOS开发与实战》课程。</p>
<p>课程不是简单地讲解FreeRTOS API的使用，而是带你从零开始编写一个RTOS内核，逐步实现任务管理、任务调度、上下文切换、同步与通信等核心机制，并通过一个远程温湿度监控设备项目，将操作系统原理应用到实际嵌入式开发中。</p>
<p>适合希望深入理解RTOS工作原理、提升嵌入式底层开发能力的同学。</p>
<p><VPLink href="/blog/diyrtos/">课程详情</VPLink></p>
</blockquote>
</div></template>


