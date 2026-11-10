<template><div><p>最近，有一位同学在学习RTOS的时候，遇到了一个困惑。他写了一段这样的代码：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 串口接收中断 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> uart_rx_isr</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 读取接收到的数据 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">    uint8_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> data </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> uart_read_data</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 释放信号量，唤醒任务B */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_sem_release</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">uart_sem</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 继续做一些其他处理 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    uart_clear_flag</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    uart_enable_rx</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>他起初认为：当调用rt_sem_release()释放信号量时，就会立即切换到任务B去执行。而后面的uart_clear_flag()和uart_enable_rx()这些函数，可能会在任务B执行完、切换回来的时候才继续执行。</p>
<p>不过，他也意识到：如果中断处理程序执行到一半就切换出去了，似乎不太对劲？越想越糊涂，于是就来问我。</p>
<p>在今天这篇文章，我就来好好聊一聊这个问题，分析到底会不会出现这种情况，以及具体的原因。</p>
<h2 id="问题的具体场景" tabindex="-1"><a class="header-anchor" href="#问题的具体场景"><span>问题的具体场景</span></a></h2>
<p>通过沟通，我大概知道了这位同学的具体问题场景。这个系统中有两个任务：</p>
<ul>
<li>任务A：优先级较低，负责一些日常的处理工作。</li>
<li>任务B：优先级较高，负责处理串口接收到的数据。</li>
</ul>
<p>当任务A正在运行时，突然触发串口接收中断，进入串口中断处理程序去执行。中断处理程序调用了rt_sem_release()释放信号量，唤醒了正在等待的任务B。</p>
<p><strong>这个同学以为执行流程是这样的：当释放信号量后，立即切换到任务B；当B执行完，再切换回中断，继续执行剩余部分。</strong>
<img src="@source/notes/tech/rtos100/irq/images/q81/错误设想的中断中切换时序图.jpg" alt="错误设想的中断中切换时序图"></p>
<p>但实际上，<strong>真正的执行流程应该是：释放信号量唤醒B之后，继续执行中断剩余部分；当中断退出后，才切换到任务B运行。</strong>
<img src="@source/notes/tech/rtos100/irq/images/q81/中断退出后任务切换时序图.jpg" alt="中断退出后任务切换时序图"></p>
<h2 id="禁止中断中切换的原因" tabindex="-1"><a class="header-anchor" href="#禁止中断中切换的原因"><span>禁止中断中切换的原因</span></a></h2>
<p>为什么要按照第二种方式来执行呢？具体而言，原因主要有如下三点：
<img src="@source/notes/tech/rtos100/irq/images/q81/禁止中断中切换原因汇聚图.jpg" alt="禁止中断中切换原因汇聚图"></p>
<p>第一，<strong>中断没有自己的任务控制块</strong>。如果在中断里直接切换，被打断任务的上下文该保存到哪里？如何进行保存？保存哪些信息？这会增加RTOS的设计难度。</p>
<p>第二，<strong>中断可能会嵌套</strong>。如果发生了更高优先级的中断，形成中断嵌套。那么，如果在第一个中断里就切换了任务，那第二个中断打断的到底是任务还是第一个中断？此时，调度逻辑会变得非常混乱。</p>
<p>第三，<strong>会延长中断响应时间</strong>。我们知道，中断应该快速处理完就退出。如果切换到其他任务，一旦任务长时间运行，中断后面的代码就一直得不到执行，系统实时性就没法保证了。</p>
<h2 id="rtos的常见处理方法" tabindex="-1"><a class="header-anchor" href="#rtos的常见处理方法"><span>RTOS的常见处理方法</span></a></h2>
<p>为了让任务切换发生在中断退出后，RTOS使用了一个很巧妙的办法：<strong>延迟调度</strong>。</p>
<p>它的思路很简单：</p>
<blockquote>
<p><strong>当唤醒任务后，并不立即切换到该任务运行，而是先标记“退出中断后需要调度”。</strong>
<strong>等当前中断以及嵌套的中断都退出来后，再根据标记情况，决定是否要进行任务切换。</strong></p>
</blockquote>
<p>也就是说，将任务切换延迟到退出中断时进行，整个流程如下图所示：
<img src="@source/notes/tech/rtos100/irq/images/q81/延迟调度流程图.jpg" alt="延迟调度流程图"></p>
<p>在Cortex-M架构中，RTOS通常会使用该架构提供的<strong>PendSV异常</strong>来实现延迟调度。PendSV异常可被设置为挂起状态，且优先级最低，可以被所有其他中断打断。</p>
<p><strong>在实际使用时，PendSV是否为“挂起”状态，表明了“是否需要进行任务切换”。</strong>
<img src="@source/notes/tech/rtos100/irq/images/q81/PendSV延迟调度时序图.jpg" alt="PendSV延迟调度时序图"></p>
<p>整个流程如下所示：</p>
<ol>
<li>串口中断触发，打断任务A，进入中断处理程序。</li>
<li>串口中断处理程序中释放信号量，唤醒高优先级任务B。</li>
<li>RTOS发现任务B优先级比当前被打断的任务A高，于是挂起PendSV异常，标记“延迟调度”。</li>
<li>串口中断处理程序继续执行剩余部分，比如清除中断标志、使能接收等。</li>
<li>如果此时又来了更高优先级的中断，就先处理那个中断，PendSV继续等待。</li>
<li>等所有中断都处理完后，CPU准备退出中断。</li>
<li>此时PendSV异常被触发，在PendSV中完成任务切换。</li>
<li>最终，切换到任务B去运行。</li>
</ol>
<p>注意到，PendSV的优先级是最低的，所以它会等所有其他中断都处理完之后才会执行。</p>
<p><strong>这样就保证了中断处理不会被任务切换打断，同时又确保了高优先级任务能够在中断退出后立即得到运行。</strong></p>
<h2 id="实际代码中的体现" tabindex="-1"><a class="header-anchor" href="#实际代码中的体现"><span>实际代码中的体现</span></a></h2>
<p>下面，我们来看一下RT-Thread中是如何实现的。</p>
<p>RT-Thread要求每个中断处理程序的入口和出口都要调用rt_interrupt_enter()和rt_interrupt_leave()，用来维护中断嵌套计数器。在Cortex-M架构中，当发生系统时钟节拍中断时，将调用SysTick_Handler()；当退出中断时，调用rt_interrupt_leave()。</p>
<p>而在rt_interrupt_leave()中，对中断嵌套计数进行减一。只有当计数器变成0的时候，也就是所有中断都退出了，才会检查是否需要调度，如果需要就调用rt_schedule()。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 系统时钟节拍中断 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> SysTick_Handler</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 进入中断，中断嵌套计数器加一 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_interrupt_enter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_tick_increase</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 退出中断，中断嵌套计数器减一 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_interrupt_leave</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 中断退出时的处理 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_interrupt_leave</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 中断嵌套计数器减一 */</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">    rt_interrupt_nest </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">--</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 如果所有中断都退出了，并且需要调度 */</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    if</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">rt_interrupt_nest </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">==</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 0</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> &#x26;&#x26;</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_scheduler_is_need_schedule</span><span style="--shiki-light:#999999;--shiki-dark:#666666">())</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 进行任务切换 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_schedule</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>rt_schedule()将进一步调用底层的任务切换函数rt_hw_context_switch_interrupt()。该函数通常用汇编代码编写，实现如下：</p>
<div class="language-assembly line-numbers-mode" data-highlighter="shiki" data-ext="assembly" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-assembly"><span class="line"><span></span></span>
<span class="line"><span>rt_hw_context_switch_interrupt    PROC</span></span>
<span class="line"><span>    ; 略去一些无关代码...</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    ; 挂起PendSV异常，触发任务切换</span></span>
<span class="line"><span>    LDR     r0, =NVIC_INT_CTRL</span></span>
<span class="line"><span>    LDR     r1, =NVIC_PENDSVSET</span></span>
<span class="line"><span>    STR     r1, [r0]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    BX      LR</span></span>
<span class="line"><span>    ENDP</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>注意到，这段代码只是把PendSV异常挂起。等PendSV真正触发的时候，CPU已经退出了中断上下文，才真正进行任务切换。</strong></p>
<h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>综上所述，<strong>在中断中唤醒了高优先级任务后，这个任务不会立即开始运行，也不应当立即运行</strong>。RTOS通常采用<strong>延迟调度的方式</strong>来处理：设置一个调度标志，等所有中断都处理完后，再进行任务切换。</p>
<hr>
<blockquote>
<p>如果你希望系统地学习RTOS底层原理，可以了解我的《RTOS开发与实战》课程。</p>
<p>课程不是简单地讲解FreeRTOS API的使用，而是带你从零开始编写一个RTOS内核，逐步实现任务管理、任务调度、上下文切换、同步与通信等核心机制，并通过一个远程温湿度监控设备项目，将操作系统原理应用到实际嵌入式开发中。</p>
<p>适合希望深入理解RTOS工作原理、提升嵌入式底层开发能力的同学。</p>
<p><VPLink href="/blog/diyrtos/">课程详情</VPLink></p>
</blockquote>
</div></template>


